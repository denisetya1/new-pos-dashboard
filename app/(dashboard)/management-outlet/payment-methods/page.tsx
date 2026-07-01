"use client";

import LoadingContent from "@/app/(dashboard)/components/LoadingContent";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetOutlets } from "@/hooks/useOutlets";
import {
  useGetOutletPaymentMethods,
  useUpdateOutletPaymentMethodStatus,
} from "@/hooks/useOutletPaymentMethods";
import { useQueryClient } from "@tanstack/react-query";
import { Store } from "lucide-react";
import queryString from "query-string";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type OutletItem = {
  id: string;
  name: string;
};

type OutletPaymentMethodItem = {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  outletPaymentMethodId: string | null;
  isActive: boolean;
};

const OutletPaymentMethodsPage = () => {
  const queryClient = useQueryClient();
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const { data: outletsData, isPending: isOutletPending } = useGetOutlets();
  const updateStatus = useUpdateOutletPaymentMethodStatus();

  const outlets: OutletItem[] = outletsData?.data || [];
  const currentOutletId = selectedOutletId || outlets[0]?.id?.toString() || "";

  const qs = useMemo(
    () =>
      queryString.stringify({
        outletId: currentOutletId || undefined,
      }),
    [currentOutletId],
  );

  const {
    data: paymentMethodsData,
    isError,
    isPending,
    refetch,
  } = useGetOutletPaymentMethods(qs, currentOutletId !== "");

  const paymentMethods: OutletPaymentMethodItem[] =
    paymentMethodsData?.data?.contents || [];

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil metode pembayaran!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const handleStatusChange = (paymentMethodId: string, isActive: boolean) => {
    updateStatus.mutate(
      {
        outletId: currentOutletId,
        paymentMethodId,
        isActive,
      },
      {
        onSuccess: () => {
          toast.success("Status metode pembayaran berhasil diperbarui.", {
            position: "top-right",
            theme: "colored",
          });
          queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
          refetch();
        },
        onError: () => {
          toast.error("Gagal memperbarui metode pembayaran!", {
            position: "top-right",
            theme: "colored",
          });
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-bold text-2xl capitalize">Metode Pembayaran</h2>
      </div>

      <div className="mb-6 flex flex-col gap-2 md:max-w-md">
        <div className="text-sm font-medium">Outlet</div>
        <Select value={currentOutletId} onValueChange={setSelectedOutletId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih outlet" />
          </SelectTrigger>
          <SelectContent>
            {outlets.map((outlet) => (
              <SelectItem key={outlet.id} value={outlet.id.toString()}>
                {outlet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-0">
        <div className="w-full overflow-x-auto rounded-2xl">
          <Table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-xl">
            <TableHeader>
              <TableRow className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-top-[1px] border-slate-200 rounded-md">
                <TableHead className="table-cell text-center">No.</TableHead>
                <TableHead className="table-cell">Metode Pembayaran</TableHead>
                <TableHead className="hidden md:table-cell">
                  Deskripsi
                </TableHead>
                <TableHead className="table-cell text-center">Aktif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {paymentMethods.map((paymentMethod, index) => (
                <TableRow
                  key={paymentMethod.id}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <TableCell className="table-cell text-center align-top w-10">
                    {index + 1}
                  </TableCell>
                  <TableCell className="table-cell align-top text-black dark:text-white">
                    <div className="font-semibold">
                      {paymentMethod.displayName || paymentMethod.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {paymentMethod.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell align-top">
                    {paymentMethod.description || "-"}
                  </TableCell>
                  <TableCell className="table-cell align-top text-center">
                    <Switch
                      checked={paymentMethod.isActive}
                      disabled={!currentOutletId || updateStatus.isPending}
                      className="data-[state=checked]:bg-blue-600"
                      onCheckedChange={(value) =>
                        handleStatusChange(paymentMethod.id, value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {!isPending && !isOutletPending && paymentMethods.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-6 text-center text-sm text-gray-500">
            <Store className="h-8 w-8 text-gray-300" />
            Data metode pembayaran tidak ditemukan.
          </div>
        )}

        {(isPending || isOutletPending) && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading metode pembayaran"
              description="Mohon tunggu sementara kami mengambil data Anda."
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default OutletPaymentMethodsPage;
