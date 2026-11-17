import Link from "next/link";
import { Phone } from "lucide-react";
import { agency } from "@/data/agency";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

const links = [
  { href: "/rentals", label: "Rentals" },
  { href: "/owners", label: "For owners" },
  { href: "/team/monika-stark", label: "Team" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="wrap flex h-16 items-center justify-between gap-6" aria-label="Main">
        <Link href="/" aria-label="Lakáspont home">
          <Logo />
        </Link>
        <ul className="hidden items-center gap-7 text-sm text-muted md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a href={`tel:${agency.phones[0].replace(/\s/g, "")}`} className="hidden items-center gap-2 text-sm text-muted hover:text-foreground lg:flex">
            <Phone className="size-4" /> <span className="num">{agency.phones[0]}</span>
          </a>
          <Button asChild size="sm" className="ml-3">
            <Link href="/rentals">Find a flat</Link>
          </Button>
        </div>
      </nav>
      <ul className="wrap flex gap-5 overflow-x-auto pb-3 text-sm text-muted md:hidden">
        {links.map((l) => (
          <li key={l.href} className="shrink-0">
            <Link href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </header>
  );
}
