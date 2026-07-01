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
import {
  SubAccountPayload,
  useCreateSubAccount,
  useDeleteSubAccount,
  useGetSubAccounts,
  useUpdateSubAccountStatus,
} from "@/hooks/useSubAccounts";
import { format } from "date-fns";
import { Plus, Search, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type SubAccountItem = {
  id: string;
  name: string;
  username: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
};

type SubAccountForm = SubAccountPayload & {
  confirmPassword: string;
};

const emptyForm: SubAccountForm = {
  name: "",
  username: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const SubAccountsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const limit = 50;
  const currentPage = Number(params.page) || 1;
  const [search, setSearch] = useState(params.search || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SubAccountItem | null>(null);
  const [form, setForm] = useState<SubAccountForm>(emptyForm);

  const qs = queryString.stringify({
    ...params,
    limit,
  });

  const {
    data: subAccountsData,
    isError,
    isPending,
    refetch,
  } = useGetSubAccounts(qs);
  const createSubAccount = useCreateSubAccount();
  const updateSubAccountStatus = useUpdateSubAccountStatus();
  const deleteSubAccount = useDeleteSubAccount();

  const {
    contents: subAccounts,
    totalRow,
  }: { contents: SubAccountItem[]; totalRow: number } =
    subAccountsData?.data || {};
  const totalPages = Math.ceil((totalRow || 0) / limit);

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil data sub account!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    router.push(
      `/settings/sub-accounts?${queryString.stringify({
        ...params,
        search: search || undefined,
        page: undefined,
      })}`,
    );
  };

  const clearSearch = () => {
    setSearch("");
    router.push(
      `/settings/sub-accounts?${queryString.stringify({
        ...params,
        search: undefined,
        page: undefined,
      })}`,
    );
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openDeleteModal = (user: SubAccountItem) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleStatusChange = (id: string, isActive: boolean) => {
    updateSubAccountStatus.mutate(
      { id, isActive },
      {
        onSuccess: () => {
          toast.success("Status sub account berhasil diperbarui.", {
            position: "top-right",
            theme: "colored",
          });
          refetch();
        },
        onError: () => {
          toast.error("Gagal memperbarui status sub account!", {
            position: "top-right",
            theme: "colored",
          });
        },
      },
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      phone: form.phone?.trim(),
      password: form.password,
    };

    if (payload.name === "") {
      toast.error("Nama user wajib diisi!", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    if (payload.username.length < 3) {
      toast.error("Username minimal 3 karakter!", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    if (payload.password.length < 6) {
      toast.error("Password minimal 6 karakter!", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    if (payload.password !== form.confirmPassword) {
      toast.error("Konfirmasi password tidak sama!", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    createSubAccount.mutate(payload, {
      onSuccess: () => {
        toast.success("Sub account berhasil dibuat.", {
          position: "top-right",
          theme: "colored",
        });
        setModalOpen(false);
        setForm(emptyForm);
        refetch();
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Gagal membuat sub account!";
        toast.error(message, {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  const onDelete = () => {
    if (!selectedUser) return;

    deleteSubAccount.mutate(selectedUser.id, {
      onSuccess: () => {
        toast.success("Sub account berhasil dihapus.", {
          position: "top-right",
          theme: "colored",
        });
        setDeleteModalOpen(false);
        setSelectedUser(null);
        refetch();
      },
      onError: () => {
        toast.error("Gagal menghapus sub account!", {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-bold text-2xl capitalize">User Sub Account</h2>
        <Button className="gap-2 md:w-auto" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Tambah User
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
            placeholder="Cari nama, username, atau telepon"
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
                <TableHead className="table-cell">User</TableHead>
                <TableHead className="hidden md:table-cell">Telepon</TableHead>
                <TableHead className="hidden lg:table-cell text-center">
                  Dibuat
                </TableHead>
                <TableHead className="table-cell text-center">Status</TableHead>
                <TableHead className="table-cell text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {subAccounts &&
                subAccounts.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                  >
                    <TableCell className="table-cell text-center align-top w-10">
                      {index + 1 + (currentPage - 1) * limit}
                    </TableCell>
                    <TableCell className="table-cell align-top text-black dark:text-white">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-gray-400">
                        @{user.username}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell align-top">
                      {user.phone || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell align-top text-center">
                      {format(new Date(user.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="table-cell align-top text-center">
                      <Switch
                        checked={user.isActive}
                        disabled={updateSubAccountStatus.isPending}
                        className="data-[state=checked]:bg-blue-600"
                        onCheckedChange={(value) =>
                          handleStatusChange(user.id, value)
                        }
                      />
                    </TableCell>
                    <TableCell className="table-cell align-top">
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600"
                          onClick={() => openDeleteModal(user)}
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

        {!isPending && subAccounts?.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            Data sub account tidak ditemukan.
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading sub account"
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
              <DialogTitle>Tambah User Sub Account</DialogTitle>
            </DialogHeader>
            <div className="my-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="sub-account-name">Nama User</Label>
                <Input
                  id="sub-account-name"
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
                <Label htmlFor="sub-account-username">Username</Label>
                <Input
                  id="sub-account-username"
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-account-phone">Telepon</Label>
                <Input
                  id="sub-account-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-account-password">Password</Label>
                <Input
                  id="sub-account-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-account-confirm-password">
                  Konfirmasi Password
                </Label>
                <Input
                  id="sub-account-confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
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
              <Button type="submit" disabled={createSubAccount.isPending}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Sub Account</DialogTitle>
          </DialogHeader>
          <div className="my-6 text-sm">
            Hapus sub account <strong>{selectedUser?.name}</strong>?
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
              disabled={deleteSubAccount.isPending}
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

export default SubAccountsPage;
