/** Utilities in the type space */

type Func = (...args: any[]) => any;

/** Give the first Function Parameter of the given function */
export type FirstParam<TFunc extends Func> = Parameters<TFunc>[1];

/** Conveience wrapped around the ubiquitous { _tag: string } type */
export interface Tagged {
  readonly _tag: string;
}
