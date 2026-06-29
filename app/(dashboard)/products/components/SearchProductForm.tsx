"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import queryString from "query-string";
import { Brand, Category, Outlet } from "@/generated/prisma/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useGetBrands } from "@/hooks/useBrands";
import { useGetCategories } from "@/hooks/useCategories";

const SearchProductForm = ({
  selectedCategory,
  selectedBrand,
  searchProduct,
  outletId,
  pageURL,
}: {
  selectedCategory: string | undefined;
  selectedBrand: string | undefined;
  outletId?: string | undefined;
  searchProduct: string | undefined;
  pageURL?: string | undefined;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [categoryId, setCategoryId] = useState(selectedCategory);
  const [brandId, setBrandId] = useState(selectedBrand);
  const [search, setSearch] = useState(searchProduct || "");

  const { data: brands } = useGetBrands();
  const { data: categories } = useGetCategories();

  const handleSearch = () => {
    const qs = queryString.stringify(
      {
        brandId,
        categoryId,
        outletId,
        search,
      },
      {
        skipEmptyString: true,
        skipNull: true,
      },
    );

    router.push(`${pathname}?${qs}`);
  };

  const handleReset = () => {
    setBrandId("");
    setCategoryId("");
    setSearch("");
    router.push(`${pathname}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-center md:items-center gap-5 mb-8">
      <div>
        <div className="mb-2 block">
          <Label
            className="text-slate-600"
            htmlFor="product-name"
            title="Ketegori"
          >
            Kategori
          </Label>
        </div>
        <Select
          onValueChange={(value) => setCategoryId(value)}
          value={categoryId}
          name="categoryId"
        >
          <SelectTrigger
            value={categoryId}
            className="w-full max-w-48 bg-white"
            onReset={() => setCategoryId("")}
          >
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Kategori</SelectLabel>
              {categories?.data &&
                categories?.data.map((category: Category) => (
                  <SelectItem
                    key={category.id.toString()}
                    value={category.id.toString()}
                  >
                    {category.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="mb-2 block">
          <Label
            className="text-slate-600"
            htmlFor="product-name"
            title="Brand"
          >
            Brand
          </Label>
        </div>
        <Select
          onValueChange={(value) => setBrandId(value)}
          value={brandId}
          name="brandId"
        >
          <SelectTrigger
            value={brandId}
            onReset={() => setBrandId("")}
            className="w-full max-w-48 bg-white"
          >
            <SelectValue placeholder="Pilih Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Brand</SelectLabel>
              {brands?.data &&
                brands?.data?.map((brand: Brand) => (
                  <SelectItem
                    key={brand.id.toString()}
                    value={brand.id.toString()}
                  >
                    {brand.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grow">
        <div className="mb-2 block">
          <Label
            className="text-slate-600"
            htmlFor="product-name"
            title="Cari Produk"
          >
            Cari Nama Produk
          </Label>
        </div>
        <Input
          id="product-name"
          className="w-full bg-white"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Cari berdasarkan nama produk/barcode/sku"
        />
      </div>
      <div className="flex gap-1 mt-4">
        <div>
          <Button onClick={handleSearch}>
            <Search /> Cari
          </Button>
        </div>
        <div>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchProductForm;
