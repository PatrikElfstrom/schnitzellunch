import { prisma } from "./lib/prisma";

export default async function handler(request: any, response: any) {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        menuItems: true,
      },
    });
    response.status(200).json(restaurants);
  } catch (e) {
    console.error("Request error", e);
    response.status(500).json({ error: "Error fetching posts" });
  }
}
