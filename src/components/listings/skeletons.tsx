/** Skeletons shaped like the real layouts (landing-page-design B9: no spinners). */
const bar = "animate-pulse rounded-md bg-card-2";

export function ResultsSkeleton() {
  return (
    <div className="wrap pt-24" aria-busy="true" aria-label="Loading homes">
      <div className={`${bar} h-4 w-24`} />
      <div className={`${bar} mt-4 h-16 w-full max-w-[680px]`} />
      <div className={`${bar} mt-12 h-24 w-full`} />
      <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <div className={`${bar} aspect-[4/3] w-full`} />
            <div className={`${bar} mt-4 h-6 w-2/3`} />
            <div className={`${bar} mt-2 h-4 w-1/2`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
