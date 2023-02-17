import moment, { Moment } from 'moment';

export function countValidDays(startDate: string, forecast: number, validWeekDays: number[] = [1, 2, 3, 4, 5]): Moment {
  let count = 0;
  let forecastDate = moment(startDate);
  while (count < forecast) {
    forecastDate = forecastDate.add(1, 'days');
    const weekday = forecastDate.isoWeekday();
    if (validWeekDays.includes(weekday)) {
      count++;
    }
  }
  return forecastDate.set({ h: 20, m: 0 });
}

export function dateByDeliveryType(type: string): Moment {
  let forecast = 1;
  if (type == 'D') forecast = 0;
  if (type.includes('+')) {
    const numb = type.split('+')[1];
    if (isNumber(numb)) {
      forecast = parseInt(numb);
    }
  }
  let now = moment();
  if (isNumber(`${process.env.LIMIT_HOUR}`)) {
    if (now.hour() >= parseInt(`${process.env.LIMIT_HOUR}`)) {
      // now = now.add(1, "days").set({ h: 17, m: 0 });
      throw new Error(`horário limite é de ${process.env.LIMIT_HOUR}:00`);
    }
  }

  now = now.subtract(parseInt(`${process.env.TZ_DIFERENCE_SUB}`), 'hours');
  return countValidDays(now.toISOString(), forecast);
}

export function isNumber(value: string) {
  if (typeof value === 'string') {
    return !isNaN(parseInt(value));
  }
}
