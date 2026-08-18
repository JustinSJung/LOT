/**
 * Ensemble weighting and simulation tuning. These are starting assumptions,
 * not derived truths — revisit them as backtest results come in rather than
 * treating them as fixed.
 */
export const ENSEMBLE_WEIGHTS = {
  frequency: 0.2,
  recentTrend: 0.15,
  gap: 0.1,
  balance: 0.15,
  pattern: 0.2,
  simulation: 0.2,
} as const;

export const RECENT_TREND_WINDOW = 30;

/** Candidates simulated when scoring a single user-submitted combination. */
export const ANALYZER_SIMULATION_SAMPLE_SIZE = 2000;

/** Candidate pool size for the bulk generator (ranks within this same pool). */
export const GENERATOR_POOL_SIZE = 2000;

/**
 * Rounds included in a standard backtest run. Set well above any realistic
 * dataset size so a run effectively covers "every eligible draw" — the real
 * cap in practice is BACKTEST_MIN_HISTORY plus however many draws exist.
 */
export const DEFAULT_BACKTEST_SAMPLE_SIZE = 100_000;

/**
 * Minimum prior draws required before a draw is included in a backtest
 * ("warmup" period). 100 was chosen so frequency/recent-trend/gap/pair stats
 * have enough history to be non-trivial before a round counts as a real test.
 */
export const BACKTEST_MIN_HISTORY = 100;

/** Expected match count for a uniformly random 6-pick against a 6/45 draw: 6 * (6/45). */
export const THEORETICAL_EXPECTED_MATCHES = 6 * (6 / 45);
