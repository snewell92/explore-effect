import React, { useCallback, useEffect, useReducer, useState } from "react";

import { Data, Effect, Layer } from "effect";
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
} from "./collapsed";
import { FirstParam } from "./type-utils";
import { useLayer } from "./useLayer";

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

function promiseMachineReducer<Result, Error>(
  _state: Collapse<Result, Error | string>,
  action: Actions<Result, Error>
): Collapse<Result, Error | string> {
  return actionMatcher(action);
}

/** Collapse an Effect into a live data structure, returns a callback to cancel
 * 
 * An abort controller, matcher, and Collapse over an Exit execution of an Effect */
function createEffectCollapse<Result, Error, Requirements = never>(
  eff: EFF<Result, Error, Requirements>,
  layer: Layer.Layer<Requirements, any, never>,
  dispatch: React.Dispatch<Actions<Result, Error>>
) {
  return () => {
    const controller = new AbortController();
    dispatch(Begin());

    const matcher = createResolvedMatchCollapse<Result, Error | string>();

    Effect.runPromiseExit(Effect.provide(eff, layer), {
      signal: controller.signal,
    }).then((exit) => {
      const collapsed = collapseExit(exit);

      matcher({
        Success(s) {
          dispatch(Succeed(s));
        },
        Error(e) {
          if (e.isInterrupt) {
            console.info("an interrupt with error: ", e.error);
            // stay in a pending state, takes care of strict mode unmounting
            return;
          }

          dispatch(Fail(e));
        },
      })(collapsed);
    });

    return controller.abort.bind(controller);
  };
}

/** Runs an Effect as a promise on mount for client components, requires a RuntimeProvider context
 *
 * @param eff A referentially stable Effect to run, wrapped in a useEffect(..., [])
 */
export const usePromise = <Context, Result, Error>(
  eff: EFF<Result, Error, Context>
) => {
  const [state, dispatch] = useReducer<
    typeof promiseMachineReducer<Result, Error>
  >(promiseMachineReducer, EMPTY_COLLAPSE);

  const layer = useLayer<Context, Error>();
  useEffect(createEffectCollapse(eff, layer, dispatch), []);

  // pin the types so we can have exhaustive checking for cases
  const matcher = useCallback(
    createMatchCollapse<Result, Error | string>(),
    []
  );

  const match = useCallback((cases: FirstParam<typeof matcher>) => matcher(cases)(state), [state]);

  return {match, state} as const;
};

/** Wraps an Effect for client components, requires a RuntimeProvider context; call start to begin execution,
 * and use match to observe the state, or use your own ifs on the state directly. A stop function is provided
 * which will cancel the execution and reset the state back to Empty.
 *
 * @param eff A referentially stable Effect to run, wrapped in a useEffect(..., [])
 */
export const useLazyPromise = <Context, Result, Error>(
  eff: EFF<Result, Error, Context>
) => {
  const [cancel, setCancel] = useState<((reason?: string) => void) | null>(null);
  const [state, dispatch] = useReducer<
    typeof promiseMachineReducer<Result, Error>
  >(promiseMachineReducer, EMPTY_COLLAPSE);

  const layer = useLayer<Context, Error>();

  // pin the types so we can have exhaustive checking for cases
  const matcher = useCallback(
    createMatchCollapse<Result, Error | string>(),
    []
  );

  const kickOff = useCallback(createEffectCollapse(eff, layer, dispatch), [eff]);
  const match = useCallback((cases: FirstParam<typeof matcher>) => matcher(cases)(state), [state]);

  const start = useCallback(() => {
    setCancel(kickOff());
  }, [eff]);

  const stop = useCallback((reason?: string) => {
    if (cancel) {
      cancel(reason);
      dispatch(Begin());
    }
  }, [cancel]);

  return {match, state, start, stop} as const;
}