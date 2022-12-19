import type { ActivityTotals, TotalType } from "../types/activities";
import { TotalCard, TotalCardProps } from "./TotalCard";

const ONE_HOUR_IN_MS = 60 * 60 * 1_000;
const ONE_MINUTE_IN_MS = 60 * 1_000;

const formatIntegerStringWithCommas = (numberToFormat: string): string => (
  numberToFormat.length <= 3
    ? numberToFormat
    : `${formatIntegerStringWithCommas(numberToFormat.slice(0, -3))},${numberToFormat.slice(-3)}`
);

const formatNumber = (numberToformat: number): string => {
  const numberAsString = `${numberToformat}`;
  const [integer, decimal] = numberAsString.split('.');
  const formattedInteger = formatIntegerStringWithCommas(integer);
  return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
};

const padStartToTwoFigures = (numberToPad: number): string => {
  const numberString = `${numberToPad}`;
  return numberString.length === 1 ? `0${numberString}` : numberString;
};

const timeInSecondsToString = (timeMs: number): string => {
  const hours = Math.floor(timeMs / ONE_HOUR_IN_MS);
  const minutes = Math.floor((timeMs - hours * ONE_HOUR_IN_MS) / ONE_MINUTE_IN_MS);
  const seconds = (timeMs - hours * ONE_HOUR_IN_MS - minutes * ONE_MINUTE_IN_MS) / 1000;

  return `${padStartToTwoFigures(hours)}:${padStartToTwoFigures(minutes)}:${padStartToTwoFigures(seconds)}`;
};

const TOTALS: TotalType[] = ['distance', 'time', 'elevation'];

const totalTypeToStatPropsCreator: Record<TotalType, (total: number) => TotalCardProps> = {
  distance: (distanceInMetres) => ({
    note: 'Distance note',
    unit: 'km',
    value: formatNumber(distanceInMetres / 1000)
  }),
  time: (timeInSeconds) => ({
    value: timeInSecondsToString(timeInSeconds)
  }),
  elevation: (elevationInMetres) => ({
    note: 'Elevation note',
    unit: 'm',
    value: formatNumber(elevationInMetres)
  })
};

export interface ActivityTotalsCardsProps {
  activityTotals: ActivityTotals | null;
}

export const ActivityTotalsCards = ({ activityTotals }: ActivityTotalsCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
    {(
      TOTALS.map((total) => (
        activityTotals
          ? <TotalCard key={total} {...totalTypeToStatPropsCreator[total](activityTotals[total])} />
          : <TotalCard key={total} value={null} />
        )
      )
    )}
  </div>
);