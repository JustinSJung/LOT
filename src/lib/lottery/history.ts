import type { Draw, LottoNumber } from "./types";
import { oddEvenSplit, lowHighSplit, sum, consecutiveRuns } from "./distribution";

export interface DrawDetails {
  drawNumber: number;
  date: string;
  numbers: LottoNumber[];
  bonusNumber: LottoNumber;
  oddCount: number;
  evenCount: number;
  lowCount: number;
  highCount: number;
  sum: number;
  consecutiveRuns: LottoNumber[][];
}

export function computeDrawDetails(draw: Draw): DrawDetails {
  const { odd, even } = oddEvenSplit(draw.numbers);
  const { low, high } = lowHighSplit(draw.numbers);
  return {
    drawNumber: draw.drawNumber,
    date: draw.date,
    numbers: draw.numbers,
    bonusNumber: draw.bonusNumber,
    oddCount: odd,
    evenCount: even,
    lowCount: low,
    highCount: high,
    sum: sum(draw.numbers),
    consecutiveRuns: consecutiveRuns(draw.numbers),
  };
}

export function drawYear(draw: Pick<Draw, "date">): number {
  return parseInt(draw.date.slice(0, 4), 10);
}

export interface HistoryFilters {
  drawNumber?: number;
  year?: number;
  minDrawNumber?: number;
  maxDrawNumber?: number;
  /** Exact count of odd numbers (0-6) in the draw. */
  oddCount?: number;
  minSum?: number;
  maxSum?: number;
}

export function filterDraws(draws: Draw[], filters: HistoryFilters): Draw[] {
  return draws.filter((draw) => {
    if (filters.drawNumber !== undefined && draw.drawNumber !== filters.drawNumber) return false;
    if (filters.year !== undefined && drawYear(draw) !== filters.year) return false;
    if (filters.minDrawNumber !== undefined && draw.drawNumber < filters.minDrawNumber) return false;
    if (filters.maxDrawNumber !== undefined && draw.drawNumber > filters.maxDrawNumber) return false;

    if (filters.oddCount !== undefined) {
      const { odd } = oddEvenSplit(draw.numbers);
      if (odd !== filters.oddCount) return false;
    }

    if (filters.minSum !== undefined || filters.maxSum !== undefined) {
      const total = sum(draw.numbers);
      if (filters.minSum !== undefined && total < filters.minSum) return false;
      if (filters.maxSum !== undefined && total > filters.maxSum) return false;
    }

    return true;
  });
}
