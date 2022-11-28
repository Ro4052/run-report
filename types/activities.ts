export interface ActivityTotals {
  distance: number;
  elevation: number;
  time: number;
}

export type TotalType = keyof ActivityTotals;
