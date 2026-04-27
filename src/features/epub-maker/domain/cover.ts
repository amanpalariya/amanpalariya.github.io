import { DEFAULT_BOOK_TITLE } from "../constants";

export type AutoCoverRendererId = "raster-png" | "svg";

export interface AutoCoverInput {
  title: string;
  author: string;
}

type AutoCoverRenderer = (input: AutoCoverInput) => string;

const DEFAULT_AUTO_COVER_RENDERER: AutoCoverRendererId = "raster-png";

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapTextLines(
  value: string,
  maxCharsPerLine: number,
  maxLines: number,
): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let currentLine = "";

  const pushCurrentLine = () => {
    if (!currentLine) return;
    lines.push(currentLine);
    currentLine = "";
  };

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
      continue;
    }

    if (!currentLine && word.length > maxCharsPerLine) {
      lines.push(word.slice(0, maxCharsPerLine));
      const remainder = word.slice(maxCharsPerLine);
      currentLine = remainder;
      if (lines.length >= maxLines) break;
      continue;
    }

    pushCurrentLine();
    currentLine = word;
    if (lines.length >= maxLines) break;
  }

  pushCurrentLine();

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }

  if (words.join(" ").length > lines.join(" ").length) {
    const lastLineIndex = lines.length - 1;
    if (lastLineIndex >= 0) {
      lines[lastLineIndex] = `${lines[lastLineIndex].replace(/[\s.]+$/g, "")}…`;
    }
  }

  return lines;
}

function createAutoCoverSvgDataUrl(input: AutoCoverInput): string {
  const titleLines = wrapTextLines(input.title || DEFAULT_BOOK_TITLE, 18, 4);
  const authorLines = wrapTextLines(input.author || "", 24, 2);

  const titleStartY = 700 - Math.max(0, titleLines.length - 1) * 58;
  const titleTspans = titleLines
    .map(
      (line, index) =>
        `<tspan x="600" y="${titleStartY + index * 116}">${escapeXmlText(line)}</tspan>`,
    )
    .join("");

  const authorStartY = titleStartY + titleLines.length * 120 + 60;
  const authorTspans = authorLines
    .map(
      (line, index) =>
        `<tspan x="600" y="${authorStartY + index * 72}">${escapeXmlText(line)}</tspan>`,
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1800" viewBox="0 0 1200 1800" role="img" aria-label="Book cover"><defs><linearGradient id="coverGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#173753"/><stop offset="100%" stop-color="#3a6ea5"/></linearGradient></defs><rect width="1200" height="1800" fill="url(#coverGradient)"/><rect x="76" y="76" width="1048" height="1648" rx="40" fill="none" stroke="rgba(255,255,255,0.34)" stroke-width="4"/><text fill="#f8fbff" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="92" font-weight="700" text-anchor="middle">${titleTspans}</text>${authorTspans ? `<text fill="#d8e7f6" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="54" font-weight="500" text-anchor="middle">${authorTspans}</text>` : ""}</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function drawRoundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const clampedRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + clampedRadius, y);
  context.lineTo(x + width - clampedRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
  context.lineTo(x + width, y + height - clampedRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - clampedRadius,
    y + height,
  );
  context.lineTo(x + clampedRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
  context.lineTo(x, y + clampedRadius);
  context.quadraticCurveTo(x, y, x + clampedRadius, y);
  context.closePath();
}

function createAutoCoverRasterDataUrl(input: AutoCoverInput): string {
  if (typeof document === "undefined") {
    return createAutoCoverSvgDataUrl(input);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1800;
  const context = canvas.getContext("2d");

  if (!context) {
    return createAutoCoverSvgDataUrl(input);
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#173753");
  gradient.addColorStop(1, "#3a6ea5");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(255,255,255,0.34)";
  context.lineWidth = 4;
  drawRoundedRectPath(context, 76, 76, 1048, 1648, 40);
  context.stroke();

  const centerX = canvas.width / 2;
  const titleLines = wrapTextLines(input.title || DEFAULT_BOOK_TITLE, 18, 4);
  const authorLines = wrapTextLines(input.author || "", 24, 2);

  const titleStartY = 700 - Math.max(0, titleLines.length - 1) * 58;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#f8fbff";
  context.font = "700 92px Inter, Segoe UI, Roboto, Arial, sans-serif";
  for (let index = 0; index < titleLines.length; index += 1) {
    context.fillText(titleLines[index], centerX, titleStartY + index * 116);
  }

  if (authorLines.length > 0) {
    const authorStartY = titleStartY + titleLines.length * 120 + 60;
    context.fillStyle = "#d8e7f6";
    context.font = "500 54px Inter, Segoe UI, Roboto, Arial, sans-serif";
    for (let index = 0; index < authorLines.length; index += 1) {
      context.fillText(authorLines[index], centerX, authorStartY + index * 72);
    }
  }

  return canvas.toDataURL("image/png");
}

const autoCoverRenderers: Record<AutoCoverRendererId, AutoCoverRenderer> = {
  "raster-png": createAutoCoverRasterDataUrl,
  svg: createAutoCoverSvgDataUrl,
};

function resolveRendererOrder(preferredRenderer: AutoCoverRendererId): AutoCoverRendererId[] {
  return preferredRenderer === "svg" ? ["svg", "raster-png"] : ["raster-png", "svg"];
}

export function createAutoCoverDataUrl(
  input: AutoCoverInput,
  preferredRenderer: AutoCoverRendererId = DEFAULT_AUTO_COVER_RENDERER,
): string {
  const rendererOrder = resolveRendererOrder(preferredRenderer);

  for (const rendererId of rendererOrder) {
    const renderer = autoCoverRenderers[rendererId];
    try {
      return renderer(input);
    } catch {
      // try next renderer strategy
    }
  }

  return createAutoCoverSvgDataUrl(input);
}

export function createAutoCoverHtml(
  title: string,
  author: string,
  preferredRenderer: AutoCoverRendererId = DEFAULT_AUTO_COVER_RENDERER,
): string {
  const safeTitle = title || DEFAULT_BOOK_TITLE;
  const coverSrc = createAutoCoverDataUrl({ title, author }, preferredRenderer);
  return `<figure><img src="${coverSrc}" alt="Cover for ${escapeXmlText(safeTitle)}" /></figure>`;
}
