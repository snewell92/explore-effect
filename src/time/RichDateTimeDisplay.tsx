/** A simple example of showing computation in Effect to
 * calculate date/time/calendar display from today's date
 */

import { type GetErrors } from "~/re-effect/useSync";
import { Meal } from "./Meal";
import { DisplayMode, getDateTimeInfo, Today } from "./time";
import { Season } from "./Season";
import { DisplayError, ParseError } from "./error";
import { DateDisplay } from "./DateDisplay";
import { TimeDisplay } from "./TimeDisplay";
import { isString } from "effect/Predicate";
import { usePromise } from "~/re-effect/usePromise";
import { ShowDeets } from "./ShowDeets";

interface ShowTodayProps {
  today: Today;
  isToday: boolean;
}

const ShowToday = ({ today, isToday }: ShowTodayProps) => {
  return (
    <div className="text-center border-4 border-lime-300 p-4 rounded-lg mx-12 mb-6 min-h-80">
      {isToday ? <h1 className="text-slate-700 text-2xl">Today is</h1> : null}

      <DateDisplay
        today={today}
        className={isToday ? "" : "text-2xl border-x-4"}
      />
      <TimeDisplay today={today} />
      <Season season={today.season} />
      <Meal meal={today.nextMeal} />
      <ShowDeets today={today} />
    </div>
  );
};

type Errors = GetErrors<ReturnType<typeof getDateTimeInfo>>;

interface ShowErrorProps {
  error: Errors;
  input: string | null;
}

const ShowError = ({ error, input }: ShowErrorProps) => {
  if (error == null || isString(error)) {
    console.error("We got a whacky error case");
    console.error(error);
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
  mode: DisplayMode;
}

const Thinking = () => <div>thinking 🤔</div>;

/** Display nicely formatted details about today, definitely has no quirks */
export const RichDateTimeDisplay = ({ mode }: RichDateTimeDisplayProps) => {
  const isToday = true;
  const input = "hey";
  const [match] = usePromise(getDateTimeInfo(mode));

  return match({
    Pending: Thinking,
    Empty: Thinking,
    Success: ({ result }) => <ShowToday today={result} isToday={isToday} />,
    Error: ({ error }) => <ShowError error={error} input={input} />,
  });
};
