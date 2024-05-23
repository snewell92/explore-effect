/** A simple sync example of a computation in Effect to
 * calculate date/time/calendar display from today's date
 */

import { GetEffectSyncErrors, useEffectSync } from "~/re-effect/useEffect";
import { Meal } from "./Meal";
import { getDayFromInput, getToday, Today } from "./time";
import { Season } from "./Season";
import { DisplayError, ParseError } from "./error";
import { DateDisplay } from "./DateDisplay";
import { TimeDisplay } from "./TimeDisplay";
import { isString } from "effect/Predicate";

// awkard name..
const ShowToday = ({ today, isToday }: { today: Today; isToday: boolean }) => (
  <div className="text-center border-4 border-lime-300 p-4 rounded-lg mx-12 mb-6 min-h-80">
    {isToday ? <h1 className="text-slate-700 text-2xl">Today is</h1> : null}

    <DateDisplay
      today={today}
      className={isToday ? "" : "text-2xl border-x-4"}
    />
    <TimeDisplay today={today} />
    <Season season={today.season} />
    <Meal meal={today.nextMeal} />
  </div>
);

type Errors =
  | GetEffectSyncErrors<typeof getToday>
  | GetEffectSyncErrors<ReturnType<typeof getDayFromInput>>;

const ShowError = ({
  error,
  input,
}: {
  error: Errors;
  input: string | null;
}) => {
  if (error == null || isString(error)) {
    return (
      <div className="text-red-500 underline text-4xl">
        Something insane happened. Close the tab.
      </div>
    );
  }

  if (error._tag === "DateParseError") {
    return <ParseError input={input || ""} />;
  }

  return <DisplayError error={error} />;
};

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
    return <ShowError error={error} input={input} />;
  }

  return <ShowToday today={result} isToday={isToday} />;
};
