export interface StatCardProps {
  note: string;
  value: string;
  unit?: string;
}

export const StatCard = ({ value, unit, note }: StatCardProps) => (
  <div className="grid grid-cols-1 grid-rows-1 bg-neutral-200 dark:bg-neutral-500 p-2 rounded max-w-md">
    <span>{value} {unit}</span>
    <br/>
    <span>{note}</span>
  </div>
);
