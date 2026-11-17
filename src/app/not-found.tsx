import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[60svh] place-items-center text-center">
      <div>
        <p className="num text-7xl font-semibold tracking-[-0.05em] text-accent">404</p>
        <h1 className="mt-4 text-2xl font-semibold">This flat has probably been let.</h1>
        <p className="mt-2 text-muted">Good ones go fast. Here&apos;s what&apos;s still free.</p>
        <Button asChild className="mt-6"><Link href="/rentals">See available flats</Link></Button>
      </div>
    </div>
  );
}
