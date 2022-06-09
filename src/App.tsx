import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  on,
} from "solid-js";
import { WeekDaySelector } from "./components/WeekDaySelector";
import { Restaurants } from "./components/Restaurants";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { createGlobalStyles, styled } from "solid-styled-components";
import { MapContainer } from "./components/Map";
import { Heading } from "./components/Heading";
import { useAppContext } from "./lib/context";
import { useWeek, useWeekDay } from "./lib/state";
import { Restaurant } from "@prisma/client";
import { createTrpcQuery } from "./lib/trpc";

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
  gridTemplateRows: "30% 70%",
}));

const Header = styled("header")(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gridArea: "1 / 1 / 2 / 3",
  zIndex: 2,
  justifySelf: "center",
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
  const week = createMemo(() => dayjs().isoWeek());
  const [weekDay, setWeekDay] = createSignal(dayjs().isoWeekday());

  const [getRestaurants, { refetch }] = createTrpcQuery("restaurants", {
    week: week(),
    weekDay: weekDay(),
  });

  createEffect(() => {
    refetch({ weekDay: weekDay(), week: week() });
  });

  return (
    <>
      <GlobalStyles />
      <Container>
        <Header>
          <Heading>Schnitzellunch.se</Heading>
          <p>Week {week}</p>
          <WeekDaySelector weekDay={weekDay} setWeekDay={setWeekDay} />
        </Header>
        <Main>
          <Restaurants getRestaurants={getRestaurants} />
        </Main>
        <Map>
          <MapContainer
            getRestaurants={getRestaurants}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </Map>
      </Container>
    </>
  );
};

export default App;
