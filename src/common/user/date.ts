export function timeAgo(dateParam?: number) {
    const rtf = new Intl.RelativeTimeFormat(navigator.language, { numeric: 'auto' });

    if (!dateParam)
        return "unkown create date";

    const date = new Date(dateParam);
    const today = new Date();
    const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);

    if (seconds < 5)
        return 'now';
    else if (seconds < 60)
        return rtf.format(-seconds, 'seconds');
    else if (seconds < 90)
        return rtf.format(-1, 'minutes');
    else if (minutes < 60)
        return rtf.format(-minutes, 'minutes');
    else if (hours < 24)
        return rtf.format(-hours, 'hours');

    const dtf = new Intl.DateTimeFormat(navigator.language, {});
    return dtf.format(date);
}