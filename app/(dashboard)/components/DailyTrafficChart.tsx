import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DailyData = {
  day: string; // "Senin", "Selasa", dst.
  totalSales: number;
  transactionCount: number;
};

export default function DailyTrafficChart({ data }: { data: DailyData[] }) {
  return (
    <div className="w-full h-75 bg-white p-4 rounded-xl shadow-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tickLine={false} style={{ fontSize: "12px" }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "transactionCount")
                return [value, "Total Transaksi"];
              return [value, name];
            }}
          />
          <Bar
            dataKey="transactionCount"
            name="transactionCount"
            fill="#f59e0b" // Warna Amber/Oranye cerah
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
