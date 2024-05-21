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

export interface TodayProps {
  input: string | null;
}

/** Display nicely formatted details about today, definitely has no quirks */
export const Today = ({ input }: TodayProps) => {
  const { result, status, error } = useEffectSync(
    input ? getDayFromInput(input) : getToday
  );

  if (status === "error") {
    if (error._tag === "DateParseError") {
      return <ParseError input={input || ""} />;
    }

    return <DisplayError error={error} />;
  }

  return (
    <div className="text-center border-4 border-lime-300 p-4 rounded-lg mx-12 mb-6 min-h-80">
      <h1 className="text-slate-700 text-2xl">Today is:</h1>

      <DateDisplay today={result} />
      <TimeDisplay today={result} />
      <Season season={result.season} />
      <Meal meal={result.nextMeal} />
    </div>
  );
};
