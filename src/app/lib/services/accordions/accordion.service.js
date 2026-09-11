import crypto from "crypto";
import sanitizeHtml from "sanitize-html";
import { prisma } from "../../prisma.js";

export const DEFAULT_ACCORDION_CSS = `.cms-accordion { display: grid; gap: 0.75rem; }
.cms-accordion-item { border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; }
.cms-accordion-question { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 1rem; background: transparent; border: 0; cursor: pointer; text-align: left; font: inherit; }
.cms-accordion-answer { padding: 0 1rem 1rem; }
.cms-accordion-answer[hidden] { display: none; }
.cms-accordion-icon { display: inline-flex; transition: transform 180ms ease; }
`;

const clean = (value) => sanitizeHtml(String(value || ""), { allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]), allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "width", "height"] }, allowedSchemes: ["http", "https", "mailto"] });
const idFor = () => `accordion-${crypto.randomBytes(3).toString("hex")}`;
const normalizeItems = (items = []) => items.map((item, index) => ({ question: String(item.question || "").trim(), answer: clean(item.answer), customClass: String(item.customClass || "").trim() || null, sortOrder: index })).filter((item) => item.question);

export async function getAccordions(tenantId) { return prisma.accordion.findMany({ where: { tenantId }, include: { items: { orderBy: { sortOrder: "asc" } } }, orderBy: { updatedAt: "desc" } }); }
export async function getAccordion(id, tenantId) { return prisma.accordion.findFirst({ where: { id: Number(id), tenantId }, include: { items: { orderBy: { sortOrder: "asc" } } } }); }
export async function createAccordion(input, tenantId) {
  const items = normalizeItems(input.items);
  return prisma.accordion.create({ data: { tenantId, name: String(input.name || "Untitled Accordion").trim(), identifier: idFor(), status: input.status === "ACTIVE" ? "ACTIVE" : "DRAFT", css: input.css || DEFAULT_ACCORDION_CSS, settings: input.settings || { allowMultiple: false, defaultState: "CLOSED", animation: "SMOOTH" }, icons: input.icons || { show: true, type: "PLUS_MINUS", open: "−", closed: "+", position: "RIGHT", size: 18, spacing: 8 }, wrapperClass: input.wrapperClass || null, itemClass: input.itemClass || null, questionClass: input.questionClass || null, answerClass: input.answerClass || null, iconClass: input.iconClass || null, pageId: input.pageId ? Number(input.pageId) : null, items: { create: items } }, include: { items: { orderBy: { sortOrder: "asc" } } } });
}
export async function updateAccordion(id, input, tenantId) {
  const current = await getAccordion(id, tenantId); if (!current) return null;
  const items = normalizeItems(input.items);
  return prisma.$transaction(async (tx) => { if (input.items) await tx.accordionItem.deleteMany({ where: { accordionId: current.id } }); return tx.accordion.update({ where: { id: current.id }, data: { name: input.name === undefined ? undefined : String(input.name).trim(), status: input.status, css: input.css, settings: input.settings, icons: input.icons, wrapperClass: input.wrapperClass, itemClass: input.itemClass, questionClass: input.questionClass, answerClass: input.answerClass, iconClass: input.iconClass, pageId: input.pageId === undefined ? undefined : (input.pageId ? Number(input.pageId) : null), items: input.items ? { create: items } : undefined }, include: { items: { orderBy: { sortOrder: "asc" } } } }); });
}
export async function deleteAccordion(id, tenantId) { return prisma.accordion.deleteMany({ where: { id: Number(id), tenantId } }); }
export async function duplicateAccordion(id, tenantId) { const source = await getAccordion(id, tenantId); if (!source) return null; return createAccordion({ ...source, name: `${source.name} Copy`, items: source.items }, tenantId); }
export async function getActiveAccordions(tenantId) { return prisma.accordion.findMany({ where: { tenantId, status: "ACTIVE" }, include: { items: { orderBy: { sortOrder: "asc" } } } }); }
export function renderAccordion(data) { return data; }
