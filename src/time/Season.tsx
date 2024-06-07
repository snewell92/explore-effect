import { Context, Effect, Layer } from "effect";
import { Month } from "./time";
import { DateError, raiseDateError } from "./error";

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";

interface Bits {
  emoji: string;
  borderColor: string;
}

const SEASON_BITS: Record<Season, Bits> = {
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

export interface SeasonProps {
  season: Season;
}

export const Season = ({ season }: SeasonProps) => {
  const { emoji, borderColor } = SEASON_BITS[season];

  return (
    <div className={"text-left border-l-4 pl-4 my-2 " + borderColor}>
      <p>
        {emoji} {season}
      </p>
    </div>
  );
};

export class SeasonService extends Context.Tag("Season")<
  SeasonService,
  {
    readonly getMonthName: (d: Date) => Month;
    readonly getSeason: (
      month: Month,
      d: Date
    ) => Effect.Effect<Season, DateError, never>;
  }
>() {}

export const SeasonServiceLive = Layer.succeed(SeasonService, {
  getMonthName(d) {
    return d.toLocaleString("default", { month: "long" }) as Month;
  },
  getSeason(month, d: Date) {
    switch (month) {
      case "December":
      case "January":
      case "February":
        // too cold to swing, cats cuddle in the winter.
        return raiseDateError("TOO_COLD", d);
      //return "Winter";
      case "March":
      case "April":
      case "May":
        return Effect.succeed("Spring");
      case "June":
      case "July":
      case "August":
        return Effect.succeed("Summer");
      case "September":
      case "October":
      case "November":
        return Effect.succeed("Autumn");
    }
  },
});
