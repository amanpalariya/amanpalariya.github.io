import { DEFAULT_BOOK_TITLE } from "../constants";
import type { CoverTemplateId, CoverTemplateOption } from "../types";

export type AutoCoverRendererId = "raster-png" | "svg";

export interface AutoCoverInput {
  title: string;
  author: string;
  templateId: CoverTemplateId;
}

type AutoCoverRenderer = (input: AutoCoverInput) => string;

type CoverTextLayout = {
  align: "center" | "left";
  x: number;
  baseY: number;
  fontSize: number;
  lineHeight: number;
  maxCharsPerLine: number;
};

type CoverAuthorLayout = {
  align: "center" | "left";
  x: number;
  mode: "after-title" | "fixed";
  baseY: number;
  fontSize: number;
  lineHeight: number;
  maxCharsPerLine: number;
};

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
  titleLayout: CoverTextLayout;
  authorLayout: CoverAuthorLayout;
};

const DEFAULT_AUTO_COVER_RENDERER: AutoCoverRendererId = "raster-png";
const AUTO_COVER_WIDTH = 1200;
const AUTO_COVER_LAYOUT_HEIGHT = 1800;
const AUTO_COVER_HEIGHT = 1920; // Kindle-friendly 1:1.6 aspect ratio
const AUTO_COVER_VERTICAL_SCALE = AUTO_COVER_HEIGHT / AUTO_COVER_LAYOUT_HEIGHT;

const COVER_TEMPLATE_SPECS: Record<CoverTemplateId, CoverTemplateSpec> = {
  classic: {
    id: "classic",
    label: "Monochrome",
    description: "Basic black-on-white with clean editorial balance.",
    gradientStart: "#ffffff",
    gradientEnd: "#f4f4f4",
    titleColor: "#0f0f0f",
    authorColor: "#4f4f4f",
    frameStroke: "rgba(0,0,0,0.28)",
    accentColor: "rgba(0,0,0,0.08)",
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 620,
      fontSize: 88,
      lineHeight: 108,
      maxCharsPerLine: 20,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "after-title",
      baseY: 72,
      fontSize: 44,
      lineHeight: 60,
      maxCharsPerLine: 30,
    },
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
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 700,
      fontSize: 92,
      lineHeight: 116,
      maxCharsPerLine: 18,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "after-title",
      baseY: 60,
      fontSize: 54,
      lineHeight: 72,
      maxCharsPerLine: 24,
    },
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
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 760,
      fontSize: 92,
      lineHeight: 116,
      maxCharsPerLine: 18,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "after-title",
      baseY: 56,
      fontSize: 52,
      lineHeight: 68,
      maxCharsPerLine: 24,
    },
  },
  midnight: {
    id: "midnight",
    label: "Noir",
    description: "White-on-black style with cinematic rings.",
    gradientStart: "#080808",
    gradientEnd: "#1a1a1a",
    titleColor: "#f8f8f8",
    authorColor: "#d2d2d2",
    frameStroke: "rgba(255,255,255,0.24)",
    accentColor: "rgba(255,255,255,0.16)",
    titleLayout: {
      align: "left",
      x: 130,
      baseY: 600,
      fontSize: 96,
      lineHeight: 114,
      maxCharsPerLine: 14,
    },
    authorLayout: {
      align: "left",
      x: 130,
      mode: "fixed",
      baseY: 1510,
      fontSize: 42,
      lineHeight: 56,
      maxCharsPerLine: 26,
    },
  },
  sage: {
    id: "sage",
    label: "Geometric",
    description: "Black-on-ivory with geometric border patterns.",
    gradientStart: "#fffef8",
    gradientEnd: "#f0ede4",
    titleColor: "#141414",
    authorColor: "#4a4a4a",
    frameStroke: "rgba(0,0,0,0.24)",
    accentColor: "rgba(0,0,0,0.14)",
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 900,
      fontSize: 86,
      lineHeight: 104,
      maxCharsPerLine: 19,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "fixed",
      baseY: 280,
      fontSize: 40,
      lineHeight: 52,
      maxCharsPerLine: 28,
    },
  },
  sunset: {
    id: "sunset",
    label: "Floral",
    description: "Botanical motifs with title in the lower half.",
    gradientStart: "#fcfaf4",
    gradientEnd: "#efe7d8",
    titleColor: "#212121",
    authorColor: "#505050",
    frameStroke: "rgba(0,0,0,0.24)",
    accentColor: "rgba(37,69,53,0.2)",
    titleLayout: {
      align: "left",
      x: 130,
      baseY: 1110,
      fontSize: 84,
      lineHeight: 100,
      maxCharsPerLine: 16,
    },
    authorLayout: {
      align: "left",
      x: 130,
      mode: "fixed",
      baseY: 305,
      fontSize: 40,
      lineHeight: 52,
      maxCharsPerLine: 28,
    },
  },
};

