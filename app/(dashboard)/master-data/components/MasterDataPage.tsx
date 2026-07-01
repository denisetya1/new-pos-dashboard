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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  MasterDataPayload,
  MasterDataType,
  useCreateMasterData,
  useDeleteMasterData,
  useGetMasterData,
  useUpdateMasterData,
} from "@/hooks/useMasterData";
import { useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type MasterDataItem = {
  id: string;
  name: string;
  description?: string | null;
  direction?: "IN" | "OUT";
  storeId?: string | null;
  editable?: boolean;
};

type MasterDataConfig = {
  type: MasterDataType;
  title: string;
  addLabel: string;
  nameLabel: string;
  searchPlaceholder: string;
  hasDescription?: boolean;
  hasDirection?: boolean;
};

const emptyForm: MasterDataPayload = {
  name: "",
  description: "",
  direction: "IN",
};

const MasterDataPage = ({ config }: { config: MasterDataConfig }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const limit = 50;
  const currentPage = Number(params.page) || 1;
  const [search, setSearch] = useState(params.search || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterDataItem | null>(null);
  const [form, setForm] = useState<MasterDataPayload>(emptyForm);

  const qs = queryString.stringify({
    ...params,
    limit,
  });

  const {
    data: masterData,
    isError,
    isPending,
    refetch,
  } = useGetMasterData(config.type, qs);
  const createMasterData = useCreateMasterData(config.type);
  const updateMasterData = useUpdateMasterData(config.type);
  const deleteMasterData = useDeleteMasterData(config.type);

  const {
    contents,
    totalRow,
  }: { contents: MasterDataItem[]; totalRow: number } = masterData?.data || {};

  const totalPages = Math.ceil((totalRow || 0) / limit);
  const isSaving = createMasterData.isPending || updateMasterData.isPending;

  useEffect(() => {
    if (isError) {
      toast.error(`Terjadi kesalahan saat mengambil data ${config.title}!`, {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [config.title, isError]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    router.push(
      `${getPagePath(config.type)}?${queryString.stringify({
        ...params,
        search: search || undefined,
        page: undefined,
      })}`,
    );
  };

  const clearSearch = () => {
    setSearch("");
    router.push(
      `${getPagePath(config.type)}?${queryString.stringify({
        ...params,
        search: undefined,
        page: undefined,
      })}`,
    );
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (item: MasterDataItem) => {
    setSelectedItem(item);
    setForm({
      id: item.id,
      name: item.name,
      description: item.description || "",
      direction: item.direction || "IN",
    });
    setModalOpen(true);
  };

  const openDeleteModal = (item: MasterDataItem) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description?.trim(),
    };

    if (payload.name === "") {
      toast.error(`${config.nameLabel} wajib diisi!`, {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    const mutation = selectedItem ? updateMasterData : createMasterData;
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(`${config.title} berhasil disimpan.`, {
          position: "top-right",
          theme: "colored",
        });
        setModalOpen(false);
        invalidateRelatedQueries(config.type, queryClient);
        refetch();
      },
      onError: () => {
        toast.error(`Gagal menyimpan ${config.title}!`, {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  const onDelete = () => {
    if (!selectedItem) return;

    deleteMasterData.mutate(selectedItem.id, {
      onSuccess: () => {
        toast.success(`${config.title} berhasil dinonaktifkan.`, {
          position: "top-right",
          theme: "colored",
        });
        setDeleteModalOpen(false);
        setSelectedItem(null);
        invalidateRelatedQueries(config.type, queryClient);
        refetch();
      },
      onError: () => {
        toast.error(`Gagal menonaktifkan ${config.title}!`, {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-bold text-2xl capitalize">{config.title}</h2>
        <Button className="gap-2 md:w-auto" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          {config.addLabel}
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
            placeholder={config.searchPlaceholder}
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
                <TableHead className="table-cell">{config.nameLabel}</TableHead>
                {config.hasDirection && (
                  <TableHead className="table-cell text-center">Arah</TableHead>
                )}
                {config.hasDescription && (
                  <TableHead className="hidden md:table-cell">
                    Deskripsi
                  </TableHead>
                )}
                {config.hasDirection && (
                  <TableHead className="hidden md:table-cell text-center">
                    Sumber
                  </TableHead>
                )}
                <TableHead className="table-cell text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {contents &&
                contents.map((item, index) => {
                  const editable = item.editable !== false;

                  return (
                    <TableRow
                      key={item.id}
                      className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                    >
                      <TableCell className="table-cell text-center align-top w-10">
                        {index + 1 + (currentPage - 1) * limit}
                      </TableCell>
                      <TableCell className="table-cell align-top text-black dark:text-white">
                        {item.name}
                      </TableCell>
                      {config.hasDirection && (
                        <TableCell className="table-cell align-top text-center">
                          <span
                            className={
                              item.direction === "OUT"
                                ? "font-semibold text-red-600"
                                : "font-semibold text-blue-600"
                            }
                          >
                            {item.direction}
                          </span>
                        </TableCell>
                      )}
                      {config.hasDescription && (
                        <TableCell className="hidden md:table-cell align-top">
                          {item.description || "-"}
                        </TableCell>
                      )}
                      {config.hasDirection && (
                        <TableCell className="hidden md:table-cell align-top text-center">
                          {editable ? "Custom" : "Bawaan"}
                        </TableCell>
                      )}
                      <TableCell className="table-cell align-top">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={!editable}
                            onClick={() => openEditModal(item)}
                          >
                            <Edit3 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600"
                            disabled={!editable}
                            onClick={() => openDeleteModal(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Nonaktifkan</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {!isPending && contents?.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            Data tidak ditemukan.
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title={`Loading ${config.title}`}
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
        <DialogContent>
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? "Edit" : "Tambah"} {config.title}
              </DialogTitle>
            </DialogHeader>
            <div className="my-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="master-data-name">{config.nameLabel}</Label>
                <Input
                  id="master-data-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>

              {config.hasDirection && (
                <div className="space-y-2">
                  <Label>Arah Stok</Label>
                  <Select
                    value={form.direction}
                    onValueChange={(value: "IN" | "OUT") =>
                      setForm((current) => ({
                        ...current,
                        direction: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih arah stok" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">IN - Penambahan Stok</SelectItem>
                      <SelectItem value="OUT">
                        OUT - Pengurangan Stok
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.hasDescription && (
                <div className="space-y-2">
                  <Label htmlFor="master-data-description">Deskripsi</Label>
                  <Textarea
                    id="master-data-description"
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
              )}
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
            <DialogTitle>Nonaktifkan {config.title}</DialogTitle>
          </DialogHeader>
          <div className="my-6 text-sm">
            Nonaktifkan data <strong>{selectedItem?.name}</strong>?
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
              disabled={deleteMasterData.isPending}
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

const getPagePath = (type: MasterDataType) => {
  return `/master-data/${type}`;
};

const invalidateRelatedQueries = (
  type: MasterDataType,
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  if (type === "brands") {
    queryClient.invalidateQueries({ queryKey: ["brands"] });
  }

  if (type === "categories") {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  if (type === "move-types") {
    queryClient.invalidateQueries({ queryKey: ["movetypes"] });
  }
};

export default MasterDataPage;
