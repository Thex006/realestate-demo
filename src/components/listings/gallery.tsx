"use client";

import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { CaretLeft, CaretRight, GridFour, X } from "@phosphor-icons/react/ssr";
import { Photo } from "./photo";

/** Bento mosaic (1 large + 4) that opens a full-screen, keyboard-driven gallery. */
export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const go = useCallback((d: number) => setI((x) => (x + d + photos.length) % photos.length), [photos.length]);
  const show = (n: number) => {
    setI(n);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const tiles = photos.slice(0, 5);
  return (
    <>
      <div className="grid h-[52svh] min-h-[360px] grid-cols-4 grid-rows-2 gap-2 md:h-[68svh]">
        {tiles.map((p, n) => (
          <button
            key={p}
            type="button"
            onClick={() => show(n)}
            className={`group relative overflow-hidden rounded-md bg-card-2 ${n === 0 ? "col-span-4 row-span-2 md:col-span-2" : "hidden md:block"}`}
            aria-label={`Open photo ${n + 1} of ${photos.length}`}
          >
            <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
              <Photo src={p} alt={n === 0 ? title : ""} priority={n < 3} />
            </div>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => show(0)}
        className="num relative z-10 -mt-12 mb-4 ml-auto mr-3 flex w-fit items-center gap-2 rounded-full bg-black/60 px-4 py-2 caption-5 text-white backdrop-blur-md transition-colors hover:bg-accent hover:text-accent-ink"
      >
        <GridFour className="size-4" /> All {photos.length} photos
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/95" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col outline-none" aria-describedby={undefined}>
            <div className="flex items-center justify-between p-4 body-6 text-white/80">
              <Dialog.Title className="heading-5 text-white">{title}</Dialog.Title>
              <div className="flex items-center gap-4">
                <span className="num">{i + 1} / {photos.length}</span>
                <Dialog.Close className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close gallery"><X className="size-5" /></Dialog.Close>
              </div>
            </div>
            <div className="relative flex-1">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                  key={photos[i]}
                  src={photos[i]}
                  alt={`${title}, photo ${i + 1}`}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>
              <button type="button" onClick={() => go(-1)} className="absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous photo"><CaretLeft /></button>
              <button type="button" onClick={() => go(1)} className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next photo"><CaretRight /></button>
            </div>
            <div className="flex gap-2 overflow-x-auto p-4">
              {photos.map((p, n) => (
                <button key={p} type="button" onClick={() => setI(n)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded ${n === i ? "ring-2 ring-accent" : "opacity-50 hover:opacity-100"}`} aria-label={`Photo ${n + 1}`}>
                  <Photo src={p} alt="" />
                </button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
