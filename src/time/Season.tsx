import { Month } from "./time";

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";

export function getSeason(month: Month): Season {
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
