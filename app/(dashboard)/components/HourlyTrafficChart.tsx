import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type HourlyData = {
  hour: string; // Contoh: "09:00", "13:00"
  totalSales: number; // Omset uang
  transactionCount: number; // Jumlah bon/struk terbuat
};

export default function HourlyTrafficChart({ data }: { data: HourlyData[] }) {
  return (
    <div className="w-full h-75 bg-white p-4 rounded-xl shadow-xs">
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="hour" tickLine={false} style={{ fontSize: "12px" }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            style={{ fontSize: "12px" }}
          />

          {/* Custom tooltip agar tampilannya bagus */}
          <Tooltip
            formatter={(value, name) => {
              if (name === "transactionCount")
                return [value, "Total Transaksi"];
              if (name === "totalSales")
                return [`Rp ${value?.toLocaleString()}`, "Omset"];
              return [value, name];
            }}
          />

          <Area
            type="monotone"
            dataKey="transactionCount" // Menggunakan jumlah transaksi untuk mengukur keramaian
            name="transactionCount"
            stroke="#8b5cf6" // Warna Ungu
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
