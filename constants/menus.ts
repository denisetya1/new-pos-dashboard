import { NavItem } from "@/app/(dashboard)/components/Navigation";
import { Home, ScrollText, ScanBarcode } from "lucide-react";

export const menuConfig: NavItem[] = [
  {
    label: "Home",
    icon: Home,
    href: "/home",
  },
  {
    label: "Manjemen Produk",
    icon: ScanBarcode,
    children: [
      {
        label: "Pencarian Multi Outlet",
        href: "/products/search-multi-outlets",
      },
      { label: "Daftar Produk & Stok", href: "/products/stocks" },
      { label: "Diskon", href: "/products/discounts" },
      //   { label: "Cetak harga", href: "/products/print" },
    ],
  },
  {
    label: "Laporan",
    icon: ScrollText,
    children: [
      { label: "Penjualan Offline", href: "/reports/sales/offline" },
      { label: "Penjualan Online", href: "/reports/sales/online" },
      { label: "Barang Terjual", href: "/reports/products/sold" },
      { label: "Perpindahan Stok", href: "/reports/stocks/movement" },
    ],
  },
  {
    label: "Settings",
    icon: ScrollText,
    children: [
      { label: "General", href: "/settings" },
      { label: "Security", href: "/settings/security" },
    ],
  },
];
