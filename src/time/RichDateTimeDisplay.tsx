/** A simple example of showing computation in Effect to
 * calculate date/time/calendar display from today's date
 */

import { type GetSyncErrors } from "~/re-effect/useSync";
import { Meal } from "./Meal";
import { getDayFromInput, getToday, Today } from "./time";
import { Season } from "./Season";
import { DisplayError, ParseError } from "./error";
import { DateDisplay } from "./DateDisplay";
import { TimeDisplay } from "./TimeDisplay";
import { isString } from "effect/Predicate";
import { usePromise } from "~/re-effect/usePromise";

interface ShowTodayProps {
  today: Today;
  isToday: boolean;
}

const ShowToday = ({ today, isToday }: ShowTodayProps) => (
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
  | GetSyncErrors<typeof getToday>
  | GetSyncErrors<ReturnType<typeof getDayFromInput>>;

interface ShowErrorProps {
  error: Errors;
  input: string | null;
}

const ShowError = ({ error, input }: ShowErrorProps) => {
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

const Thinking = () => <div>thinking 🤔</div>;

/** Display nicely formatted details about today, definitely has no quirks */
export const RichDateTimeDisplay = ({ input }: RichDateTimeDisplayProps) => {
  const isToday = input === null;
  const [match] = usePromise(isToday ? getToday : getDayFromInput(input));

  return match({
    Pending: Thinking,
    Empty: Thinking,
    Success: ({ result }) => <ShowToday today={result} isToday={isToday} />,
    Error: ({ error }) => <ShowError error={error} input={input} />,
  });
};
