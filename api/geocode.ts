import { NextApiRequest, NextApiResponse } from "next";
import { getRestaurants, updateRestaurants } from "../lib/_database.js";
import { geocodeAddresses } from "../lib/_geocode.js";

export default async function handler(
  _request: NextApiRequest,
  response: NextApiResponse
) {
  const geocoderTimerStart = Date.now();

  const restaurants = await getRestaurants({
    where: {
      OR: [{ latitude: null, longitude: null }],
    },
    take: 5, // We're limited to 10 sec and 1 geocoding request per sec
  });

  console.log(`Geocoding ${restaurants.length} restaurants...`);
  const geocodedRestaurants = await geocodeAddresses(restaurants);

  console.log("Updating restaurants...");
  await updateRestaurants(geocodedRestaurants);

  console.log(
    `Completed geocoding ${restaurants.length} restaurants in ${
      (Date.now() - geocoderTimerStart) / 1000
    } seconds`
  );

  response.status(200).send("ok");
}
