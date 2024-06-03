/** Utilities in the type space */

type Func = (...args: any[]) => any;

/** Give the first Function Parameter of the given function */
export type FirstParam<TFunc extends Func> = Parameters<TFunc>[1];

/** Conveience wrapped around the ubiquitous { _tag: string } type */
export interface Tagged {
  readonly _tag: string;
}

/** Gives a union of the names of the _tag as Strings  */
export type AllTags<T extends Tagged> = T["_tag"];

/** Extract one member of a union by its tag name */
export type ExtractByTag<
  TUnion extends Tagged,
  TagName extends AllTags<TUnion>
> = Extract<TUnion, { _tag: TagName }>;
