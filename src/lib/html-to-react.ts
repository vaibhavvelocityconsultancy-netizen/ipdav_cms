import "server-only";

import sanitizeHtml from "sanitize-html";
import * as cheerio from "cheerio";
import HTMLtoJSX from "htmltojsx";
import { parse } from "@babel/parser";

const converter = new HTMLtoJSX({
  createClass: false,
});

// ── Types ─────────────────────────────────────────────────

export interface ValidationIssue {
  type: "error" | "warning" | "info" | "success" | "critical";
  message: string;
}

export interface TransformResult {
  success: boolean;
  sanitizedHtml: string;
  jsxCode: string;
  errors: string[];
  warnings: ValidationIssue[];
}

// ── Supported Safe Handlers ───────────────────────────────

const supportedActions: Record<
  string,
  {
    handlerName: string;
    reactEvent: string;
    inject: string;
  }
> = {
  "submit-form": {
    handlerName: "handleSubmit",

    reactEvent: "onSubmit",

    inject: `
const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  const formData = new FormData(
    e.currentTarget
  );

  const values = Object.fromEntries(
    formData.entries()
  );

  console.log("Form values:", values);

  // TODO:
  // Add API logic here
};
`,
  },

  "open-modal": {
    handlerName: "openModal",

    reactEvent: "onClick",

    inject: `
const openModal = () => {
  console.log("Open modal");

  // TODO:
  // Add modal logic
};
`,
  },

  "toggle-accordion": {
    handlerName: "toggleAccordion",

    reactEvent: "onClick",

    inject: `
const toggleAccordion = () => {
  console.log("Toggle accordion");

  // TODO:
  // Add accordion logic
};
`,
  },
};
// ── Step 1: Sanitize ──────────────────────────────────────

function sanitize(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: false,
    allowedAttributes: false,
    disallowedTagsMode: "discard",
  });
}

// ── Step 2: Normalize ─────────────────────────────────────

function normalize(html: string): {
  html: string;
  warnings: ValidationIssue[];
  usedHandlers: Set<string>;
} {
  const warnings: ValidationIssue[] = [];

  const usedHandlers = new Set<string>();

  const $ = cheerio.load(html, {
    decodeEntities: false,
  });

  // ── Add missing alt to images ──────────────────────────

  $("img:not([alt])").each((_, el) => {
    $(el).attr("alt", "");

    warnings.push({
      type: "info",
      message: `Added missing alt="" to <img src="${$(el).attr("src") ?? ""}">`,
    });
  });

  // ── Handle Inline Events ───────────────────────────────

  $("*").each((_, el) => {
    const attribs = (el as cheerio.Element).attribs ?? {};

    Object.keys(attribs).forEach((attr) => {
      if (!attr.startsWith("on")) return;

      const rawValue = attribs[attr];

      // Example:
      // handleSubmit(event)
      // openModal()

      const match = rawValue.match(/^([a-zA-Z0-9_]+)/);

      const functionName = match?.[1];

      // ── Safe Supported Handler ─────────────────────────

      if (functionName && supportedActions[functionName]) {
        const config = supportedActions[functionName];

        usedHandlers.add(functionName);

        // Remove original inline event
        $(el).removeAttr(attr);

        // Add React-style event placeholder
        $(el).attr(config.reactEvent, `{${functionName}}`);

        warnings.push({
          type: "info",
          message: `Converted inline handler "${functionName}" → React ${config.reactEvent}`,
        });
      } else {
        // ── Unsafe / Unsupported JS ──────────────────────

        $(el).removeAttr(attr);

        warnings.push({
          type: "warning",
          message: `Removed unsupported inline event handler: ${attr}`,
        });
      }
    });
  });

  // ── Remove Script Tags ─────────────────────────────────

  const scriptCount = $("script").length;

  if (scriptCount > 0) {
    $("script").remove();

    warnings.push({
      type: "warning",
      message: `Removed ${scriptCount} <script> tag(s)`,
    });
  }

  // ── Handle data-action ────────────────────────────────

  $("*").each((_, el) => {
    const action = $(el).attr("data-action");

    if (!action) return;

    const config = supportedActions[action];

    // Unsupported action
    if (!config) {
      warnings.push({
        type: "warning",

        message: `Unsupported action: ${action}`,
      });

      return;
    }

    // Remove data-action attribute
    $(el).removeAttr("data-action");

    // Add React event
    $(el).attr(config.reactEvent, `{${config.handlerName}}`);

    usedHandlers.add(action);

    warnings.push({
      type: "info",

      message: `Converted action "${action}" → React ${config.reactEvent}`,
    });
  });
  // ── Warn Duplicate IDs ─────────────────────────────────

  const idMap: Record<string, number> = {};

  $("[id]").each((_, el) => {
    const id = $(el).attr("id") ?? "";

    idMap[id] = (idMap[id] ?? 0) + 1;
  });

  Object.entries(idMap).forEach(([id, count]) => {
    if (count > 1) {
      warnings.push({
        type: "warning",
        message: `Duplicate ID "${id}" appears ${count} times`,
      });
    }
  });

  return {
    html: $.html(),
    warnings,
    usedHandlers,
  };
}

