import { DEFAULT_BOOK_TITLE } from "../constants";
import type { CoverTemplateId, CoverTemplateOption } from "../types";

export type AutoCoverRendererId = "raster-png" | "svg";

export interface AutoCoverInput {
  title: string;
  author: string;
  templateId: CoverTemplateId;
}

type AutoCoverRenderer = (input: AutoCoverInput) => string;

type CoverTemplateSpec = {
  id: CoverTemplateId;
  label: string;
  description: string;
  gradientStart: string;
  gradientEnd: string;
  titleColor: string;
  authorColor: string;
  frameStroke: string;
  accentColor: string;
};

const DEFAULT_AUTO_COVER_RENDERER: AutoCoverRendererId = "raster-png";

const COVER_TEMPLATE_SPECS: Record<CoverTemplateId, CoverTemplateSpec> = {
  classic: {
    id: "classic",
    label: "Classic",
    description: "Clean frame with balanced typography.",
    gradientStart: "#173753",
    gradientEnd: "#3a6ea5",
    titleColor: "#f8fbff",
    authorColor: "#d8e7f6",
    frameStroke: "rgba(255,255,255,0.34)",
    accentColor: "rgba(255,255,255,0.16)",
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    description: "Soft glows and cool gradients.",
    gradientStart: "#1b1b3a",
    gradientEnd: "#5a4fcf",
    titleColor: "#f7f7ff",
    authorColor: "#d9d6ff",
    frameStroke: "rgba(230,224,255,0.36)",
    accentColor: "rgba(164,244,255,0.26)",
  },
  ember: {
    id: "ember",
    label: "Ember",
    description: "Warm contrast with energetic highlights.",
    gradientStart: "#4a1d12",
    gradientEnd: "#b23a24",
    titleColor: "#fff4e8",
    authorColor: "#ffd6b3",
    frameStroke: "rgba(255,228,204,0.34)",
    accentColor: "rgba(255,211,153,0.22)",
  },
};

export const COVER_TEMPLATE_OPTIONS: CoverTemplateOption[] = [
  {
    id: COVER_TEMPLATE_SPECS.classic.id,
    label: COVER_TEMPLATE_SPECS.classic.label,
    description: COVER_TEMPLATE_SPECS.classic.description,
  },
  {
    id: COVER_TEMPLATE_SPECS.aurora.id,
    label: COVER_TEMPLATE_SPECS.aurora.label,
    description: COVER_TEMPLATE_SPECS.aurora.description,
  },
  {
    id: COVER_TEMPLATE_SPECS.ember.id,
    label: COVER_TEMPLATE_SPECS.ember.label,
    description: COVER_TEMPLATE_SPECS.ember.description,
  },
];

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

function resolveTemplate(templateId: CoverTemplateId): CoverTemplateSpec {
  return COVER_TEMPLATE_SPECS[templateId] ?? COVER_TEMPLATE_SPECS.classic;
}

function createSvgDecoration(template: CoverTemplateSpec): string {
  if (template.id === "classic") {
    return `<rect x="106" y="106" width="988" height="1588" rx="32" fill="none" stroke="${template.accentColor}" stroke-width="1"/>`;
  }

  if (template.id === "aurora") {
    return `<circle cx="190" cy="230" r="260" fill="${template.accentColor}"/><circle cx="1030" cy="1500" r="320" fill="${template.accentColor}"/><circle cx="950" cy="330" r="180" fill="rgba(214,173,255,0.18)"/>`;
  }

  return `<path d="M0,1560 L1200,1180 L1200,1800 L0,1800 Z" fill="${template.accentColor}"/><path d="M0,0 L760,0 L0,760 Z" fill="rgba(255,166,107,0.14)"/>`;
}

function createAutoCoverSvgDataUrl(input: AutoCoverInput): string {
  const template = resolveTemplate(input.templateId);
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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1800" viewBox="0 0 1200 1800" role="img" aria-label="Book cover"><defs><linearGradient id="coverGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${template.gradientStart}"/><stop offset="100%" stop-color="${template.gradientEnd}"/></linearGradient></defs><rect width="1200" height="1800" fill="url(#coverGradient)"/>${createSvgDecoration(template)}<rect x="76" y="76" width="1048" height="1648" rx="40" fill="none" stroke="${template.frameStroke}" stroke-width="4"/><text fill="${template.titleColor}" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="92" font-weight="700" text-anchor="middle">${titleTspans}</text>${authorTspans ? `<text fill="${template.authorColor}" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="54" font-weight="500" text-anchor="middle">${authorTspans}</text>` : ""}</svg>`;

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

function drawCanvasDecoration(
  context: CanvasRenderingContext2D,
  template: CoverTemplateSpec,
  width: number,
  height: number,
) {
  context.save();

  if (template.id === "classic") {
    context.strokeStyle = template.accentColor;
    context.lineWidth = 1;
    drawRoundedRectPath(context, 106, 106, 988, 1588, 32);
    context.stroke();
    context.restore();
    return;
  }

  if (template.id === "aurora") {
    context.fillStyle = template.accentColor;
    context.beginPath();
    context.arc(190, 230, 260, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(1030, 1500, 320, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(214,173,255,0.18)";
    context.beginPath();
    context.arc(950, 330, 180, 0, Math.PI * 2);
    context.fill();
    context.restore();
    return;
  }

  context.fillStyle = template.accentColor;
  context.beginPath();
  context.moveTo(0, 1560);
  context.lineTo(width, 1180);
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();

  context.fillStyle = "rgba(255,166,107,0.14)";
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(760, 0);
  context.lineTo(0, 760);
  context.closePath();
  context.fill();

  context.restore();
}

function createAutoCoverRasterDataUrl(input: AutoCoverInput): string {
  if (typeof document === "undefined") {
    return createAutoCoverSvgDataUrl(input);
  }

  const template = resolveTemplate(input.templateId);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1800;
  const context = canvas.getContext("2d");

  if (!context) {
    return createAutoCoverSvgDataUrl(input);
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, template.gradientStart);
  gradient.addColorStop(1, template.gradientEnd);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawCanvasDecoration(context, template, canvas.width, canvas.height);

  context.strokeStyle = template.frameStroke;
  context.lineWidth = 4;
  drawRoundedRectPath(context, 76, 76, 1048, 1648, 40);
  context.stroke();

  const centerX = canvas.width / 2;
  const titleLines = wrapTextLines(input.title || DEFAULT_BOOK_TITLE, 18, 4);
  const authorLines = wrapTextLines(input.author || "", 24, 2);

  const titleStartY = 700 - Math.max(0, titleLines.length - 1) * 58;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = template.titleColor;
  context.font = "700 92px Inter, Segoe UI, Roboto, Arial, sans-serif";
  for (let index = 0; index < titleLines.length; index += 1) {
    context.fillText(titleLines[index], centerX, titleStartY + index * 116);
  }

  if (authorLines.length > 0) {
    const authorStartY = titleStartY + titleLines.length * 120 + 60;
    context.fillStyle = template.authorColor;
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
  templateId: CoverTemplateId,
  preferredRenderer: AutoCoverRendererId = DEFAULT_AUTO_COVER_RENDERER,
): string {
  const safeTitle = title || DEFAULT_BOOK_TITLE;
  const coverSrc = createAutoCoverDataUrl(
    {
      title,
      author,
      templateId,
    },
    preferredRenderer,
  );
  return `<figure><img src="${coverSrc}" alt="Cover for ${escapeXmlText(safeTitle)}" /></figure>`;
}
