import { Context, Layer, Effect } from "effect";
import { Effect as EFF } from "effect/Effect";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Schema } from "@effect/schema";
import { APIService } from "~/api/query-client";
import { queryOptions } from "@tanstack/react-query";
import { useCallback } from "react";
import { useLayer } from "~/re-effect/useLayer";
import { usePromise } from "~/re-effect/usePromise";

const FACT_URL = "https://uselessfacts.jsph.pl/api/v2/facts/today";

const FactResponse = Schema.Struct({
  text: Schema.String,
});

// tracer fails CORs check due to the server being out of our control
const FetchTodaysFact = Effect.withTracerEnabled(false)(
  HttpClientRequest.get(FACT_URL, { acceptJson: true }).pipe(
    HttpClient.fetchOk,
    Effect.andThen(HttpClientResponse.schemaBodyJson(FactResponse)),
    Effect.scoped
  )
);

interface Methods {
  readonly getTodayFact: EFF<
    string,
    EFF.Error<typeof FetchTodaysFact>,
    APIService
  >;
}

const Tag = Context.Tag("FactsService")<FactsService, Methods>();

export class FactsService extends Tag {}

const TODAY_FACT_QUERY_OPTIONS = queryOptions({
  queryKey: ["today"],
  queryFn: () => Effect.runPromise(FetchTodaysFact),
  staleTime: 3_600_000, // 60 * 60 * 1_000
  gcTime: Infinity,
});

export const FactsServiceLive = Layer.succeed(FactsService, {
  getTodayFact: Effect.gen(function* () {
    const { queryClient } = yield* APIService;

    const result = yield* Effect.promise(() =>
      queryClient.ensureQueryData(TODAY_FACT_QUERY_OPTIONS)
    );

    return result.text;
  }),
});

const GetTodaysFact = Effect.gen(function* () {
  const { getTodayFact } = yield* FactsService;
  return yield* getTodayFact;
});

const PrefetchToday = Effect.gen(function* () {
  const { queryClient } = yield* APIService;
  queryClient.prefetchQuery(TODAY_FACT_QUERY_OPTIONS);
});

/** Custom hook that returns a callback to prefetch today */
const usePreFetchTodayFn = () => {
  const layer = useLayer<FactsService | APIService, never>();
  return useCallback(
    () => Effect.runPromise(Effect.provide(PrefetchToday, layer)),
    []
  );
};

const Pending = () => <div>...</div>;

export function TodayFact() {
  const {match} = usePromise(GetTodaysFact);

  return match({
    Empty: Pending,
    Pending: Pending,
    Error: (err) => <div>oops {JSON.stringify(err)}</div>,
    Success: ({ result }) => <p>{result}</p>,
  });
}

TodayFact.getPrefetcher = usePreFetchTodayFn;

export declare namespace TodayFact {
  export let getPrefetcher: typeof usePreFetchTodayFn;
}
