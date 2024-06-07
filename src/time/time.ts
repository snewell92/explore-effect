import { Data, Effect } from "effect";
import { type Effect as EFF } from "effect/Effect";
import { Meal, nextMeal } from "./Meal";
import { Season, SeasonService } from "./Season";
import { ordinal, padNumWithZeroes } from "./format";
import { DateError, raiseDateError } from "./error";
import { Services } from "~/registry";

export type Month =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

// no Schema or Data... yet!
export interface Today {
  monthName: Month;
  ordinalDate: string;
  year: string;
  /** 24 hour time */
  hourNum: number;
  /** 12 hour time */
  hour: string;
  minute: string;
  second: string;
  meridiem: "pm" | "am";
  season: Season;
  nextMeal: Meal;
}

const Today = Data.case<Today>();

type GetToday = EFF<Today, DateError, Services>;

/** Converts 24 hour time to 12 hour time. Sorry. */
export function twentyFourToTwelve(hour: number): [string, "am" | "pm"] {
  const meridiemPeriod = hour < 12 ? "am" : "pm";

  let twelveHourTime = String(hour);
  if (hour === 0) {
    twelveHourTime = "12";
  } else if (hour > 12) {
    twelveHourTime = String(hour - 12);
  }

  return [twelveHourTime, meridiemPeriod];
}

function processDate(d: Date): GetToday {
  return Effect.gen(function* () {
    const seasonService = yield* SeasonService;

    const hour = d.getHours();
    const second = d.getSeconds();
    const minute = d.getMinutes();

    if (second % 2 === 0) {
      // we live on the off beat and swing thru the down beats.
      yield* raiseDateError("EVEN_SECONDS", d);
    }

    const monthName = seasonService.getMonthName(d);
    const season = yield* seasonService.getSeason(monthName, d);

    if (hour < 5) {
      yield* raiseDateError("TOO_EARLY", d);
    }

    const meal = nextMeal(hour, minute);
    const [twelveHourTime, meridiemPeriod] = twentyFourToTwelve(hour);

    return Today({
      monthName,
      season,
      ordinalDate: ordinal(d.getDate()),
      year: d.getFullYear().toString(10),
      hourNum: hour,
      hour: twelveHourTime,
      minute: padNumWithZeroes(2, minute),
      second: padNumWithZeroes(2, second),
      meridiem: meridiemPeriod,
      nextMeal: meal,
    });
  });
}

class DateParseError {
  readonly _tag = "DateParseError";
  readonly error: unknown;

  constructor(error: unknown) {
    this.error = error;
  }
}

const isInvalidDate = (d: Date) =>
  Number.isNaN(d.valueOf()) || String(d) === "Invalid Date";

const parseDate = (input: string) =>
  Effect.try({
    try() {
      const d = new Date(input);
      if (isInvalidDate(d)) {
        throw new Error("Invalid date");
      }
      return d;
    },
    catch: (e) => new DateParseError(e),
  });

// I don't think new Date w/ no args could ever fail (?)
const freshDay = Effect.sync(() => new Date());

export const getToday = freshDay.pipe(Effect.flatMap(processDate));
export const getDayFromInput = (input: string) =>
  parseDate(input).pipe(Effect.flatMap(processDate));
