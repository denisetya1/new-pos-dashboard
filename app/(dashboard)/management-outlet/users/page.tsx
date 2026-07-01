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
  OutletUserPayload,
  useCreateOutletUser,
  useDeleteOutletUser,
  useGetOutletUsers,
  useGetRoles,
  useUpdateOutletUser,
  useUpdateOutletUserStatus,
} from "@/hooks/useOutletUsers";
import { useGetSubAccounts } from "@/hooks/useSubAccounts";
import { Edit3, Plus, Store, Trash2 } from "lucide-react";
import queryString from "query-string";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type OutletItem = {
  id: string;
  name: string;
};

type RoleItem = {
  id: string;
  name: string;
};

type SubAccountItem = {
  id: string;
  name: string;
  username: string;
  isActive: boolean;
};

type OutletUserItem = {
  id: string;
  userId: string;
  outletId: string;
  roleId: string;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    username: string;
    phone: string | null;
  };
  role: {
    id: string;
    name: string;
  };
};

const emptyForm: OutletUserPayload = {
  outletId: "",
  userId: "",
  roleId: "",
};

const OutletUsersPage = () => {
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOutletUser, setSelectedOutletUser] =
    useState<OutletUserItem | null>(null);
  const [form, setForm] = useState<OutletUserPayload>(emptyForm);

  const { data: outletsData, isPending: isOutletPending } = useGetOutlets();
  const { data: rolesData } = useGetRoles();
  const { data: subAccountsData } = useGetSubAccounts(
    queryString.stringify({ limit: 1000 }),
  );
  const createOutletUser = useCreateOutletUser();
  const updateOutletUser = useUpdateOutletUser();
  const updateOutletUserStatus = useUpdateOutletUserStatus();
  const deleteOutletUser = useDeleteOutletUser();

  const outlets: OutletItem[] = outletsData?.data || [];
  const roles: RoleItem[] = rolesData?.data || [];
  const subAccounts: SubAccountItem[] =
    subAccountsData?.data?.contents?.filter(
      (user: SubAccountItem) => user.isActive,
    ) || [];
  const currentOutletId = selectedOutletId || outlets[0]?.id?.toString() || "";
  const isSaving = createOutletUser.isPending || updateOutletUser.isPending;

  const qs = useMemo(
    () =>
      queryString.stringify({
        outletId: currentOutletId || undefined,
      }),
    [currentOutletId],
  );

  const {
    data: outletUsersData,
    isError,
    isPending,
    refetch,
  } = useGetOutletUsers(qs, currentOutletId !== "");

  const outletUsers: OutletUserItem[] = outletUsersData?.data?.contents || [];

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil pengguna outlet!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const openCreateModal = () => {
    setSelectedOutletUser(null);
    setForm({
      ...emptyForm,
      outletId: currentOutletId,
    });
    setModalOpen(true);
  };

  const openEditModal = (outletUser: OutletUserItem) => {
    setSelectedOutletUser(outletUser);
    setForm({
      id: outletUser.id,
      outletId: outletUser.outletId,
      userId: outletUser.userId,
      roleId: outletUser.roleId,
    });
    setModalOpen(true);
  };

  const openDeleteModal = (outletUser: OutletUserItem) => {
    setSelectedOutletUser(outletUser);
    setDeleteModalOpen(true);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...form,
      outletId: currentOutletId,
    };

    if (payload.userId === "" || payload.roleId === "") {
      toast.error("User dan role wajib dipilih!", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    const mutation = selectedOutletUser ? updateOutletUser : createOutletUser;
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Pengguna outlet berhasil disimpan.", {
          position: "top-right",
          theme: "colored",
        });
        setModalOpen(false);
        refetch();
      },
      onError: () => {
        toast.error("Gagal menyimpan pengguna outlet!", {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  const handleStatusChange = (id: string, isActive: boolean) => {
    updateOutletUserStatus.mutate(
      { id, isActive },
      {
        onSuccess: () => {
          toast.success("Status pengguna outlet berhasil diperbarui.", {
            position: "top-right",
            theme: "colored",
          });
          refetch();
        },
        onError: () => {
          toast.error("Gagal memperbarui status pengguna outlet!", {
            position: "top-right",
            theme: "colored",
          });
        },
      },
    );
  };

  const onDelete = () => {
    if (!selectedOutletUser) return;

    deleteOutletUser.mutate(selectedOutletUser.id, {
      onSuccess: () => {
        toast.success("Pengguna outlet berhasil dihapus.", {
          position: "top-right",
          theme: "colored",
        });
        setDeleteModalOpen(false);
        setSelectedOutletUser(null);
        refetch();
      },
      onError: () => {
        toast.error("Gagal menghapus pengguna outlet!", {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-bold text-2xl capitalize">
          Daftar Pengguna Outlet
        </h2>
        <Button
          className="gap-2 md:w-auto"
          disabled={!currentOutletId}
          onClick={openCreateModal}
        >
          <Plus className="h-4 w-4" />
          Tambah Pengguna
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
                <TableHead className="table-cell">User</TableHead>
                <TableHead className="hidden md:table-cell">Telepon</TableHead>
                <TableHead className="table-cell">Role</TableHead>
                <TableHead className="table-cell text-center">Aktif</TableHead>
                <TableHead className="table-cell text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {outletUsers.map((outletUser, index) => (
                <TableRow
                  key={outletUser.id}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <TableCell className="table-cell text-center align-top w-10">
                    {index + 1}
                  </TableCell>
                  <TableCell className="table-cell align-top text-black dark:text-white">
                    <div className="font-semibold">{outletUser.user.name}</div>
                    <div className="text-xs text-gray-400">
                      @{outletUser.user.username}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell align-top">
                    {outletUser.user.phone || "-"}
                  </TableCell>
                  <TableCell className="table-cell align-top">
                    {outletUser.role.name}
                  </TableCell>
                  <TableCell className="table-cell align-top text-center">
                    <Switch
                      checked={outletUser.isActive}
                      disabled={updateOutletUserStatus.isPending}
                      className="data-[state=checked]:bg-blue-600"
                      onCheckedChange={(value) =>
                        handleStatusChange(outletUser.id, value)
                      }
                    />
                  </TableCell>
                  <TableCell className="table-cell align-top">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditModal(outletUser)}
                      >
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600"
                        onClick={() => openDeleteModal(outletUser)}
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

        {!isPending && !isOutletPending && outletUsers.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-6 text-center text-sm text-gray-500">
            <Store className="h-8 w-8 text-gray-300" />
            Data pengguna outlet tidak ditemukan.
          </div>
        )}

        {(isPending || isOutletPending) && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading pengguna outlet"
              description="Mohon tunggu sementara kami mengambil data Anda."
            />
          </div>
        )}
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedOutletUser
                  ? "Edit Pengguna Outlet"
                  : "Tambah Pengguna Outlet"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-2">
                <Label>User Sub Account</Label>
                <Select
                  value={form.userId}
                  disabled={selectedOutletUser !== null}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, userId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih user" />
                  </SelectTrigger>
                  <SelectContent>
                    {subAccounts.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} (@{user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.roleId}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, roleId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <DialogTitle>Hapus Pengguna Outlet</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 text-sm">
            Hapus akses outlet untuk{" "}
            <strong>{selectedOutletUser?.user.name}</strong>?
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
              disabled={deleteOutletUser.isPending}
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

export default OutletUsersPage;
