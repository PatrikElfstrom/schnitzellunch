import { Prisma, Restaurant } from "@prisma/client";
import NodeGeocoder from "node-geocoder";
import pThrottle from "p-throttle";

const options = {
  provider: "openstreetmap",
};

const fixAddress = (address: string) =>
  address
    .replace(/JA Wettergrens gata/i, "J A Wettergrens gata")
    .replace(/Västra Frölunda/i, "Göteborg")
    .replace(/Hisingsbacka/i, "Hisings backa")
    .replace(/Säteri allén/i, "Säteriallén");

export const geocodeAddress = async (_address: string) => {
  const address = fixAddress(_address);
  if (address !== _address) {
    console.log(`Fixed address: ${_address} -> ${address}`);
  }

  const geocoder = NodeGeocoder(options as any);
  const entries = await geocoder.geocode(address);

  if (entries.length === 0) {
    console.log(`Could not geocode ${address}`);
    return { latitude: null, longitude: null };
  }

  const entry = entries[0];

  const latitude = entry.latitude ? new Prisma.Decimal(entry.latitude) : null;
  const longitude = entry.longitude
    ? new Prisma.Decimal(entry.longitude)
    : null;

  return { latitude, longitude };
};

export const geocodeAddresses = async (restaurants: Restaurant[]) => {
  // maximum of 1 request per second
  // https://operations.osmfoundation.org/policies/nominatim/
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
