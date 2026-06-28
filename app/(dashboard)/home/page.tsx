"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  useGetDailyTraffics,
  useGetHourlyTraffics,
  useGetMonthlySummary,
  useGetRevenueSummary,
} from "@/hooks/useAnalytics";
import { formatCompactCurrency } from "@/lib/functions";
import { motion } from "framer-motion";

import RevenueChart from "../components/RevenueChart";
import { ChevronDown, ChevronUp } from "lucide-react";
import MonthlyTransactionChart from "../components/MonthlyTransactionCountChart";
import HourlyTrafficChart from "../components/HourlyTrafficChart";
import DailyTrafficChart from "../components/DailyTrafficChart";

const HomePage = () => {
  const { data: revenueSummary } = useGetRevenueSummary();
  const { data: monthlyRevenue } = useGetMonthlySummary();
  const { data: HourlyData } = useGetHourlyTraffics();
  const { data: DailyData } = useGetDailyTraffics();

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {revenueSummary &&
          revenueSummary.data &&
          ["monthly", "weekly", "daily"].map((time, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-xl shadow-none gap-0">
                <CardHeader className="mb-0">
                  <CardTitle className="text-sm font-medium text-gray-500 mb-0 flex justify-between items-center">
                    <div>Revenue {revenueSummary.data[time].title}</div>
                    {revenueSummary.data[time].growth.revenue.percentage !==
                      0 && (
                      <div
                        className={`flex font-light text-sm justify-end items-center ${revenueSummary.data[time].growth.revenue.percentage < 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {revenueSummary.data[time].growth.revenue.percentage}%
                        {revenueSummary.data[time].growth.revenue.percentage <
                        0 ? (
                          <ChevronDown size="16" />
                        ) : (
                          <ChevronUp size="16" />
                        )}{" "}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center mb-5">
                    {formatCompactCurrency(
                      revenueSummary.data[time].current.totalRevenue,
                    )}{" "}
                  </div>
                  <div className="flex justify-between">
                    <div className="text-xs text-gray-500 mt-1">
                      offline:{" "}
                      <span className="font-semibold">
                        {formatCompactCurrency(
                          revenueSummary.data[time].current.offline,
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      online:{" "}
                      <span className="font-semibold">
                        {formatCompactCurrency(
                          revenueSummary.data[time].current.online,
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        {revenueSummary && revenueSummary.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4 * 0.1 }}
          >
            <Card className="rounded-xl shadow-none gap-0">
              <CardHeader className="mb-0">
                <CardTitle className="text-sm font-medium text-gray-500 mb-0 flex justify-between items-center">
                  <div>Jml. Transaksi Hari Ini</div>
                  {revenueSummary.data.daily.growth.transaction.percentage !==
                    0 && (
                    <div
                      className={`flex font-light text-sm justify-end items-center ${revenueSummary.data.daily.growth.transaction.percentage < 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {revenueSummary.data.daily.growth.transaction.percentage}%
                      {revenueSummary.data.daily.growth.transaction.percentage <
                      0 ? (
                        <ChevronDown size="16" />
                      ) : (
                        <ChevronUp size="16" />
                      )}{" "}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center mb-5">
                  {revenueSummary.data.daily.current.transactionCount.total}
                </div>
                <div className="flex justify-between">
                  <div className="text-xs text-gray-500 mt-1">
                    offline:{" "}
                    <span className="font-semibold">
                      {
                        revenueSummary.data.daily.current.transactionCount
                          .offline
                      }
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    online:{" "}
                    <span className="font-semibold">
                      {
                        revenueSummary.data.daily.current.transactionCount
                          .online
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Chart */}
      <div className="flex flex-row justify-between gap-5">
        <Card className="rounded-xl shadow-none w-1/2">
          <CardHeader>
            <CardTitle>Ringkasan Total Penjualan Bulanan</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <RevenueChart data={monthlyRevenue?.data || []} />
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-none w-1/2">
          <CardHeader>
            <CardTitle>Ringkasan Jumlah Transaksi Bulanan</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <MonthlyTransactionChart data={monthlyRevenue?.data || []} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-row justify-between gap-5">
        <Card className="rounded-xl shadow-none w-1/2">
          <CardHeader>
            <CardTitle>Tren Jam Ramai Transaksi (24 Jam)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <HourlyTrafficChart data={HourlyData?.data || []} />
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-none w-1/2">
          <CardHeader>
            <CardTitle>Analisis Hari Ramai Transaksi (Mingguan)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <DailyTrafficChart data={DailyData?.data || []} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default HomePage;
