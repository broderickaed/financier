// resources/js/utils/dateFormatter.ts

/**
 * Formats an ISO 8601 date string into a user-friendly format.
 * @param {string} isoString The date string from Laravel (e.g., "2025-07-09T19:47:23.000000Z").
 * @param {Intl.DateTimeFormatOptions} options Optional formatting options.
 * @returns {string} The formatted date string.
 */
export function formatDateTime(isoString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
    if (!isoString) {
        return 'N/A'; // Or an empty string, depending on your preference
    }

    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            // Handle invalid date strings
            console.warn('Invalid date string provided to formatDateTime:', isoString);
            return isoString; // Fallback to original or 'Invalid Date'
        }

        // Default options for common use case (e.g., "Jul 9, 2025, 7:47 PM")
        const defaultOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // Use 12-hour clock with AM/PM
            // timeZoneName: 'shortOffset', // Optional: e.g., "EST" or "-04:00"
        };

        return date.toLocaleString(
            navigator.language || 'en-US', // Use user's locale or default to 'en-US'
            { ...defaultOptions, ...options }, // Merge default and custom options
        );
    } catch (error) {
        console.error('Error formatting date:', error, 'Original string:', isoString);
        return isoString; // Fallback
    }
}

/**
 * Formats an ISO 8601 date string into a date-only format.
 * @param {string} isoString The date string from Laravel.
 * @returns {string} The formatted date string (e.g., "Jul 9, 2025").
 */
export function formatDate(isoString: string | null | undefined): string {
    return formatDateTime(isoString, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: undefined, // Explicitly set to undefined to remove time
        minute: undefined,
        second: undefined,
        hour12: undefined,
    });
}

/**
 * Formats an ISO 8601 date string into a time-only format.
 * @param {string} isoString The date string from Laravel.
 * @returns {string} The formatted time string (e.g., "7:47 PM").
 */
export function formatTime(isoString: string | null | undefined): string {
    return formatDateTime(isoString, {
        year: undefined,
        month: undefined,
        day: undefined,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}
