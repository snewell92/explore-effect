// Compose services into our registry here

import { Layer } from "effect";
import { SeasonServiceLive } from "./time/Season";

/** The Live Services */
export const services = SeasonServiceLive;

export type Services = Layer.Layer.Success<typeof services>;
