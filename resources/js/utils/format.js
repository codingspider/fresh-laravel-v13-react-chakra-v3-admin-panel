/*
 * Format values for the screen. Always show dates in Bangladesh time.
 * Use these in table cells and pages — never format inline.
 */

const TIME_ZONE = 'Asia/Dhaka';

// "15 Oct 2026"
export function formatDate(value) {
    if (!value) return '—';

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: TIME_ZONE,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

// "02:30 PM"
export function formatTime(value) {
    if (!value) return '—';

    return new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(value));
}

// "15 Oct 2026, 02:30 PM"
export function formatDateTime(value) {
    if (!value) return '—';

    return `${formatDate(value)}, ${formatTime(value)}`;
}

// "৳ 1,25,000.00"
export function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '—';

    const amount = Number(value).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return `৳ ${amount}`;
}
