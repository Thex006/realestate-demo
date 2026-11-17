"use client";

import { useRouter } from "next/navigation";
import type { ListingFilters } from "@/lib/types";
import { filtersToSearch } from "@/lib/listing-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SortSelect({ value }: { value: ListingFilters }) {
  const router = useRouter();
  return (
    <Select
      value={value.sort ?? "newest"}
      onValueChange={(v) => router.replace(`/rentals${filtersToSearch({ ...value, sort: v as ListingFilters["sort"] })}`, { scroll: false })}
    >
      <SelectTrigger className="h-9 w-44 rounded-full" aria-label="Sort"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest first</SelectItem>
        <SelectItem value="price-asc">Rent: low to high</SelectItem>
        <SelectItem value="price-desc">Rent: high to low</SelectItem>
        <SelectItem value="size-desc">Largest first</SelectItem>
      </SelectContent>
    </Select>
  );
}
