import { type Exit, match as matchExit } from "effect/Exit";
import { type Cause, match as matchCause } from "effect/Cause";
import { FiberId } from "effect/FiberId";
import { Data } from "effect";
import { ExtractByTag, FirstParam } from "./type-utils";

export type Collapse<Result, Error> = Data.TaggedEnum<{
  Empty: {};
  Pending: {};
  Success: { readonly result: Result };
  Error: { readonly error: Error };
}>;

/** A Collapse TaggedEnum constrainted to its Success or Error types only  */
type ResolvedCollapse<Result, Error> = ExtractByTag<
  Collapse<Result, Error>,
  "Success" | "Error"
>;

interface CollapseDef extends Data.TaggedEnum.WithGenerics<2> {
  readonly taggedEnum: Collapse<this["A"], this["B"]>;
}

const { Empty, Pending, Success, Error } = Data.taggedEnum<CollapseDef>();

interface ResolvedCollapseDef extends Data.TaggedEnum.WithGenerics<2> {
  readonly taggedEnum: ResolvedCollapse<this["A"], this["B"]>;
}

const { $match: matchResolved } = Data.taggedEnum<ResolvedCollapseDef>();

export const EMPTY_COLLAPSE = Empty();
export const PENDING_COLLAPSE = Pending();

export function collapseOk<TR>(result: TR) {
  return Success({ result });
}

export function collapseError<TE>(error: TE) {
  return Error({ error });
}

/** Create a matcher for a resolved collapse (only success/error) */
export const matchCollapse = matchResolved;

/** Create a strongly typed match constructor for any resolved collapse */
export function createResolvedMatchCollapse<TR, TE>() {
  const pinnedEnum = Data.taggedEnum<ResolvedCollapse<TR, TE>>();
  return pinnedEnum.$match;
}

/** Create a strongly typed match constructor for any resolved collapse */
export function createMatchCollapse<TR, TE>() {
  const pinnedEnum = Data.taggedEnum<Collapse<TR, TE>>();
  return pinnedEnum.$match;
}

type CauseMatcher<Z, E> = Parameters<typeof matchCause<Z, E>>[1];

const CAUSE_MATCHER = {
  onFail: collapseError,
  onEmpty: collapseError("Empty cause"),
  onDie: (defect: any) => collapseError("Unexpected defect: " + String(defect)),
  onInterrupt: (fiberId: FiberId) =>
    collapseError(`Interrupted [${fiberId}] - expecting retry`),
  onParallel: (_l: any, _r: any) => collapseError("Unexpected parallel error"),
  onSequential: (_l: any, _r: any) =>
    collapseError("Sequential failure, expecting retry"),
} as CauseMatcher<any, any>;

const collapseCause = <TE>(cause: Cause<TE>): Collapse<never, TE | string> =>
  matchCause(cause, CAUSE_MATCHER);

type ExitMatcher<E, A, Z1, Z2> = FirstParam<typeof matchExit<E, A, Z1, Z2>>;

const EXIT_MATCHER = {
  onSuccess: collapseOk,
  onFailure: collapseCause,
} as ExitMatcher<any, any, any, any>;

/** Match a given Exit and its inner Cause (if applicable) down to a Success or Error.
 * The underlying Cause matching may go down an Exit path without an Error available,
 * and will construct a string in that case - hence the `| string` added to the error type.
 */
export const collapseExit = <TR, TE>(
  exit: Exit<TR, TE>
): ResolvedCollapse<TR, TE | string> => matchExit(exit, EXIT_MATCHER);
