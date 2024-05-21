import { Today } from "./time";

export interface DateDisplayProps {
  today: Today;
}

export const DateDisplay = ({ today }: DateDisplayProps) => {
  const { monthName, ordinalDate, year } = today;
  return (
    <p className="mb-2 border-x-2 border-sky-300 mx-auto w-fit inline-block px-2">
      {monthName} {ordinalDate}, {year}
    </p>
  );
};