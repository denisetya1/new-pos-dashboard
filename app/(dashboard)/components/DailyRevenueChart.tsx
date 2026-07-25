import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DailyRevenue } from "@/types/analytics";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatYAxis = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} M`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} Jt`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} Rb`;
  }

  return String(value);
};

export default function DailyRevenueChart({
  data,
}: {
  data: DailyRevenue[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 12, left: 10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="dailyRevenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          minTickGap={22}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          width={64}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.date || ""
          }
          formatter={(value, name) => [
            formatCurrency(Number(value) || 0),
            name,
          ]}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="offlineRevenue"
          name="Offline"
          stackId="revenue"
          stroke="#2563eb"
          strokeWidth={2.5}
          fill="url(#dailyRevenueFill)"
          activeDot={{ r: 5 }}
        />
        <Area
          type="monotone"
          dataKey="onlineRevenue"
          name="Online"
          stackId="revenue"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="#10b981"
          fillOpacity={0.18}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
