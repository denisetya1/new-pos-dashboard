"use client";

import { useGetSalesReport } from "@/hooks/useSalesReport";
import { SalesSummaryWidget } from "./components/SalesSummarryWidget";
import SalesTable from "./components/SalesTable";
import TablePagination from "@/app/(dashboard)/components/TablePagination-backup";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import { TransactionDetailModal } from "../components/TransactionDetailModal";
import { useState } from "react";

const OfflineSalesReportPage = () => {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const [transaction, setTransaction] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const limit = 50;
  const { page } = params;

  const qs = queryString.stringify(params);
  const { data: sales, isLoading } = useGetSalesReport(qs);

  const { totalRow } = sales?.data || {};
  const totalPages = Math.ceil(totalRow / limit);
  const currentPage = parseInt(page) || 1;

  const handleDetailClick = (transaction) => {
    setTransaction(transaction);
    setModalOpen(true);
  };

  return (
    <div>
      <h2 className="font-bold text-2xl capitalize mb-10">
        Laporan Penjualan Offline
      </h2>
      {/* <div>Filter</div> */}
      {sales && <SalesSummaryWidget summary={sales.data.summary} />}
      {sales && (
        <TablePagination
          totalPages={totalPages}
          currentPage={currentPage}
          limit={limit}
        />
      )}
      {sales && (
        <SalesTable
          startNumber={(currentPage - 1) * limit + 1}
          transactions={sales.data.contents}
          isLoading={isLoading}
          onDetailClick={handleDetailClick}
        />
      )}
      {sales && (
        <TablePagination
          totalPages={totalPages}
          currentPage={currentPage}
          limit={limit}
        />
      )}
      <TransactionDetailModal
        transaction={transaction}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default OfflineSalesReportPage;
