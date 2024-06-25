/** Merges live services into our registry / context */

import { Layer } from "effect";
import { SeasonServiceLive } from "./time/Season";
import { APIServiceLive } from "./api/query-client";
import { FactsServiceLive } from "./facts/FactsService";

/** The Merged Live Services */
export const services = Layer.mergeAll(SeasonServiceLive, APIServiceLive, FactsServiceLive);

/** A union type of all merged services  */
export type Services = Layer.Layer.Success<typeof services>;
