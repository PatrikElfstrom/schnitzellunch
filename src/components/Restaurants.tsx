import { createEffect, For } from "solid-js";
import { styled } from "solid-styled-components";
import { createTrpcQuery } from "../lib/trpc";

const Loading = styled("div")(() => ({
  height: "100%",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "2em",
}));

export const Restaurants = ({ week, weekDay }: { week: any; weekDay: any }) => {
  const [restaurants, { refetch }] = createTrpcQuery("restaurants", {
    weekDay: weekDay(),
    week: week(),
  });

  createEffect(() => {
    refetch({ weekDay: weekDay(), week: week() });
  });

  return (
    <>
      {restaurants.loading && <Loading>Loading...</Loading>}
      {restaurants.loading === false && (
        <ul>
          <For each={restaurants()}>
            {(restaurant, i) => (
              <li>
                <h2>{restaurant.title}</h2>
                <div>Address: {restaurant.address}</div>
                <div>Phone: {restaurant.phone}</div>
                <ul>
                  {restaurant.menuItems.map(({ description }) => (
                    <li>{description}</li>
                  ))}
                </ul>
              </li>
            )}
          </For>
        </ul>
      )}
    </>
  );
};
