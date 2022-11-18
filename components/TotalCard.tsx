export interface TotalCardProps {
  note?: string;
  value: string | null;
  unit?: string;
}

export const TotalCard = ({ value, unit, note }: TotalCardProps) => (
  <div className="grid grid-cols-1 grid-rows-1 bg-neutral-200 dark:bg-neutral-500 p-2 rounded max-w-md">
    <span>{value} {unit}</span>
    {note && (
      <>
        <br/>
        <span>{note}</span>
      </>
    )}
  </div>
);
