import { router } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../_prisma.js";

export const restaurants = router().query("restaurants", {
  input: z
    .object({
      weekDay: z.number().min(1).max(7).optional(),
      week: z.number().min(1).max(53).optional(), // ISO week year can have 53 weeks per year
      year: z.number().optional(),
    })
    .optional(),
  async resolve({ input }) {
    const { weekDay, week, year } = input || {};

    const restaurants = await prisma.restaurant.findMany({
      include: {
        menuItems: {
          where: {
            weekDay,
            week,
            year,
          },
        },
      },
    });

    return restaurants.filter((restaurant) => restaurant.menuItems.length);
  },
});
