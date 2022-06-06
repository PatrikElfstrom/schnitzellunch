import type { NextApiRequest, NextApiResponse } from "next";
import got from "got";
import { load } from "cheerio";
import { decode } from "he";
import { setTimeout } from "node:timers/promises";
import { ExtendedResturant } from "../lib/_database";
import { Crawler } from "../restaurants-recrawl";

// Sleep a random time betwen 0 and milliseconds
const randomSleep = (milliseconds: number) =>
  setTimeout(Math.round(Math.random() * milliseconds));

const parseHTML = async (data: string, weekDay: number, week: number) => {
  const $ = load(data);
  const restaurants: ExtendedResturant[] = [];

  $("#lista .panel").each((index, restaurant) => {
    const title = decode($(".name .t_lunch", restaurant).text().trim());

    let { address, phone } = $(".divider .name", restaurant)
      .text()
      .match(/ADRESS: (?<address>.+?)TEL: (?<phone>.+?)(?= {2})/s)?.groups as {
      address: string;
      phone: string;
    };

    // Remove more than two spaces whitespace
    address = decode(address.replace(/\s{2,}/g, " ").trim());

    let menuItems = $(".rest-menu > p", restaurant)
      .html()
      ?.replace(/<br>/g, "\n")
      .match(/^(.*\b(schnitzel)\b.*)$/gim);

    if (menuItems) {
      // remove whitespace
      menuItems = menuItems.map((menuItem) =>
        decode(menuItem.replace(/\s{2,}/g, " ").trim())
      );

      restaurants.push({
        title,
        address,
        phone,
        latitude: null,
        longitude: null,
        menuItems: menuItems.map((menuItem) => ({
          description: menuItem,
          week,
          weekDay,
        })),
      });
    }
  });

  return restaurants;
};

const getMenuItems = async (weekDay: number, week: number, city: number) =>
  got
    .get(`https://www.kvartersmenyn.se/find/_/city/${city}/day/${weekDay}`)
    .then(({ body }) => parseHTML(body, weekDay, week))
    .catch((error) => console.error(error));

const kvartersmenyn: Crawler = async ({ week, weekDay, city = 19 }) => {
  const siteTimerStart = Date.now();
  let restaurants: ExtendedResturant[] = [];

  console.log(`Crawling Kvartersmenyn`);

  if (!weekDay) {
    // If no weekDay is set, loop thru all week days
    for (const weekDay of [1, 2, 3, 4, 5, 6, 7]) {
      await randomSleep(5000);
      console.log(`Crawling week: ${week}, weekDay: ${weekDay}, city: ${city}`);
      const menuItems = await getMenuItems(weekDay, week, city);
      if (menuItems) {
        restaurants.push(...menuItems);
      }
    }
  } else {
    // Otherwise get todays items
    console.log(`Crawling week: ${week}, weekDay: ${weekDay}, city: ${city}`);
    const menuItems = await getMenuItems(weekDay, week, city);
    if (menuItems) {
      restaurants.push(...menuItems);
    }
  }

  console.log(
    `Kvartersmenyn crawled in ${(Date.now() - siteTimerStart) / 1000} seconds`
  );
  console.log(`Found ${restaurants.length} restaurants`);

  return restaurants;
};

export default kvartersmenyn;
