import React, { useEffect, useReducer } from "react";

import { Effect, Cause, Exit, Data } from "effect";
import type { Effect as EFF } from "effect/Effect";

import {
  CollapsedStates,
  EMPTY_COLLAPSE,
  PENDING_COLLAPSE,
  collapseError,
  collapseOk,
} from "./collapsed";

type Actions<Result, Error> = Data.TaggedEnum<{
  Process: {};
  Success: { readonly result: Result };
  Error: { readonly error: Error };
}>;

const { Process, Success, Error, $match } =
  Data.taggedEnum<Actions<any, any>>();

const actionMatcher = $match({
  Process: (_) => structuredClone(PENDING_COLLAPSE),
  Success: (s) => collapseOk(s.result),
  Error: (e) => collapseError(e.error),
});

function promiseMachineReducer<Result, Error>(
  _state: CollapsedStates<Result, Error | string>,
  action: Actions<Result, Error>
): CollapsedStates<Result, Error | string> {
  return actionMatcher(action);
}

function createEffectCollapse<Result, Error>(
  eff: EFF<Result, Error>,
  dispatch: React.Dispatch<Actions<Result, Error>>
) {
  return () => {
    const controller = new AbortController();
    dispatch(Process());

    Effect.runPromiseExit(eff, { signal: controller.signal }).then((exit) =>
      Exit.match(exit, {
        onSuccess(result) {
          dispatch(Success({ result }));
        },
        onFailure(cause) {
          Cause.match(cause, {
            onFail(error) {
              dispatch(Error({ error }));
            },
            onDie: (_defect) =>
              dispatch(
                Error({ error: "Unexpected defect: " + cause.toJSON() })
              ),
            onInterrupt: (fiberId) => {
              console.warn(`Interrupted [${fiberId}] - expecting retry`);
            },
            onParallel: (_l, _r) =>
              dispatch(Error({ error: "Unexpected parallel error" })),
            onSequential: (_l, _r) => {
              console.warn("Sequential failure, expecting retry");
            },
            onEmpty: null,
          });
        },
      })
    );

    return controller.abort.bind(controller);
  };
}

/** Runs an effect as a promise on mount
 *
 * @param eff A referentially stable Effect to run, wrapped in a useEffect(..., [])
 */
export const usePromise = <TR, TE>(
  eff: EFF<TR, TE>
): CollapsedStates<TR, TE | string> => {
  const [state, dispatch] = useReducer<typeof promiseMachineReducer<TR, TE>>(
    promiseMachineReducer,
    EMPTY_COLLAPSE
  );

  useEffect(createEffectCollapse(eff, dispatch), []);

  return state;
};
