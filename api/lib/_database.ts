import { MenuItem, Restaurant } from "@prisma/client";
import { prisma } from "./_prisma";

type PartialRestaurant = Pick<
  Restaurant,
  "title" | "address" | "phone" | "latitude" | "longitude"
>;

type PartialMenuItem = Pick<MenuItem, "description" | "week" | "weekDay">;

export interface ExtendedResturant extends PartialRestaurant {
  menuItems: PartialMenuItem[];
}

export const saveRestaurant = (restaurants: ExtendedResturant[]) =>
  Promise.allSettled(
    restaurants.map(async (_restaurant) => {
      const menuItems: PartialMenuItem[] = _restaurant.menuItems;
      const restaurant: PartialRestaurant = {
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
        await prisma.menuItem.upsert({
          where: {
            weekDay_week_restaurantId: {
              week: menuItem.week,
              weekDay: menuItem.weekDay,
              restaurantId: result.id,
            },
          },
          update: {
            ...menuItem,
          },
          create: {
            ...menuItem,
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
