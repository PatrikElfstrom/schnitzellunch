import { Component, createEffect, createMemo, createSignal } from "solid-js";
import { WeekDaySelector } from "./components/WeekDaySelector";
import { Restaurants } from "./components/Restaurants";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { createGlobalStyles, styled } from "solid-styled-components";
import { MapContainer } from "./components/Map";
import { Heading } from "./components/Heading";
import { createTrpcQuery } from "./lib/trpc";
import { Restaurant } from "@prisma/client";

const GlobalStyles = () => {
  const Styles = createGlobalStyles`
    html,
    body,
    #root {
      height: 100%;
      margin: 0;
    }

    body {
      font-family: system-ui;
    }

    #root {
      overflow: hidden;
    }
    `;
  return <Styles />;
};

const Container = styled("div")(() => ({
  display: "grid",
  height: "100%",
  gridTemplateColumns: "40% 60%",
  gridTemplateRows: "fit-content(30%) auto",
}));

const Header = styled("header")(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gridArea: "1 / 1 / 2 / 3",
  zIndex: 2,
  justifySelf: "center",
  "-webkit-transform": "translateZ(0)", // Fixes Safari bug where header disappears behind map
}));

const Main = styled("main")(() => ({
  overflow: "auto",
  gridArea: "2 / 1 / 3 / 2",
  zIndex: 2,
  backdropFilter: "blur(30px)",
}));

const Map = styled("div")(() => ({
  gridArea: " 1 / 1 / 3 / 3",
  zIndex: 1,
}));

dayjs.extend(isoWeek);
dayjs.Ls.en.weekStart = 1;

const App: Component = () => {
  let mainRef!: HTMLDivElement;
  const week = createMemo(() => dayjs().isoWeek());
  const [weekDay, setWeekDay] = createSignal(dayjs().isoWeekday());
  const [getSelectedRestaurant, _setSelectedRestaurant] =
    createSignal<Restaurant | null>(null);

  const [getRestaurants, { refetch }] = createTrpcQuery("restaurants", {
    week: week(),
    weekDay: weekDay(),
  });

  createEffect(() => {
    refetch({ weekDay: weekDay(), week: week() });
  });

  const setSelectedRestaurant = (restaurant: Restaurant) => {
    _setSelectedRestaurant((prev: any) =>
      prev === restaurant ? null : restaurant
    );
  };

  return (
    <>
      <GlobalStyles />
      <Container>
        <Header>
          <Heading>Schnitzellunch.se</Heading>
          <p>Week {week}</p>
          <WeekDaySelector weekDay={weekDay} setWeekDay={setWeekDay} />
        </Header>
        <Main ref={mainRef}>
          <Restaurants
            getRestaurants={getRestaurants}
            getSelectedRestaurant={getSelectedRestaurant}
            setSelectedRestaurant={setSelectedRestaurant}
          />
        </Main>
        <Map>
          <MapContainer
            getRestaurants={getRestaurants}
            mainRef={mainRef}
            getSelectedRestaurant={getSelectedRestaurant}
            setSelectedRestaurant={setSelectedRestaurant}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </Map>
      </Container>
    </>
  );
};

export default App;
