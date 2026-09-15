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
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] ?? char,
  );

export async function renderGalleryShortcodes(html: string): Promise<string> {
  const pattern = /\[gallery\s+([^\]]+)\]/gi;
  let output = html;
  for (const match of [...html.matchAll(pattern)]) {
    const attrs = Object.fromEntries(
      [...match[1].matchAll(/(\w+)=(["'])([^"']+)\2/g)].map((item) => [
        item[1],
        item[3],
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
        ? renderGalleryHtml(
            gallery as Gallery,
            Number(attrs.columns) || gallery.columns,
          )
        : "",
    );
  }
  return output;
}

export function renderGalleryHtml(gallery: Gallery, columns = 3): string {
  const id = `gallery-${gallery.id}`;
  const safeColumns = Math.min(6, Math.max(1, Number(columns) || 3));
  const categories = [
    ...new Set(
      gallery.images
        .map((image) => image.category?.trim())
        .filter(Boolean) as string[],
    ),
  ];
  const total = gallery.images.length;

  const filters =
    gallery.categoriesEnabled && categories.length
      ? `<nav class="cms-gallery-filters" aria-label="Filter gallery categories">
        <button type="button" class="cms-gallery-filter is-active" data-gallery-filter="all">All</button>
        ${categories.map((category) => `<button type="button" class="cms-gallery-filter" data-gallery-filter="${escape(category)}">${escape(category)}</button>`).join("")}
      </nav>`
      : "";

  const images = gallery.images
    .map((image, index) => {
      const label =
        image.caption ||
        image.media.altText ||
        image.media.originalName ||
        "Gallery image";
      return `<figure class="cms-gallery-item" data-category="${escape(image.category || "")}">
      <button type="button" class="cms-gallery-frame" data-gallery-index="${index}" aria-label="View ${escape(label)}">
        <img src="${escape(image.media.url)}" alt="${escape(label)}" loading="lazy">
      </button>
      ${image.caption ? `<figcaption class="cms-gallery-caption">${escape(image.caption)}</figcaption>` : ""}
    </figure>`;
    })
    .join("");

  return `<div id="${id}" class="cms-gallery" style="--gallery-columns:${safeColumns}" data-gallery="${id}">
    ${filters}
    <div class="cms-gallery-grid">${images}</div>
    <div class="cms-gallery-lightbox" hidden role="dialog" aria-modal="true" aria-label="Image preview">
      <div class="cms-gallery-lightbox-bar">
        <span class="cms-gallery-count"><span data-gallery-current>1</span> / ${total}</span>
        <button type="button" class="cms-gallery-close" aria-label="Close image preview">Close</button>
      </div>
      <div class="cms-gallery-lightbox-body">
        <button type="button" class="cms-gallery-nav cms-gallery-prev" aria-label="Previous image">‹</button>
        <figure>
          <img class="cms-gallery-lightbox-image" alt="">
          <figcaption class="cms-gallery-lightbox-caption"></figcaption>
        </figure>
        <button type="button" class="cms-gallery-nav cms-gallery-next" aria-label="Next image">›</button>
      </div>
    </div>
    <style>
      .cms-gallery{
        --gallery-ink:#1a1a18;
        --gallery-muted:#6b6a66;
        --gallery-border:#dcdad4;
        --gallery-surface:#f6f5f2;
        margin:2rem 0;
        color:var(--gallery-ink);
      }
      .cms-gallery-filters{
        display:flex;
        flex-wrap:wrap;
        align-items:center;
        gap:0;
        margin-bottom:1.5rem;
        border-bottom:1px solid var(--gallery-border);
        padding-bottom:.75rem;
      }
      .cms-gallery-filter{
        border:0;
        background:transparent;
        color:var(--gallery-muted);
        font:inherit;
        font-size:.9rem;
        cursor:pointer;
        padding:.25rem .75rem;
        border-left:1px solid var(--gallery-border);
        line-height:1;
      }
      .cms-gallery-filter:first-child{border-left:0;padding-left:0}
      .cms-gallery-filter:hover{color:var(--gallery-ink)}
      .cms-gallery-filter.is-active{color:var(--gallery-ink);font-weight:600;text-decoration:underline;text-underline-offset:.3em}
      .cms-gallery-grid{
        display:grid;
        grid-template-columns:repeat(var(--gallery-columns),minmax(0,1fr));
        gap:1.75rem 1.25rem;
      }
      .cms-gallery-item{margin:0}
      .cms-gallery-frame{
        display:block;
        width:100%;
        border:1px solid var(--gallery-border);
        background:var(--gallery-surface);
        padding:.4rem;
        cursor:zoom-in;
      }
      .cms-gallery-frame img{
        display:block;
        width:100%;
        aspect-ratio:4/5;
        object-fit:cover;
        transition:transform .35s ease;
      }
      .cms-gallery-frame:hover img,
      .cms-gallery-frame:focus-visible img{transform:scale(1.03)}
      .cms-gallery-frame:focus-visible{outline:2px solid var(--gallery-ink);outline-offset:2px}
      .cms-gallery-caption{
        margin-top:.6rem;
        padding-top:.6rem;
        border-top:1px solid var(--gallery-border);
        font-size:.85rem;
        color:var(--gallery-muted);
      }
      .cms-gallery-lightbox{
        position:fixed;
        inset:0;
        z-index:9999;
        display:flex;
        flex-direction:column;
        background:#0e0e0d;
      }
      .cms-gallery-lightbox[hidden]{display:none}
      .cms-gallery-lightbox-bar{
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:1rem 1.25rem;
        color:#e9e8e4;
        font-size:.85rem;
      }
      .cms-gallery-close{
        border:1px solid rgb(255 255 255/.3);
        background:transparent;
        color:inherit;
        font:inherit;
        padding:.4rem .9rem;
        cursor:pointer;
      }
      .cms-gallery-close:hover{border-color:rgb(255 255 255/.7)}
      .cms-gallery-lightbox-body{
        flex:1;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:1.5rem;
        padding:0 1.5rem 2rem;
        min-height:0;
      }
      .cms-gallery-lightbox-body figure{margin:0;min-width:0;text-align:center}
      .cms-gallery-lightbox-image{
        display:block;
        max-width:min(82vw,1100px);
        max-height:72vh;
        object-fit:contain;
        margin:0 auto;
      }
      .cms-gallery-lightbox-caption{color:#c9c8c3;margin-top:1rem;font-size:.9rem}
      .cms-gallery-nav{
        flex:0 0 auto;
        border:0;
        background:transparent;
        color:#e9e8e4;
        font-size:2.25rem;
        line-height:1;
        cursor:pointer;
        padding:.25rem .5rem;
      }
      .cms-gallery-nav:hover{color:#fff}
      @media(prefers-reduced-motion:reduce){
        .cms-gallery-frame img{transition:none}
      }
      @media(max-width:640px){
        .cms-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25rem .75rem}
        .cms-gallery-lightbox-body{padding:0 .5rem 1.5rem;gap:.5rem}
        .cms-gallery-nav{font-size:1.75rem}
      }
    </style>
  </div>`;
}
