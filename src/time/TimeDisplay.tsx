import { Today } from "./time";

export interface TimeDisplayProps {
  today: Today;
}

export const TimeDisplay = ({ today }: TimeDisplayProps) => {
  const { hour, minute, second, meridiem } = today;
  return (
    <div className="text-left border-l-4 border-cyan-300 pl-4 my-2">
      <p>
        🕰 {hour}:{minute}
        {meridiem}
      </p>
      <p className="pl-2 text-xs">at {second} seconds</p>
    </div>
  );
};
