import { Layer, ManagedRuntime } from "effect";
import * as React from "react";

/* copied & adapted implementation of apollo to avoid common pitfals

source: https://github.com/apollographql/apollo-client/blob/main/src/react/context/ApolloContext.ts#L20
some interesting PRs to see how preact/widgets/redux impacted this decision:
- https://github.com/apollographql/apollo-client/pull/11082
- https://github.com/apollographql/apollo-client/pull/11026
- https://github.com/apollographql/apollo-client/pull/8798

Opting _not_ to use rehackt as I purposefully _only_ want client component support for now
https://www.npmjs.com/package/rehackt

*/

// alias for a very generous layer type
// TODO tighten types
export type AnyLayer = Layer.Layer<any, any, any> | Layer.Layer<never>;

export interface ReEffectContextValue<Layer extends AnyLayer> {
  layer?: Layer;
  runtime?: ManagedRuntime.ManagedRuntime<any, any>;
}

type ReEffectContext<Layer extends AnyLayer> = React.Context<
  ReEffectContextValue<Layer>
>;

const RE_EFFECT_CONTEXT_KEY = Symbol.for("RE_EFFECT_CONTEXT_KEY");

// tried pretty hard to use module augmentation, but it kinda breaks down for this case
// see: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
interface PatchedContext<Layer extends AnyLayer> {
  (defaultValue: Layer): ReEffectContext<Layer>;
  [RE_EFFECT_CONTEXT_KEY]: ReEffectContext<Layer>;
}

export function getContext<Layer extends AnyLayer>() {
  // TODO consider an invariant here to ensure we are in a client component and createContext exists

  // TODO tighten how we patch this
  let context = (React.createContext as PatchedContext<Layer>)[
    RE_EFFECT_CONTEXT_KEY
  ];

  if (!context) {
    Object.defineProperty(React.createContext, RE_EFFECT_CONTEXT_KEY, {
      value: (context = React.createContext<ReEffectContextValue<Layer>>({})),
      enumerable: false,
      writable: false,
      configurable: true,
    });

    context.displayName = "ReEffectContext";
  }

  return context;
}
