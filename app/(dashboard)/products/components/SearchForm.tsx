"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import queryString from "query-string";
import { useQuery } from "@tanstack/react-query";
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
import { useGetOutlets } from "@/hooks/useOutlets";

const SearchForm = ({
  selectedCategory,
  selectedBrand,
  searchProduct,
  selectedOutlet,
  pageURL,
}: {
  selectedCategory: string | undefined;
  selectedBrand: string | undefined;
  selectedOutlet?: string | undefined;
  searchProduct: string | undefined;
  pageURL?: string | undefined;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [categoryId, setCategoryId] = useState(selectedCategory);
  const [brandId, setBrandId] = useState(selectedBrand);
  const [search, setSearch] = useState(searchProduct || "");
  const [outletId, setOutletId] = useState(selectedOutlet);

  const { data: brands } = useGetBrands();
  const { data: categories } = useGetCategories();
  const { data: outlets } = useGetOutlets();

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
    setOutletId("");
    setSearch("");
    router.push(`${pathname}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="sm:flex flex-row justify-start gap-5 items-center mb-8">
      {outlets && outlets?.length > 0 ? (
        <div>
          <div className="mb-2 block">
            <Label
              className="text-slate-600"
              htmlFor="product-name"
              title="Outlet"
            >
              Outlet
            </Label>
          </div>
          <Select
            onValueChange={(value) => setOutletId(value)}
            value={outletId}
            name="outletId"
          >
            <SelectTrigger
              value={outletId}
              className="w-full max-w-48 bg-white"
              onReset={() => setOutletId("")}
            >
              <SelectValue placeholder="Pilih Outlet" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Outlet</SelectLabel>
                {outlets &&
                  outlets.map((outlet: Outlet) => (
                    <SelectItem
                      key={outlet.id.toString()}
                      value={outlet.id.toString()}
                    >
                      {outlet.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <></>
      )}

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
              <SelectLabel>Kategori</SelectLabel>
              {categories &&
                categories.map((category: Category) => (
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
              <SelectLabel>Brand</SelectLabel>
              {brands &&
                brands.map((brand: Brand) => (
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

export default SearchForm;
