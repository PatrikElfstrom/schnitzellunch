import { inferAsyncReturnType, router } from "@trpc/server";
import {
  createNextApiHandler,
  CreateNextContextOptions,
} from "@trpc/server/adapters/next/dist/trpc-server-adapters-next.cjs.js";
import { restaurants } from "../../lib/routers/_restaurants.js";

const createContext = async ({ req, res }: CreateNextContextOptions) => {
  return {
    req,
    res,
  };
};

type Context = inferAsyncReturnType<typeof createContext>;

function createRouter() {
  return router<Context>();
}

const appRouter = createRouter().merge(restaurants);

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext,
  responseMeta({ ctx, paths, type, errors }) {
    // assuming you have all your public routes with the keyword `public` in them
    const allPublic =
      paths && paths.every((path) => path.includes("restaurants"));
    // checking that no procedures errored
    const allOk = errors.length === 0;
    // checking we're doing a query request
    const isQuery = type === "query";

    if (ctx?.res && allPublic && allOk && isQuery) {
      // cache request for 1 day + revalidate once every hour
      const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
      const ONE_HOUR_IN_SECONDS = 60 * 60;
      return {
        headers: {
          "cache-control": `s-maxage=${ONE_HOUR_IN_SECONDS}, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
        },
      };
    }
    return {};
  },
});
