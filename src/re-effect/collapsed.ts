import { type Exit, match as matchExit } from "effect/Exit";
import { type Cause, match as matchCause } from "effect/Cause";
import { type Effect } from "effect/Effect";
import { FiberId } from "effect/FiberId";
import { Data } from "effect";
import { FirstParam } from "./type-utils";

/** A 'live' version of Exit to represent executing (aka collapsing) an Effect,
 * includes states for initial (empty) / pending / success / error.
 */
export type Collapse<Result, Error> = Data.TaggedEnum<{
  Empty: {};
  Pending: {};
  Success: { readonly result: Result };
  Error: {
    readonly error: Error;
    /** A flag to mark the failure as an interrupt, which should usually be ignored by usePromise/useSync
     *
     * This kind of error may be due to a signal interruption or a fiber interrupt,
     * like from an AbortController firing its signal when something is unmounted.
     */
    readonly isInterrupt: boolean;
  };
}>;

/** A Collapse TaggedEnum constrainted to its Success or Error types only  */
type ResolvedCollapse<Result, Error> = Data.TaggedEnum.Value<
  Collapse<Result, Error>,
  "Success" | "Error"
>;

interface CollapseDef extends Data.TaggedEnum.WithGenerics<2> {
  readonly taggedEnum: Collapse<this["A"], this["B"]>;
}

const { Empty, Pending, Success, Error } = Data.taggedEnum<CollapseDef>();

export type SuccessCase<T> = ReturnType<typeof Success<T, any>>;
export type InferSuccessCase<T> =
  T extends (...args: any[]) => Effect<infer S, any, any>
    ? SuccessCase<S>
    : T extends Effect<infer S, any, any>
      ? SuccessCase<S>
      : SuccessCase<T>;

export type ErrorCase<T> = ReturnType<typeof Error<T, any>>;
export type InferErrorCase<T> =
  T extends (...args: any[]) => Effect<any, infer E, any>
    ? ErrorCase<E>
    : T extends Effect<any, infer E, any>
      ? ErrorCase<E>
      : SuccessCase<T>;

interface ResolvedCollapseDef extends Data.TaggedEnum.WithGenerics<2> {
  readonly taggedEnum: ResolvedCollapse<this["A"], this["B"]>;
}

const { $match: matchResolved } = Data.taggedEnum<ResolvedCollapseDef>();

export const EMPTY_COLLAPSE = Empty();
export const PENDING_COLLAPSE = Pending();

export function collapseOk<Result>(result: Result) {
  return Success({ result });
}

export function collapseError<Error>(error: Error, isInterrupt = false) {
  return Error({ error, isInterrupt });
}

/** Create a matcher for a resolved collapse (only success/error) */
export const matchCollapse = matchResolved;

/** Create a strongly typed match constructor for any resolved collapse */
export function createResolvedMatchCollapse<Result, Error>() {
  const pinnedEnum = Data.taggedEnum<ResolvedCollapse<Result, Error>>();
  return pinnedEnum.$match;
}

/** Create a strongly typed match constructor for any collapse */
export function createMatchCollapse<Result, Error>() {
  const pinnedEnum = Data.taggedEnum<Collapse<Result, Error>>();
  return pinnedEnum.$match;
}

type CauseMatcher<ReducedValue, Error> = Parameters<
  typeof matchCause<ReducedValue, Error>
>[1];

const CAUSE_MATCHER = {
  onFail: collapseError,
  onEmpty: collapseError("Empty cause"),
  onDie: (defect: any) => collapseError("Unexpected defect: " + String(defect)),
  onInterrupt: (fiberId: FiberId) =>
    collapseError(`Interrupted [${fiberId}] - expecting retry`, true),
  onParallel: (_l: any, _r: any) => collapseError("Unexpected parallel error"),
  onSequential: (_l: any, _r: any) =>
    collapseError("Sequential failure, expecting retry", true),
} as CauseMatcher<any, any>;

const collapseCause = <Error>(
  cause: Cause<Error>
): Collapse<never, Error | string> => matchCause(cause, CAUSE_MATCHER);

type ExitMatcher<Error, Result, Z1, Z2> = FirstParam<
  typeof matchExit<Error, Result, Z1, Z2>
>;

const EXIT_MATCHER = {
  onSuccess: collapseOk,
  onFailure: collapseCause,
} as ExitMatcher<any, any, any, any>;

/** Match a given Exit and its inner Cause (if applicable) down to a Success or Error.
 * The underlying Cause matching may go down an Exit path without an Error available,
 * and will construct a string in that case - hence the `| string` added to the error type.
 */
export const collapseExit = <Result, Error>(
  exit: Exit<Result, Error>
): ResolvedCollapse<Result, Error | string> => matchExit(exit, EXIT_MATCHER);
