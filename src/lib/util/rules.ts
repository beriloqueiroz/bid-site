import moment from "moment";

export function countValidDays(startDate: string, forecast: Number, validWeekDays: number[] = [1, 2, 3, 4, 5]): string {
    let count = 0;
    let forecastDate = moment(startDate);
    while (count < forecast) {
        forecastDate = forecastDate.add(1, "days");
        const weekday = forecastDate.isoWeekday();
        if (validWeekDays.includes(weekday)) {
            count++;
        }
    }
    return forecastDate.set({ h: 20, m: 0 }).format(
        "DD/MM/YYYY hh:mm:ss A"
    );
}

export function dateByDeliveryType(type: string) {
    let forecast = 1;
    if (type == "D") forecast = 0;
    if (type.includes("+")) {
        const numb = type.split("+")[1];
        if (isNumber(numb)) {
            forecast = parseInt(numb);
        }
    }
    const now = moment().format("DD/MM/YYYY hh:mm:ss A");
    return countValidDays(now, forecast);
}

function isNumber(value: string) {
    if (typeof value === "string") {
        return !isNaN(parseInt(value));
    }
}