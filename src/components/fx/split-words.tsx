import { Fragment } from "react";

/**
 * Headline whose words rise out of their own line, one after another (CSS only, so it runs before hydration).
 * Wrap a word in *asterisks* to set it in the accent colour. A lone "|" forces a line break at a meaningful point.
 */
export function SplitWords({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const words = text.split(" ");
  const plain = text.replace(/\*/g, "").replace(/ \| /g, " ");
  return (
    <span className={className} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      <span className="sr-only">{plain}</span>
      <span aria-hidden>
        {words.map((w, i) => {
          if (w === "|") return <br key={i} />;
          const em = w.startsWith("*");
          const clean = w.replace(/\*/g, "");
          return (
            <Fragment key={i}>
              <span className="word"><span style={{ "--i": i } as React.CSSProperties}>{em ? <em>{clean}</em> : clean}</span></span>
              {i < words.length - 1 && " "}
            </Fragment>
          );
        })}
      </span>
    </span>
  );
}
