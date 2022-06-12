import { Component, createEffect, For } from "solid-js";
import { styled } from "solid-styled-components";

const Loading = styled("div")(() => ({
  height: "100%",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "2em",
}));

const List = styled("ul")(() => ({
  listStyle: "none",
  padding: 0,
}));

const RestaurantItem = styled("li")<{ selected: boolean }>((props) => ({
  backgroundImage: props.selected
    ? "linear-gradient(90deg, hsla(0, 0%, 96.1%, 0.9) 50%, hsla(0, 0%, 96.1%, 0) 100%)"
    : "linear-gradient(90deg, hsla(0, 0%, 96.1%, 0.5) 50%, hsla(0, 0%, 96.1%, 0) 100%)",
  padding: "1rem",
  color: "#333",
}));

const Headline = styled("h2")(() => ({
  margin: "0 0 1rem",
}));

const MenuItem = styled("li")(() => ({
  padding: "0.5rem 0",
  "&:last-child": {
    paddingBottom: 0,
  },
}));

export const Restaurants: Component<{
  getRestaurants: any;
  setSelectedRestaurant: any;
  getSelectedRestaurant: any;
}> = ({ getRestaurants, setSelectedRestaurant, getSelectedRestaurant }) => {
  let refs: HTMLLIElement[] = [];

  createEffect(() => {
    const selectedRestaurant = getSelectedRestaurant();

    if (selectedRestaurant) {
      refs[selectedRestaurant.id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  });

  return (
    <>
      {getRestaurants.loading && <Loading>Loading...</Loading>}
      {getRestaurants.loading === false && (
        <List>
          <For each={getRestaurants()}>
            {(restaurant: any, i) => (
              <RestaurantItem
                ref={refs[restaurant.id]}
                onClick={() => setSelectedRestaurant(restaurant)}
                selected={restaurant === getSelectedRestaurant()}
              >
                <Headline>{restaurant.title}</Headline>
                <div>
                  <b>Address:</b> {restaurant.address}
                </div>
                <div>
                  <b>Phone:</b> {restaurant.phone}
                </div>
                <b>Menu items:</b>
                <List>
                  {restaurant.menuItems.map(({ description }: any) => (
                    <MenuItem>{description}</MenuItem>
                  ))}
                </List>
              </RestaurantItem>
            )}
          </For>
        </List>
      )}
    </>
  );
};
