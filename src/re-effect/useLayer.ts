import { useContext } from "react";
import { getContext } from "./getContext";
import { Layer } from "effect";

// TODO tighten types - somewhat decent in signature at least but we have some fun coercions
/** Pull a merged Layer from the current React ReEffectContext
 * 
 * @returns The configured Layer from the current ReEffectContext, or Layer.empty if there is none
 */
export const useLayer = <Requirements = never, Error = never>(): Layer.Layer<
  Requirements,
  Error,
  never
> => {
  const ReEffectContext = getContext<any>();
  const { layer } = useContext<any>(ReEffectContext);

  if (!layer) {
    // we just ignore this :clown:
    return Layer.empty as any;
  }

  return layer as Layer.Layer<Requirements, Error, never>;
};
