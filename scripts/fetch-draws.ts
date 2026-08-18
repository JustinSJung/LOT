#!/usr/bin/env -S npx tsx
/**
 * Fetches Lotto 6/45 draw results from the official Dongheng Lottery API and
 * appends any newly-drawn rounds to data/draws.json. Only rounds after the
 * highest cached round are requested.
 *
 * Intended to run server-side only (GitHub Actions), never from the browser
 * — avoids CORS entirely and keeps the request off client machines.
 *
 * The upstream host is known to block requests from some datacenter/cloud IP
 * ranges (observed as an HTTP redirect back to the homepage instead of JSON).
 * On any such failure this script stops early and leaves data/draws.json
 * exactly as it was — no partial or corrupt writes.
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeLatestRound } from "../src/lib/lottery/round";
import type { Draw } from "../src/lib/lottery/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "draws.json");
const API_BASE = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
const REQUEST_TIMEOUT_MS = 10_000;
const DELAY_BETWEEN_REQUESTS_MS = 250;

interface DhLotteryResponse {
  returnValue: "success" | "fail";
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRound(round: number): Promise<Draw | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${round}`, {
      signal: controller.signal,
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Referer: "https://www.dhlottery.co.kr/gameResult.do?method=byWin",
        Accept: "application/json, text/plain, */*",
      },
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      const body = await res.text();
      console.error(`\n--- 회차 ${round} 진단 정보 (redirect) ---`);
      console.error(`HTTP Status: ${res.status} ${res.statusText}`);
      console.error(`Location 헤더: ${location}`);
      console.error(`응답 헤더:`, Object.fromEntries(res.headers.entries()));
      console.error(`응답 본문 (앞 1000자):\n${body.slice(0, 1000)}`);
      console.error(`--- 진단 정보 끝 ---\n`);
      throw new Error(`round ${round}: 차단 추정 (HTTP ${res.status} redirect → ${location})`);
    }
    if (!res.ok) {
      const body = await res.text();
      console.error(`\n--- 회차 ${round} 진단 정보 (non-OK) ---`);
      console.error(`HTTP Status: ${res.status} ${res.statusText}`);
      console.error(`응답 헤더:`, Object.fromEntries(res.headers.entries()));
      console.error(`응답 본문 (앞 1000자):\n${body.slice(0, 1000)}`);
      console.error(`--- 진단 정보 끝 ---\n`);
      throw new Error(`round ${round}: HTTP ${res.status}`);
    }

    const text = await res.text();
    let data: DhLotteryResponse;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error(`\n--- 회차 ${round} 진단 정보 (JSON 파싱 실패) ---`);
      console.error(`HTTP Status: ${res.status} ${res.statusText}`);
      console.error(`파싱 에러: ${(parseErr as Error).message}`);
      console.error(`응답 본문 (앞 1000자):\n${text.slice(0, 1000)}`);
      console.error(`--- 진단 정보 끝 ---\n`);
      throw new Error(`round ${round}: JSON 파싱 실패 (차단 페이지 응답 가능성)`);
    }

    if (data.returnValue !== "success") {
      return null; // not drawn yet
    }

    return {
      round: data.drwNo,
      date: data.drwNoDate,
      numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6]
        .sort((a, b) => a - b) as Draw["numbers"],
      bonus: data.bnusNo,
    };
  } finally {
    clearTimeout(timer);
  }
}

function writeOutput(key: string, value: string) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    appendFileSync(outputPath, `${key}=${value}\n`);
  }
}

async function main() {
  let cached: Draw[] = [];
  if (existsSync(DATA_PATH)) {
    const raw = readFileSync(DATA_PATH, "utf-8").trim();
    cached = raw ? JSON.parse(raw) : [];
  }

  const cachedMax = cached.reduce((max, d) => Math.max(max, d.round), 0);
  const target = computeLatestRound();
  console.log(`캐시된 최대 회차: ${cachedMax}, 계산된 최신 회차: ${target}`);

  if (target <= cachedMax) {
    console.log("갱신할 새 회차가 없습니다.");
    writeOutput("added", "0");
    return;
  }

  const fetched: Draw[] = [];
  for (let round = cachedMax + 1; round <= target; round++) {
    try {
      const draw = await fetchRound(round);
      if (!draw) {
        console.log(`회차 ${round}: 아직 추첨 전. 중단.`);
        break;
      }
      fetched.push(draw);
      console.log(`회차 ${round} 수집 완료: ${draw.numbers.join(", ")} + ${draw.bonus}`);
    } catch (err) {
      const e = err as Error & { cause?: unknown };
      console.error(`회차 ${round} 수집 실패: ${e.message}`);
      if (e.cause) console.error(`원인(cause):`, e.cause);
      if (e.stack) console.error(`스택:\n${e.stack}`);
      break; // stop early; likely to fail for every subsequent round too
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  if (fetched.length === 0) {
    console.log("새로 수집된 회차가 없습니다. 기존 파일 유지.");
    writeOutput("added", "0");
    return;
  }

  const merged = [...cached, ...fetched].sort((a, b) => a.round - b.round);
  mkdirSync(dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2) + "\n");
  console.log(`저장 완료. 총 ${merged.length}개 회차 (신규 ${fetched.length}개).`);
  writeOutput("added", String(fetched.length));
}

main().catch((err) => {
  console.error("치명적 오류:", err);
  process.exit(1);
});
