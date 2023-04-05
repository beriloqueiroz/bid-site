import moment, { Moment } from 'moment';
import { Client } from '../types/Client';

export function isNumber(value: string) {
  if (typeof value === 'string') {
    return !Number.isNaN(Number(value));
  }
  return false;
}

export function countValidDays(startDate: string, forecast: number, validWeekDays: number[] = [1, 2, 3, 4, 5, 6]): Moment {
  let count = 0;
  let forecastDate = moment(startDate);
  if (isNumber(`${process.env.LIMIT_HOUR}`)) {
    if (forecastDate.hour() >= Number(`${process.env.LIMIT_HOUR}`)) {
      forecastDate.add(1, 'days');
    }
  }

  while (count < forecast) {
    forecastDate = forecastDate.add(1, 'days');
    const weekday = forecastDate.isoWeekday();
    if (validWeekDays.includes(weekday)) {
      count++;
    }
  }
  return forecastDate.set({ h: 20, m: 0 });
}

export function dateByDeliveryType(type: string, withSub = true): Moment {
  let forecast = 1;
  if (type === 'D') forecast = 0;
  if (type.includes('+')) {
    const numb = type.split('+')[1];
    if (isNumber(numb)) {
      forecast = parseInt(numb, 10);
    }
  }
  let now = moment();
  if (withSub) {
    now = moment().subtract(3, 'hours');
  }
  // if (isNumber(`${process.env.LIMIT_HOUR}`)) {
  //   if (now.hour() >= Number(`${process.env.LIMIT_HOUR}`)) {
  //     throw new Error(`horário limite é de ${process.env.LIMIT_HOUR}:00`);
  //   }
  // }

  return countValidDays(now.toISOString(), forecast);
}

export function calculePrice(value:number, typeSelected:string, citySelected: string, clientInfos: Client) {
  let base = 10;
  if (typeSelected === 'D') {
    if (citySelected.toLowerCase() === 'fortaleza') {
      base = clientInfos.prices.capital.d;
    } else { base = clientInfos.prices.metropolitana.d; }
  }
  if (typeSelected === 'D+1') {
    if (citySelected.toLowerCase() === 'fortaleza') {
      base = clientInfos.prices.capital.d1;
    } else { base = clientInfos.prices.metropolitana.d1; }
  }
  if (value < 200) return base;
  return (base * value) / 200;
}
