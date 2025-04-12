import useSWR from 'swr';
import { fetchFacebookMetrics, FacebookMetrics } from '../services/facebook';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, parse, format } from 'date-fns';

const formatDateForFacebook = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

const getDateRange = (timeframe: string) => {
  const now = new Date();
  let start: Date;
  let end: Date;
  
  if (timeframe.includes('-')) {
    const [startStr, endStr] = timeframe.split('-').map(d => d.trim());
    try {
      start = parse(startStr, 'dd/MM/yyyy', new Date());
      end = parse(endStr, 'dd/MM/yyyy', new Date());
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }

      start = startOfDay(start);
      end = endOfDay(end);
    } catch (error) {
      console.error('Date parsing error:', error);
      start = startOfYear(now);
      end = endOfYear(now);
    }
  } else {
    switch (timeframe) {
      case 'Today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'Yesterday':
        start = startOfDay(subDays(now, 1));
        end = endOfDay(subDays(now, 1));
        break;
      case 'Last 7 Days':
        start = startOfDay(subDays(now, 6));
        end = endOfDay(now);
        break;
      case 'Last 30 Days':
        start = startOfDay(subDays(now, 29));
        end = endOfDay(now);
        break;
      case 'This Month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'This Year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = startOfYear(now);
        end = endOfYear(now);
    }
  }

  return {
    start: formatDateForFacebook(start),
    end: formatDateForFacebook(end)
  };
};

export const useFacebookMetrics = (timeframe: string) => {
  const { start, end } = getDateRange(timeframe);
  
  const { data, error, mutate } = useSWR<FacebookMetrics>(
    ['facebook-metrics', start, end],
    () => fetchFacebookMetrics(start, end),
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
      shouldRetryOnError: true,
      errorRetryCount: 3
    }
  );

  return {
    metrics: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
};