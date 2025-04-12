import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  secondaryValue?: {
    value: number;
    currency: string;
  };
  icon?: LucideIcon;
  chartData?: any[];
  format?: 'currency' | 'decimal';
  description?: string;
  customIcon?: React.ReactNode;
  toFixed?: number;
  error?: {
    type: string;
    message: string;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  secondaryValue,
  icon: Icon,
  chartData,
  format = 'currency',
  description,
  customIcon,
  toFixed,
  error
}) => {
  const formatNumber = (num: number, currency?: string) => {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    const hasSignificantDecimals = numValue % 1 !== 0;
    
    if (format === 'currency') {
      if (currency === 'USD') {
        return `$ ${numValue.toLocaleString('en-US', { 
          minimumFractionDigits: hasSignificantDecimals ? 2 : 0,
          maximumFractionDigits: 2
        })}`;
      }
      return `R$ ${numValue.toLocaleString('pt-BR', { 
        minimumFractionDigits: hasSignificantDecimals ? 2 : 0,
        maximumFractionDigits: 2
      })}`;
    } else {
      return numValue.toLocaleString('pt-BR', {
        minimumFractionDigits: toFixed !== undefined ? toFixed : (hasSignificantDecimals ? 2 : 0),
        maximumFractionDigits: toFixed !== undefined ? toFixed : 2
      });
    }
  };

  const formattedValue = formatNumber(Number(value));
  const formattedSecondaryValue = secondaryValue ? formatNumber(secondaryValue.value, secondaryValue.currency) : null;

  const getBackgroundColor = () => {
    if (title === "Net Profit") {
      const numericValue = Number(value);
      return numericValue >= 0 ? '#EBF8F3' : '#FFF5F4';
    }
    return 'white';
  };

  return (
    <div className="metric-card group" style={{ background: getBackgroundColor() }}>
      <div className="relative h-full rounded sm:p-4 sm:pt-4 p-4 pt-6 px-6 sm:px-4 flex flex-col gap-4">
        <div>
          <div className="w-full flex justify-between items-start flex-wrap overflow-hidden">
            <div className="flex items-center gap-2">
              {customIcon || (Icon && <Icon className="h-5 w-5 text-gray-500" />)}
              <p className="metric-title whitespace-nowrap">{title}</p>
            </div>
          </div>
        </div>
        
        <div className="summary-box-body flex h-full flex-col">
          <div className="h-full flex flex-col gap-4 justify-between">
            <div className="flex sm:flex sm:justify-between items-start flex-col">
              <div className="flex justify-between w-full relative">
                {error ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error.message}</span>
                  </div>
                ) : (
                  <div>
                    <p className="metric-value text-xl sm:text-[1.625rem]">
                      {formattedValue}
                    </p>
                    {formattedSecondaryValue && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formattedSecondaryValue}
                      </p>
                    )}
                    {description && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {!error && chartData && (
              <div className="chart-container h-[40px] sm:h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="20%" stopColor="var(--chart-gradient-start)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--chart-gradient-end)" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="url(#chart-gradient)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;