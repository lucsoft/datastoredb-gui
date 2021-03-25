const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];


function getFormattedDate(date: Date, prefomattedDate?: string, hideYear = false) {
    const day = date.getDate();
    const month = MONTH_NAMES[ date.getMonth() ];
    const hours = date.getHours();
    let minutes: number | string = date.getMinutes();

    if (minutes < 10)
        minutes = `0${minutes}`;

    if (prefomattedDate)
        return `${prefomattedDate} at ${hours}:${minutes}`;

    if (hideYear)
        return `${day} ${month} at ${hours}:${minutes}`;

    return `${day} ${month} ${date.getFullYear()} at ${hours}:${minutes}`;
}


// --- Main function
export function timeAgo(dateParam?: number) {
    if (!dateParam)
        return "unkown create date";

    const date = new Date(dateParam);
    const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
    const today = new Date();
    const yesterday = new Date(today.getTime() - DAY_IN_MS);
    const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const isToday = today.toDateString() === date.toDateString();
    const isYesterday = yesterday.toDateString() === date.toDateString();
    const isThisYear = today.getFullYear() === date.getFullYear();


    if (seconds < 5)
        return 'now';
    else if (seconds < 60)
        return `${seconds} seconds ago`;
    else if (seconds < 90)
        return 'about a minute ago';
    else if (minutes < 60)
        return `${minutes} minutes ago`;
    else if (isToday)
        return getFormattedDate(date, 'Today'); // Today at 10:20
    else if (isYesterday)
        return getFormattedDate(date, 'Yesterday'); // Yesterday at 10:20
    else if (isThisYear)
        return getFormattedDate(date, undefined, true); // 10. January at 10:20


    return getFormattedDate(date); // 10. January 2017. at 10:20
}