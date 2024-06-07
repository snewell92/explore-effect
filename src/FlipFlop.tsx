import React, { useReducer, useEffect } from "react";
import { Data } from "effect";

type Actions<Result, Error> = Data.TaggedEnum<{
  Begin: {};
  Succeed: { readonly result: Result };
  Fail: { readonly error: Error };
}>;

// Effect can generate the action creators (constructors) + matchers:
const { Begin, Succeed, Fail, $match } = Data.taggedEnum<Actions<any, any>>();

type State = Data.TaggedEnum<{
  Empty: {};
  Failed: { readonly errorMessage: string };
  Completed: { readonly answer: number };
}>;

// we'll have to alias $match
const {
  Empty,
  Failed,
  Completed,
  $match: matchState,
} = Data.taggedEnum<State>();

const actionToStateMatcher = $match({
  Begin: (_) => Empty(),
  Fail: ({ error }) => Failed({ errorMessage: String(error) }),
  Succeed: (_result) => Completed({ answer: 42 }),
});

const reducer: React.Reducer<State, Actions<any, any>> = (_s, actions) =>
  actionToStateMatcher(actions);

const useFlipFlop = (dispatch: React.Dispatch<Actions<any, any>>) => {
  useEffect(() => {
    dispatch(Begin());
    let flip = false;

    const interval = setInterval(() => {
      dispatch(flip ? Succeed({ result: "flip" }) : Fail({ error: "flop" }));
      flip = !flip;
    }, 600);

    return () => clearTimeout(interval);
  }, []);
};

const INITIAL_STATE = Empty();

type CompletedCase = Data.TaggedEnum.Value<State, "Completed">;

const DisplayCompleted = ({ answer }: CompletedCase) => (
  <h1 className="text-2xl">
    👉<span className="text-teal-700 underline">{answer}</span>👈
  </h1>
);

const DisplayEmpty = () => <div>emptiness...</div>;

type FailedCase = Data.TaggedEnum.Value<State, "Failed">;
const DisplayFailed = ({ errorMessage }: FailedCase) => (
  <p className="text-orange-400">{errorMessage}</p>
);

const StateMatcher = matchState({
  Empty: DisplayEmpty,
  Failed: DisplayFailed,
  Completed: DisplayCompleted,
});

export const FlipFlop = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useFlipFlop(dispatch);

  return StateMatcher(state);
};
