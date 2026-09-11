"use client";
import { useEffect, useState } from "react";

type Item = { id: number; question: string; answer: string; customClass?: string | null };
type Accordion = { identifier: string; css: string; settings?: any; icons?: any; wrapperClass?: string | null; itemClass?: string | null; questionClass?: string | null; answerClass?: string | null; iconClass?: string | null; items: Item[] };

function Instance({ data }: { data: Accordion }) {
  const settings = { allowMultiple: false, defaultState: "CLOSED", animation: "SMOOTH", ...data.settings };
  const icons = { show: true, type: "PLUS_MINUS", open: "−", closed: "+", position: "RIGHT", size: 18, spacing: 8, ...data.icons };
  const initial = settings.defaultState === "ALL_OPEN" ? data.items.map((item) => item.id) : settings.defaultState === "FIRST_OPEN" ? [data.items[0]?.id] : [];
  const [open, setOpen] = useState<number[]>(initial.filter(Boolean));
  const toggle = (id: number) => setOpen((current) => current.includes(id) ? current.filter((value) => value !== id) : settings.allowMultiple ? [...current, id] : [id]);
  return <><style dangerouslySetInnerHTML={{ __html: data.css || "" }} /><div className={`cms-accordion ${data.identifier} ${data.wrapperClass || ""}`} data-accordion={data.identifier}>{data.items.map((item) => { const isOpen = open.includes(item.id); return <div className={`cms-accordion-item ${data.itemClass || ""} ${item.customClass || ""}`} key={item.id}><button type="button" className={`cms-accordion-question ${data.questionClass || ""}`} aria-expanded={isOpen} aria-controls={`${data.identifier}-answer-${item.id}`} onClick={() => toggle(item.id)}><span dangerouslySetInnerHTML={{ __html: item.question }} />{icons.show && <span aria-hidden="true" className={`cms-accordion-icon ${data.iconClass || ""}`} style={{ fontSize: `${icons.size}px`, marginLeft: `${icons.spacing}px`, order: icons.position === "LEFT" ? -1 : 1 }}>{isOpen ? icons.open : icons.closed}</span>}</button><div id={`${data.identifier}-answer-${item.id}`} role="region" className={`cms-accordion-answer ${data.answerClass || ""} ${settings.animation !== "NONE" ? `cms-accordion-${String(settings.animation).toLowerCase()}` : ""}`} hidden={!isOpen} dangerouslySetInnerHTML={{ __html: item.answer }} /></div>})}</div></>;
}

export default function AccordionRuntime() {
  const [data, setData] = useState<Accordion[]>([]);
  useEffect(() => { const load = async () => { const response = await fetch("/api/public/accordions"); const json = await response.json(); setData(json.data || []); }; load(); }, []);
  useEffect(() => { if (!data.length) return; document.querySelectorAll<HTMLElement>("[class*='accordion-']").forEach((node) => { const match = Array.from(node.classList).find((name) => /^accordion-[a-f0-9]{6}$/.test(name)); const item = data.find((entry) => entry.identifier === match); if (item && !node.querySelector("[data-accordion]") && node instanceof HTMLElement) { node.replaceChildren(); node.appendChild(Object.assign(document.createElement("div"), { className: "cms-accordion-placeholder" })); } }); }, [data]);
  return <>{data.map((item) => <div key={item.identifier} className="cms-accordion-runtime"><Instance data={item} /></div>)}</>;
}
