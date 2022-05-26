import { createEffect, For } from "solid-js";
import { createTrpcQuery } from "../lib/trpc";

export const Restaurants = ({ week, weekDay }: { week: any; weekDay: any }) => {
  const [restaurants, { refetch }] = createTrpcQuery("restaurants", {
    weekDay: weekDay(),
    week: week(),
  });

  createEffect(() => {
    console.log("refetch", { weekDay: weekDay(), week: week() });
    refetch({ weekDay: weekDay(), week: week() });
  });

  return (
    <>
      <span>{restaurants.loading && "Loading..."}</span>
      <ul>
        <For each={restaurants()}>
          {(restaurant, i) => (
            <li>
              <h2>{restaurant.title}</h2>
              <div>Address: {restaurant.address}</div>
              <div>Phone: {restaurant.phone}</div>
              <ul>
                {restaurant.menuItems.map(({ name }) => (
                  <li>{name}</li>
                ))}
              </ul>
            </li>
          )}
        </For>
      </ul>
    </>
  );
};
