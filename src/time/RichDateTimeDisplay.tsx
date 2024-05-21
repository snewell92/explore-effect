/** A simple sync example of a computation in Effect to
 * calculate date/time/calendar display from today's date
 */

import { useEffectSync } from "~/re-effect/useEffect";
import { Meal } from "./Meal";
import { getDayFromInput, getToday } from "./time";
import { Season } from "./Season";
import { DisplayError, ParseError } from "./error";
import { DateDisplay } from "./DateDisplay";
import { TimeDisplay } from "./TimeDisplay";

export interface RichDateTimeDisplayProps {
  input: string | null;
}

/** Display nicely formatted details about today, definitely has no quirks */
export const RichDateTimeDisplay = ({ input }: RichDateTimeDisplayProps) => {
  const isToday = input === null;
  const { result, status, error } = useEffectSync(
    isToday ? getToday : getDayFromInput(input)
  );

  if (status === "error") {
    if (error._tag === "DateParseError") {
      return <ParseError input={input || ""} />;
    }

    return <DisplayError error={error} />;
  }

  return (
    <div className="text-center border-4 border-lime-300 p-4 rounded-lg mx-12 mb-6 min-h-80">
      {isToday ? <h1 className="text-slate-700 text-2xl">Today is</h1> : null}

      <DateDisplay
        today={result}
        className={isToday ? "" : "text-2xl border-x-4"}
      />
      <TimeDisplay today={result} />
      <Season season={result.season} />
      <Meal meal={result.nextMeal} />
    </div>
  );
};
