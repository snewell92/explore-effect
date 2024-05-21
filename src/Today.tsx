/** A simple sync example of a computation in Effect to
 * calculate date/time/calendar display from today's date
 */

import { Effect } from "effect";
import { useEffectSync } from "./re-effect/useEffect";

type Month =
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

// https://scifi.stackexchange.com/a/105212
// Taking the 7 meal interpretation, separating Dinner and Supper
type HobbitMeal =
  | "Breakfast"
  | "Second Breakfast"
  | "Elevenses"
  | "Lunch"
  | "Tea Time"
  | "Dinner"
  | "Supper";

type HourMinute = [number, number];

interface Meal {
  name: HobbitMeal;
  time: HourMinute;
  runningLate: boolean;
}

function declareMeal(name: HobbitMeal, hour: number, minute: number): Meal {
  return {
    name,
    time: [hour, minute],
    runningLate: false,
  };
}

// times are to my liking
const HOBBIT_MEALS: Array<Meal> = [
  declareMeal("Breakfast", 8, 0),
  declareMeal("Second Breakfast", 10, 0),
  declareMeal("Elevenses", 11, 0),
  declareMeal("Lunch", 12, 30),
  declareMeal("Tea Time", 16, 0),
  declareMeal("Dinner", 18, 0),
  declareMeal("Supper", 21, 0),
];

// You can still make it within 5 minutes, but after that the doors are locked.
const WIGGLE_MINUTE = 5;

function nextMeal(hour: number, minute: number): Meal {
  // in case of a looooooong session (y tho), don't mutate original
  const meals = structuredClone(HOBBIT_MEALS);

  let nextMeal = meals[0];

  for (const meal of meals) {
    nextMeal = meal;

    const [mealHour, mealMinute] = meal.time;

    if (mealHour < hour) {
      continue;
    }

    if (mealHour > hour) {
      break;
    }

    const cutOff = mealMinute + WIGGLE_MINUTE;
    if (cutOff >= minute) {
      if (mealMinute <= minute) {
        nextMeal.runningLate = true;
      }

      break;
    }
  }

  return nextMeal;
}

interface Today {
  monthName: Month;
  ordinalDate: string;
  year: string;
  hour: string;
  minute: string;
  second: string;
  meridiem: "pm" | "am";
  season: "Spring" | "Summer" | "Autumn" | "Winter";
  nextMeal: Meal;
}

const EXPLAIN_SYM = Symbol("explain");

interface Explain {
  [EXPLAIN_SYM]: true;
  explain(): string;
}

function isExplainable(e: unknown): e is Explain {
  // is this really better than instanceof checks...
  return (
    typeof e === "object" &&
    e != null &&
    EXPLAIN_SYM in e &&
    e[EXPLAIN_SYM] === true
  );
}

class InvalidSeconds implements Explain {
  readonly _tag = "InvalidSeconds";
  readonly [EXPLAIN_SYM] = true;

  explain(): string {
    return "The second can't even.";
  }
}

class InvalidSeason implements Explain {
  readonly _tag = "InvalidSeason";
  readonly [EXPLAIN_SYM] = true;

  explain(): string {
    return "The season is too cold.";
  }
}

// Add errors here
type HandledErrors = InvalidSeconds | InvalidSeason;

type GetToday = Effect.Effect<Today, HandledErrors, never>;

// I don't think new Date w/ no args could ever fail (?)
const freshDay = Effect.sync(() => new Date());

/** Pad left with numDigit zeroes */
function padNumWithZeroes(numDigits: number, n: number) {
  return n.toString(10).padStart(numDigits, "0");
}

function getSeason(month: Month): Today["season"] {
  switch (month) {
    case "December":
    case "January":
    case "February":
      return "Winter";
    case "March":
    case "April":
    case "May":
      return "Spring";
    case "June":
    case "July":
    case "August":
      return "Summer";
    case "September":
    case "October":
    case "November":
      return "Autumn";
  }
}

const english_ordinal_rules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes: Record<Intl.LDMLPluralRule, string> = {
  zero: "th",
  one: "st",
  two: "nd",
  few: "rd",
  other: "th",
  many: "th",
} as const;

function ordinal(number: number) {
  const category = english_ordinal_rules.select(number);
  const suffix = suffixes[category];

  return number.toString(10) + suffix;
}

function processDate(d: Date): Effect.Effect<Today, HandledErrors, never> {
  const hour = d.getHours();
  const second = d.getSeconds();
  const minute = d.getMinutes();

  if (second % 2 === 0) {
    // we live on the off beat and swing thru the down beats.
    return Effect.fail(new InvalidSeconds());
  }

  const monthName = d.toLocaleString("default", { month: "long" }) as Month;
  const season = getSeason(monthName);

  if (season === "Winter") {
    // too cold to swing, cats cuddle in the winter.
    return Effect.fail(new InvalidSeason());
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

const getToday: GetToday = freshDay.pipe(Effect.flatMap(processDate));

interface Bits {
  emoji: string;
  borderColor: string;
}

const SEASON_BITS: Record<Today["season"], Bits> = {
  Autumn: {
    emoji: "🍂",
    borderColor: "border-orange-300",
  },
  Spring: {
    borderColor: "border-green-300",
    emoji: "🌷",
  },
  Summer: {
    borderColor: "border-red-600",
    emoji: "🌞",
  },
  Winter: {
    borderColor: "border-blue-300",
    emoji: "❄",
  },
};

/** Display nicely formatted details about today, definitely has no quirks */
export const Today = () => {
  const { result, status, error } = useEffectSync(getToday);

  if (status !== "success") {
    return (
      <div className="text-center border-4 border-red-600 p-4 rounded-lg mx-12 mb-6 min-h-80">
        <h1 className="text-slate-700 text-2xl">What is today?</h1>
        {isExplainable(error) ? <p>{error.explain()}</p> : <p>{error}</p>}
      </div>
    );
  }

  const {
    monthName,
    ordinalDate,
    year,
    hour,
    minute,
    second,
    meridiem,
    season,
    nextMeal,
  } = result;

  const { emoji, borderColor } = SEASON_BITS[season];
  const { name, time, runningLate } = nextMeal;

  return (
    <div className="text-center border-4 border-lime-300 p-4 rounded-lg mx-12 mb-6 min-h-80">
      <h1 className="text-slate-700 text-2xl">Today is:</h1>
      <p className="mb-2 border-x-2 border-sky-300 mx-auto w-fit inline-block px-2">
        {monthName} {ordinalDate}, {year}
      </p>
      <div className="text-left border-l-4 border-cyan-300 pl-4 my-2">
        <p>
          🕰 {hour}:{minute}
          {meridiem}
        </p>
        <p className="pl-2 text-xs">at {second} seconds</p>
      </div>

      <div className={"text-left border-l-4 pl-4 my-2 " + borderColor}>
        <p>
          {emoji} {season}
        </p>
      </div>

      <div className="text-left border-l-4 pl-4 my-2 border-l-indigo-600">
        <p>
          🍴 {name} at {time[0]}:{padNumWithZeroes(2, time[1])}.{" "}
          {runningLate
            ? "Get there quick before food runs out!"
            : "Don't be late, they won't wait for you."}
        </p>
      </div>
    </div>
  );
};
