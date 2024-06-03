import { useMemo } from "react";

import { Effect } from "effect";
import type { Effect as EFF } from "effect/Effect";

import { CollapsedSyncStates, collapseExit } from "./collapsed";
import { compose } from "effect/Function";

/** Gives you the errors useSync would yield */
export type GetSyncErrors<TEffect extends EFF<any, any, any>> =
  | EFF.Error<TEffect>
  | string;

const collapseEffectSync = compose(Effect.runSyncExit, collapseExit);

/** Runs a 'clean' synchronous effect, returning the result
 *
 * @param effect An effect to run with Effect.runSync, once, by wrapping with useMemo(..., [])
 */
export const useSync = <TResult, TError>(
  effect: EFF<TResult, TError, never>
): CollapsedSyncStates<TResult, TError | string> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => collapseEffectSync(effect), []);
};
