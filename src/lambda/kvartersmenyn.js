import 'core-js/features/array/flat-map';
import axios from 'axios';
import cheerio from 'cheerio';
import { decode } from 'he';
import { getISOWeek, getISODay } from 'date-fns';

// Sleep a random time betwen 0 and milliseconds
const randomSleep = milliseconds =>
  new Promise(resolve =>
    setTimeout(resolve, Math.round(Math.random() * milliseconds))
  );

const parseHTML = async ({ data }, weekDay, week) => {
  const $ = cheerio.load(data);
  const restaurants = [];

  $('#lista .panel').each((index, restaurant) => {
    const title = decode(
      $('.name .t_lunch', restaurant)
        .text()
        .trim()
    );

    let { address, phone } = $('.divider .name', restaurant)
      .text()
      .match(/ADRESS: (?<address>.+?)TEL: (?<phone>.+?)(?= {2})/s).groups;

    // Remove more than two spaces whitespace
    address = decode(address.replace(/\s{2,}/g, ' ').trim());

    let menuItems = $('.rest-menu > p', restaurant)
      .html()
      .replace(/<br>/g, '\n')
      .match(/^(.*\b(schnitzel)\b.*)$/gim);

    if (menuItems) {
      // remove whitespace
      menuItems = menuItems.map(menuItem =>
        decode(menuItem.replace(/\s{2,}/g, ' ').trim())
      );

      restaurants.push({
        title,
        address,
        phone,
        week,
        weekDay,
        menuItems
      });
    }
  });

  return restaurants;
};

const getMenuItems = async (
  weekDay = getISODay(new Date()),
  week = getISOWeek(new Date()),
  city = 19 // Gothenburg at kvartersmenyn
) =>
  axios
    .get(`http://www.kvartersmenyn.se/find/_/city/${city}/day/${weekDay}`)
    .then(data => parseHTML(data, weekDay, week))
    .catch(error => console.error(error));

export const handler = async ({
  queryStringParameters: { weekDay, week, city }
}) => {
  let restaurants;

  if (!weekDay) {
    // If no weekDay is set, loop thru all week days
    restaurants = await Promise.all(
      [1, 2, 3, 4, 5, 6, 7].map(async weekDay => {
        // sleep a random time between 0 and 5000 to simulate a human request
        await randomSleep(5000);
        return await getMenuItems(weekDay, week, city);
      })
    ).then(a => a.flatMap(b => b)); // since flatMap doesn't like promises we need to flatMap the array after
  } else {
    // Otherwise get todays items
    restaurants = await getMenuItems(weekDay, week, city);
  }

  console.log(`Crawl results: ${JSON.stringify(restaurants)}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ restaurants })
  };
};
