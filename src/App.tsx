import { Component, createMemo, createSignal } from "solid-js";
import { WeekDaySelector } from "./components/WeekDaySelector";
import { Restaurants } from "./components/Restaurants";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);
dayjs.Ls.en.weekStart = 1;

const App: Component = () => {
  const currentWeekDay = createMemo(() => dayjs().isoWeekday());
  const week = createMemo(() => dayjs().isoWeek());

  const [weekDay, setWeekDay] = createSignal(currentWeekDay());

  return (
    <>
      <h1>Schnitzellunch.se</h1>
      <p>Week {week()}</p>
      <WeekDaySelector weekDay={weekDay()} setWeekDay={setWeekDay} />
      <Restaurants week={week} weekDay={weekDay} />
    </>
  );
};

export default App;
