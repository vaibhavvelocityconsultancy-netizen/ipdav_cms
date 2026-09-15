import { prisma } from "@/src/app/lib/prisma";
const escape = (value = "") =>
  String(value).replace(
    /[&<>\"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#39;",
      })[char],
  );
export async function renderGalleryShortcodes(html) {
  const pattern = /\[gallery\s+([^\]]+)\]/gi;
  const matches = [...html.matchAll(pattern)];
  let output = html;
  for (const match of matches) {
    const attrs = Object.fromEntries(
      [...match[1].matchAll(/(\w+)=[\"']([^\"']+)[\"']/g)].map((item) => [
        item[1],
        item[2],
      ]),
    );
    const gallery = await prisma.gallery.findFirst({
      where: { id: Number(attrs.id) },
      include: {
        images: { include: { media: true }, orderBy: { order: "asc" } },
      },
    });
    output = output.replace(
      match[0],
      gallery
        ? renderGalleryHtml(gallery, Number(attrs.columns) || gallery.columns)
        : "",
    );
  }
  return output;
}

export function renderGalleryHtml(gallery, columns = 3) {
  const id = `gallery-${gallery.id}`;
<<<<<<< HEAD
  const safeColumns = Math.min(6, Math.max(1, Number(columns) || 3));
  const categories = [...new Set(gallery.images.map((image) => String(image.category || "").trim()).filter(Boolean))];
  const filter = gallery.categoriesEnabled && categories.length
    ? `<div class="cms-gallery-filters" role="group" aria-label="Filter gallery categories"><button type="button" class="cms-gallery-filter is-active" data-gallery-filter="all">All</button>${categories.map((category) => `<button type="button" class="cms-gallery-filter" data-gallery-filter="${escape(category)}">${escape(category)}</button>`).join("")}</div>`
    : "";
  const images = gallery.images.map((image, index) => {
    const label = image.caption || image.media.altText || image.media.originalName;
    return `<button type="button" class="cms-gallery-item" data-gallery-index="${index}" data-category="${escape(image.category || "")}" aria-label="View ${escape(label)}"><span class="cms-gallery-image-wrap"><img src="${escape(image.media.url)}" alt="${escape(label)}" loading="lazy" /></span>${image.caption ? `<span class="cms-gallery-caption">${escape(image.caption)}</span>` : ""}${gallery.categoriesEnabled && image.category ? `<span class="cms-gallery-category">${escape(image.category)}</span>` : ""}</button>`;
  }).join("");

  return `<div id="${id}" class="cms-gallery" style="--gallery-columns:${safeColumns}" data-gallery="${id}">${filter}<div class="cms-gallery-grid">${images}</div><div class="cms-gallery-lightbox" hidden role="dialog" aria-modal="true" aria-label="Image preview"><button type="button" class="cms-gallery-close" aria-label="Close image preview">×</button><button type="button" class="cms-gallery-prev" aria-label="Previous image">‹</button><figure class="cms-gallery-preview"><img class="cms-gallery-lightbox-image" alt="" /><figcaption class="cms-gallery-lightbox-caption"></figcaption></figure><button type="button" class="cms-gallery-next" aria-label="Next image">›</button></div><style>.cms-gallery{margin:1.5rem 0}.cms-gallery-grid{display:grid;grid-template-columns:repeat(var(--gallery-columns),minmax(0,1fr));gap:1rem}.cms-gallery-item{display:block;width:100%;border:0;background:transparent;padding:0;text-align:left;cursor:pointer;color:inherit}.cms-gallery-image-wrap{display:block;overflow:hidden;border-radius:.75rem;background:#f3f4f6;aspect-ratio:4/3}.cms-gallery-item img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .3s ease}.cms-gallery-item:hover img,.cms-gallery-item:focus-visible img{transform:scale(1.04)}.cms-gallery-caption{display:block;padding:.65rem .15rem .1rem;font-size:.95rem}.cms-gallery-category{display:block;padding:.25rem .15rem;color:#6b7280;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em}.cms-gallery-filters{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}.cms-gallery-filter{border:1px solid #d1d5db;border-radius:999px;background:transparent;padding:.45rem .85rem;cursor:pointer;font:inherit}.cms-gallery-filter.is-active,.cms-gallery-filter:hover{background:#111827;color:#fff;border-color:#111827}.cms-gallery-lightbox{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgb(0 0 0/.92);padding:3rem}.cms-gallery-lightbox[hidden]{display:none}.cms-gallery-preview{max-width:min(90vw,1100px);max-height:90vh;margin:0;text-align:center}.cms-gallery-lightbox-image{display:block;max-width:100%;max-height:78vh;object-fit:contain;border-radius:.5rem}.cms-gallery-lightbox-caption{margin-top:.75rem;color:#fff}.cms-gallery-close,.cms-gallery-prev,.cms-gallery-next{position:absolute;border:0;background:transparent;color:#fff;cursor:pointer;font-size:3rem;line-height:1;padding:.5rem}.cms-gallery-close{top:1rem;right:1.25rem}.cms-gallery-prev{left:1rem}.cms-gallery-next{right:1rem}@media(max-width:900px){.cms-gallery-grid{grid-template-columns:repeat(min(3,var(--gallery-columns)),minmax(0,1fr))}}@media(max-width:640px){.cms-gallery-grid{grid-template-columns:repeat(min(2,var(--gallery-columns)),minmax(0,1fr));gap:.65rem}.cms-gallery-lightbox{padding:2rem .75rem}.cms-gallery-prev{left:0}.cms-gallery-next{right:0}}</style><script>(()=>{const root=document.getElementById('${id}');if(!root||root.dataset.ready)return;root.dataset.ready='1';const items=[...root.querySelectorAll('.cms-gallery-item')],box=root.querySelector('.cms-gallery-lightbox'),image=root.querySelector('.cms-gallery-lightbox-image'),caption=root.querySelector('.cms-gallery-lightbox-caption');let visible=items, index=0;const show=()=>{const source=visible[index]?.querySelector('img');if(!source)return;image.src=source.src;image.alt=source.alt;caption.textContent=visible[index].querySelector('.cms-gallery-caption')?.textContent||'';box.hidden=false;document.body.style.overflow='hidden'};const close=()=>{box.hidden=true;document.body.style.overflow=''};const move=(step)=>{if(!visible.length)return;index=(index+step+visible.length)%visible.length;show()};items.forEach((item)=>item.addEventListener('click',()=>{visible=items.filter((entry)=>!entry.hidden);index=visible.indexOf(item);show()}));root.querySelector('.cms-gallery-close').addEventListener('click',close);root.querySelector('.cms-gallery-prev').addEventListener('click',()=>move(-1));root.querySelector('.cms-gallery-next').addEventListener('click',()=>move(1));box.addEventListener('click',(event)=>{if(event.target===box)close()});document.addEventListener('keydown',(event)=>{if(box.hidden)return;if(event.key==='Escape')close();if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1)});root.querySelectorAll('.cms-gallery-filter').forEach((button)=>button.addEventListener('click',()=>{const value=button.dataset.galleryFilter;root.querySelectorAll('.cms-gallery-filter').forEach((entry)=>entry.classList.toggle('is-active',entry===button));items.forEach((item)=>{item.hidden=value!=='all'&&item.dataset.category!==value});visible=items.filter((item)=>!item.hidden);index=0}))})();</script></div>`;
=======
  const images = gallery.images
    .map(
      (image) =>
        `<button type="button" class="cms-gallery-item" data-gallery-index="${image.order}" aria-label="View ${escape(image.caption || image.media.altText || image.media.originalName)}"><img src="${escape(image.media.url)}" alt="${escape(image.caption || image.media.altText || image.media.originalName)}" loading="lazy" />${image.caption ? `<span>${escape(image.caption)}</span>` : ""}</button>`,
    )
    .join("");
  return `<div id="${id}" class="cms-gallery" style="--gallery-columns:${Math.min(6, Math.max(1, columns))}" data-gallery="${id}"><div class="cms-gallery-grid">${images}</div><div class="cms-gallery-lightbox" hidden role="dialog" aria-modal="true"><button class="cms-gallery-close" aria-label="Close">×</button><button class="cms-gallery-prev" aria-label="Previous">‹</button><img class="cms-gallery-lightbox-image" alt="" /><button class="cms-gallery-next" aria-label="Next">›</button></div><style>.cms-gallery-grid{display:grid;grid-template-columns:repeat(var(--gallery-columns),minmax(0,1fr));gap:1rem}.cms-gallery-item{border:0;background:transparent;padding:0;text-align:left;cursor:pointer}.cms-gallery-item img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:.5rem}.cms-gallery-item span{display:block;padding:.5rem 0;font-size:.875rem}.cms-gallery-lightbox{position:fixed;inset:0;z-index:9999;background:rgb(0 0 0/.9);display:flex;align-items:center;justify-content:center;gap:2rem}.cms-gallery-lightbox[hidden]{display:none}.cms-gallery-lightbox-image{max-width:80vw;max-height:85vh;object-fit:contain}.cms-gallery-close,.cms-gallery-prev,.cms-gallery-next{position:absolute;color:white;background:transparent;border:0;font-size:3rem;cursor:pointer}.cms-gallery-close{top:1rem;right:2rem}.cms-gallery-prev{left:2rem}.cms-gallery-next{right:2rem}@media(max-width:640px){.cms-gallery-grid{grid-template-columns:repeat(min(2,var(--gallery-columns)),minmax(0,1fr))}}</style><script>(()=>{const root=document.getElementById('${id}');if(!root||root.dataset.ready)return;root.dataset.ready='1';const items=[...root.querySelectorAll('.cms-gallery-item')],box=root.querySelector('.cms-gallery-lightbox'),image=root.querySelector('.cms-gallery-lightbox-image');let index=0;const show=()=>{const source=items[index]?.querySelector('img');if(source){image.src=source.src;image.alt=source.alt}box.hidden=false};items.forEach((item,i)=>item.addEventListener('click',()=>{index=i;show()}));root.querySelector('.cms-gallery-close').onclick=()=>box.hidden=true;root.querySelector('.cms-gallery-prev').onclick=()=>{index=(index-1+items.length)%items.length;show()};root.querySelector('.cms-gallery-next').onclick=()=>{index=(index+1)%items.length;show()};document.addEventListener('keydown',e=>{if(box.hidden)return;if(e.key==='Escape')box.hidden=true;if(e.key==='ArrowLeft')root.querySelector('.cms-gallery-prev').click();if(e.key==='ArrowRight')root.querySelector('.cms-gallery-next').click()})})();</script></div>`;
>>>>>>> test-install-seo
}
