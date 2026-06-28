import { MonthlySummary } from "@/types/analytics";
import {
  LineChart, // 💡 Ubah dari BarChart
  Line, // 💡 Ubah dari Bar
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MonthlyTransactionChart({
  data,
}: {
  data: MonthlySummary[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* 💡 Ubah ke LineChart */}
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis width={90} />

        {/* Tooltip otomatis menampilkan breakdown Online & Offline */}
        <Tooltip />

        {/* Legend petunjuk warna garis */}
        <Legend />

        {/* 💡 LINE 1: Offline */}
        <Line
          type="monotone" // 💡 Membuat garis melengkung halus (smooth curve)
          dataKey="offlineCount"
          name="Offline"
          stroke="#3b82f6" // Warna Biru untuk Garis
          strokeWidth={2} // Ketebalan garis
          activeDot={{ r: 8 }} // Ukuran titik saat di-hover
        />

        {/* 💡 LINE 2: Online */}
        <Line
          type="monotone"
          dataKey="onlineCount"
          name="Online"
          stroke="#10b981" // Warna Hijau untuk Garis
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
