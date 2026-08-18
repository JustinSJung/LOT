/**
 * Achievements are earned by USING analysis/exploration features, never by
 * lottery participation frequency (no streaks, no "draws played" counters,
 * no purchase-adjacent language). See Product Direction v2.
 */
export type CounterKey =
  | "patternExplorations" // pair/triple pattern views on the Statistics page
  | "statisticsFilterUses" // filter/segment changes on the Statistics page
  | "numberAnalyses" // completed Number Analyzer runs
  | "backtestConditionChanges" // model/sample-size changes on the Backtest page
  | "luckProfilesViewed" // distinct Luck Profile reveals
  | "whatIfEdits" // What If? single-number swaps
  | "numberBattles" // Number Battle comparisons run
  | "setsSaved" // saved number sets (localStorage)
  | "resultsShared"; // Share Card shares/copies

export interface AchievementDefinition {
  id: string;
  icon: string;
  title: string;
  description: string;
  counterKey: CounterKey;
  threshold: number;
}

export interface AchievementProgress {
  definition: AchievementDefinition;
  count: number;
  unlocked: boolean;
  /** ISO timestamp of first time the threshold was met, if unlocked. */
  unlockedAt: string | null;
}
