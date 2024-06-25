import { useCallback, useMemo } from "react";

import { Effect } from "effect";
import type { Effect as EFF } from "effect/Effect";

import { collapseExit, createResolvedMatchCollapse } from "./collapsed";
import { compose } from "effect/Function";
import { FirstParam } from "./type-utils";

/** Gives you the errors useSync/usePromise would yield */
export type GetErrors<TEffect extends EFF<unknown, unknown, unknown>> =
  | EFF.Error<TEffect>
  | string;

const collapseEffectSync = compose(Effect.runSyncExit, collapseExit);

/** Runs a 'clean' synchronous effect, returning a convenient matcher and the resolved Collapsed Effect.
 *
 * @param effect An effect to run with Effect.runSync, once, by wrapping with useMemo(..., [])
 */
export const useSync = <TResult, TError>(
  effect: EFF<TResult, TError, never>
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => {
    const collapsed = collapseEffectSync<TResult, TError | string>(effect);

    // pin the types so we can have exhaustive checking for cases
    const matcher = useCallback(
      createResolvedMatchCollapse<TResult, TError | string>(),
      []
    );

    type CollapseMatcher = FirstParam<typeof matcher>;

    const match = <Cases extends CollapseMatcher>(cases: Cases) =>
      matcher(cases)(collapsed);

    return [match, collapsed] as const;
  }, []);
};
