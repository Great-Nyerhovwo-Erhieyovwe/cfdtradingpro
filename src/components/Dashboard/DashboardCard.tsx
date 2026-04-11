import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorClasses = {
  blue: "from-blue-50 to-blue-100 border-blue-200",
  green: "from-green-50 to-green-100 border-green-200",
  purple: "from-purple-50 to-purple-100 border-purple-200",
  orange: "from-orange-50 to-orange-100 border-orange-200",
  red: "from-red-50 to-red-100 border-red-200",
};

const iconColorClasses = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  red: "text-red-600",
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = "blue",
}) => {
  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{value}</p>
          {trend && (
            <p
              className={`text-xs sm:text-sm mt-1 sm:mt-2 ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : "-"}{trend.value}% {trend.isPositive ? "up" : "down"}
            </p>
          )}
        </div>
        {icon && (
          <div className={`text-xl sm:text-2xl flex-shrink-0 ${iconColorClasses[color]}`}>{icon}</div>
        )}
      </div>
    </div>
  );
};
