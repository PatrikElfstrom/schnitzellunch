import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import { saveRestaurant } from "../lib/_database.js";
import kvartersmenyn from "./sites/_kvartersmenyn.js";

const sites = [kvartersmenyn];

dayjs.extend(isoWeek);
dayjs.Ls.en.weekStart = 1;

export type CrawlerReturnType = {
  title: string;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  menuItems: {
    description: string;
    weekDay: number;
    week: number;
  }[];
};

type CrawlerOptions = { week: number; weekDay?: number; city?: number };
export type Crawler = (options: CrawlerOptions) => Promise<CrawlerReturnType[]>;

const crawlSite = async (crawler: Crawler, options: CrawlerOptions) => {
  try {
    console.log("Crawling...");
    let restaurants = await crawler(options);

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
