
export type CollapsedState = "init" | "processing" | "success" | "error";

export interface CollapsedResult<TResult, TError> {
  result: TResult,
  error: TError,
  status: CollapsedState
}

export interface EmptyCollapse extends CollapsedResult<null, null> {
  result: null,
  error: null,
  status: "init"
}

export interface PendingCollapse extends CollapsedResult<null, null> {
  result: null,
  error: null,
  status: "processing"
}

export interface SuceededCollapse<TR> extends CollapsedResult<TR, null> {
  result: TR,
  error: null,
  status: "success"
}

export interface ErroredCollapse<TE> extends CollapsedResult<null, TE> {
  result: null,
  error: TE,
  status: "error"
}

export type CollapsedStates<TR, TE> = EmptyCollapse | PendingCollapse | SuceededCollapse<TR> | ErroredCollapse<TE>;

/** For blocking cases that will never enter their init or pending states. */
export type CollapsedSyncStates<TR, TE> = SuceededCollapse<TR> | ErroredCollapse<TE>;

export const EMPTY_COLLAPSE: EmptyCollapse = {
  result: null,
  error: null,
  status: "init"
};

export function collapseOk<TR>(result: TR): SuceededCollapse<TR> {
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
