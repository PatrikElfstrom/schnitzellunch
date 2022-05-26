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

export interface ExtendedResturant
  extends Pick<Restaurant, "title" | "address" | "phone"> {
  menuItems: Pick<MenuItem, "description" | "week" | "weekDay">[];
}

const saveRestaurant = (restaurants: ExtendedResturant[]) =>
  Promise.allSettled(
    restaurants.map((restaurant) => {
      return prisma.restaurant.upsert({
        where: {
          title: restaurant.title,
        },
        update: {
          ...restaurant,
          menuItems: {
            create: restaurant.menuItems,
          },
        },
        create: {
          ...restaurant,
          menuItems: {
            create: restaurant.menuItems,
          },
        },
      });
    })
  ).then((results) => {
    const failed = results.filter((result) => result.status === "rejected");
    const fulfilled = results.filter((result) => result.status === "fulfilled");

    if (failed.length) {
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
