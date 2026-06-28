"use client";

import { useGetSalesReport } from "@/hooks/useSalesReport";
import { SalesSummaryWidget } from "./components/SalesSummarryWidget";
import SalesTable from "./components/SalesTable";

const OfflineSalesReportPage = () => {
  const qs = "";
  const { data: sales, isLoading } = useGetSalesReport(qs);
  console.log("sales", sales);

  return (
    <div>
      <h2 className="font-bold text-2xl capitalize mb-10">
        Laporan Penjualan Offline
      </h2>
      <div>Filter</div>
      {sales && <SalesSummaryWidget summary={sales.data.summary} />}
      {sales && (
        <SalesTable transactions={sales.data.contents} isLoading={isLoading} />
      )}
    </div>
  );
};

export default OfflineSalesReportPage;
