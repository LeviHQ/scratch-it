import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { decodePayload, CardPayload } from "@/lib/card-payload";
import { getTemplate } from "@/lib/templates";
import { ScratchCard } from "@/components/ScratchCard";
import { CardContent } from "@/components/CardContent";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/reveal")({
  component: RevealPage,
  head: () => ({
    meta: [
      { title: "A surprise is waiting for you ✨ — ScratchIt" },
      { name: "description", content: "Someone made you a scratch card. Tap to reveal what's hidden." },
      { property: "og:title", content: "A surprise is waiting for you ✨" },
      { property: "og:description", content: "Tap to scratch and reveal what's hidden inside." },
    ],
  }),
});

function RevealPage() {
  const [payload, setPayload] = useState<CardPayload | null | undefined>(undefined);
  const [revealed, setRevealed] = useState(false);
  const [size, setSize] = useState({ w: 340, h: 460 });

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    setPayload(hash ? decodePayload(hash) : null);
    const compute = () => {
      const w = Math.min(380, window.innerWidth - 40);
      const h = Math.round(w * 1.32);
      setSize({ w, h });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const template = useMemo(
    () => (payload?.kind === "template" ? getTemplate(payload.tpl) : undefined),
    [payload]
  );

  if (payload === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (payload === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">🤔</div>
        <h1 className="mt-4 font-display text-2xl font-bold">This card link looks broken</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Ask the sender to share the link again — or make your own scratch card.
        </p>
        <Link to="/" className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
          Make a card
        </Link>
      </div>
    );
  }

  const message =
    payload.msg || (template ? template.message : "You got a surprise! 🎉");
  const imageUrl = payload.kind === "image" ? payload.img : undefined;
  const scratchColor = template?.scratchColor ?? "#c14a2a";
  const scratchLabel = template?.scratchLabel ?? "Scratch to reveal ✨";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="font-display text-xl font-bold tracking-tight">ScratchIt</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {payload.from ? `From ${payload.from} 💌` : "Someone sent you a surprise 💌"}
        </p>
        <h1 className="mb-6 text-center font-display text-3xl font-bold sm:text-4xl">
          {revealed ? "Surprise! 🎉" : "A scratch card just for you"}
        </h1>

        <ScratchCard
          width={size.w}
          height={size.h}
          scratchColor={scratchColor}
          scratchLabel={scratchLabel}
          onRevealed={() => setRevealed(true)}
        >
          <CardContent
            width={size.w}
            height={size.h}
            template={template}
            imageUrl={imageUrl}
            message={message}
            from={payload.from}
          />
        </ScratchCard>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {revealed ? "Hope it made you smile ✨" : "Use your finger or mouse to scratch"}
        </p>

        <Link
          to="/"
          className="mt-8 rounded-full bg-gradient-warm px-6 py-3 text-sm font-semibold text-white shadow-soft"
        >
          Make your own scratch card →
        </Link>
      </main>
    </div>
  );
}
