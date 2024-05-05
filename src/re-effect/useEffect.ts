import { useEffect, useMemo, useState } from "react";

import { Effect, Cause } from "effect";

import type { Effect as EFF } from "effect/Effect";
import type { Exit as EX } from "effect/Exit";
import { CollapsedState, CollapsedStates, EmptyCollapse, ErroredCollapse, PendingCollapse, SuceededCollapse, collapseError, collapseOk } from "./collapsed";

/** Collapse an Exit, only handles Fail type Causes
 * 
 * @param exit The Exit to handle
 * @returns A CollapsedResult, potentially with a string as the
 *   error if the Cause of the Exit is not a Fail type
 */
function collapseExit<TR, TE>(exit: EX<TR, TE>): SuceededCollapse<TR> | ErroredCollapse<TE | string> {
  switch (exit._tag) {
    case "Success":
      return collapseOk(exit.value);
    case "Failure":
      if (Cause.isFailType(exit.cause)) {
        return collapseError(exit.cause.error);
      } else {
        console.warn("Non Fail Cause; falling back to toString");
        console.warn(exit.cause);

        const exitCause = exit.cause.toString();
        return collapseError(exitCause);
      }
  }
}

/** Runs a 'clean' synchronous effect, returning the result
 * 
 * @param effect An effect to run with Effect.runSync, once, by wrapping with useMemo
*/
export const useEffectSync = <TResult, TError>(effect: EFF<TResult, TError, never>): CollapsedStates<TResult, TError | string> => {
  return useMemo(() => {
    const exit = Effect.runSyncExit(effect);

    return collapseExit(exit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Runs an effect as a promise on mount
 * 
 * @param eff A referentially stable Effect to run
*/
export const useMountEffectPromise = <TR, TE>(eff: EFF<TR, TE>): CollapsedStates<TR, TE> => {
  const [result, setResult] = useState<TR | null>(null);
  const [status, setStatus] = useState<CollapsedState>("init");
  const [error, setError] = useState<TE | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setStatus("processing");
    Effect.runPromiseExit(eff, { signal: controller.signal })
      .then(exit => {
        switch (exit._tag) {
          case "Success":
            setStatus("success");
            setResult(exit.value);
            break;
          case "Failure":
            if (Cause.isFailType(exit.cause)) {
              setStatus("error");
              setError(exit.cause.error);
            } else {
              setStatus("error");
              console.error("Invalid Cause; must be fail type");
              console.error(exit.cause);
            }
            break;
        }
      });
    return controller.abort.bind(controller);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ensures there is no invalid combination of state returned
  switch (status) {
    case "init":
      return { result, error, status } as EmptyCollapse;

    case "processing":
      return { result, error, status } as PendingCollapse;

    case "success":
      return { result, error, status } as SuceededCollapse<TR>;

    case "error":
      return { result, error, status } as ErroredCollapse<TE>;
  }
}
