import { Component, For } from "solid-js";
import { styled } from "solid-styled-components";

const Loading = styled("div")(() => ({
  height: "100%",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "2em",
}));

export const Restaurants: Component<{ getRestaurants: any }> = ({
  getRestaurants,
}) => (
  <>
    {getRestaurants.loading && <Loading>Loading...</Loading>}
    {getRestaurants.loading === false && (
      <ul>
        <For each={getRestaurants()}>
          {(restaurant: any, i) => (
            <li>
              <h2>{restaurant.title}</h2>
              <div>Address: {restaurant.address}</div>
              <div>Phone: {restaurant.phone}</div>
              <ul>
                {restaurant.menuItems.map(({ description }: any) => (
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
