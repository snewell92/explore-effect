import { TodayFact } from "~/facts/FactsService";
import { Today } from "./time";
import { useState } from "react";

interface DeetsProps {
  today: Today;
}

export const ShowDeets = ({ today }: DeetsProps) => {
  const [showFact, setShowFact] = useState(false);
  const prefetch = TodayFact.getPrefetcher();

  function showIt() {
    setShowFact(true);
  }

  return (
    <div onMouseEnter={prefetch}>
      <p>Hai</p>
      <button onClick={showIt}>Reveal Today's Fact</button>
      {showFact ? <TodayFact /> : null}
    </div>
  );
};
