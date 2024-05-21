import { useCallback, useState } from "react";
import { Today } from "./time/Today";

function incrementNum(a: number): number {
  return a + 1;
}

export function App() {
  const [todayMountKey, setTodayMountKey] = useState(0);

  const remountToday = useCallback(() => setTodayMountKey(incrementNum), []);

  return (
    <div className="pl-6">
      <h1 className="text-slate-700 text-4xl mt-4 mb-2 underline decoration-lime-400">
        Effect Explorations
      </h1>
      <p className="mb-4 pl-2">With a bit of whimsy</p>
      <Today key={todayMountKey} />
      <button
        className="bg-lime-400 border-space-4 group border-4 block mx-auto px-12 py-4 text-2xl text-center border-purple-950 hover:border-teal-300"
        onClick={remountToday}
      >
        Refresh{" "}
        <span className="inline-block group-hover:animate-spin h-10 w-10">
          ♻
        </span>
      </button>
    </div>
  );
}
