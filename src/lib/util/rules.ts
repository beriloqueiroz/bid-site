import moment from "moment";

export function countValidDays(startDate: string, forecast: Number, subHour = 0, validWeekDays: number[] = [1, 2, 3, 4, 5]): string {
    let count = 0;
    let forecastDate = moment(startDate);
    while (count < forecast) {
        forecastDate = forecastDate.add(1, "days");
        const weekday = forecastDate.isoWeekday();
        if (validWeekDays.includes(weekday)) {
            count++;
        }
    }
    return forecastDate.set({ h: 20, m: 0 }).subtract(subHour, "hours").format(
        "DD/MM/YYYY hh:mm:ss A"
    );
}

export function countValidDaysV2(startDate: string, forecast: Number, subHour = 0, validWeekDays: number[] = [1, 2, 3, 4, 5]): string {
    let count = 0;
    let forecastDate = moment(startDate);
    while (count < forecast) {
        forecastDate = forecastDate.add(1, "days");
        const weekday = forecastDate.isoWeekday();
        if (validWeekDays.includes(weekday)) {
            count++;
        }
    }
    return forecastDate.set({ h: 20, m: 0 }).subtract(subHour, "hours").format(
        "YYYY-MM-DDThh:mm:ss"
    );
}

export function dateByDeliveryType(type: string, subHour?: number) {
    let forecast = 1;
    if (type == "D") forecast = 0;
    if (type.includes("+")) {
        const numb = type.split("+")[1];
        if (isNumber(numb)) {
            forecast = parseInt(numb);
        }
    }
    const now = moment();
    return countValidDaysV2(now.toISOString(), forecast, 1);
}

export function isNumber(value: string) {
    if (typeof value === "string") {
        return !isNaN(parseInt(value));
    }
}