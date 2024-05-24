import { Effect } from "effect";
import { type Effect as EFF } from "effect/Effect";

type EvenSeconds = "EVEN_SECONDS";
type TooEarly = "TOO_EARLY";
type TooCold = "TOO_COLD";

export type HandledErrors = EvenSeconds | TooCold | TooEarly;

export interface DateError {
  type: HandledErrors;
  _tag: "DateError";
  date?: Date;
}

export const raiseDateError = (
  type: HandledErrors,
  date?: Date
): EFF<never, DateError, never> =>
  Effect.fail({
    type,
    date,
    _tag: "DateError",
  });

export interface DisplayErrorProps {
  error: DateError;
}

const ERROR_MESSAGES: Record<HandledErrors, string> = {
  EVEN_SECONDS: "Given time was on an even second - perposterous.",
  TOO_COLD: "This time would be way too cold, stay inside",
  TOO_EARLY: "sleepy, going back to bed",
};

export const DisplayError = ({ error }: DisplayErrorProps) => {
  return (
    <div className="text-center border-4 border-red-600 p-4 rounded-lg mx-12 mb-6 min-h-80">
      <h1 className="text-slate-700 text-2xl mb-4">What time is it?</h1>
      <div className="text-left">
        <p>
          Error message:{" "}
          <span className="font-mono">{ERROR_MESSAGES[error.type]}</span>
        </p>
        {typeof error.date === "undefined" ? null : (
          <p>
            Full Date:{" "}
            <span className="text-sm font-mono">
              {error.date.toISOString()}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export const ParseError = ({ input }: { input: string }) => {
  return (
    <div className="text-center border-4 border-red-600 p-4 rounded-lg mx-12 mb-6 min-h-80">
      <h1 className="text-slate-700 text-2xl mb-4">What was that?</h1>
      <div className="text-left">
        <p>
          We use "new Date(input)" to parse your input, looks like that failed.
        </p>
        <p>
          You gave us: <span className="font-mono text-slate-600">{input}</span>
        </p>
        <p>Generally, an almost ISO 8601 date string usually works, like:</p>
        <ul className="list-disc pl-8">
          <li>2022-01-01</li>
          <li>2022-01-01T00:00:00</li>
          <li>2022-01-01T00:00:00.000Z</li>
          <li>2022-01-01T00:00:00.000-05:00</li>
          <li>YYYY-MM-DDTHH:mm:ss.sssZ</li>
        </ul>
        <p>etc...</p>
        <p>
          The full docs are{" "}
          <a
            target="_blank"
            className="text-blue-600"
            href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format"
          >
            here
          </a>
        </p>
      </div>
    </div>
  );
};