// ── Step 3: Convert HTML → JSX ────────────────────────────

function convertToJsx(html: string): string {
  return converter.convert(html);
}

// ── Step 4: Wrap in TSX Component ─────────────────────────

function wrapInComponent(
  jsx: string,
  componentName: string,
  usedHandlers: Set<string>,
): string {
  const injectedFunctions = [...usedHandlers]
    .map((name) => supportedActions[name]?.inject)
    .join("\n");

  return `"use client";

export default function ${componentName}() {

${injectedFunctions}

  return (
    <>
      ${jsx.trim().split("\n").join("\n      ")}
    </>
  );
}
`;
}

// ── Step 5: Validate JSX ──────────────────────────────────

function validateJsx(code: string): {
  errors: string[];
  warnings: ValidationIssue[];
} {
  const errors: string[] = [];

  const warnings: ValidationIssue[] = [];

  try {
    parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
  } catch (err: any) {
    errors.push(`JSX parse error: ${err.message}`);
  }

  // ── Detect invalid class= ──────────────────────────────

  if (/\sclass="/.test(code)) {
    warnings.push({
      type: "warning",
      message: "Found class= not converted to className=",
    });
  }

  // ── Detect invalid for= ────────────────────────────────

  if (/\sfor="/.test(code)) {
    warnings.push({
      type: "warning",
      message: "Found for= not converted to htmlFor=",
    });
  }

  // ── Detect style strings ───────────────────────────────

  if (/style="[^"]*"/.test(code)) {
    warnings.push({
      type: "warning",
      message: "Found style= string — should be style={{}} object",
    });
  }

  return {
    errors,
    warnings,
  };
}

// ── Slug → ComponentName ──────────────────────────────────

export function slugToComponentName(slug: string): string {
  return (
    slug
      .split(/[-_\s]/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("") + "Page"
  );
}

// ── Main Pipeline ─────────────────────────────────────────

export function transformHtmlToReact(
  inputHtml: string,
  componentName: string = "GeneratedPage",
): TransformResult {

  // 1. Sanitize
  const sanitizedHtml = sanitize(inputHtml);

  // 2. Normalize
  const {
    html: normalizedHtml,
    warnings: normalizeWarnings,
    usedHandlers,
  } = normalize(sanitizedHtml);

  // 3. Convert HTML → JSX
  const jsx = convertToJsx(normalizedHtml);

  // Fix React event placeholders
  const fixedJsx = jsx.replace(
    /=\"\{([a-zA-Z0-9_]+)\}\"/g,
    "={$1}",
  );

  // Remove invalid selected attribute
  const finalJsx = fixedJsx.replace(
    /\sselected/g,
    "",
  );

  // 4. Wrap in Component
  const jsxCode = wrapInComponent(
    finalJsx,
    componentName,
    usedHandlers,
  );

  // 5. Validate JSX
  const {
    errors,
    warnings: validateWarnings,
  } = validateJsx(jsxCode);

  // Combine all warnings
  const allWarnings = [
    ...normalizeWarnings,
    ...validateWarnings,
  ];

  // Detect blocking warnings
  const hasCriticalWarnings =
    allWarnings.some(
      (w) => w.type === "critical",
    );

  return {

    // Block success if:
    // - JSX errors exist
    // - critical warnings exist
    success:
      errors.length === 0 &&
      !hasCriticalWarnings,

    sanitizedHtml: normalizedHtml,

    jsxCode,

    errors,

    warnings: allWarnings,
  };
}