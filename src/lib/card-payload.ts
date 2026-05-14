// URL hash payload helpers — no backend required.
// We store small payloads in the URL hash so links are fully self-contained.

export type CardPayload = {
  v: 1;
  // content kind
  kind: "image" | "text" | "template";
  // base64 image data URL (for kind=image), optional for template
  img?: string;
  // text message (always optional)
  msg?: string;
  // template id (for kind=template)
  tpl?: string;
  // sender label
  from?: string;
};

// URL-safe base64
const toB64 = (s: string) =>
  btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromB64 = (s: string) => {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return decodeURIComponent(escape(atob(b)));
};

export const encodePayload = (p: CardPayload): string =>
  toB64(JSON.stringify(p));

export const decodePayload = (s: string): CardPayload | null => {
  try {
    const obj = JSON.parse(fromB64(s));
    if (obj && obj.v === 1) return obj as CardPayload;
    return null;
  } catch {
    return null;
  }
};

// Compress an uploaded image to keep URL hash size manageable.
export const compressImage = async (
  file: File,
  maxDim = 1000,
  quality = 0.72
): Promise<string> => {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });
  const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
};
