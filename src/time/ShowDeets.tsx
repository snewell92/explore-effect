import { TodayFact } from "~/facts/FactsService";
import { useState } from "react";

export const ShowDeets = () => {
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
