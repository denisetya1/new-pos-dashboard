"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { ChevronDown, ChevronUp } from "lucide-react";

const SortableHeader = ({
  title,
  fieldName,
}: {
  title: string;
  fieldName: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const sorted = searchParams.get("sort");
  let direction = searchParams.get("direction");

  const onButtonClicked = () => {
    if (direction === "asc") direction = "desc";
    else direction = "asc";

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", fieldName);
    params.set("direction", direction);

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <button
      className="h-full w-full outline-none flex justify-between gap-3 text-xs hover:bg-gray-200"
      onClick={onButtonClicked}
    >
      <span className={`${sorted === fieldName ? "font-semi-bold" : ""}`}>
        {title.toUpperCase()}
      </span>
      <span className="text-sm">
        {sorted === fieldName && direction === "asc" && <ChevronUp />}
        {sorted === fieldName && direction === "desc" && <ChevronDown />}
      </span>
    </button>
  );
};

export default SortableHeader;
