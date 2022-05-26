import { createTRPCClient } from "@trpc/client";
import { createResource } from "solid-js";

import type { inferHandlerInput } from "@trpc/server";
import type { AppRouter } from "../../api/trpc/[trpc]";

const client = createTRPCClient<AppRouter>({ url: "/api/trpc" });

type AppQueries = AppRouter["_def"]["queries"];

type AppQueryKeys = keyof AppQueries & string;

export const createTrpcQuery = <TPath extends AppQueryKeys>(
  path: TPath,
  ...args: inferHandlerInput<AppQueries[TPath]>
) => {
  const fetchData = async (
    _source: any,
    { refetching }: { refetching?: any }
  ) => {
    if (refetching) {
      return client.query(path, ...([refetching] as any));
    }

    return client.query(path, ...(args as any));
  };

  return createResource(fetchData);
};