export const COVER_TEMPLATE_OPTIONS: CoverTemplateOption[] = Object.values(
  COVER_TEMPLATE_SPECS,
).map((template) => ({
  id: template.id,
  label: template.label,
  description: template.description,
}));

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

function computeTitleStartY(layout: CoverTextLayout, lineCount: number): number {
  return layout.baseY - Math.max(0, lineCount - 1) * (layout.lineHeight / 2);
}

function computeAuthorStartY(
  layout: CoverAuthorLayout,
  titleLayout: CoverTextLayout,
  titleStartY: number,
  titleLineCount: number,
): number {
  if (layout.mode === "fixed") return layout.baseY;
  return titleStartY + titleLineCount * titleLayout.lineHeight + layout.baseY;
}

function toSvgTextAnchor(align: "center" | "left"): "middle" | "start" {
  return align === "center" ? "middle" : "start";
}

function toCanvasTextAlign(align: "center" | "left"): CanvasTextAlign {
  return align === "center" ? "center" : "left";
}

function createSvgDecoration(template: CoverTemplateSpec): string {
  switch (template.id) {
    case "classic":
      return `<rect x="106" y="106" width="988" height="1588" rx="32" fill="none" stroke="${template.accentColor}" stroke-width="1"/><line x1="180" y1="220" x2="1020" y2="220" stroke="${template.accentColor}" stroke-width="2"/><line x1="180" y1="1580" x2="1020" y2="1580" stroke="${template.accentColor}" stroke-width="2"/>`;
    case "aurora":
      return `<circle cx="190" cy="230" r="260" fill="${template.accentColor}"/><circle cx="1030" cy="1500" r="320" fill="${template.accentColor}"/><circle cx="950" cy="330" r="180" fill="rgba(214,173,255,0.18)"/>`;
    case "ember":
      return `<path d="M0,1560 L1200,1180 L1200,1800 L0,1800 Z" fill="${template.accentColor}"/><path d="M0,0 L760,0 L0,760 Z" fill="rgba(255,166,107,0.14)"/>`;
    case "midnight":
      return `<circle cx="980" cy="260" r="148" fill="${template.accentColor}"/><circle cx="1040" cy="228" r="118" fill="rgba(8,8,8,0.9)"/><circle cx="980" cy="260" r="205" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/><circle cx="980" cy="260" r="270" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/><circle cx="240" cy="260" r="8" fill="rgba(255,255,255,0.45)"/><circle cx="350" cy="420" r="5" fill="rgba(255,255,255,0.4)"/><circle cx="860" cy="340" r="6" fill="rgba(255,255,255,0.36)"/><circle cx="1080" cy="470" r="4" fill="rgba(255,255,255,0.42)"/><path d="M0,1460 C220,1360 430,1520 620,1450 C820,1375 980,1470 1200,1380 L1200,1800 L0,1800 Z" fill="rgba(24,24,24,0.3)"/>`;
    case "sage":
      return `<defs><pattern id="geoPattern" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M0 18 L18 0 L36 18 L18 36 Z" fill="none" stroke="${template.accentColor}" stroke-width="1"/></pattern></defs><rect x="96" y="96" width="1008" height="1608" fill="url(#geoPattern)" opacity="0.34"/><rect x="112" y="112" width="976" height="1576" fill="none" stroke="${template.accentColor}" stroke-width="2"/><line x1="132" y1="300" x2="1068" y2="300" stroke="${template.accentColor}" stroke-width="2"/><line x1="132" y1="1500" x2="1068" y2="1500" stroke="${template.accentColor}" stroke-width="2"/>`;
    case "sunset":
      return `<g stroke="${template.accentColor}" stroke-width="3" fill="none"><path d="M130,230 C230,360 220,560 140,760"/><path d="M1030,1570 C950,1410 950,1190 1060,1030"/></g><g fill="${template.accentColor}"><circle cx="150" cy="250" r="24"/><circle cx="185" cy="220" r="20"/><circle cx="185" cy="280" r="20"/><circle cx="112" cy="220" r="20"/><circle cx="112" cy="280" r="20"/><circle cx="1038" cy="1560" r="22"/><circle cx="1070" cy="1530" r="18"/><circle cx="1070" cy="1590" r="18"/><circle cx="1006" cy="1530" r="18"/><circle cx="1006" cy="1590" r="18"/></g><ellipse cx="220" cy="500" rx="52" ry="24" fill="rgba(37,69,53,0.16)" transform="rotate(-26 220 500)"/><ellipse cx="960" cy="1280" rx="56" ry="25" fill="rgba(37,69,53,0.16)" transform="rotate(28 960 1280)"/>`;
    default:
      return "";
  }
}

