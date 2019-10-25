import axios from 'axios';
import cheerio from 'cheerio';

const parseHTML = async ({ data }, weekDay) => {
  const $ = cheerio.load(data);
  const restaurants = [];

  $('#lista .panel').each((index, restaurant) => {
    const title = $('.name .t_lunch', restaurant).text();

    let { address, phone } = $('.divider .name', restaurant)
      .text()
      .match(/ADRESS: (?<address>.+?)TEL: (?<phone>.+?)(?= {2})/s).groups;

    // Remove more than two spaces whitespace
    address = address.replace(/\s{2,}/g, ' ');

    let menuItems = $('.rest-menu > p', restaurant)
      .html()
      .replace(/<br>/g, '\n')
      .match(/^(.*\b(schnitzel)\b.*)$/gim);

    if (menuItems) {
      // remove whitespace
      menuItems = menuItems.map(menuItem => menuItem.replace(/\s{2,}/g, ' '));

      restaurants.push({
        title,
        address,
        phone,
        weekDay,
        menuItems
      });
    }
  });

  return { restaurants };
};

const getMenuItems = (weekDay = 5, city = 19) =>
  axios
    .get(`http://www.kvartersmenyn.se/find/_/city/${city}/day/${weekDay}`)
    .then(data => parseHTML(data, weekDay))
    .then(data => JSON.stringify(data))
    .then(data => {
      console.log(`Crawl results: ${data}`);
      return data;
    })
    .catch(error => console.error(error));

export const handler = async () => ({
  statusCode: 200,
  body: await getMenuItems()
});
