"use client";

import LoadingContent from "@/app/(dashboard)/components/LoadingContent";
import TablePagination from "@/app/(dashboard)/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  MemberPayload,
  useAdjustMemberPoints,
  useCreateMember,
  useDeleteMember,
  useGetMemberPoints,
  useGetMembers,
  useUpdateMember,
} from "@/hooks/useMembers";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Coins,
  Edit3,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type MemberItem = {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  address: string | null;
  points: number;
  createdAt: string;
};

type PointTransaction = {
  id: string;
  type: "ADD" | "DEDUCT";
  points: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
  updatedBy: string | null;
  outlet: {
    id: string;
    name: string;
  } | null;
};

const emptyMemberForm: MemberPayload = {
  name: "",
  phone: "",
  email: "",
  birthDate: "",
  address: "",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
};

const MembersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const params = Object.fromEntries(searchParams.entries());
  const limit = 50;
  const currentPage = Number(params.page) || 1;
  const [search, setSearch] = useState(params.search || "");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [memberForm, setMemberForm] =
    useState<MemberPayload>(emptyMemberForm);
  const [pointType, setPointType] = useState<"ADD" | "DEDUCT">("ADD");
  const [pointAmount, setPointAmount] = useState("");
  const [pointReason, setPointReason] = useState("");

  const qs = queryString.stringify({ ...params, limit });
  const {
    data: membersData,
    isError,
    isPending,
    refetch,
  } = useGetMembers(qs);
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const adjustPoints = useAdjustMemberPoints();
  const {
    data: pointsData,
    isError: isPointsError,
    isPending: isPointsPending,
    refetch: refetchPoints,
  } = useGetMemberPoints(selectedMember?.id || "", pointsModalOpen);

  const members: MemberItem[] = membersData?.data?.contents || [];
  const totalRow = Number(membersData?.data?.totalRow || 0);
  const totalPages = Math.ceil(totalRow / limit);
  const pointTransactions: PointTransaction[] =
    pointsData?.data?.contents || [];
  const currentPointBalance = Number(
    pointsData?.data?.member?.points ?? selectedMember?.points ?? 0,
  );
  const isSaving = createMember.isPending || updateMember.isPending;

  useEffect(() => {
    if (isError) {
      toast.error("Data member gagal dimuat.", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(
      `/members?${queryString.stringify({
        ...params,
        search: search || undefined,
        page: undefined,
      })}`,
    );
  };

  const clearSearch = () => {
    setSearch("");
    router.push(
      `/members?${queryString.stringify({
        ...params,
        search: undefined,
        page: undefined,
      })}`,
    );
  };

  const openCreateModal = () => {
    setSelectedMember(null);
    setMemberForm(emptyMemberForm);
    setMemberModalOpen(true);
  };

  const openEditModal = (member: MemberItem) => {
    setSelectedMember(member);
    setMemberForm({
      id: member.id,
      name: member.name,
      phone: member.phone,
      email: member.email || "",
      birthDate: member.birthDate
        ? format(new Date(member.birthDate), "yyyy-MM-dd")
        : "",
      address: member.address || "",
    });
    setMemberModalOpen(true);
  };

  const openPointsModal = (member: MemberItem) => {
    setSelectedMember(member);
    setPointType("ADD");
    setPointAmount("");
    setPointReason("");
    setPointsModalOpen(true);
  };

  const onSubmitMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...memberForm,
      name: memberForm.name.trim(),
      phone: memberForm.phone.trim(),
      email: memberForm.email?.trim(),
      address: memberForm.address?.trim(),
    };

    if (!payload.name || !payload.phone) {
      toast.error("Nama dan nomor telepon wajib diisi.", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    const mutation = selectedMember ? updateMember : createMember;
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(
          selectedMember
            ? "Data member berhasil diperbarui."
            : "Member berhasil ditambahkan.",
          { position: "top-right", theme: "colored" },
        );
        setMemberModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["members"] });
        refetch();
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Data member gagal disimpan."), {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  const onDeleteMember = () => {
    if (!selectedMember) return;

    deleteMember.mutate(selectedMember.id, {
      onSuccess: () => {
        toast.success("Member berhasil dinonaktifkan.", {
          position: "top-right",
          theme: "colored",
        });
        setDeleteModalOpen(false);
        setSelectedMember(null);
        queryClient.invalidateQueries({ queryKey: ["members"] });
        refetch();
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Member gagal dinonaktifkan."), {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  const onAdjustPoints = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedMember) return;

    const amount = Number(pointAmount);

    if (!Number.isInteger(amount) || amount <= 0) {
      toast.error("Jumlah poin harus berupa angka bulat lebih dari 0.", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    if (pointReason.trim().length < 3) {
      toast.error("Alasan penyesuaian poin wajib diisi.", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    adjustPoints.mutate(
      {
        memberId: selectedMember.id,
        type: pointType,
        amount,
        reason: pointReason.trim(),
      },
      {
        onSuccess: () => {
          toast.success(
            pointType === "ADD"
              ? "Poin member berhasil ditambahkan."
              : "Poin member berhasil dikurangi.",
            { position: "top-right", theme: "colored" },
          );
          setPointAmount("");
          setPointReason("");
          queryClient.invalidateQueries({ queryKey: ["members"] });
          queryClient.invalidateQueries({
            queryKey: ["member-points", selectedMember.id],
          });
          refetch();
          refetchPoints();
        },
        onError: (error) => {
          toast.error(
            getErrorMessage(error, "Penyesuaian poin gagal disimpan."),
            { position: "top-right", theme: "colored" },
          );
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Member</h2>
          <p className="mt-2 text-sm text-gray-500">
            Kelola data member dan saldo loyalti poin per toko.
          </p>
        </div>
        <Button className="min-h-11 gap-2 md:w-auto" onClick={openCreateModal}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Member
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
            placeholder="Cari nama, kode, telepon, atau email"
            aria-label="Cari member"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="min-h-11 gap-2">
            <Search className="h-4 w-4" aria-hidden="true" />
            Cari
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11"
            onClick={clearSearch}
            disabled={!params.search}
          >
            <X className="h-4 w-4" aria-hidden="true" />
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
          <Table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <TableHeader>
              <TableRow className="border-slate-200 bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <TableHead className="w-12 text-center">No.</TableHead>
                <TableHead>Member</TableHead>
                <TableHead className="hidden md:table-cell">Kontak</TableHead>
                <TableHead className="text-center">Poin</TableHead>
                <TableHead className="hidden lg:table-cell">Terdaftar</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {members.map((member, index) => (
                <TableRow
                  key={member.id}
                  className="border-b odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800"
                >
                  <TableCell className="w-12 text-center align-top">
                    {index + 1 + (currentPage - 1) * limit}
                  </TableCell>
                  <TableCell className="align-top text-black dark:text-white">
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-xs text-gray-400">
                      {member.memberCode}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 md:hidden">
                      {member.phone}
                    </div>
                  </TableCell>
                  <TableCell className="hidden align-top md:table-cell">
                    <div>{member.phone}</div>
                    <div className="text-xs text-gray-400">
                      {member.email || "Tidak ada email"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-top font-semibold text-amber-700 dark:text-amber-400">
                    {member.points.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="hidden align-top lg:table-cell">
                    {format(new Date(member.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 text-amber-700"
                        onClick={() => openPointsModal(member)}
                      >
                        <Coins className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">
                          Kelola poin {member.name}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11"
                        onClick={() => openEditModal(member)}
                      >
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Edit {member.name}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 text-red-600"
                        onClick={() => {
                          setSelectedMember(member);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">
                          Nonaktifkan {member.name}
                        </span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {isError && (
          <div className="p-6 text-center text-sm text-red-700" role="alert">
            Data member gagal dimuat. Muat ulang halaman untuk mencoba lagi.
          </div>
        )}

        {!isPending && !isError && members.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-8 text-center text-sm text-gray-500">
            <UserRound className="h-8 w-8 text-gray-300" aria-hidden="true" />
            {params.search
              ? "Tidak ada member yang cocok dengan pencarian ini."
              : "Belum ada member. Tambahkan member pertama untuk mulai mencatat poin."}
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading member"
              description="Sedang mengambil data member dan saldo poin."
            />
          </div>
        )}
      </Card>

      <div className="mb-10 mt-2">
        <TablePagination
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPages}
        />
      </div>

      <Dialog open={memberModalOpen} onOpenChange={setMemberModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <form onSubmit={onSubmitMember} className="flex min-h-0 flex-1 flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedMember ? "Edit Member" : "Tambah Member"}
              </DialogTitle>
              <DialogDescription>
                Nama dan nomor telepon wajib diisi. Kode member dibuat otomatis.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="space-y-2">
                <Label htmlFor="member-name">Nama</Label>
                <Input
                  id="member-name"
                  required
                  autoComplete="name"
                  value={memberForm.name}
                  onChange={(event) =>
                    setMemberForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-phone">Nomor Telepon</Label>
                <Input
                  id="member-phone"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={memberForm.phone}
                  onChange={(event) =>
                    setMemberForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  autoComplete="email"
                  value={memberForm.email}
                  onChange={(event) =>
                    setMemberForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-birth-date">Tanggal Lahir</Label>
                <Input
                  id="member-birth-date"
                  type="date"
                  max={format(new Date(), "yyyy-MM-dd")}
                  value={memberForm.birthDate}
                  onChange={(event) =>
                    setMemberForm((current) => ({
                      ...current,
                      birthDate: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-address">Alamat</Label>
                <Textarea
                  id="member-address"
                  value={memberForm.address}
                  onChange={(event) =>
                    setMemberForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMemberModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={pointsModalOpen} onOpenChange={setPointsModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Kelola Loyalti Poin</DialogTitle>
            <DialogDescription>
              {selectedMember?.name} · {selectedMember?.memberCode}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70dvh] space-y-6 overflow-y-auto p-6">
            <div>
              <div className="text-sm text-gray-500">Saldo saat ini</div>
              <div className="mt-1 text-3xl font-bold text-amber-700 dark:text-amber-400">
                {currentPointBalance.toLocaleString("id-ID")} poin
              </div>
            </div>

            <form className="space-y-4" onSubmit={onAdjustPoints}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Jenis Penyesuaian</Label>
                  <Select
                    value={pointType}
                    onValueChange={(value: "ADD" | "DEDUCT") =>
                      setPointType(value)
                    }
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADD">Tambah poin</SelectItem>
                      <SelectItem value="DEDUCT">Kurangi poin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="point-amount">Jumlah Poin</Label>
                  <Input
                    id="point-amount"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    required
                    value={pointAmount}
                    onChange={(event) => setPointAmount(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="point-reason">Alasan</Label>
                <Textarea
                  id="point-reason"
                  required
                  maxLength={255}
                  placeholder="Contoh: bonus pendaftaran atau penukaran hadiah"
                  value={pointReason}
                  onChange={(event) => setPointReason(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={adjustPoints.isPending}>
                {adjustPoints.isPending
                  ? "Menyimpan..."
                  : pointType === "ADD"
                    ? "Tambahkan Poin"
                    : "Kurangi Poin"}
              </Button>
            </form>

            <div>
              <h3 className="mb-3 font-semibold">Riwayat Poin</h3>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Alasan</TableHead>
                      <TableHead className="text-right">Perubahan</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap align-top">
                          {format(
                            new Date(transaction.createdAt),
                            "dd MMM yyyy HH:mm",
                          )}
                        </TableCell>
                        <TableCell className="min-w-52 align-top">
                          <div>{transaction.reason}</div>
                          <div className="text-xs text-gray-400">
                            {transaction.outlet?.name || "Toko"}
                            {transaction.updatedBy
                              ? ` · ${transaction.updatedBy}`
                              : ""}
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-right align-top font-semibold ${
                            transaction.points >= 0
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {transaction.points >= 0 ? "+" : ""}
                          {transaction.points.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right align-top">
                          {transaction.balanceAfter.toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {isPointsError && (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  Riwayat poin gagal dimuat. Tutup lalu buka kembali untuk
                  mencoba lagi.
                </p>
              )}
              {!isPointsPending &&
                !isPointsError &&
                pointTransactions.length === 0 && (
                  <p className="mt-3 text-sm text-gray-500">
                    Belum ada riwayat poin untuk member ini.
                  </p>
                )}
              {isPointsPending && (
                <p className="mt-3 text-sm text-gray-500" role="status">
                  Memuat riwayat poin...
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPointsModalOpen(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nonaktifkan Member</DialogTitle>
            <DialogDescription>
              Riwayat poin tetap tersimpan untuk kebutuhan audit.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 text-sm">
            Nonaktifkan member <strong>{selectedMember?.name}</strong>?
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
              disabled={deleteMember.isPending}
              onClick={onDeleteMember}
            >
              {deleteMember.isPending ? "Memproses..." : "Nonaktifkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembersPage;
