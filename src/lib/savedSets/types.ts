import type { LottoNumber, PrizeTier } from "../lottery/types";
import type { GeneratorModel } from "../lottery/generator";

export interface SavedSet {
  id: string;
  numbers: LottoNumber[];
  /** The draw this set was saved for — checked against draws.json on future visits. */
  drawNumber: number;
  /** Which of the 5 Possible Paths this came from, e.g. "The Statistician". */
  pathLabel: string;
  model: GeneratorModel;
  /** User-given nickname, e.g. "가족 번호". Null until renamed. */
  name: string | null;
  savedAt: string; // ISO timestamp
}

export interface SavedSetResult {
  savedSet: SavedSet;
  actualNumbers: LottoNumber[];
  actualBonus: LottoNumber;
  matches: number;
  prizeTier: PrizeTier;
}
