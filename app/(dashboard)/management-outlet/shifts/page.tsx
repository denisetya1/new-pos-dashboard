"use client";

import LoadingContent from "@/app/(dashboard)/components/LoadingContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  OutletShiftPayload,
  useCreateOutletShift,
  useDeleteOutletShift,
  useGetOutletShifts,
  useUpdateOutletShift,
  useUpdateOutletShiftStatus,
} from "@/hooks/useOutletShifts";
import { useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Store, Trash2 } from "lucide-react";
import queryString from "query-string";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type OutletItem = {
  id: string;
  name: string;
};

type ShiftItem = {
  id: string;
  outletId: string;
  name: string;
  sort: number;
  workingHours: string | null;
  isActive: boolean;
};

const emptyForm: OutletShiftPayload = {
  outletId: "",
  name: "",
  workingHours: "",
};

const OutletShiftsPage = () => {
  const queryClient = useQueryClient();
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftItem | null>(null);
  const [form, setForm] = useState<OutletShiftPayload>(emptyForm);
  const { data: outletsData, isPending: isOutletPending } = useGetOutlets();
  const createShift = useCreateOutletShift();
  const updateShift = useUpdateOutletShift();
  const updateShiftStatus = useUpdateOutletShiftStatus();
  const deleteShift = useDeleteOutletShift();

  const outlets: OutletItem[] = outletsData?.data || [];
  const currentOutletId = selectedOutletId || outlets[0]?.id?.toString() || "";
  const isSaving = createShift.isPending || updateShift.isPending;

  const qs = useMemo(
    () =>
      queryString.stringify({
        outletId: currentOutletId || undefined,
      }),
    [currentOutletId],
  );

  const {
    data: shiftsData,
    isError,
    isPending,
    refetch,
  } = useGetOutletShifts(qs, currentOutletId !== "");

  const shifts: ShiftItem[] = shiftsData?.data?.contents || [];

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil daftar shift!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const invalidateShiftQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["shifts"] });
  };

  const openCreateModal = () => {
    setSelectedShift(null);
    setForm({
      ...emptyForm,
      outletId: currentOutletId,
    });
    setModalOpen(true);
  };

  const openEditModal = (shift: ShiftItem) => {
    setSelectedShift(shift);
    setForm({
      id: shift.id,
      outletId: shift.outletId,
      name: shift.name,
      workingHours: shift.workingHours || "",
    });
    setModalOpen(true);
  };

  const openDeleteModal = (shift: ShiftItem) => {
    setSelectedShift(shift);
    setDeleteModalOpen(true);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...form,
      outletId: currentOutletId,
      name: form.name.trim(),
      workingHours: form.workingHours?.trim(),
    };

    if (payload.name === "") {
      toast.error("Nama shift wajib diisi!", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    const mutation = selectedShift ? updateShift : createShift;
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Shift kasir berhasil disimpan.", {
          position: "top-right",
          theme: "colored",
        });
        setModalOpen(false);
        invalidateShiftQueries();
        refetch();
      },
      onError: () => {
        toast.error("Gagal menyimpan shift kasir!", {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  const handleStatusChange = (id: string, isActive: boolean) => {
    updateShiftStatus.mutate(
      { id, isActive },
      {
        onSuccess: () => {
          toast.success("Status shift berhasil diperbarui.", {
            position: "top-right",
            theme: "colored",
          });
          invalidateShiftQueries();
          refetch();
        },
        onError: () => {
          toast.error("Gagal memperbarui status shift!", {
            position: "top-right",
            theme: "colored",
          });
        },
      },
    );
  };

  const onDelete = () => {
    if (!selectedShift) return;

    deleteShift.mutate(selectedShift.id, {
      onSuccess: () => {
        toast.success("Shift kasir berhasil dihapus.", {
          position: "top-right",
          theme: "colored",
        });
        setDeleteModalOpen(false);
        setSelectedShift(null);
        invalidateShiftQueries();
        refetch();
      },
      onError: () => {
        toast.error("Gagal menghapus shift kasir!", {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-bold text-2xl capitalize">Daftar Shift Kasir</h2>
        <Button
          className="gap-2 md:w-auto"
          disabled={!currentOutletId}
          onClick={openCreateModal}
        >
          <Plus className="h-4 w-4" />
          Tambah Shift
        </Button>
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
                <TableHead className="table-cell">Shift</TableHead>
                <TableHead className="hidden md:table-cell">
                  Jam Kerja
                </TableHead>
                <TableHead className="table-cell text-center">Aktif</TableHead>
                <TableHead className="table-cell text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {shifts.map((shift, index) => (
                <TableRow
                  key={shift.id}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <TableCell className="table-cell text-center align-top w-10">
                    {index + 1}
                  </TableCell>
                  <TableCell className="table-cell align-top text-black dark:text-white">
                    <div className="font-semibold">{shift.name}</div>
                    <div className="text-xs text-gray-400">
                      Urutan: {shift.sort}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell align-top">
                    {shift.workingHours || "-"}
                  </TableCell>
                  <TableCell className="table-cell align-top text-center">
                    <Switch
                      checked={shift.isActive}
                      disabled={updateShiftStatus.isPending}
                      className="data-[state=checked]:bg-blue-600"
                      onCheckedChange={(value) =>
                        handleStatusChange(shift.id, value)
                      }
                    />
                  </TableCell>
                  <TableCell className="table-cell align-top">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditModal(shift)}
                      >
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600"
                        onClick={() => openDeleteModal(shift)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {!isPending && !isOutletPending && shifts.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-6 text-center text-sm text-gray-500">
            <Store className="h-8 w-8 text-gray-300" />
            Data shift kasir tidak ditemukan.
          </div>
        )}

        {(isPending || isOutletPending) && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading shift kasir"
              description="Mohon tunggu sementara kami mengambil data Anda."
            />
          </div>
        )}
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>
                {selectedShift ? "Edit Shift Kasir" : "Tambah Shift Kasir"}
              </DialogTitle>
            </DialogHeader>
            <div className="my-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shift-name">Nama Shift</Label>
                <Input
                  id="shift-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-working-hours">Jam Kerja</Label>
                <Input
                  id="shift-working-hours"
                  value={form.workingHours}
                  placeholder="Contoh: 08:00 - 16:00"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      workingHours: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Shift Kasir</DialogTitle>
          </DialogHeader>
          <div className="my-6 text-sm">
            Hapus shift <strong>{selectedShift?.name}</strong>?
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteShift.isPending}
              onClick={onDelete}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutletShiftsPage;
