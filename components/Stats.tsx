import { StatCard, StatCardProps } from "./StatCard";

const stats: StatCardProps[] = [
  {
    note: 'Distance note',
    unit: 'km',
    value: 'Distance'
  },
  {
    note: 'Time note',
    value: 'Time'
  },
  {
    note: 'Elevation note',
    unit: 'm',
    value: 'Elevation'
  }
];

export const Stats = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
    {(
      stats.map((stat, i) => <StatCard key={i} {...stat} />)
    )}
  </div>
);