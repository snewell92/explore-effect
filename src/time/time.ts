import { Effect } from "effect";
import { Meal, nextMeal } from "./Meal";
import { InvalidSeason, Season, getSeason } from "./Season";
import { ordinal, padNumWithZeroes } from "./format";
import { Explain } from "./error";

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

export interface Today {
  monthName: Month;
  ordinalDate: string;
  year: string;
  hour: string;
  minute: string;
  second: string;
  meridiem: "pm" | "am";
  season: Season;
  nextMeal: Meal;
}

class InvalidSeconds implements Explain {
  readonly _tag = "InvalidSeconds";
  readonly msg: string;
  readonly raw: Date;

  constructor(
    date: Date,
    msg: string = "The second can't even."
  ) {
    this.msg = msg;
    this.raw = date;
  }
}

class TooEarly implements Explain {
  readonly _tag = "TooEarly";
  readonly msg: string;
  readonly raw: Date;

  constructor(
    date: Date,
    msg: string = "It's too early, back to bed."
  ) {
    this.msg = msg;
    this.raw = date;
  }
}

type HandledErrors = InvalidSeconds | InvalidSeason | TooEarly;

type GetToday = Effect.Effect<Today, HandledErrors, never>;

// I don't think new Date w/ no args could ever fail (?)
const freshDay = Effect.sync(() => new Date());

function processDate(d: Date): GetToday {
  const hour = d.getHours();
  const second = d.getSeconds();
  const minute = d.getMinutes();

  if (second % 2 === 0) {
    // we live on the off beat and swing thru the down beats.
    return Effect.fail(new InvalidSeconds(d));
  }

  const monthName = d.toLocaleString("default", { month: "long" }) as Month;
  const season = getSeason(monthName);

  if (season === "Winter") {
    // too cold to swing, cats cuddle in the winter.
    return Effect.fail(new InvalidSeason(d));
  }

  if (hour < 5) {
    return Effect.fail(new TooEarly(d));
  }

  const meridiemPeriod = hour < 12 ? "am" : "pm";
  const meal = nextMeal(hour, minute);

  return Effect.succeed<Today>({
    monthName,
    season,
    ordinalDate: ordinal(d.getDate()),
    year: d.getFullYear().toString(10),
    hour: hour === 0 ? "12" : padNumWithZeroes(2, hour),
    minute: padNumWithZeroes(2, minute),
    second: padNumWithZeroes(2, second),
    meridiem: meridiemPeriod,
    nextMeal: meal,
  });
}

export const getToday = freshDay.pipe(Effect.flatMap(processDate));
