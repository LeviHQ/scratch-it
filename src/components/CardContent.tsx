import { Template } from "@/lib/templates";

type Props = {
  message?: string;
  imageUrl?: string;
  template?: Template;
  from?: string;
  width: number;
  height: number;
};

export function CardContent({ message, imageUrl, template, from, width, height }: Props) {
  const bg = template?.gradient ?? "linear-gradient(135deg, #fff7ed, #ffe4d6)";
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center px-6 py-8 text-center"
      style={{ width, height, background: bg }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Surprise"
          className="max-h-[55%] w-auto rounded-2xl object-contain shadow-soft"
        />
      ) : template ? (
        <div className="text-7xl drop-shadow-sm">{template.emoji}</div>
      ) : (
        <div className="text-6xl">💌</div>
      )}
      {message && (
        <p
          className="mt-5 max-w-[90%] whitespace-pre-line font-display text-xl font-semibold leading-snug text-plum"
          style={{ color: "#3d1f33" }}
        >
          {message}
        </p>
      )}
      {from && (
        <p className="mt-3 text-sm font-medium opacity-70" style={{ color: "#3d1f33" }}>
          — {from}
        </p>
      )}
    </div>
  );
}
