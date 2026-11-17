import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[60svh] place-items-center py-24 text-center">
      <div>
        <p className="eyebrow justify-center">404</p>
        <h1 className="heading-1 mt-6">This one has <em>already</em> gone.</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">Good homes in Budapest don&apos;t stay listed for long. Here is everything still available.</p>
        <div className="mt-10 flex justify-center gap-3">
          <Button asChild size="lg"><Link href="/rent">Homes to rent</Link></Button>
          <Button asChild size="lg" variant="secondary"><Link href="/buy">Homes for sale</Link></Button>
        </div>
      </div>
    </div>
  );
}
