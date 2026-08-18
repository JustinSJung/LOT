#!/usr/bin/env -S npx tsx
/**
 * Fetches Lotto 6/45 draw results and writes data/draws.json.
 *
 * DATA SOURCE: this currently pulls from a community-maintained GitHub Pages
 * mirror (https://smok95.github.io/lotto), NOT the official Dongheng Lottery
 * (dhlottery.co.kr) API. The official API blocks requests from this project's
 * environments at the IP/session level regardless of headers used (see the
 * commented-out implementation below and the diagnostic output it produces).
 * Because this is an unofficial third-party mirror, treat the data as
 * "best effort" — there is a small possibility of transcription errors or
 * lag versus the official result. Re-verify against dhlottery.co.kr directly
 * if precision matters for a specific round.
 *
 * The mirror publishes one JSON array with every draw from round 1 to the
 * latest, so this script does a single fetch — no per-round looping needed.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Draw } from "../src/lib/lottery/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "draws.json");
const MIRROR_URL = "https://smok95.github.io/lotto/results/all.json";
const REQUEST_TIMEOUT_MS = 20_000;

interface MirrorDraw {
  draw_no: number;
  numbers: number[];
  bonus_no: number;
  date: string; // ISO datetime, e.g. "2002-12-07T00:00:00Z"
  // divisions / total_sales_amount / winners_combination are published by the
  // mirror too, but nothing in this project's spec uses them yet — skipped.
}

function toDrawDate(isoDateTime: string): string {
  return isoDateTime.slice(0, 10); // "2002-12-07T00:00:00Z" -> "2002-12-07"
}

async function fetchMirror(): Promise<MirrorDraw[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(MIRROR_URL, { signal: controller.signal });
    if (!res.ok) {
      const body = await res.text();
      console.error(`\n--- 미러 진단 정보 ---`);
      console.error(`HTTP Status: ${res.status} ${res.statusText}`);
      console.error(`응답 본문 (앞 1000자):\n${body.slice(0, 1000)}`);
      console.error(`--- 진단 정보 끝 ---\n`);
      throw new Error(`미러 fetch 실패: HTTP ${res.status}`);
    }
    return (await res.json()) as MirrorDraw[];
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const raw = await fetchMirror();

  const draws: Draw[] = raw
    .map((d) => ({
      drawNumber: d.draw_no,
      date: toDrawDate(d.date),
      numbers: [...d.numbers].sort((a, b) => a - b) as Draw["numbers"],
      bonusNumber: d.bonus_no,
    }))
    .sort((a, b) => a.drawNumber - b.drawNumber);

  mkdirSync(dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(draws, null, 2) + "\n");

  const latest = draws[draws.length - 1];
  console.log(`저장 완료. 총 ${draws.length}개 회차.`);
  if (latest) {
    console.log(`최신 회차: ${latest.drawNumber}회 (${latest.date})`);
  }

  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(process.env.GITHUB_OUTPUT, `added=${draws.length}\n`);
  }
}

main().catch((err) => {
  console.error("치명적 오류:", err);
  process.exit(1);
});

/* -----------------------------------------------------------------------
 * ARCHIVED: official dhlottery.co.kr direct-fetch implementation.
 *
 * Kept for reference in case official API access becomes available again
 * (e.g. from a GitHub Actions runner IP that isn't blocked, or once
 * dhlottery lifts whatever's blocking this environment). Confirmed blocked
 * at the IP/session level as of 2026-08-18 — see the diagnostic output this
 * produced: every request (even to the bare homepage) gets redirected back
 * to a page containing "서비스 접속이 차단 되었습니다", regardless of
 * User-Agent/Referer headers.
 *
 * To resume: rename this script to fetch-draws.legacy.ts, restore the body
 * below as fetch-draws.ts, and re-test from the actual GitHub Actions runner.
 * -----------------------------------------------------------------------

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
        Accept: "application/json, text/plain, *\/*",
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
      throw new Error(`round ${round}: 차단 추정 (HTTP ${res.status} redirect -> ${location})`);
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
      drawNumber: data.drwNo,
      date: data.drwNoDate,
      numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6]
        .sort((a, b) => a - b) as Draw["numbers"],
      bonusNumber: data.bnusNo,
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

async function legacyMain() {
  let cached: Draw[] = [];
  if (existsSync(DATA_PATH)) {
    const raw = readFileSync(DATA_PATH, "utf-8").trim();
    cached = raw ? JSON.parse(raw) : [];
  }

  const cachedMax = cached.reduce((max, d) => Math.max(max, d.drawNumber), 0);
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
      console.log(`회차 ${round} 수집 완료: ${draw.numbers.join(", ")} + ${draw.bonusNumber}`);
    } catch (err) {
      const e = err as Error & { cause?: unknown };
      console.error(`회차 ${round} 수집 실패: ${e.message}`);
      if (e.cause) console.error(`원인(cause):`, e.cause);
      if (e.stack) console.error(`스택:\n${e.stack}`);
      break;
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  if (fetched.length === 0) {
    console.log("새로 수집된 회차가 없습니다. 기존 파일 유지.");
    writeOutput("added", "0");
    return;
  }

  const merged = [...cached, ...fetched].sort((a, b) => a.drawNumber - b.drawNumber);
  mkdirSync(dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2) + "\n");
  console.log(`저장 완료. 총 ${merged.length}개 회차 (신규 ${fetched.length}개).`);
  writeOutput("added", String(fetched.length));
}

----------------------------------------------------------------------- */
