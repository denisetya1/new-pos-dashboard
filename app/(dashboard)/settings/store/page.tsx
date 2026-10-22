"use client";

import LoadingContent from "@/app/(dashboard)/components/LoadingContent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  StoreConfigPayload,
  useGetStoreConfig,
  useUpdateStoreConfig,
} from "@/hooks/useStoreConfig";
import { useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";

const initialForm: StoreConfigPayload = {
  name: "",
  pointRewardEnabled: false,
  pointEarningThreshold: 10000,
  pointRedemptionValue: 100,
};

const StoreConfigPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<StoreConfigPayload>(initialForm);
  const { data, isError, isPending, refetch } = useGetStoreConfig();
  const updateStoreConfig = useUpdateStoreConfig();
  const storeConfig = data?.data as StoreConfigPayload | undefined;

  useEffect(() => {
    if (storeConfig) {
      setForm({
        name: storeConfig.name,
        pointRewardEnabled: storeConfig.pointRewardEnabled,
        pointEarningThreshold: storeConfig.pointEarningThreshold,
        pointRedemptionValue: storeConfig.pointRedemptionValue,
      });
    }
  }, [storeConfig]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...form,
      name: form.name.trim(),
    };

    if (payload.name.length < 2) {
      toast.error("Nama toko minimal 2 karakter.", { theme: "colored" });
      return;
    }

    if (
      !Number.isSafeInteger(payload.pointEarningThreshold) ||
      payload.pointEarningThreshold < 1
    ) {
      toast.error("Nominal perolehan poin wajib diisi.", {
        theme: "colored",
      });
      return;
    }

    if (
      !Number.isSafeInteger(payload.pointRedemptionValue) ||
      payload.pointRedemptionValue < 1
    ) {
      toast.error("Nilai konversi poin wajib diisi.", {
        theme: "colored",
      });
      return;
    }

    updateStoreConfig.mutate(payload, {
      onSuccess: (response) => {
        queryClient.setQueryData(["store-config"], response);
        toast.success("Konfigurasi toko berhasil disimpan.", {
          theme: "colored",
        });
      },
      onError: (error: unknown) => {
        const message =
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Konfigurasi toko gagal disimpan.";
        toast.error(message, { theme: "colored" });
      },
    });
  };

  if (isPending) {
    return (
      <LoadingContent
        title="Memuat konfigurasi toko"
        description="Nama toko dan aturan point reward sedang disiapkan."
      />
    );
  }

  if (isError) {
    return (
      <Card className="max-w-3xl shadow-none">
        <CardHeader>
          <CardTitle>Konfigurasi toko gagal dimuat</CardTitle>
          <CardDescription>
            Periksa koneksi lalu muat ulang data konfigurasi.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="min-h-11" onClick={() => refetch()}>
            Muat Ulang
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Konfigurasi Toko</h2>
        <p className="mt-1 text-sm text-gray-600">
          Atur identitas toko dan cara member memperoleh poin dari transaksi.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Identitas Toko</CardTitle>
            <CardDescription>
              Nama ini digunakan sebagai identitas utama toko di dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="store-name">Nama Toko</Label>
              <Input
                id="store-name"
                className="min-h-11"
                value={form.name}
                maxLength={191}
                autoComplete="organization"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Point Reward</CardTitle>
            <CardDescription>
              Poin dihitung dari nilai akhir transaksi dan hanya diberikan jika
              transaksi menggunakan member.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex min-h-14 items-center justify-between gap-4 rounded-lg border p-4">
              <div className="min-w-0 space-y-1">
                <Label htmlFor="point-reward-enabled">
                  Aktifkan Point Reward
                </Label>
                <p className="text-sm text-gray-600">
                  {form.pointRewardEnabled
                    ? "Transaksi member akan memperoleh poin otomatis."
                    : "Transaksi baru tidak akan menambah poin member."}
                </p>
              </div>
              <Switch
                id="point-reward-enabled"
                aria-label="Aktifkan point reward"
                className="min-h-6 min-w-11"
                checked={form.pointRewardEnabled}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    pointRewardEnabled: checked,
                  }))
                }
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="point-earning-threshold">
                  Nominal Belanja untuk 1 Poin
                </Label>
                <NumericFormat
                  id="point-earning-threshold"
                  value={form.pointEarningThreshold}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                  allowNegative={false}
                  decimalScale={0}
                  inputMode="numeric"
                  customInput={Input}
                  className="min-h-11"
                  disabled={!form.pointRewardEnabled}
                  onValueChange={(values) =>
                    setForm((current) => ({
                      ...current,
                      pointEarningThreshold: Number(values.value || 0),
                    }))
                  }
                />
                <p className="text-sm text-gray-600">
                  Setiap Rp
                  {form.pointEarningThreshold.toLocaleString("id-ID")} nilai
                  transaksi menghasilkan 1 poin. Sisa nominal tidak dibulatkan
                  ke atas.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="point-redemption-value">
                  Nilai Rupiah untuk 1 Poin
                </Label>
                <NumericFormat
                  id="point-redemption-value"
                  value={form.pointRedemptionValue}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                  allowNegative={false}
                  decimalScale={0}
                  inputMode="numeric"
                  customInput={Input}
                  className="min-h-11"
                  disabled={!form.pointRewardEnabled}
                  onValueChange={(values) =>
                    setForm((current) => ({
                      ...current,
                      pointRedemptionValue: Number(values.value || 0),
                    }))
                  }
                />
                <p className="text-sm text-gray-600">
                  Saat ditukarkan, 1 poin setara Rp
                  {form.pointRedemptionValue.toLocaleString("id-ID")}.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t">
            <Button
              type="submit"
              className="min-h-11 w-full sm:w-auto"
              disabled={updateStoreConfig.isPending}
            >
              {updateStoreConfig.isPending
                ? "Menyimpan..."
                : "Simpan Konfigurasi"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default StoreConfigPage;
