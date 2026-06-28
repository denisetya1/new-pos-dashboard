import { MonthlySummary } from "@/types/analytics";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(0)} Jt`;
  }
  return formatCurrency(value);
};

export default function RevenueChart({ data }: { data: MonthlySummary[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis width={90} tickFormatter={formatYAxis} />

        {/* Tooltip otomatis menampilkan breakdown Online & Offline saat di-hover */}
        <Tooltip
          formatter={(value: any) => formatCurrency(Number(value) || 0)}
        />

        {/* Legend untuk menampilkan petunjuk warna biru/hijau di bawah/atas grafik */}
        <Legend />

        {/* 💡 BAR 1: Offline Revenue */}
        <Bar
          dataKey="offlineRevenue"
          name="Offline"
          stackId="revenue" // 💡 Kunci penumpukan (harus sama)
          fill="#3b82f6" // Warna Biru
        />

        {/* 💡 BAR 2: Online Revenue */}
        <Bar
          dataKey="onlineRevenue"
          name="Online"
          stackId="revenue" // 💡 Kunci penumpukan (harus sama)
          radius={[5, 5, 0, 0]} // Efek tumpul hanya diberikan di bar paling atas
          fill="#10b981" // Warna Hijau
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
