import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export type PeriodType = 'today' | 'month' | 'year';

export function getDateRange(period: string) {
    const now = new Date();

    switch (period) {
        case 'today':
            return {
                gte: startOfDay(now),
                lte: endOfDay(now),
            };
        case 'month':
            return {
                gte: startOfMonth(now),
                lte: endOfMonth(now),
            };
        case 'year':
            return {
                gte: startOfYear(now),
                lte: endOfYear(now),
            };
        default:
            // Default fallback to today
            return {
                gte: startOfDay(now),
                lte: endOfDay(now),
            };
    }
}