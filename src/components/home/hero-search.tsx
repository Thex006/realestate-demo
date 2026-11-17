"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { filtersToSearch } from "@/lib/listing-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ANY = "any";

export function HeroSearch({ districts }: { districts: string[] }) {
  const router = useRouter();
  const [district, setDistrict] = useState(ANY);
  const [budget, setBudget] = useState(ANY);
  return (
    <form
      role="search"
      aria-label="Search rentals"
      className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-black/45 p-2 backdrop-blur-xl sm:flex-row sm:rounded-full"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/rentals${filtersToSearch({ district: district === ANY ? undefined : district, maxRent: budget === ANY ? undefined : Number(budget) })}`);
      }}
    >
      <Select value={district} onValueChange={setDistrict}>
        <SelectTrigger aria-label="District" className="border-0 bg-transparent text-white sm:w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any district</SelectItem>
          {districts.map((d) => <SelectItem key={d} value={d}>District {d}</SelectItem>)}
        </SelectContent>
      </Select>
      <span className="hidden w-px self-stretch bg-border sm:block" aria-hidden />
      <Select value={budget} onValueChange={setBudget}>
        <SelectTrigger aria-label="Budget" className="border-0 bg-transparent text-white sm:w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any budget</SelectItem>
          {[250_000, 300_000, 400_000, 500_000].map((b) => <SelectItem key={b} value={String(b)}>Up to {b / 1000}k Ft</SelectItem>)}
        </SelectContent>
      </Select>
      <Button type="submit" size="lg" className="sm:ml-auto"><Search /> Show flats</Button>
    </form>
  );
}
