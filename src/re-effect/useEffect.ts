import { useEffect, useMemo, useState } from "react";

import { Effect, Cause, Exit } from "effect";

import type { Effect as EFF } from "effect/Effect";
import { CollapsedEffectState, CollapsedStates, CollapsedSyncStates, collapseExit } from "./collapsed";
import { compose } from "effect/Function";

const collapseEffectSync = compose(Effect.runSyncExit, collapseExit);

/** Runs a 'clean' synchronous effect, returning the result
 * 
 * @param effect An effect to run with Effect.runSync, once, by wrapping with useMemo(..., [])
*/
export const useEffectSync = <TResult, TError>(effect: EFF<TResult, TError, never>): CollapsedSyncStates<TResult, TError | string> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => collapseEffectSync(effect), []);
}

/** Runs an effect as a promise on mount
 * 
 * @param eff A referentially stable Effect to run, wrapped in a useEffect(..., [])
*/
export const useMountEffectPromise = <TR, TE>(eff: EFF<TR, TE>): CollapsedStates<TR, TE | string> => {
  // TODO consider useReducer
  const [result, setResult] = useState<TR | null>(null);
  const [status, setStatus] = useState<CollapsedEffectState>("init");
  const [error, setError] = useState<TE | string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("processing");

    Effect.runPromiseExit(eff, { signal: controller.signal }).then(exit =>
      Exit.match(exit, {
        onSuccess(result) {
          setResult(result);
          setStatus("success");
        },
        onFailure(cause) {
          let setToError = true;

          Cause.match(cause, {
            onFail(error) {
              setError(error);
            },
            onDie: (_defect) =>
              setError("Unexpected defect: " + cause.toJSON()),
            onInterrupt: (fiberId) => {
              setToError = false;
              console.warn(`Interrupted [${fiberId}] - expecting retry`);
            },
            onParallel: (_l, _r) => setError("Unexpected parallel error"),
            onSequential: (_l, _r) => {
              setToError = false;
              console.warn("Sequential failure, expecting retry");
            },
            onEmpty: null,
          });

          if (setToError) {
            setStatus("error");
          }
        }
      })
    );

    return controller.abort.bind(controller);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // we need to as to get type narrowing to work properly when using this
  return { result, error, status } as CollapsedStates<TR, TE | string>;
}
