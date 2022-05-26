import { Setter } from "solid-js";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/sv";

dayjs.extend(isoWeek);
dayjs.Ls.en.weekStart = 1;

export const WeekDaySelector = ({
  weekDay,
  setWeekDay,
}: {
  weekDay: number;
  setWeekDay: Setter<number>;
}) => {
  const weekDays = [1, 2, 3, 4, 5, 6, 0];

  return (
    <form>
      {weekDays.map((day) => (
        <label>
          <input
            checked={day === weekDay}
            name="weekDays"
            type="radio"
            value={day}
            onInput={(event) => setWeekDay(Number(event.currentTarget.value))}
          />
          {dayjs().isoWeekday(day).format("dddd")}
        </label>
      ))}
    </form>
  );
};
