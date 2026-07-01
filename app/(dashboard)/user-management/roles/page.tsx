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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateRole, useGetRoleManagement } from "@/hooks/useRoles";
import { Plus, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type RoleItem = {
  id: string;
  name: string;
  storeId: string | null;
  editable: boolean;
};

const RolesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const limit = 50;
  const currentPage = Number(params.page) || 1;
  const [search, setSearch] = useState(params.search || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const qs = queryString.stringify({
    ...params,
    limit,
  });

  const { data: rolesData, isError, isPending, refetch } = useGetRoleManagement(qs);
  const createRole = useCreateRole();
  const { contents: roles, totalRow }: { contents: RoleItem[]; totalRow: number } =
    rolesData?.data || {};
  const totalPages = Math.ceil((totalRow || 0) / limit);

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil data role!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    router.push(
      `/user-management/roles?${queryString.stringify({
        ...params,
        search: search || undefined,
        page: undefined,
      })}`,
    );
  };

  const clearSearch = () => {
    setSearch("");
    router.push(
      `/user-management/roles?${queryString.stringify({
        ...params,
        search: undefined,
        page: undefined,
      })}`,
    );
  };

  const openCreateModal = () => {
    setName("");
    setModalOpen(true);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: name.trim(),
    };

    if (payload.name === "") {
      toast.error("Nama role wajib diisi!", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    createRole.mutate(payload, {
      onSuccess: () => {
        toast.success("Role berhasil dibuat.", {
          position: "top-right",
          theme: "colored",
        });
        setModalOpen(false);
        setName("");
        refetch();
      },
      onError: () => {
        toast.error("Gagal membuat role!", {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-bold text-2xl capitalize">Daftar Role</h2>
        <Button className="gap-2 md:w-auto" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Tambah Role
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
            placeholder="Cari nama role"
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
                <TableHead className="table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell text-center">
                  Sumber
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {roles &&
                roles.map((role, index) => (
                <TableRow
                  key={role.id}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <TableCell className="table-cell text-center align-top w-10">
                    {index + 1 + (currentPage - 1) * limit}
                  </TableCell>
                  <TableCell className="table-cell align-top text-black dark:text-white">
                    {role.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell align-top text-center">
                    {role.editable ? "Custom" : "Bawaan"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {!isPending && roles?.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            Data role tidak ditemukan.
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading role"
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
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <DialogHeader>
              <DialogTitle>Tambah Role</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              <Label htmlFor="role-name">Nama Role</Label>
              <Input
                id="role-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createRole.isPending}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPage;
