import { router } from "@trpc/server";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { restaurants } from "../lib/routers/_restaurants";

const appRouter = router().merge(restaurants);

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
