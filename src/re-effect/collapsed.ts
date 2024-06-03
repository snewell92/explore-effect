import { type Exit, match as matchExit } from "effect/Exit";
import { type Cause, match as matchCause } from "effect/Cause";
import { FiberId } from "effect/FiberId";

export type CollapsedEffectState = "init" | "processing" | "success" | "error";

export interface CollapsedEffect<
  TResult,
  TError,
  TState = CollapsedEffectState
> {
  result: TResult;
  error: TError;
  status: TState;
}

export type EmptyCollapse = CollapsedEffect<null, null, "init">;
export type PendingCollapse = CollapsedEffect<null, null, "processing">;
export type SucceededCollapse<TR> = CollapsedEffect<TR, null, "success">;
export type ErroredCollapse<TE> = CollapsedEffect<null, TE, "error">;

export type CollapsedStates<TR, TE> =
  | EmptyCollapse
  | PendingCollapse
  | SucceededCollapse<TR>
  | ErroredCollapse<TE>;

/** For blocking cases that will never enter their init or pending states. */
export type CollapsedSyncStates<TR, TE> =
  | SucceededCollapse<TR>
  | ErroredCollapse<TE>;

export const EMPTY_COLLAPSE: EmptyCollapse = {
  result: null,
  error: null,
  status: "init",
};

export const PENDING_COLLAPSE: PendingCollapse = {
  result: null,
  error: null,
  status: "processing",
};

export function collapseOk<TR>(result: TR): SucceededCollapse<TR> {
  return {
    result,
    error: null,
    status: "success",
  };
}

export function collapseError<TE>(error: TE): ErroredCollapse<TE> {
  return {
    result: null,
    error,
    status: "error",
  };
}

interface CauseMatcher<TE> {
  onFail(error: TE): ErroredCollapse<TE>;
  onEmpty: ErroredCollapse<string>;
  onDie(defect: any): ErroredCollapse<string>;
  onInterrupt(fiberId: FiberId): ErroredCollapse<string>;
  onParallel(_l: any, _r: any): ErroredCollapse<string>;
  onSequential(_l: any, _r: any): ErroredCollapse<string>;
}

const CAUSE_MATCHER = {
  onFail: collapseError,
  onEmpty: collapseError("Empty cause"),
  onDie: (defect: any) => collapseError("Unexpected defect: " + String(defect)),
  onInterrupt: (fiberId: FiberId) =>
    collapseError(`Interrupted [${fiberId}] - expecting retry`),
  onParallel: (_l: any, _r: any) => collapseError("Unexpected parallel error"),
  onSequential: (_l: any, _r: any) =>
    collapseError("Sequential failure, expecting retry"),
} satisfies CauseMatcher<any>;

const collapseCause = <TE>(cause: Cause<TE>) =>
  matchCause<ErroredCollapse<TE | string>, TE>(cause, CAUSE_MATCHER);

interface ExitMatcher<TR, TE> {
  onSuccess(r: TR): SucceededCollapse<TR>;
  onFailure(e: Cause<TE>): ErroredCollapse<TE | string>;
}

const EXIT_MATCHER = {
  onSuccess: collapseOk,
  onFailure: collapseCause,
} satisfies ExitMatcher<unknown, unknown>;

/** Match a given Exit and its inner Cause (if applicable) down to a Success or Error */
export const collapseExit = <TR, TE>(
  exit: Exit<TR, TE>
): CollapsedSyncStates<TR, TE | string> =>
  matchExit<TR, TE, ErroredCollapse<TE | string>, SucceededCollapse<TR>>(
    exit,
    EXIT_MATCHER
  );
