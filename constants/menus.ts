import { NavItem } from "@/app/(dashboard)/components/Navigation";
import {
  Database,
  Home,
  ScrollText,
  ScanBarcode,
  Store,
  Users,
} from "lucide-react";

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
      // { label: "Barang Terjual", href: "/reports/products/sold" },
      { label: "Produk Terlaris", href: "/reports/products/top-sellers" },
      { label: "Barang Akan Expired", href: "/reports/products/expired" },
      { label: "Stok Barang Menipis", href: "/reports/stocks/low-stock" },
      // { label: "Perpindahan Stok", href: "/reports/stocks/movement" },
    ],
  },
  {
    label: "Master Data",
    icon: Database,
    children: [
      { label: "Brand", href: "/master-data/brands" },
      { label: "Kategori", href: "/master-data/categories" },
      { label: "Jenis Perpindahan Stok", href: "/master-data/move-types" },
    ],
  },
  {
    label: "Manajemen Outlet",
    icon: Store,
    children: [
      { label: "Daftar Outlet", href: "/management-outlet/outlets" },
      {
        label: "Metode Pembayaran",
        href: "/management-outlet/payment-methods",
      },
      { label: "Daftar Shift Kasir", href: "/management-outlet/shifts" },
      { label: "Daftar Pengguna Outlet", href: "/management-outlet/users" },
    ],
  },
  {
    label: "Manajemen Pengguna",
    icon: Users,
    children: [
      { label: "Daftar Pengguna", href: "/user-management/users" },
      { label: "Daftar Role", href: "/user-management/roles" },
    ],
  },
  // {
  //   label: "Settings",
  //   icon: ScrollText,
  //   children: [
  //     { label: "General", href: "/settings" },
  //     { label: "Security", href: "/settings/security" },
  //   ],
  // },
];
