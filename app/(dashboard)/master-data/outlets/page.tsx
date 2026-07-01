"use client";

import LoadingContent from "@/app/(dashboard)/components/LoadingContent";
import TablePagination from "@/app/(dashboard)/components/TablePagination";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  OutletPayload,
  useCreateOutletManagement,
  useDeleteOutletManagement,
  useGetOutletManagement,
  useUpdateOutletManagement,
} from "@/hooks/useOutletManagement";
import { useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type OutletItem = {
  id: string;
  name: string;
  sequence: number | null;
  phone: string | null;
  address: string | null;
  isActivePOS: boolean | null;
  printExtraInfo: string | null;
  printHeaderLine1: string | null;
  printHeaderLine2: string | null;
  printHeaderLine3: string | null;
  printHeaderLine4: string | null;
  printHeaderLine5: string | null;
};

const emptyForm: OutletPayload = {
  name: "",
  phone: "",
  address: "",
  isActivePOS: true,
  printHeaderLine1: "",
  printHeaderLine2: "",
  printHeaderLine3: "",
  printHeaderLine4: "",
  printHeaderLine5: "",
  printExtraInfo: "",
};

const OutletManagementPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const limit = 50;
  const currentPage = Number(params.page) || 1;
  const [search, setSearch] = useState(params.search || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<OutletItem | null>(null);
  const [form, setForm] = useState<OutletPayload>(emptyForm);

  const qs = queryString.stringify({
    ...params,
    limit,
  });

  const {
    data: outletsData,
    isError,
    isPending,
    refetch,
  } = useGetOutletManagement(qs);
  const createOutlet = useCreateOutletManagement();
  const updateOutlet = useUpdateOutletManagement();
  const deleteOutlet = useDeleteOutletManagement();

  const { contents: outlets, totalRow }: { contents: OutletItem[]; totalRow: number } =
    outletsData?.data || {};
  const totalPages = Math.ceil((totalRow || 0) / limit);
  const isSaving = createOutlet.isPending || updateOutlet.isPending;

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil data outlet!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    router.push(
      `/master-data/outlets?${queryString.stringify({
        ...params,
        search: search || undefined,
        page: undefined,
      })}`,
    );
  };

  const clearSearch = () => {
    setSearch("");
    router.push(
      `/master-data/outlets?${queryString.stringify({
        ...params,
        search: undefined,
        page: undefined,
      })}`,
    );
  };

  const openCreateModal = () => {
    setSelectedOutlet(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (outlet: OutletItem) => {
    setSelectedOutlet(outlet);
    setForm({
      id: outlet.id,
      name: outlet.name,
      phone: outlet.phone || "",
      address: outlet.address || "",
      isActivePOS: outlet.isActivePOS ?? false,
      printHeaderLine1: outlet.printHeaderLine1 || "",
      printHeaderLine2: outlet.printHeaderLine2 || "",
      printHeaderLine3: outlet.printHeaderLine3 || "",
      printHeaderLine4: outlet.printHeaderLine4 || "",
      printHeaderLine5: outlet.printHeaderLine5 || "",
      printExtraInfo: outlet.printExtraInfo || "",
    });
    setModalOpen(true);
  };

  const openDeleteModal = (outlet: OutletItem) => {
    setSelectedOutlet(outlet);
    setDeleteModalOpen(true);
  };

  const invalidateOutletQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["outlets"] });
    queryClient.invalidateQueries({ queryKey: ["outlet"] });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...form,
      name: form.name.trim(),
      phone: form.phone?.trim(),
      address: form.address?.trim(),
    };

    if (payload.name === "") {
      toast.error("Nama outlet wajib diisi!", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    const mutation = selectedOutlet ? updateOutlet : createOutlet;
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Outlet berhasil disimpan.", {
          position: "top-right",
          theme: "colored",
        });
        setModalOpen(false);
        invalidateOutletQueries();
        refetch();
      },
      onError: () => {
        toast.error("Gagal menyimpan outlet!", {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  const onDelete = () => {
    if (!selectedOutlet) return;

    deleteOutlet.mutate(selectedOutlet.id, {
      onSuccess: () => {
        toast.success("Outlet berhasil dinonaktifkan.", {
          position: "top-right",
          theme: "colored",
        });
        setDeleteModalOpen(false);
        setSelectedOutlet(null);
        invalidateOutletQueries();
        refetch();
      },
      onError: () => {
        toast.error("Gagal menonaktifkan outlet!", {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-bold text-2xl capitalize">Manage Outlet</h2>
        <Button className="gap-2 md:w-auto" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Tambah Outlet
        </Button>
      </div>

      <form
        className="mb-6 flex flex-col gap-3 md:flex-row md:items-center"
        onSubmit={onSearch}
      >
        <div className="w-full md:max-w-md">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama, telepon, atau alamat outlet"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="gap-2">
            <Search className="h-4 w-4" />
            Cari
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={clearSearch}
            disabled={!params.search}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Reset pencarian</span>
          </Button>
        </div>
      </form>

      <div className="mb-2">
        <TablePagination
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPages}
        />
      </div>

      <Card className="p-0">
        <div className="w-full overflow-x-auto rounded-2xl">
          <Table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-xl">
            <TableHeader>
              <TableRow className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-top-[1px] border-slate-200 rounded-md">
                <TableHead className="table-cell text-center">No.</TableHead>
                <TableHead className="table-cell">Outlet</TableHead>
                <TableHead className="hidden md:table-cell">Kontak</TableHead>
                <TableHead className="hidden lg:table-cell">Alamat</TableHead>
                <TableHead className="table-cell text-center">POS</TableHead>
                <TableHead className="table-cell text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {outlets &&
                outlets.map((outlet, index) => (
                  <TableRow
                    key={outlet.id}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                  >
                    <TableCell className="table-cell text-center align-top w-10">
                      {index + 1 + (currentPage - 1) * limit}
                    </TableCell>
                    <TableCell className="table-cell align-top text-black dark:text-white">
                      <div className="font-semibold">{outlet.name}</div>
                      <div className="text-xs text-gray-400">
                        Urutan: {outlet.sequence ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell align-top">
                      {outlet.phone || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell align-top">
                      {outlet.address || "-"}
                    </TableCell>
                    <TableCell className="table-cell align-top text-center">
                      <span
                        className={
                          outlet.isActivePOS
                            ? "font-semibold text-blue-600"
                            : "font-semibold text-gray-400"
                        }
                      >
                        {outlet.isActivePOS ? "Aktif" : "Nonaktif"}
                      </span>
                    </TableCell>
                    <TableCell className="table-cell align-top">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(outlet)}
                        >
                          <Edit3 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600"
                          onClick={() => openDeleteModal(outlet)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Nonaktifkan</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {!isPending && outlets?.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            Data outlet tidak ditemukan.
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading outlet"
              description="Mohon tunggu sementara kami mengambil data Anda."
            />
          </div>
        )}
      </Card>

      <div className="mt-2 mb-10">
        <TablePagination
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPages}
        />
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedOutlet ? "Edit Outlet" : "Tambah Outlet"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="outlet-name">Nama Outlet</Label>
                <Input
                  id="outlet-name"
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
                <Label htmlFor="outlet-phone">Telepon</Label>
                <Input
                  id="outlet-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-end gap-3 pb-2">
                <Switch
                  checked={form.isActivePOS}
                  onCheckedChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      isActivePOS: value,
                    }))
                  }
                />
                <Label>Aktif di POS</Label>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="outlet-address">Alamat</Label>
                <Textarea
                  id="outlet-address"
                  value={form.address}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="print-header-1">Header Struk 1</Label>
                <Input
                  id="print-header-1"
                  value={form.printHeaderLine1}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      printHeaderLine1: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="print-header-2">Header Struk 2</Label>
                <Input
                  id="print-header-2"
                  value={form.printHeaderLine2}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      printHeaderLine2: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="print-header-3">Header Struk 3</Label>
                <Input
                  id="print-header-3"
                  value={form.printHeaderLine3}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      printHeaderLine3: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="print-header-4">Header Struk 4</Label>
                <Input
                  id="print-header-4"
                  value={form.printHeaderLine4}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      printHeaderLine4: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="print-header-5">Header Struk 5</Label>
                <Input
                  id="print-header-5"
                  value={form.printHeaderLine5}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      printHeaderLine5: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="print-extra-info">Info Tambahan Struk</Label>
                <Input
                  id="print-extra-info"
                  value={form.printExtraInfo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      printExtraInfo: event.target.value,
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
            <DialogTitle>Nonaktifkan Outlet</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 text-sm">
            Nonaktifkan outlet <strong>{selectedOutlet?.name}</strong>?
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
              disabled={deleteOutlet.isPending}
              onClick={onDelete}
            >
              Nonaktifkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutletManagementPage;
