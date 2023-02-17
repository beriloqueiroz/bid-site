// import moment, { Moment } from "moment";
import moment, { Moment } from "moment-timezone";

export function countValidDays(startDate: string, forecast: Number, validWeekDays: number[] = [1, 2, 3, 4, 5]): Moment {
  let count = 0;
  let forecastDate = moment(startDate);
  while (count < forecast) {
    forecastDate = forecastDate.add(1, "days");
    const weekday = forecastDate.isoWeekday();
    if (validWeekDays.includes(weekday)) {
      count++;
    }
  }
  return forecastDate.set({ h: 20, m: 0 });
}

export function dateByDeliveryType(type: string): Moment {
  let forecast = 1;
  if (type == "D") forecast = 0;
  if (type.includes("+")) {
    const numb = type.split("+")[1];
    if (isNumber(numb)) {
      forecast = parseInt(numb);
    }
  }
  const now = moment().tz("America/Fortaleza");
  return countValidDays(now.toISOString(), forecast);
}

export function isNumber(value: string) {
  if (typeof value === "string") {
    return !isNaN(parseInt(value));
  }
}
