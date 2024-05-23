import { Exit, match as matchExit } from "effect/Exit";
import { match as matchCause } from "effect/Cause";

export type CollapsedEffectState = "init" | "processing" | "success" | "error";

export interface CollapsedEffect<TResult, TError, TState = CollapsedEffectState> {
  result: TResult,
  error: TError,
  status: TState
}

export type EmptyCollapse = CollapsedEffect<null, null, "init">;
export type PendingCollapse = CollapsedEffect<null, null, "processing">;
export type SucceededCollapse<TR> = CollapsedEffect<TR, null, "success">;
export type ErroredCollapse<TE> = CollapsedEffect<null, TE, "error">;

export type CollapsedStates<TR, TE> = EmptyCollapse | PendingCollapse | SucceededCollapse<TR> | ErroredCollapse<TE>;

/** For blocking cases that will never enter their init or pending states. */
export type CollapsedSyncStates<TR, TE> = SucceededCollapse<TR> | ErroredCollapse<TE>;

export const EMPTY_COLLAPSE: EmptyCollapse = {
  result: null,
  error: null,
  status: "init"
};

export const PENDING_COLLAPSE: PendingCollapse = {
  result: null,
  error: null,
  status: "processing"
};

export function collapseOk<TR>(result: TR): SucceededCollapse<TR> {
  return {
    result,
    error: null,
    status: "success"
  }
}

export function collapseError<TE>(error: TE): ErroredCollapse<TE> {
  return {
    result: null,
    error,
    status: "error"
  }
}

export function collapseExit<TR, TE>(exit: Exit<TR, TE>): CollapsedSyncStates<TR, TE | string> {
  return matchExit(exit, {
    onSuccess: collapseOk,
    onFailure(cause) {
      return matchCause<ErroredCollapse<TE | string>, TE>(cause, {
        onFail: collapseError,
        onDie: (_defect) => collapseError("Unexpected defect: " + cause.toJSON()),
        onInterrupt: (fiberId) => collapseError(`Interrupted [${fiberId}] - expecting retry`),
        onParallel: (_l, _r) => collapseError("Unexpected parallel error"),
        onSequential: (_l, _r) => collapseError("Sequential failure, expecting retry"),
        onEmpty: collapseError("Empty cause of failure: " + cause.toJSON()),
      });
    }
  });
}