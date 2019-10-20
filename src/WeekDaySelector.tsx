import React from 'react';
import { getWeekDays } from './helpers/date';

export const WeekDaySelector = ({
  weekDay,
  setWeekDay
}: {
  weekDay: number;
  setWeekDay: Function;
}) => {
  const weekDays = getWeekDays();

  return (
    <form>
      {weekDays.map((weekDayName, index) => (
        <label key={index}>
          <input
            defaultChecked={index === weekDay}
            name="weekDays"
            type="radio"
            value={index}
            onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
              setWeekDay(Number(event.target.value))
            }
          />
          {weekDayName}
        </label>
      ))}
    </form>
  );
};
