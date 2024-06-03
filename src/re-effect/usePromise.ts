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
  createResolvedMatchCollapse,
  matchCollapse,
} from "./collapsed";
import { FirstParam } from "./type-utils";

type Actions<Result, Error> = Data.TaggedEnum<{
  Begin: {};
  Succeed: { readonly result: Result };
  Fail: { readonly error: Error };
}>;

const { Begin, Succeed, Fail, $match } = Data.taggedEnum<Actions<any, any>>();

const actionMatcher = $match({
  Begin: (_) => structuredClone(PENDING_COLLAPSE),
  Succeed: (s) => collapseOk(s.result),
  Fail: (e) => collapseError(e.error),
});

const R: React.Reducer<Collapse<string, string>, Actions<string, string>> = (
  s,
  a
) => {
  return actionMatcher(a);
};

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
    dispatch(Begin());

    const matcher = createResolvedMatchCollapse<Result, Error | string>();

    Effect.runPromiseExit(eff, { signal: controller.signal }).then((exit) => {
      const collapsed = collapseExit(exit);

      matcher({
        Success(s) {
          dispatch(Succeed(s));
        },
        Error(e) {
          dispatch(Fail(e));
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
export const usePromise = <Result, Error>(eff: EFF<Result, Error>) => {
  const [state, dispatch] = useReducer<
    typeof promiseMachineReducer<Result, Error>
  >(promiseMachineReducer, EMPTY_COLLAPSE);

  useEffect(createEffectCollapse(eff, dispatch), []);

  // pin the types so we can have exhaustive checking for cases
  const matcher = useCallback(
    createMatchCollapse<Result, Error | string>(),
    []
  );

  type CollapseMatcher = FirstParam<typeof matcher>;

  const match = <Cases extends CollapseMatcher>(cases: Cases) =>
    matcher(cases)(state);

  return [match, state] as const;
};
