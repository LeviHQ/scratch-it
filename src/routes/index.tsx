import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { TEMPLATES, Template } from "@/lib/templates";
import { compressImage, encodePayload, CardPayload } from "@/lib/card-payload";
import { CardContent } from "@/components/CardContent";
import { ScratchCard } from "@/components/ScratchCard";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "ScratchIt — Make a free scratch card in seconds" },
      {
        name: "description",
        content:
          "Hide a photo or message under a scratch layer. Send the link on WhatsApp or Instagram and watch them reveal your surprise.",
      },
    ],
  }),
});

type Mode = "template" | "upload" | "text";

function HomePage() {
  const [mode, setMode] = useState<Mode>("template");
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [imgData, setImgData] = useState<string | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFile = async (f: File | null) => {
    setImgError(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setImgError("Please pick an image file.");
      return;
    }
    try {
      const data = await compressImage(f);
      // Keep payload reasonable. ~1.4MB base64 ≈ 1MB image.
      if (data.length > 1_500_000) {
        const smaller = await compressImage(f, 720, 0.6);
        setImgData(smaller);
      } else {
        setImgData(data);
      }
    } catch {
      setImgError("Couldn't read that image. Try another.");
    }
  };

  const create = () => {
    const payload: CardPayload = (() => {
      if (mode === "template")
        return { v: 1, kind: "template", tpl: template.id, msg: message || template.message, from };
      if (mode === "upload" && imgData)
        return { v: 1, kind: "image", img: imgData, msg: message, from };
      return { v: 1, kind: "text", msg: message || "Surprise! 🎉", from };
    })();
    const hash = encodePayload(payload);
    const url = `${window.location.origin}/reveal#${hash}`;
    setLink(url);
    setCopied(false);
    setTimeout(() => {
      document.getElementById("share-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const canCreate =
    (mode === "template") ||
    (mode === "upload" && !!imgData) ||
    (mode === "text" && message.trim().length > 0);

  const previewW = 320;
  const previewH = 420;

  const shareText = "I made you a scratch card 💌 tap to reveal:";
  const waUrl = link ? `https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}` : "";

  const previewKey = useMemo(
    () => `${mode}-${template.id}-${imgData?.slice(0, 32)}-${message}-${from}`,
    [mode, template, imgData, message, from]
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 pt-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="font-display text-xl font-bold tracking-tight">ScratchIt</span>
        </Link>
        <a
          href="#create"
          className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition hover:opacity-90"
        >
          Make a card
        </a>
        <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pt-14 pb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
          <span className="h-2 w-2 rounded-full bg-coral" />
          100% free · no signup
        </span>
        <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
          Hide a little surprise.
          <br />
          <span className="bg-gradient-warm bg-clip-text text-transparent">Make them scratch for it.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Turn a photo or message into a scratch-to-reveal card. Share the link on WhatsApp, Instagram or anywhere — they'll love it.
        </p>
      </section>

      {/* Builder */}
      <section id="create" className="mx-auto max-w-5xl px-5 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
          {/* Left: controls */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-2xl font-bold">1. Pick what to hide</h2>

            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  { id: "template", label: "🎁 Template" },
                  { id: "upload", label: "🖼 Upload photo" },
                  { id: "text", label: "✍️ Just text" },
                ] as { id: Mode; label: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    mode === t.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background hover:border-foreground/30"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {mode === "template" && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTemplate(t);
                      if (!message) setMessage("");
                    }}
                    className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                      template.id === t.id
                        ? "border-foreground ring-2 ring-foreground/10"
                        : "border-border hover:border-foreground/40"
                    }`}
                    style={{ background: t.gradient }}
                  >
                    <div className="text-3xl">{t.emoji}</div>
                    <div className="mt-2 text-sm font-semibold" style={{ color: "#3d1f33" }}>
                      {t.name}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {mode === "upload" && (
              <div className="mt-6">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background/60 px-6 py-10 text-center transition hover:border-foreground/40 hover:bg-background"
                >
                  <div className="text-3xl">📸</div>
                  <div className="mt-2 font-semibold">
                    {imgData ? "Replace photo" : "Tap to upload a photo"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    JPG or PNG · we'll compress it for you
                  </div>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
                {imgError && <p className="mt-2 text-sm text-destructive">{imgError}</p>}
                {imgData && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted p-3">
                    <img src={imgData} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <span className="text-sm text-muted-foreground">Photo ready ✨</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold">2. Add a message</h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 220))}
                placeholder={
                  mode === "template" ? template.message : "Type something sweet, funny, or surprising..."
                }
                rows={3}
                className="mt-3 w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none transition focus:border-foreground"
              />
              <div className="mt-1 text-right text-xs text-muted-foreground">{message.length}/220</div>

              <input
                value={from}
                onChange={(e) => setFrom(e.target.value.slice(0, 40))}
                placeholder="From (optional) — e.g. Mom, Aarav, your secret admirer"
                className="mt-3 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none transition focus:border-foreground"
              />
            </div>

            <button
              onClick={create}
              disabled={!canCreate}
              className="mt-8 w-full rounded-2xl bg-gradient-warm px-6 py-4 font-display text-lg font-bold text-white shadow-card transition disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-105 active:scale-[0.99]"
            >
              Create my scratch card →
            </button>
          </div>

          {/* Right: live preview */}
          <div className="flex flex-col items-center justify-start lg:sticky lg:top-6 lg:self-start">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live preview
            </div>
            <ScratchCard
              key={previewKey}
              width={previewW}
              height={previewH}
              scratchColor={mode === "template" ? template.scratchColor : "#c14a2a"}
              scratchLabel={mode === "template" ? template.scratchLabel : "Scratch to reveal ✨"}
            >
              <CardContent
                width={previewW}
                height={previewH}
                template={mode === "template" ? template : undefined}
                imageUrl={mode === "upload" ? imgData ?? undefined : undefined}
                message={message || (mode === "template" ? template.message : undefined)}
                from={from || undefined}
              />
            </ScratchCard>
            <p className="mt-3 text-xs text-muted-foreground">Try scratching it ↑</p>
          </div>
        </div>

        {/* Share */}
        {link && (
          <div
            id="share-card"
            className="mt-10 rounded-3xl border border-border bg-gradient-confetti p-1 shadow-card"
          >
            <div className="rounded-[1.4rem] bg-card p-6 sm:p-8">
              <h3 className="font-display text-2xl font-bold">Your card is ready 🎉</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Send this link — it works on any phone, no app needed.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  readOnly
                  value={link}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-3 font-mono text-xs"
                />
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                  className="rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  {copied ? "Copied ✓" : "Copy link"}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#25D366] px-5 py-2 text-sm font-semibold text-white"
                >
                  Share on WhatsApp
                </a>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Open card →
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 pb-24">
        <h2 className="font-display text-3xl font-bold">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { n: "01", t: "Pick what to hide", d: "A photo, message, or one of our occasion templates." },
            { n: "02", t: "Get a magic link", d: "We bake your card into a link — no account, no upload server." },
            { n: "03", t: "They scratch & smile", d: "Tap, drag, reveal. Works on any phone or desktop." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-5">
              <div className="font-display text-3xl font-bold text-coral">{s.n}</div>
              <div className="mt-2 font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Made with ❤️ for surprises · ScratchIt
      </footer>
    </div>
  );
}
