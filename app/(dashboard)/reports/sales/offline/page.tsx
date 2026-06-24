"use client";

import { useGetSalesReport } from "@/hooks/useSalesReport";
import { formatCurrency } from "@/lib/functions";
import { Transaction } from "@/types/transaction";
import { format } from "date-fns";

const OfflineSalesReportPage = () => {
  const { data: sales } = useGetSalesReport("");

  return (
    <div>
      <h2 className="font-bold text-2xl capitalize mb-10">
        Laporan Penjualan Offline
      </h2>
      <div>Filter</div>
      <div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead>
            <tr className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-top-[1px] border-slate-200 rounded-md">
              <th scope="col" className="px-6 py-5">
                No.
              </th>
              <th scope="col" className="px-6 py-5">
                No. Transaksi
              </th>
              <th scope="col" className="hidden sm:table-cell px-6 py-5">
                Waktu
              </th>
              <th scope="col" className="hidden sm:table-cell px-6 py-5">
                Kasir
              </th>
              <th scope="col" className="hidden sm:table-cell px-6 py-5">
                Shift
              </th>
              <th scope="col" className="px-6 py-5 text-center">
                Jumlah Item
              </th>
              <th scope="col" className="hidden sm:table-cell px-6 py-5">
                Metode Pembayaran
              </th>
              <th scope="col" className="px-6 py-5 text-center">
                Total
              </th>
              <th scope="col" className="px-6 py-5 text-center">
                Detail Transaksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sales.map((tr: Transaction, index: number) => {
              return (
                <tr
                  key={tr.id}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-6 py-3 w-10">{index + 1}</td>
                  <td className="px-6 py-3 w-[100px] text-black dark:text-white">
                    {tr.id}
                  </td>
                  <td className="px-6 py-3 w-[150px]">
                    {format(tr.transactionTime, "DD-MM-yyyy HH:mm:ss")}
                  </td>
                  <td className="px-6 py-3 text-center">{tr.user.name}</td>
                  <td className="px-6 py-3 w-80 dark:text-white">
                    {tr.userShift.shift.name}
                  </td>
                  <td className="px-6 py-3 text-center text-black">
                    {tr.totalItem}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {tr.outletPaymentMethod.paymentMethod.displayName}
                  </td>
                  <td className="px-6 py-3 text-right text-black">
                    {formatCurrency(Number(tr.totalPrice))}
                  </td>
                  <td className="px-6 py-3 text-right text-black">
                    {/* <Tooltip
                      content="Lihat Detail Transaksi"
                      placement="bottom"
                    >
                      <TransactionDetailsModal
                        modalTitle={`Detail Transaksi: ${tr.id}`}
                        buttonTitle={<TbListDetails />}
                        transaction={tr}
                      />
                    </Tooltip> */}
                  </td>
                </tr>
              );
            })}
            {/* {payments.map((p) => (
              <tr key={p as string} className="bg-slate-50">
                <td colSpan={7} className="px-6 py-3 text-right">
                  Total {p}
                </td>
                <td className="px-6 py-3 text-right">
                  <strong>
                    {formatCurrency(totalByPaymentFiltered[p as string])}
                  </strong>
                </td>
                <td></td>
              </tr>
            ))} */}
            {/* <tr className="bg-slate-50">
              <td colSpan={7} className="px-6 py-3 text-right">
                Total
              </td>
              <td className="px-6 py-3 text-right">
                <strong>{formatCurrency(totalAllFiltered)}</strong>
              </td>
              <td></td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfflineSalesReportPage;
