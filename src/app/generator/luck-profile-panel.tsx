import type { LuckCharacter, LuckProfile } from "@/lib/lottery";

const AXES: { key: "balance" | "pattern" | "trend" | "rarity" | "diversity"; label: string }[] = [
  { key: "balance", label: "균형" },
  { key: "pattern", label: "패턴" },
  { key: "trend", label: "트렌드" },
  { key: "rarity", label: "희귀도" },
  { key: "diversity", label: "다양성" },
];

const CHARACTER_LABELS_KO: Record<LuckCharacter, string> = {
  "The Balanced Explorer": "균형 탐험가",
  "The Hot Chaser": "핫넘버 추격자",
  "The Contrarian": "역발상가",
  "The Pattern Hunter": "패턴 헌터",
  "The Wild Card": "와일드카드",
  "The Quiet Player": "조용한 플레이어",
  "The High Roller": "하이롤러",
  "The Number Architect": "넘버 아키텍트",
};

const CHARACTER_DESCRIPTIONS_KO: Record<LuckCharacter, string> = {
  "The Balanced Explorer": "어느 한 특성도 두드러지지 않는, 고르게 분산된 통계 프로필입니다.",
  "The Hot Chaser": "최근 출현 흐름이 강한 번호 위주의 조합입니다.",
  "The Contrarian": "역대 출현 빈도가 낮았던 번호 위주의 조합입니다.",
  "The Pattern Hunter": "역대 자주 함께 나온 번호 쌍/조합 위주의 조합입니다.",
  "The Wild Card": "두 개 이상의 특성이 동률로 1위라 종잡을 수 없는 조합입니다.",
  "The Quiet Player": "모든 특성에서 무난한 점수를 보이는 절제된 조합입니다.",
  "The High Roller": "모든 특성에서 동시에 강한 점수를 보이는 조합입니다.",
  "The Number Architect": "번호 구간을 고르게 분산시키고 연속 번호를 피한 조합입니다.",
};

export function LuckProfilePanel({ profile }: { profile: LuckProfile }) {
  return (
    <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        조합 캐릭터
      </p>
      <p className="mt-1 text-lg font-semibold text-neutral-50">
        {CHARACTER_LABELS_KO[profile.character]}
      </p>
      <p className="mt-1 text-sm text-neutral-400">
        {CHARACTER_DESCRIPTIONS_KO[profile.character]}
      </p>

      <div className="mt-4 space-y-2">
        {AXES.map(({ key, label }) => (
          <div key={key}>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{label}</span>
              <span>{Math.round(profile[key])}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.max(0, Math.min(100, profile[key]))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-neutral-500">
        이 조합 번호의 통계적 특성을 보여줄 뿐, 예측이 아닙니다 — 모든 6/45 조합은 다음
        회차에 당첨될 확률이 동일합니다.
      </p>
    </div>
  );
}