function createAutoCoverSvgDataUrl(input: AutoCoverInput): string {
  const template = resolveTemplate(input.templateId);
  const titleLines = wrapTextLines(
    input.title || DEFAULT_BOOK_TITLE,
    template.titleLayout.maxCharsPerLine,
    4,
  );
  const authorLines = wrapTextLines(
    input.author || "",
    template.authorLayout.maxCharsPerLine,
    3,
  );

  const titleStartY = computeTitleStartY(template.titleLayout, titleLines.length);
  const titleAnchor = toSvgTextAnchor(template.titleLayout.align);
  const titleTspans = titleLines
    .map(
      (line, index) =>
        `<tspan x="${template.titleLayout.x}" y="${titleStartY + index * template.titleLayout.lineHeight}">${escapeXmlText(line)}</tspan>`,
    )
    .join("");

  const authorStartY = computeAuthorStartY(
    template.authorLayout,
    template.titleLayout,
    titleStartY,
    titleLines.length,
  );
  const authorAnchor = toSvgTextAnchor(template.authorLayout.align);
  const authorTspans = authorLines
    .map(
      (line, index) =>
        `<tspan x="${template.authorLayout.x}" y="${authorStartY + index * template.authorLayout.lineHeight}">${escapeXmlText(line)}</tspan>`,
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${AUTO_COVER_WIDTH}" height="${AUTO_COVER_HEIGHT}" viewBox="0 0 ${AUTO_COVER_WIDTH} ${AUTO_COVER_HEIGHT}" role="img" aria-label="Book cover"><defs><linearGradient id="coverGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${template.gradientStart}"/><stop offset="100%" stop-color="${template.gradientEnd}"/></linearGradient></defs><rect width="${AUTO_COVER_WIDTH}" height="${AUTO_COVER_HEIGHT}" fill="url(#coverGradient)"/><g transform="scale(1 ${AUTO_COVER_VERTICAL_SCALE})">${createSvgDecoration(template)}<rect x="76" y="76" width="1048" height="1648" rx="40" fill="none" stroke="${template.frameStroke}" stroke-width="4"/><text fill="${template.titleColor}" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="${template.titleLayout.fontSize}" font-weight="700" text-anchor="${titleAnchor}">${titleTspans}</text>${authorTspans ? `<text fill="${template.authorColor}" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="${template.authorLayout.fontSize}" font-weight="500" text-anchor="${authorAnchor}">${authorTspans}</text>` : ""}</g></svg>`;

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

  switch (template.id) {
    case "classic": {
      context.strokeStyle = template.accentColor;
      context.lineWidth = 1;
      drawRoundedRectPath(context, 106, 106, 988, 1588, 32);
      context.stroke();

      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(180, 220);
      context.lineTo(1020, 220);
      context.moveTo(180, 1580);
      context.lineTo(1020, 1580);
      context.stroke();

      context.restore();
      return;
    }
    case "aurora": {
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
    case "ember": {
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
      return;
    }
    case "midnight": {
      context.fillStyle = template.accentColor;
      context.beginPath();
      context.arc(980, 260, 148, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "rgba(8,8,8,0.9)";
      context.beginPath();
      context.arc(1040, 228, 118, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "rgba(255,255,255,0.14)";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(980, 260, 205, 0, Math.PI * 2);
      context.stroke();

      context.strokeStyle = "rgba(255,255,255,0.08)";
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(980, 260, 270, 0, Math.PI * 2);
      context.stroke();

      context.fillStyle = "rgba(255,255,255,0.42)";
      for (const [x, y, r] of [
        [240, 260, 8],
        [350, 420, 5],
        [860, 340, 6],
        [1080, 470, 4],
      ] as const) {
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = "rgba(24,24,24,0.3)";
      context.beginPath();
      context.moveTo(0, 1460);
      context.bezierCurveTo(220, 1360, 430, 1520, 620, 1450);
      context.bezierCurveTo(820, 1375, 980, 1470, width, 1380);
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      context.fill();
      context.restore();
      return;
    }
    case "sage": {
      context.strokeStyle = template.accentColor;
      context.lineWidth = 1;
      for (let y = 96; y <= 1704; y += 36) {
        for (let x = 96; x <= 1104; x += 36) {
          context.beginPath();
          context.moveTo(x, y + 18);
          context.lineTo(x + 18, y);
          context.lineTo(x + 36, y + 18);
          context.lineTo(x + 18, y + 36);
          context.closePath();
          context.stroke();
        }
      }

      context.lineWidth = 2;
      context.beginPath();
      context.rect(112, 112, 976, 1576);
      context.stroke();

      context.beginPath();
      context.moveTo(132, 300);
      context.lineTo(1068, 300);
      context.moveTo(132, 1500);
      context.lineTo(1068, 1500);
      context.stroke();

      context.restore();
      return;
    }
    case "sunset": {
      context.strokeStyle = template.accentColor;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(130, 230);
      context.bezierCurveTo(230, 360, 220, 560, 140, 760);
      context.moveTo(1030, 1570);
      context.bezierCurveTo(950, 1410, 950, 1190, 1060, 1030);
      context.stroke();

      context.fillStyle = template.accentColor;
      for (const [x, y, r] of [
        [150, 250, 24],
        [185, 220, 20],
        [185, 280, 20],
        [112, 220, 20],
        [112, 280, 20],
        [1038, 1560, 22],
        [1070, 1530, 18],
        [1070, 1590, 18],
        [1006, 1530, 18],
        [1006, 1590, 18],
      ] as const) {
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = "rgba(37,69,53,0.16)";
      context.save();
      context.translate(220, 500);
      context.rotate((-26 * Math.PI) / 180);
      context.beginPath();
      context.ellipse(0, 0, 52, 24, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();

      context.save();
      context.translate(960, 1280);
      context.rotate((28 * Math.PI) / 180);
      context.beginPath();
      context.ellipse(0, 0, 56, 25, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();

      context.restore();
      return;
    }
    default:
      context.restore();
  }
}

function createAutoCoverRasterDataUrl(input: AutoCoverInput): string {
  if (typeof document === "undefined") {
    return createAutoCoverSvgDataUrl(input);
  }

  const template = resolveTemplate(input.templateId);
  const canvas = document.createElement("canvas");
  canvas.width = AUTO_COVER_WIDTH;
  canvas.height = AUTO_COVER_HEIGHT;
  const context = canvas.getContext("2d");

  if (!context) {
    return createAutoCoverSvgDataUrl(input);
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, template.gradientStart);
  gradient.addColorStop(1, template.gradientEnd);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.scale(1, AUTO_COVER_VERTICAL_SCALE);

  drawCanvasDecoration(context, template, AUTO_COVER_WIDTH, AUTO_COVER_LAYOUT_HEIGHT);

  context.strokeStyle = template.frameStroke;
  context.lineWidth = 4;
  drawRoundedRectPath(context, 76, 76, 1048, 1648, 40);
  context.stroke();

  const titleLines = wrapTextLines(
    input.title || DEFAULT_BOOK_TITLE,
    template.titleLayout.maxCharsPerLine,
    4,
  );
  const authorLines = wrapTextLines(
    input.author || "",
    template.authorLayout.maxCharsPerLine,
    3,
  );

  const titleStartY = computeTitleStartY(template.titleLayout, titleLines.length);
  context.textAlign = toCanvasTextAlign(template.titleLayout.align);
  context.textBaseline = "middle";
  context.fillStyle = template.titleColor;
  context.font = `700 ${template.titleLayout.fontSize}px Inter, Segoe UI, Roboto, Arial, sans-serif`;
  for (let index = 0; index < titleLines.length; index += 1) {
    context.fillText(
      titleLines[index],
      template.titleLayout.x,
      titleStartY + index * template.titleLayout.lineHeight,
    );
  }

  if (authorLines.length > 0) {
    const authorStartY = computeAuthorStartY(
      template.authorLayout,
      template.titleLayout,
      titleStartY,
      titleLines.length,
    );
    context.textAlign = toCanvasTextAlign(template.authorLayout.align);
    context.fillStyle = template.authorColor;
    context.font = `500 ${template.authorLayout.fontSize}px Inter, Segoe UI, Roboto, Arial, sans-serif`;
    for (let index = 0; index < authorLines.length; index += 1) {
      context.fillText(
        authorLines[index],
        template.authorLayout.x,
        authorStartY + index * template.authorLayout.lineHeight,
      );
    }
  }

  context.restore();

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
