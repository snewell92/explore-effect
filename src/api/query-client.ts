import { QueryClient, QueryCache } from "@tanstack/react-query";
import { Context, Layer } from "effect";

const queryClient = new QueryClient({
  queryCache: new QueryCache()
})

export class APIService extends Context.Tag("APIService")<
  APIService,
  {
    readonly queryClient: QueryClient;
  }
>() {};

export const APIServiceLive = Layer.succeed(APIService, {
  queryClient: queryClient
});
