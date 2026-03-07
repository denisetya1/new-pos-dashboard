"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  BarChart,
} from "recharts";

const data = [
  { name: "Jan", total: 400 },
  { name: "Feb", total: 300 },
  { name: "Mar", total: 500 },
  { name: "Apr", total: 200 },
  { name: "May", total: 600 },
  { name: "Jun", total: 700 },
];

const HomePage = () => {
  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Revenue", "Users", "Orders", "Growth"].map((title, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-xl shadow-none">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,345</div>
                <p className="text-xs text-gray-500 mt-1">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#4b5ff6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default HomePage;
