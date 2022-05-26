import { router } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../_prisma";

export const restaurants = router().query("restaurants", {
  input: z
    .object({
      weekDay: z.number().min(0).max(6).optional(),
      week: z.number().min(1).max(52).optional(),
    })
    .optional(),
  async resolve({ input }) {
    const { weekDay, week } = input || {};

    const restaurants = await prisma.restaurant.findMany({
      include: {
        menuItems: {
          where: {
            weekDay,
            week,
          },
        },
      },
    });

    return restaurants.filter((restaurant) => restaurant.menuItems.length);
  },
});
