import type { Metadata } from "next";
import { ResultsPage } from "@/components/listings/results-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Homes for sale" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ResultsPage kind="sale" searchParams={await searchParams} />;
}
