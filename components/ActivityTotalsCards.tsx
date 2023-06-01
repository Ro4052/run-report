import { format } from "d3-format";
import moment from "moment";

import type { ActivityTotals, TotalType } from "../types/activities";
import { TotalCard, TotalCardProps } from "./TotalCard";

const TRACK_LENGTH_METRES = 400;
const SNOWDON_HEIGHT_METRES = 1_085;

const distanceFormatter = format(",.2f");

const durationFormatter = (duration: number) =>
  moment.utc(duration).format("h:mm:ss");

const elevationFormatter = format(",.0f");
const elevationNoteFormatter = format(",.1f");

const TOTALS: TotalType[] = ["distance", "time", "elevation"];

const totalTypeToStatPropsCreator: Record<
  TotalType,
  (total: number) => TotalCardProps
> = {
  distance: (distanceInMetres) => ({
    note: `That's the equivalent of ${Math.round(
      distanceInMetres / TRACK_LENGTH_METRES
    )} times around a running track`,
    unit: "km",
    value: distanceFormatter(distanceInMetres / 1000),
  }),
  time: (time) => ({
    value: durationFormatter(time),
  }),
  elevation: (elevationInMetres) => ({
    note: `That's the equivalent of ${elevationNoteFormatter(
      elevationInMetres / SNOWDON_HEIGHT_METRES
    )} times up Snowdon`,
    unit: "m",
    value: elevationFormatter(elevationInMetres),
  }),
};

export interface ActivityTotalsCardsProps {
  activityTotals: ActivityTotals | null;
}

export const ActivityTotalsCards = ({
  activityTotals,
}: ActivityTotalsCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
    {activityTotals &&
      TOTALS.map((total) => (
        <TotalCard
          key={total}
          {...totalTypeToStatPropsCreator[total](activityTotals[total])}
        />
      ))}
  </div>
);
