import React, { useContext, useMemo } from "react";
import { Layer } from "effect";
import { AnyLayer, ReEffectContextValue, getContext } from "./getContext";

// TODO tighten types
function combineLayers<
  ParentLayer extends AnyLayer,
  ChildLayer extends AnyLayer
>(layer?: ChildLayer, parentLayer?: ParentLayer) {
  if (parentLayer && layer) {
    return Layer.merge(parentLayer, layer);
  }

  if (!parentLayer && layer) {
    return layer;
  }

  return Layer.empty;
}

/** interface with just our props */
interface LayerProviderProp<Layer extends AnyLayer> {
  /** A Layer of dependencies to provide as Requirements to the Runtime for any effects to run.
   * Defaults to Layer.empty
   * @see https://effect.website/docs/guides/context-management/layers
   */
  layer?: Layer;
}

/** Include children so we can be a well behaved provider */
type LayerProviderProps<Layer extends AnyLayer> = React.PropsWithChildren<
  LayerProviderProp<Layer>
>;

/** Provides Requirements via a Layer for running Effects in the subtree via React.Context.
 *
 * Any descendant Provider Layer will be merged, if no Layer is found Layer.empty is used.
 * @see https://effect.website/docs/guides/context-management/layers
 */
export const LayerProvider = <Layer extends AnyLayer>({
  layer,
  children,
}: LayerProviderProps<Layer>) => {
  const ReEffectContext = getContext<Layer>();
  const parentContext = useContext(ReEffectContext);

  const context = useMemo(() => {
    // we really kind of abandon TS until the return here :sweat_smile:
    // TODO tighten types
    const newContext = { ...parentContext } as any;
    newContext.layer = combineLayers(layer, parentContext.layer) as Layer.Layer<
      never,
      never,
      never
    >;

    return newContext as ReEffectContextValue<Layer>;
  }, [parentContext, layer]);

  return (
    <ReEffectContext.Provider value={context}>
      {children}
    </ReEffectContext.Provider>
  );
};
