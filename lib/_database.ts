import { Prisma, Restaurant } from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "./_prisma.js";

type SaveRestaurant = {
  id?: string;
  title: string;
  address: string;
  phone: string;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
  menuItems: {
    id?: string;
    description: string;
    weekDay: number;
    week: number;
    year?: number;
    restaurantId?: string;
  }[];
};

export const saveRestaurant = (restaurants: SaveRestaurant[]) =>
  Promise.allSettled(
    restaurants.map(async (_restaurant) => {
      const menuItems = _restaurant.menuItems;
      const restaurant = {
        title: _restaurant.title,
        address: _restaurant.address,
        phone: _restaurant.phone,
        latitude: _restaurant.latitude,
        longitude: _restaurant.longitude,
      };

      const result = await prisma.restaurant.upsert({
        where: {
          title: restaurant.title,
        },
        update: {
          ...restaurant,
        },
        create: {
          ...restaurant,
        },
      });

      for (const menuItem of menuItems) {
        const year = dayjs().isoWeekYear();

        await prisma.menuItem.upsert({
          where: {
            weekDay_week_year_restaurantId: {
              year: year,
              week: menuItem.week,
              weekDay: menuItem.weekDay,
              restaurantId: result.id,
            },
          },
          update: {
            ...menuItem,
          },
          create: {
            ...{ ...menuItem, year },
            restaurantId: result.id,
          },
        });
      }

      const restaurantId = result.id;
    })
  ).then((results) => {
    const failed = results.filter((result) => result.status === "rejected");
    const fulfilled = results.filter((result) => result.status === "fulfilled");

    if (failed.length) {
      console.log(failed);
      console.log(`Failed to save ${failed.length} restaurants`);
    }

    if (fulfilled.length) {
      console.log(`Saved ${fulfilled.length} restaurants`);
    }
  });

export const updateRestaurants = (restaurants: Restaurant[]) =>
  Promise.allSettled(
    restaurants.map(
      async (restaurant) =>
        await prisma.restaurant.update({
          where: {
            id: restaurant.id,
          },
          data: {
            ...restaurant,
          },
        })
    )
  );

export const getRestaurants = (args?: Prisma.RestaurantFindManyArgs) =>
  prisma.restaurant.findMany(args);
