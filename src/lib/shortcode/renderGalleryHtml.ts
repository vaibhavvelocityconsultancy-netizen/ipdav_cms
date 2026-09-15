import { prisma } from "@/src/app/lib/prisma";

type GalleryImage = {
  category?: string | null;
  caption?: string | null;
  media: { url: string; altText?: string | null; originalName?: string | null };
};

type Gallery = {
  id: number;
  columns: number;
  categoriesEnabled?: boolean | null;
  images: GalleryImage[];
};

const escape = (value: unknown = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char] ?? char));

export async function renderGalleryShortcodes(html: string): Promise<string> {
  const pattern = /\[gallery\s+([^\]]+)\]/gi;
  let output = html;
  for (const match of [...html.matchAll(pattern)]) {
    const attrs = Object.fromEntries(
      [...match[1].matchAll(/(\w+)=(["'])([^"']+)\2/g)].map((item) => [item[1], item[3]]),
    );
    const gallery = await prisma.gallery.findFirst({
      where: { id: Number(attrs.id) },
      include: { images: { include: { media: true }, orderBy: { order: "asc" } } },
    });
    output = output.replace(match[0], gallery ? renderGalleryHtml(gallery as Gallery, Number(attrs.columns) || gallery.columns) : "");
  }
  return output;
}

export function renderGalleryHtml(gallery: Gallery, columns = 3): string {
  const id = `gallery-${gallery.id}`;
  const safeColumns = Math.min(6, Math.max(1, Number(columns) || 3));
  const categories = [...new Set(gallery.images.map((image) => image.category?.trim()).filter(Boolean) as string[])];
  const filters = gallery.categoriesEnabled && categories.length
    ? `<div class="cms-gallery-filters" role="group" aria-label="Filter gallery categories"><button type="button" class="cms-gallery-filter is-active" data-gallery-filter="all">All</button>${categories.map((category) => `<button type="button" class="cms-gallery-filter" data-gallery-filter="${escape(category)}">${escape(category)}</button>`).join("")}</div>`
    : "";
  const images = gallery.images.map((image, index) => {
    const label = image.caption || image.media.altText || image.media.originalName || "Gallery image";
    return `<button type="button" class="cms-gallery-item" data-gallery-index="${index}" data-category="${escape(image.category || "")}" aria-label="View ${escape(label)}"><span class="cms-gallery-image-wrap"><img src="${escape(image.media.url)}" alt="${escape(label)}" loading="lazy"></span>${image.caption ? `<span class="cms-gallery-caption">${escape(image.caption)}</span>` : ""}</button>`;
  }).join("");
  return `<div id="${id}" class="cms-gallery" style="--gallery-columns:${safeColumns}" data-gallery="${id}">${filters}<div class="cms-gallery-grid">${images}</div><div class="cms-gallery-lightbox" hidden role="dialog" aria-modal="true" aria-label="Image preview"><button type="button" class="cms-gallery-close" aria-label="Close image preview">×</button><button type="button" class="cms-gallery-prev" aria-label="Previous image">‹</button><figure><img class="cms-gallery-lightbox-image" alt=""><figcaption class="cms-gallery-lightbox-caption"></figcaption></figure><button type="button" class="cms-gallery-next" aria-label="Next image">›</button></div><style>.cms-gallery{margin:1.5rem 0}.cms-gallery-grid{display:grid;grid-template-columns:repeat(var(--gallery-columns),minmax(0,1fr));gap:1rem}.cms-gallery-item{display:block;width:100%;border:0;background:transparent;padding:0;text-align:left;cursor:pointer;color:inherit}.cms-gallery-image-wrap{display:block;overflow:hidden;border-radius:.75rem;background:#f3f4f6;aspect-ratio:4/3}.cms-gallery-item img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .3s ease}.cms-gallery-item:hover img,.cms-gallery-item:focus-visible img{transform:scale(1.04)}.cms-gallery-caption{display:block;padding:.65rem .15rem;font-size:.95rem}.cms-gallery-filters{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}.cms-gallery-filter{border:1px solid #d1d5db;border-radius:999px;background:transparent;padding:.45rem .85rem;cursor:pointer;font:inherit}.cms-gallery-filter.is-active,.cms-gallery-filter:hover{background:#111827;color:#fff}.cms-gallery-lightbox{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;gap:1rem;background:rgb(0 0 0/.92);padding:2rem}.cms-gallery-lightbox[hidden]{display:none}.cms-gallery-lightbox figure{margin:0;text-align:center}.cms-gallery-lightbox-image{display:block;max-width:min(85vw,1100px);max-height:82vh;object-fit:contain}.cms-gallery-lightbox-caption{color:#fff;margin-top:.75rem}.cms-gallery-close,.cms-gallery-prev,.cms-gallery-next{border:0;background:rgb(255 255 255/.15);color:#fff;border-radius:999px;cursor:pointer;font-size:2rem;line-height:1;padding:.25rem .7rem}.cms-gallery-close{position:absolute;right:1rem;top:1rem}.cms-gallery-prev,.cms-gallery-next{flex:0 0 auto}@media(max-width:640px){.cms-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}.cms-gallery-lightbox{padding:1rem}.cms-gallery-prev,.cms-gallery-next{position:absolute;bottom:2rem}.cms-gallery-prev{left:1rem}.cms-gallery-next{right:1rem}}</style><script>(function(){const root=document.getElementById('${id}');if(!root||root.dataset.ready)return;root.dataset.ready='1';const cards=[...root.querySelectorAll('.cms-gallery-item')],box=root.querySelector('.cms-gallery-lightbox'),preview=root.querySelector('.cms-gallery-lightbox-image'),caption=root.querySelector('.cms-gallery-lightbox-caption');let index=0;const visible=()=>cards.filter((card)=>!card.hidden);const show=(next)=>{const list=visible();if(!list.length)return;index=(next+list.length)%list.length;const card=list[index],img=card.querySelector('img');preview.src=img.src;preview.alt=img.alt;caption.textContent=card.querySelector('.cms-gallery-caption')?.textContent||'';box.hidden=false;document.body.style.overflow='hidden'};const close=()=>{box.hidden=true;document.body.style.overflow=''};cards.forEach((card)=>card.addEventListener('click',()=>show(visible().indexOf(card))));root.querySelector('.cms-gallery-close').addEventListener('click',close);root.querySelector('.cms-gallery-prev').addEventListener('click',()=>show(index-1));root.querySelector('.cms-gallery-next').addEventListener('click',()=>show(index+1));box.addEventListener('click',(event)=>{if(event.target===box)close()});document.addEventListener('keydown',(event)=>{if(box.hidden)return;if(event.key==='Escape')close();if(event.key==='ArrowLeft')show(index-1);if(event.key==='ArrowRight')show(index+1)});root.querySelectorAll('.cms-gallery-filter').forEach((filter)=>filter.addEventListener('click',()=>{root.querySelectorAll('.cms-gallery-filter').forEach((item)=>item.classList.remove('is-active'));filter.classList.add('is-active');const category=filter.dataset.galleryFilter;cards.forEach((card)=>{card.hidden=category!=='all'&&card.dataset.category!==category})}))})()</script></div>`;
}
