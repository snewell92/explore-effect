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
const getPostAndValidate = Effect.withTracerEnabled(false)(
  HttpClientRequest.get(FACT_URL, { acceptJson: true }).pipe(
    HttpClient.fetch,
    Effect.andThen(HttpClientResponse.schemaBodyJson(FactResponse)),
    Effect.scoped
  )
);

interface Methods {
  readonly getTodayFact: EFF<
    string,
    EFF.Error<typeof getPostAndValidate>,
    APIService
  >;
  readonly prefetchTodayFact: EFF<void, never, APIService>;
}

const Tag = Context.Tag("FactsService")<FactsService, Methods>();

export class FactsService extends Tag {}

const TODAY_FACT_QUERY_OPTTIONS = queryOptions({
  queryKey: ["today"],
  queryFn: () => Effect.runPromise(getPostAndValidate),
});

export const FactsServiceLive = Layer.succeed(FactsService, {
  getTodayFact: Effect.gen(function* () {
    const { queryClient } = yield* APIService;

    const result = yield* Effect.promise(() =>
      queryClient.ensureQueryData(TODAY_FACT_QUERY_OPTTIONS)
    );

    return result.text;
  }),
  prefetchTodayFact: Effect.gen(function* () {
    const { queryClient } = yield* APIService;
    queryClient.prefetchQuery(TODAY_FACT_QUERY_OPTTIONS);
  }),
});

const PrefetchToday = Effect.gen(function* () {
  const { prefetchTodayFact } = yield* FactsService;
  yield* prefetchTodayFact;
});

// hack... lol
let prefetched = false;

/** Custom hook that returns a callback to prefetch today */
const usePreFetchTodayFn = () => {
  // TODO could I lift up the layer somehow?
  const layer = useLayer<FactsService | APIService, never>();
  const prefetch = useCallback(() => {
    if (prefetched) {
      console.info("We already did this");
      return;
    }

    // we don't care about the Exit/Result/pending - fire and forget, only once
    prefetched = true;
    Effect.runPromise(Effect.provide(PrefetchToday, layer));
  }, []);

  return prefetch;
};

const Pending = () => <div>...</div>;

export declare namespace TodayFact {
  export let getPrefetcher: typeof usePreFetchTodayFn;
}

export function TodayFact() {
  const [match] = usePromise(
    Effect.gen(function* () {
      const { getTodayFact } = yield* FactsService;
      return yield* getTodayFact;
    })
  );

  return match({
    Empty: Pending,
    Pending: Pending,
    Error: (err) => <div>oops {JSON.stringify(err)}</div>,
    Success: ({ result }) => <p>{result}</p>,
  });
}

TodayFact.getPrefetcher = usePreFetchTodayFn;
