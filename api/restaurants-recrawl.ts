import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { geocodeAddresses } from "./lib/_geocode";
import { ExtendedResturant, saveRestaurant } from "./lib/_database";
import kvartersmenyn from "./sites/_kvartersmenyn";

const sites = [kvartersmenyn];

dayjs.extend(isoWeek);
dayjs.Ls.en.weekStart = 1;

type CrawlerOptions = { week: number; weekDay?: number; city?: number };
export type Crawler = (options: CrawlerOptions) => Promise<ExtendedResturant[]>;

const crawlSite = async (crawler: Crawler, options: CrawlerOptions) => {
  try {
    console.log("Crawling...");
    let restaurants = await crawler(options);

    console.log("Geocoding addresses...");
    restaurants = await geocodeAddresses(restaurants);

    console.log("Saving restaurants...");
    await saveRestaurant(restaurants);
  } catch (error) {
    console.error(error);
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
    parseInt(_weekDay as string) ||
    (fullWeek ? undefined : dayjs().isoWeekday());
  const city = parseInt(_city as string) || undefined;

  for (const site of sites) {
    await crawlSite(site, { week, weekDay, city });
  }

  console.log(
    `Completed crawling ${sites.length} sites in ${
      (Date.now() - sitesTimerStart) / 1000
    } seconds`
  );

  response.status(200).send("ok");
}
