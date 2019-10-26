import { getISOWeek } from 'date-fns';

export const currentWeekDay = () => new Date().getDay();

export const currentWeek = () => getISOWeek(new Date());

export const getLocalizedWeekDay = (date: Date, locale?: string | undefined) =>
  new Date(date).toLocaleString(locale, { weekday: 'long' });

export const getWeekDays = (locale?: string | undefined): string[] => {
  const current = new Date();
  const weekDays = [];

  // Set start to Sunday
  current.setDate(current.getDate() - current.getDay());

  for (var i = 0; i < 7; i++) {
    weekDays.push(getLocalizedWeekDay(current, locale));
    current.setDate(current.getDate() + 1);
  }

  return weekDays;
};
