// https://scifi.stackexchange.com/a/105212

import { padNumWithZeroes } from "./format";
import { twentyFourToTwelve } from "./time";

// Taking the 7 meal interpretation, separating Dinner and Supper
export type HobbitMeal =
  | "Breakfast"
  | "Second Breakfast"
  | "Elevenses"
  | "Lunch"
  | "Tea Time"
  | "Dinner"
  | "Supper";

export type HourMinute = [number, number];

export interface Meal {
  name: HobbitMeal;
  time: HourMinute;
  runningLate: boolean;
}

export const declareMeal = (
  name: HobbitMeal,
  hour: number,
  minute: number
): Meal => ({
  name,
  time: [hour, minute],
  runningLate: false,
});

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

export function nextMeal(hour: number, minute: number): Meal {
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

export interface MealProps {
  meal: Meal;
}

export const Meal = ({ meal: { name, time, runningLate } }: MealProps) => {
  const [twelveHourTime, meridiemPeriod] = twentyFourToTwelve(time[0]);

  return (
    <div className="text-left border-l-4 pl-4 my-2 border-l-indigo-600">
      <p>
        🍴 {name} at {twelveHourTime}:{padNumWithZeroes(2, time[1])}
        {meridiemPeriod}
      </p>
      <p
        className={
          "text-xs pl-4 " + (runningLate ? "text-red-500 font-semibold" : "")
        }
      >
        {runningLate
          ? "Get there quick before food runs out!"
          : "Don't be late, they won't wait for you."}
      </p>
    </div>
  );
};
