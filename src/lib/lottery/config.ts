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

/** Rounds included in a standard backtest run. */
export const DEFAULT_BACKTEST_SAMPLE_SIZE = 100;

/** Minimum draws required before a round is included in a backtest. */
export const BACKTEST_MIN_HISTORY = 10;
