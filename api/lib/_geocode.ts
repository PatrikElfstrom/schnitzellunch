import { Prisma, Restaurant } from "@prisma/client";
import NodeGeocoder from "node-geocoder";
import pThrottle from "p-throttle";

const fixAddress = (address: string) =>
  address
    .replace(/JA Wettergrens gata/i, "J A Wettergrens gata")
    .replace(/Västra Frölunda/i, "Göteborg")
    .replace(/Hisingsbacka/i, "Hisings backa")
    .replace(/Säteri allén/i, "Säteriallén")
    .replace(/Klangfärsgatan/i, "Klangfärgsgatan")
    .replace(/Krokslättsparkgata/i, "Krokslätts parkgata")
    .replace(/Hedins bilvaruhus/i, "")
    .replace(/Skandiahamnen/i, "");

export const geocodeAddress = async (_address: string) => {
  const address = fixAddress(_address);
  if (address !== _address) {
    console.log(`Fixed address: ${_address} -> ${address}`);
  }

  const geocoder = NodeGeocoder({
    provider: "openstreetmap",
  });
  let entries = await geocoder.geocode(address);

  if (entries.length === 0) {
    console.log(
      `Failed to geocode address: ${address} with OpenStreetMap. Trying Google...`
    );
    // If we got no results
    // Try again with Google Geocoding API
    const geocoder = NodeGeocoder({
      provider: "google",
      apiKey: process.env.GOOGLE_MAPS_API,
      language: "sv",
      region: "SE",
    });
    entries = await geocoder.geocode(address);

    if (entries.length > 1) {
      const highConfidenceEntries = entries.filter(
        (entry) => entry.extra && entry.extra.confidence === 1
      );
      if (highConfidenceEntries.length > 1) {
        console.log(`Got multiple high confidence entries for ${address}`);
        console.log(highConfidenceEntries);
      }
    }
  }

  if (entries.length === 0) {
    console.log(`Could not geocode ${address}`);
    return { latitude: null, longitude: null };
  }

  // Get entry with highest confidence
  const entry = entries
    .filter((entry) => entry.extra && entry.extra.confidence)
    .reduce((previousValue: any, currentValue: any) => {
      return previousValue.extra.confidence > currentValue.extra.confidence
        ? previousValue
        : currentValue;
    }, {});

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
