import { Accessor, Setter } from "solid-js";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/sv";
import { styled } from "solid-styled-components";

dayjs.extend(isoWeek);
dayjs.Ls.en.weekStart = 1;

const Label = styled("label")(() => ({
  width: "fit-content(40px)",
  height: "fit-content(40px)",
}));

const Button = styled("div")(({ active }: { active: boolean }) => ({
  background: active ? "#3e485b" : "#242a35",
  color: active ? "#03a9f4" : "#fff",
  borderRadius: "4px",
  padding: "10px",
}));

const Form = styled("form")(() => ({
  display: "inline-flex",
  gap: "5px",
}));

export const WeekDaySelector = ({
  weekDay,
  setWeekDay,
}: {
  weekDay: Accessor<number>;
  setWeekDay: Setter<number>;
}) => {
  const weekDays = [1, 2, 3, 4, 5, 6, 7];

  return (
    <Form>
      {weekDays.map((day) => (
        <Label>
          <input
            checked={day === weekDay()}
            name="weekDays"
            type="radio"
            value={day}
            onInput={(event) => setWeekDay(Number(event.currentTarget.value))}
            style={{ display: "none" }}
          />
          <Button active={day === weekDay()}>
            {dayjs().isoWeekday(day).format("dddd")}
          </Button>
        </Label>
      ))}
    </Form>
  );
};
