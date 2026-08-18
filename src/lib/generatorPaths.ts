import type { GeneratorModel } from "./lottery";

export interface GeneratorPathOption {
  label: string;
  model: GeneratorModel;
  description: string;
}

/** Shared between the Generator page's "5 Possible Paths" and the Backtest page's model picker. */
export const GENERATOR_PATHS: GeneratorPathOption[] = [
  {
    label: "통계학자",
    model: "ensemble",
    description: "모든 통계 지표를 종합해 하나의 순위로 계산합니다.",
  },
  {
    label: "핫넘버 추적자",
    model: "hotNumbers",
    description: "역대 출현 빈도가 높은 번호 위주로 구성합니다.",
  },
  {
    label: "콜드넘버 사냥꾼",
    model: "coldNumbers",
    description: "역대 출현 빈도가 낮은 번호 위주로 구성합니다.",
  },
  {
    label: "밸런스형",
    model: "balanced",
    description: "홀짝, 저고 비율이 고르게 맞춰지도록 구성합니다.",
  },
  {
    label: "와일드카드",
    model: "monteCarlo",
    description: "시뮬레이션 풀에서 순위 없이 그대로 뽑은 조합입니다.",
  },
];
