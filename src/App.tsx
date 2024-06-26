import { useCallback, useState } from "react";
import { RichDateTimeDisplay } from "./time/RichDateTimeDisplay";
import { Current, DisplayMode, Specified } from "./time/time";

function incrementNum(a: number): number {
  return a + 1;
}

export function App() {
  const [todayMountKey, setTodayMountKey] = useState(0);
  const [mode, setMode] = useState<DisplayMode>(Current());
  const [input, setInput] = useState<string | null>(null);

  const remountToday = useCallback(() => {
    setInput(null);
    setTodayMountKey(incrementNum);
  }, []);

  const updateInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e?.target?.value?.trim() ?? "";
    if (clean.length === 0) {
      setInput(null);
    } else {
      setMode(Specified({ isoDateTime: clean }));
      setInput(clean);
    }
  }, []);

  return (
    <div className="pl-6">
      <h1 className="text-slate-700 text-4xl mt-4 mb-2 underline decoration-lime-400">
        Effect Explorations
      </h1>
      <p className="mb-4 pl-2">With a bit of whimsy</p>

      <RichDateTimeDisplay key={`${todayMountKey}-${input}`} mode={mode} />

      <button
        className="bg-lime-400 border-space-4 group border-4 block mx-auto px-12 py-2 text-2xl text-center border-purple-950 hover:border-teal-300"
        onClick={remountToday}
      >
        Reset <span className="inline-block group-hover:animate-spin">♻</span>
      </button>

      <div className="mt-8 mx-auto w-fit">
        <label>Arbitrary Date time: </label>
        <input
          type="text"
          value={input ?? ""}
          onChange={updateInput}
          className="border-4 border-purple-950 px-2 py-1"
        />
      </div>
    </div>
  );
}
