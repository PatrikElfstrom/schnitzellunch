import { Prisma } from "@prisma/client";
import NodeGeocoder from "node-geocoder";
import pThrottle from "p-throttle";
import { ExtendedResturant } from "../restaurants-recrawl";

const options = {
  provider: "openstreetmap",
};

export const geocodeAddress = async (address: string) => {
  const geocoder = NodeGeocoder(options as any);
  const entries = await geocoder.geocode(address);

  const entry = entries[0];

  const latitude = entry.latitude ? new Prisma.Decimal(entry.latitude) : null;
  const longitude = entry.longitude
    ? new Prisma.Decimal(entry.longitude)
    : null;

  return { latitude, longitude };
};

export const geocodeAddresses = async (restaurants: ExtendedResturant[]) => {
  const throttle = pThrottle({
    limit: 1,
    interval: 1000,
  });

  return Promise.all(
    restaurants.map((restaurant) =>
      throttle(async () => {
        const location = await geocodeAddress(restaurant.address);
        return { ...restaurant, ...location };
      })()
    )
  );
};
