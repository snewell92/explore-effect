import { Today } from "./time";

export interface DateDisplayProps {
  today: Today;
  className?: string;
}

export const DateDisplay = ({ today, className }: DateDisplayProps) => {
  const { monthName, ordinalDate, year } = today;
  const extraClass = className ?? "";

  return (
    <p
      className={
        "mb-2 border-x-2 h-8 pt-[2px] border-sky-300 mx-auto w-fit inline-block px-2 " +
        extraClass
      }
    >
      {monthName} {ordinalDate}, {year}
    </p>
  );
};
