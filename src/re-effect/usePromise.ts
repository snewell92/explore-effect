import React, { useCallback, useEffect, useReducer } from "react";

import { Effect, Data } from "effect";
import type { Effect as EFF } from "effect/Effect";

import {
  Collapse,
  EMPTY_COLLAPSE,
  PENDING_COLLAPSE,
  collapseError,
  collapseExit,
  collapseOk,
  createMatchCollapse,
  matchCollapse,
} from "./collapsed";
import { FirstParam } from "./type-utils";

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
  _state: Collapse<Result, Error | string>,
  action: Actions<Result, Error>
): Collapse<Result, Error | string> {
  return actionMatcher(action);
}

function createEffectCollapse<Result, Error>(
  eff: EFF<Result, Error>,
  dispatch: React.Dispatch<Actions<Result, Error>>
) {
  return () => {
    const controller = new AbortController();
    dispatch(Process());

    Effect.runPromiseExit(eff, { signal: controller.signal }).then((exit) => {
      const collapsed = collapseExit(exit);

      matchCollapse({
        Success(s) {
          dispatch(Success(s));
        },
        Error(e) {
          dispatch(Error(e));
        },
      })(collapsed);
    });

    return controller.abort.bind(controller);
  };
}

/** Runs an effect as a promise on mount
 *
 * @param eff A referentially stable Effect to run, wrapped in a useEffect(..., [])
 */
export const usePromise = <TR, TE>(eff: EFF<TR, TE>) => {
  const [state, dispatch] = useReducer<typeof promiseMachineReducer<TR, TE>>(
    promiseMachineReducer,
    EMPTY_COLLAPSE
  );

  useEffect(createEffectCollapse(eff, dispatch), []);

  // pin the types so we can have exhaustive checking for cases
  const matcher = useCallback(createMatchCollapse<TR, TE | string>(), []);

  type CollapseMatcher = FirstParam<typeof matcher>;

  const match = <Cases extends CollapseMatcher>(cases: Cases) =>
    matcher(cases)(state);

  return [match, state] as const;
};
