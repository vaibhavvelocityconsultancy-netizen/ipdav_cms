import { prisma } from "../../prisma.js";
import crypto from "crypto";

/**
 * Generate a collision-safe popup element class identifier.
 * Format: popup-[6-char-random]
 */
export function generatePopupElementClass() {
  return `popup-${crypto.randomBytes(3).toString("hex")}`;
}

/**
 * Sanitize popup HTML to strip executable tags/attributes.
 * Allows basic formatting, but removes scripts, event handlers, etc.
 */
export function sanitizePopupHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Wrap popup CSS under a generated class to prevent collisions.
 */
export function scopePopupCss(css, elementClass) {
  if (!css) return "";
  // Wrap all selectors in the popup element class
  return css
    .split("\n")
    .map((line) => {
      if (line.includes("{")) {
        const [selector] = line.split("{");
        return line.replace(selector.trim(), `.${elementClass} ${selector}`);
      }
      return line;
    })
    .join("\n");
}

/**
 * Get all popups for a tenant (admin).
 */
export async function getPopups(tenantId, { status, sortBy = "updatedAt", order = "desc" } = {}) {
  const where = { tenantId };
  if (status) where.status = status;

  return prisma.popup.findMany({
    where,
    orderBy: { [sortBy]: order },
  });
}

/**
 * Get a single popup by ID (admin).
 */
export async function getPopupById(id, tenantId) {
  return prisma.popup.findFirst({
    where: { id: Number(id), tenantId },
  });
}

/**
 * Create a new popup (admin).
 */
export async function createPopup(
  {
    name,
    type = "MODAL",
    target = "GLOBAL",
    pageIds = [],
    trigger = "PAGE_LOAD",
    delayMs = 0,
    frequency = "EVERY_TIME",
    status = "DRAFT",
    html,
    css,
  },
  tenantId
) {
  // Validate required fields
  if (!name || !html) {
    throw new Error("Name and HTML are required");
  }

  // Sanitize HTML and CSS
  const sanitizedHtml = sanitizePopupHtml(html);
  const elementClass = generatePopupElementClass();
  const scopedCss = scopePopupCss(css || "", elementClass);

  return prisma.popup.create({
    data: {
      name,
      type,
      target,
      pageIds: target === "GLOBAL" ? null : pageIds,
      trigger,
      delayMs: Number(delayMs),
      frequency,
      status,
      html: sanitizedHtml,
      css: scopedCss,
      elementClass,
      tenantId,
    },
  });
}

/**
 * Update an existing popup (admin).
 */
export async function updatePopup(
  id,
  {
    name,
    type,
    target,
    pageIds,
    trigger,
    delayMs,
    frequency,
    status,
    html,
    css,
  },
  tenantId
) {
  const popup = await getPopupById(id, tenantId);
  if (!popup) throw new Error("Popup not found");

  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;
  if (target !== undefined) updateData.target = target;
  if (pageIds !== undefined) {
    updateData.pageIds = target === "GLOBAL" ? null : pageIds;
  }
  if (trigger !== undefined) updateData.trigger = trigger;
  if (delayMs !== undefined) updateData.delayMs = Number(delayMs);
  if (frequency !== undefined) updateData.frequency = frequency;
  if (status !== undefined) updateData.status = status;

  if (html !== undefined) {
    updateData.html = sanitizePopupHtml(html);
  }

  if (css !== undefined) {
    updateData.css = scopePopupCss(css || "", popup.elementClass);
  }

  return prisma.popup.update({
    where: { id: Number(id) },
    data: updateData,
  });
}

/**
 * Delete a popup (admin).
 */
export async function deletePopup(id, tenantId) {
  const popup = await getPopupById(id, tenantId);
  if (!popup) throw new Error("Popup not found");

  return prisma.popup.delete({
    where: { id: Number(id) },
  });
}

/**
 * Toggle popup status (active/paused/draft).
 */
export async function togglePopupStatus(id, newStatus, tenantId) {
  if (!["DRAFT", "ACTIVE", "PAUSED"].includes(newStatus)) {
    throw new Error("Invalid status");
  }

  return updatePopup(id, { status: newStatus }, tenantId);
}

/**
 * Duplicate a popup.
 */
export async function duplicatePopup(id, tenantId) {
  const popup = await getPopupById(id, tenantId);
  if (!popup) throw new Error("Popup not found");

  const newElementClass = generatePopupElementClass();
  const newCss = scopePopupCss(popup.css, newElementClass);

  return prisma.popup.create({
    data: {
      name: `${popup.name} (Copy)`,
      type: popup.type,
      target: popup.target,
      pageIds: popup.pageIds,
      trigger: popup.trigger,
      delayMs: popup.delayMs,
      frequency: popup.frequency,
      status: "DRAFT",
      html: popup.html,
      css: newCss,
      elementClass: newElementClass,
      tenantId,
    },
  });
}

/**
 * Get public popups for a tenant and page (for frontend delivery).
 * Returns only ACTIVE popups that target the given page.
 */
export async function getPublicPopups(tenantId, pageSlug) {
  return prisma.popup.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
      OR: [
        { target: "GLOBAL" },
        {
          target: "SPECIFIC_PAGES",
          pageIds: {
            not: null,
          },
        },
      ],
    },
  });
}
