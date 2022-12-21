export interface TotalCardProps {
  note?: string;
  value: string;
  unit?: string;
}

export const TotalCard = ({ value, unit, note }: TotalCardProps) => (
  <div className='grid grid-cols-1 grid-rows-1 bg-neutral-200 dark:bg-neutral-500 p-2 rounded shadow-md'>
    <span className='text-2xl'>{value} {unit}</span>
    {note && (
      <>
        <span className='text-sm mt-3'>{note}</span>
      </>
    )}
  </div>
);
