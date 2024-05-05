import { useState } from 'react'
import { Effect } from "effect";
import { ReEffect } from './re-effect';

const hiEff = Effect.succeed("Hello");
const supEff = Effect.succeed("'sup");
const willError = Effect.fail("bang");

export function App() {
  const [count, setCount] = useState(0)
  const { status: hiStatus, result: hi } = ReEffect.useSync(hiEff);
  const { status: supStatus, result } = ReEffect.usePromise(supEff);
  const { status: willErrStatus, error } = ReEffect.usePromise(willError);

  return (
    <div className="pl-6">
      <p>{hi} ({hiStatus})</p>
      <p>Sup: {supStatus === "success" ? result : "Processing..."}</p>
      <p>Err: {willErrStatus === "error" ? error : "Processing..."}</p>
      <h1 className="text-slate-700 text-4xl mt-4 mb-6">Effect Explorations</h1>
      <div>
        <button className="bg-lime-300 border-space-4 border-4 border-purple-950 p-1 hover:border-teal-400" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}
