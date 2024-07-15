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
import { InferErrorCase, InferSuccessCase } from "~/re-effect/collapsed";

interface ShowTodayProps {
  today: Today;
}

const ShowToday = ({ today }: ShowTodayProps) => {
  return (
    <div className="text-center border-4 border-lime-300 p-4 rounded-lg mx-12 mb-6 min-h-80">
      {today.isToday ? (
        <h1 className="text-slate-700 text-2xl">Today is</h1>
      ) : null}

      <DateDisplay
        today={today}
        className={today.isToday ? "" : "text-2xl border-x-4"}
      />
      <TimeDisplay today={today} />
      <Season season={today.season} />
      <Meal meal={today.nextMeal} />
      <ShowDeets />
    </div>
  );
};

type Errors = GetErrors<ReturnType<typeof getDateTimeInfo>>;

interface ShowErrorProps {
  error: Errors;
}

const ShowError = ({ error }: ShowErrorProps) => {
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
    return <ParseError input={error.input} />;
  }

  return <DisplayError error={error} />;
};

export interface RichDateTimeDisplayProps {
  mode: DisplayMode;
}

const Thinking = () => <div>thinking 🤔</div>;

function SuccessToday({ result }: InferSuccessCase<typeof getDateTimeInfo>) {
  return <ShowToday today={result} />;
}

function ErrorCase({ error }: InferErrorCase<typeof getDateTimeInfo>) {
  return <ShowError error={error} />;
}

/** Display nicely formatted details about today, definitely has no quirks */
export const RichDateTimeDisplay = ({ mode }: RichDateTimeDisplayProps) => {
  const { match } = usePromise(getDateTimeInfo(mode));

  return match({
    Pending: Thinking,
    Empty: Thinking,
    Success: SuccessToday,
    Error: ErrorCase,
  });
};
