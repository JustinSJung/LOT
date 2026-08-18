import type { AchievementDefinition } from "./types";

/**
 * Every achievement here rewards exploring the data/tools, not lottery
 * participation. No entry may key off draw counts, purchase counts, or
 * "returned N weeks in a row" — see Product Direction v2 for why.
 */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "pattern-detective",
    icon: "🏅",
    title: "Pattern Detective",
    description: "Explored pair/triple pattern data 5 times",
    counterKey: "patternExplorations",
    threshold: 5,
  },
  {
    id: "data-explorer",
    icon: "🏅",
    title: "Data Explorer",
    description: "Visited Statistics and tried its filters",
    counterKey: "statisticsFilterUses",
    threshold: 3,
  },
  {
    id: "number-analyst",
    icon: "🏅",
    title: "Number Analyst",
    description: "Analyzed 3 different number sets in the Analyzer",
    counterKey: "numberAnalyses",
    threshold: 3,
  },
  {
    id: "backtest-explorer",
    icon: "🏅",
    title: "Backtest Explorer",
    description: "Changed Backtest conditions to compare results",
    counterKey: "backtestConditionChanges",
    threshold: 3,
  },
  {
    id: "number-personality",
    icon: "🏅",
    title: "Number Personality",
    description: "Revealed 5 Luck Profiles",
    counterKey: "luckProfilesViewed",
    threshold: 5,
  },
  {
    id: "what-if-thinker",
    icon: "🏅",
    title: "What-If Thinker",
    description: "Tried swapping numbers with What If? 5 times",
    counterKey: "whatIfEdits",
    threshold: 5,
  },
  {
    id: "rival-finder",
    icon: "🏅",
    title: "Rival Finder",
    description: "Ran 3 Number Battle comparisons",
    counterKey: "numberBattles",
    threshold: 3,
  },
  {
    id: "set-collector",
    icon: "🏅",
    title: "Set Collector",
    description: "Saved 3 of your own number sets",
    counterKey: "setsSaved",
    threshold: 3,
  },
  {
    id: "sharer",
    icon: "🏅",
    title: "Sharer",
    description: "Shared a Share Card at least once",
    counterKey: "resultsShared",
    threshold: 1,
  },
];
