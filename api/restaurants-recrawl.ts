import type { NextApiRequest, NextApiResponse } from "next";
import { MenuItem, Prisma, Restaurant } from "@prisma/client";
import got from "got";
import { prisma } from "./lib/_prisma";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { geocodeAddresses } from "./lib/_geocode";

dayjs.extend(isoWeek);
dayjs.Ls.en.weekStart = 1;

const sites = ["kvartersmenyn"];

const message = (message: string) => {
  console.log(message);
};

type PartialRestaurant = Pick<
  Restaurant,
  "title" | "address" | "phone" | "latitude" | "longitude"
>;

type PartialMenuItem = Pick<MenuItem, "description" | "week" | "weekDay">;

export interface ExtendedResturant extends PartialRestaurant {
  menuItems: PartialMenuItem[];
}

const saveRestaurant = (restaurants: ExtendedResturant[]) =>
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

const makeRequest = async (site: string, week?: number, weekDay?: number) => {
  const siteTimerStart = Date.now();
  const city = 19; // Gothenburg at kvartersmenyn

  try {
    let restaurants = await got({
      url: `http://localhost:3000/api/crawl/${site}`,
      searchParams: { weekDay, week, city },
    }).json<ExtendedResturant[]>();

    message(
      `${site} crawled in ${(Date.now() - siteTimerStart) / 1000} seconds`
    );

    console.log("Geocoding addresses...");
    restaurants = await geocodeAddresses(restaurants);

    console.log("Saving restaurants...");
    await saveRestaurant(restaurants);

    message(
      `${site} completed successfully in ${
        (Date.now() - siteTimerStart) / 1000
      } seconds`
    );
  } catch (error) {
    message(
      `${site} failed in ${
        (Date.now() - siteTimerStart) / 1000
      } seconds - ${error}`
    );
  }
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const sitesTimerStart = Date.now();

  const {
    weekDay: _weekDay,
    week: _week,
    city: _city,
    fullWeek: _fullWeek,
  } = request.query;

  const fullWeek = _fullWeek === "true";
  const week = parseInt(_week as string) || dayjs().isoWeek();
  const weekDay =
    parseInt(_weekDay as string) || fullWeek ? undefined : dayjs().isoWeekday();
  const city = parseInt(_city as string) || undefined;

  for (const site of sites) {
    console.log(
      `Crawling site: ${site}, week: ${week}, weekDay: ${weekDay}, city: ${city}`
    );
    await makeRequest(site, week, weekDay);
  }

  message(
    `Completed crawling ${sites.length} sites in ${
      (Date.now() - sitesTimerStart) / 1000
    } seconds`
  );

  response.status(200).send("ok");
}
