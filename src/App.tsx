import { useState } from 'react'
import { Effect } from "effect";
import { useMountEffectPromise } from './re-effect/useEffect';

const seco = Effect.succeed("Hello");

export function App() {
  const [count, setCount] = useState(0)
  const { status, result } = useMountEffectPromise(seco);

  return (
    <div className="pl-6">
      <p>{status === "resolved:success" ? result : "Processing..."}</p>
      <h1 className="text-slate-700 text-4xl mt-4 mb-6">Effect Explorations</h1>
      <div>
        <button className="bg-lime-300 border-space-4 border-4 border-purple-950 p-1 hover:border-teal-400" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}
