import type { NextApiRequest, NextApiResponse } from "next";
import { MenuItem, Restaurant } from "@prisma/client";
import got from "got";
import { prisma } from "./lib/_prisma";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);
dayjs.Ls.en.weekStart = 1;

const sites = ["kvartersmenyn"];

const message = (message: string) => {
  console.log(message);
};

interface ExtendedResturant extends Restaurant {
  menuItems: string[];
}

const saveRestaurant = (restaurants: ExtendedResturant[]) =>
  Promise.all(
    restaurants.map((restaurant) => {
      return prisma.restaurant.create({
        data: {
          ...restaurant,
          menuItems: {
            create: restaurant.menuItems.map((menuItem) => ({
              name: menuItem,
            })),
          },
        },
      });
    })
  );

const makeRequest = async (site: string) => {
  const siteTimerStart = Date.now();
  const weekDay = dayjs().isoWeekday();
  const week = dayjs().isoWeek();
  const city = 19; // Gothenburg at kvartersmenyn

  try {
    const restaurants = await got({
      url: `http://localhost:3000/api/crawl/${site}`,
      searchParams: { weekDay, week, city },
    }).json<ExtendedResturant[]>();

    message(
      `${site} crawled in ${(Date.now() - siteTimerStart) / 1000} seconds`
    );

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

  for (const site of sites) {
    await makeRequest(site);
  }

  message(
    `Completed crawling ${sites.length} sites in ${
      (Date.now() - sitesTimerStart) / 1000
    } seconds`
  );

  response.status(200).send("ok");
}
