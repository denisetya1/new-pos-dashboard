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

const SearchDiscountForm = ({
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
  const [search, setSearch] = useState(searchProduct || "");

  const handleSearch = () => {
    const qs = queryString.stringify(
      {
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
      <div>
        <div className="mb-2 block">
          <Label
            className="text-slate-600"
            htmlFor="product-name"
            title="Cari Produk"
          >
            Cari Diskon
          </Label>
        </div>
        <Input
          id="product-name"
          className="w-100 bg-white"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Cari berdasarkan nama diskon atau kode diskon"
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

export default SearchDiscountForm;
