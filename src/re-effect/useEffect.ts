
import { Effect } from "effect";
import type { Effect as EFF } from "effect/Effect";
import { useEffect, useState } from "react";

/** Runs a 'clean' synchronous effect, returning the result */
export const useEffectSync = <TResult, TError>(effect: EFF<TResult, TError, never>): TResult =>
  Effect.runSync(effect);

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
    Effect.runPromise(eff, { signal: controller.signal })
      .then(res => {
        setStatus("resolved:success");
        setResult(res);
      })
      .catch(err => {
        setStatus("resolved:error");
        setError(err);
      });

    return controller.abort.bind(controller);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
