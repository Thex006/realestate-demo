import type { Metadata } from "next";
import { ResultsPage } from "@/components/listings/results-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Homes to rent" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ResultsPage kind="rent" searchParams={await searchParams} />;
}
