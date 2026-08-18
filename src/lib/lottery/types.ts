export type LottoNumber = number; // 1-45

export const ALL_NUMBERS: LottoNumber[] = Array.from({ length: 45 }, (_, i) => i + 1);

export interface Draw {
  round: number;
  date: string; // YYYY-MM-DD
  numbers: [
    LottoNumber,
    LottoNumber,
    LottoNumber,
    LottoNumber,
    LottoNumber,
    LottoNumber,
  ];
  bonus: LottoNumber;
}

/** 0 = no prize ("낙첨"), 1-5 = prize tier */
export type PrizeTier = 0 | 1 | 2 | 3 | 4 | 5;

export interface NumberFrequencyStat {
  number: LottoNumber;
  count: number;
  lastSeenRound: number | null;
  gap: number; // rounds since last appearance (relative to latest known round)
}

export interface ScoreBreakdown {
  frequency: number;
  recentTrend: number;
  gap: number;
  balance: number;
  pattern: number;
  simulation: number;
}

export interface ScoredCombination {
  numbers: [
    LottoNumber,
    LottoNumber,
    LottoNumber,
    LottoNumber,
    LottoNumber,
    LottoNumber,
  ];
  breakdown: ScoreBreakdown;
  ensembleScore: number; // 0-100, relative statistical ranking only — not a win probability
}
