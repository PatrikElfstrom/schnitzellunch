import type { NextApiRequest, NextApiResponse } from "next";
import got from "got";
import { load } from "cheerio";
import { decode } from "he";
import { setTimeout } from "node:timers/promises";

interface Restaurant {
  title: string;
  address: string;
  phone: string;
  week: number;
  weekDay: number;
  menuItems: string[];
}

// Sleep a random time betwen 0 and milliseconds
const randomSleep = (milliseconds: number) =>
  setTimeout(Math.round(Math.random() * milliseconds));

const parseHTML = async (data: string, weekDay: number, week: number) => {
  const $ = load(data);
  const restaurants: Restaurant[] = [];

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
        week,
        weekDay,
        menuItems,
      });
    }
  });

  return restaurants;
};

const getMenuItems = async (weekDay: number, week: number, city: number) =>
  got
    .get(`http://www.kvartersmenyn.se/find/_/city/${city}/day/${weekDay}`)
    .then(({ body }) => parseHTML(body, weekDay, week))
    .catch((error) => console.error(error));

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { weekDay: _weekDay, week: _week, city: _city } = request.query;

  const weekDay = parseInt(
    typeof _weekDay === "string" ? _weekDay : _weekDay[0]
  );
  const week = parseInt(typeof _week === "string" ? _week : _week[0]);
  const city = parseInt(typeof _city === "string" ? _city : _city[0]);

  let restaurants: Restaurant[] = [];

  if (!weekDay) {
    // If no weekDay is set, loop thru all week days
    for (const weekDay of [1, 2, 3, 4, 5, 6, 7]) {
      await randomSleep(5000);
      const menuItems = await getMenuItems(weekDay, week, city);
      if (menuItems) {
        restaurants.push(...menuItems);
      }
    }
  } else {
    // Otherwise get todays items
    const menuItems = await getMenuItems(weekDay, week, city);
    if (menuItems) {
      restaurants.push(...menuItems);
    }
  }

  console.log(`Found ${restaurants.length} restaurants`);

  response.status(200).json(restaurants);
}
