
import { Effect } from "effect";
import type { Effect as EFF } from "effect/Effect";
import { useEffect, useMemo, useState } from "react";

/** Runs a 'clean' synchronous effect, returning the result
 * 
 * @param effect An effect to run with Effect.runSync, once, by wrapping with useMemo
*/
export const useEffectSync = <TResult, TError>(effect: EFF<TResult, TError, never>): TResult => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => Effect.runSync(effect), []);
}

export type PromiseState = "init" | "pending" | "resolved:success" | "resolved:error";

type Init = {
  result: null,
  error: null,
  status: "init"
}

type Pending = {
  result: null,
  error: null,
  status: "pending"
}

type Resolved<TR> = {
  result: TR,
  error: null,
  status: "resolved:success"
}

type Errored<TE> = {
  result: null,
  error: TE,
  status: "resolved:error"
}

type States<TR, TE> = Init | Pending | Resolved<TR> | Errored<TE>

/** Runs an effect as a promise on mount
 * 
 * @param eff A referentially stable Effect to run
*/
export const useMountEffectPromise = <TR, TE>(eff: EFF<TR, TE>): States<TR, TE> => {
  const [result, setResult] = useState<TR | null>(null);
  const [status, setStatus] = useState<PromiseState>("init");
  const [error, setError] = useState<TE | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setStatus("pending");
    Effect.runPromiseExit(eff, { signal: controller.signal })
      .then(exit =>
        Effect.match(exit, {
          onSuccess(result) {
            setStatus("resolved:success");
            setResult(result);
          },
          onFailure(error) {
            setStatus("resolved:error");
            setError(error);
          },
        })
      ).then(Effect.runSync);

    return controller.abort.bind(controller);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ensures there is no invalid combination of state returned
  switch (status) {
    case "init":
      return { result, error, status } as Init;

    case "pending":
      return { result, error, status } as Pending;

    case "resolved:success":
      return { result, error, status } as Resolved<TR>;

    case "resolved:error":
      return { result, error, status } as Errored<TE>;
  }
}
