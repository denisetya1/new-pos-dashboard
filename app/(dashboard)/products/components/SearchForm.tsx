"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [categoryId, setCategoryId] = useState(selectedCategory);
  const [brandId, setBrandId] = useState(selectedBrand);
  const [search, setSearch] = useState(searchProduct || "");
  const [outletId, setOutletId] = useState(selectedOutlet);

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/brand").then((res) => res.json());
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["brands"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/categories").then((res) =>
        res.json(),
      );
    },
  });

  const { data: outlets } = useQuery({
    queryKey: ["brands"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/outlets").then((res) => res.json());
    },
  });

  useEffect(() => {
    const query = {
      categoryId,
      brandId,
      outletId,
      search,
    };

    const qs = queryString.stringify(query, {
      skipEmptyString: true,
      skipNull: true,
    });

    // router.push(`${pageURL}?${qs}`);
  }, [categoryId, brandId, search, outletId, pageURL, router]);

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
          >
            <SelectTrigger className="w-full max-w-48 bg-white">
              <SelectValue placeholder="Pilih Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Kategori</SelectLabel>
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
        >
          <SelectTrigger className="w-full max-w-48 bg-white">
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
        <Select onValueChange={(value) => setBrandId(value)} value={brandId}>
          <SelectTrigger className="w-full max-w-48 bg-white">
            <SelectValue placeholder="Pilih Kategori" />
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
          type="text"
          placeholder="Cari berdasarkan nama produk/barcode/sku"
        />
      </div>
      <div className="flex gap-1 mt-4">
        <div>
          <Button>
            <Search /> Cari
          </Button>
        </div>
        <div>
          <Button variant="outline">Reset</Button>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
