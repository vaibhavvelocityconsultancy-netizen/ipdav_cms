import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const RESPONSIVE = ["sm", "md", "lg", "xl", "2xl"];
const INTERACTIVE = [
  "hover",
  "focus",
  "active",
  "disabled",
  "group-hover",
  "focus-within",
];
const ALL_VARIANTS = [...RESPONSIVE, ...INTERACTIVE];

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/services/**/*.{ts,tsx}",
    "./src/ui/**/*.{ts,tsx}",
    "./src/tailwind-cms-content.html",
  ],
  safelist: [
    // Layout
    "container",
    "block",
    "inline-block",
    "inline",
    "flex",
    "inline-flex",
    "grid",
    "inline-grid",
    "hidden",
    "contents",

    // Flex
    "flex-row",
    "flex-row-reverse",
    "flex-col",
    "flex-col-reverse",
    "flex-wrap",
    "flex-nowrap",
    "flex-1",
    "flex-auto",
    "flex-none",

    "items-start",
    "items-end",
    "items-center",
    "items-baseline",
    "items-stretch",

    "justify-start",
    "justify-end",
    "justify-center",
    "justify-between",
    "justify-around",
    "justify-evenly",

    // Grid
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "grid-cols-5",
    "grid-cols-6",
    "grid-cols-12",

    // Spacing
    {
      pattern: /^(p|px|py|pt|pb|pl|pr)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32)$/,
      variants: ["sm", "md", "lg"],
    },

    {
      pattern:
        /^-?(m|mx|my|mt|mb|ml|mr)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|auto)$/,
      variants: ["sm", "md", "lg"],
    },

    // Gap
    {
      pattern: /^gap-(0|1|2|3|4|5|6|8|10|12|16|20|24)$/,
      variants: ["sm", "md", "lg"],
    },

    {
      pattern: /^gap-(x|y)-(0|1|2|3|4|5|6|8|10|12|16|20|24)$/,
      variants: ["sm", "md", "lg"],
    },

    // Width / Height
    {
      pattern:
        /^(w|h)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64|72|80|96|auto|full|screen|min|max|fit)$/,
      variants: ["sm", "md", "lg"],
    },

    // Max/min width
    {
      pattern:
        /^(max-w)-(none|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|screen|prose)$/,
      variants: ["sm", "md", "lg"],
    },

    // Typography
    {
      pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
      variants: ["sm", "md", "lg"],
    },

    {
      pattern:
        /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    },

    {
      pattern:
        /^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/,
    },

    {
      pattern: /^text-(left|center|right|justify)$/,
      variants: ["sm", "md", "lg"],
    },

    "italic",
    "not-italic",
    "uppercase",
    "lowercase",
    "capitalize",
    "normal-case",
    "underline",
    "line-through",
    "no-underline",
    "truncate",
    "whitespace-normal",
    "whitespace-nowrap",
    "whitespace-pre",
    "whitespace-pre-line",
    "whitespace-pre-wrap",
    "break-normal",
    "break-words",
    "break-all",

    // Colors
    {
      pattern: /^(bg|text|border)-(white|black|transparent|current)$/,
      variants: ["sm", "md", "lg", "hover", "focus"],
    },

    {
      pattern:
        /^(bg|text|border)-(red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|pink|rose)-(500|600|700)$/,
      variants: ["sm", "md", "lg", "hover", "dark"],
    },

    // Border
    {
      pattern: /^border(-(0|2|4|8|t|b|l|r|x|y))?$/,
      variants: ["sm", "md", "lg"],
    },

    {
      pattern: /^rounded(-(none|sm|md|lg|xl|2xl|3xl|full))?$/,
      variants: ["sm", "md", "lg"],
    },

    // Position
    "relative",
    "absolute",
    "fixed",
    "sticky",
    "static",

    {
      pattern:
        /^(top|bottom|left|right|inset)-(0|1|2|4|6|8|10|12|16|20|24|auto|1\/2|full)$/,
      variants: ["sm", "md", "lg"],
    },

    // Z-index
    {
      pattern: /^z-(0|10|20|30|40|50|auto)$/,
    },

    // Object
    "object-cover",
    "object-contain",
    "object-fill",
    "object-center",

    // Overflow
    "overflow-hidden",
    "overflow-visible",
    "overflow-auto",
    "overflow-scroll",
    "overflow-x-auto",
    "overflow-y-auto",
    "overflow-x-hidden",
    "overflow-y-hidden",

    // Cursor / pointer
    "cursor-pointer",
    "cursor-default",
    "cursor-not-allowed",
    "pointer-events-none",
    "pointer-events-auto",

    // Opacity
    {
      pattern: /^opacity-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)$/,
      variants: ["sm", "md", "lg", "hover"],
    },

    // Shadow
    {
      pattern: /^shadow(-(sm|md|lg|xl|2xl|inner|none))?$/,
      variants: ["hover"],
    },

    // Transitions
    {
      pattern: /^transition(-(none|all|colors|opacity|shadow|transform))?$/,
    },

    {
      pattern: /^duration-(75|100|150|200|300|500|700|1000)$/,
    },

    // Aspect ratio
    "aspect-auto",
    "aspect-square",
    "aspect-video",

    // Background
    "bg-cover",
    "bg-contain",
    "bg-auto",
    "bg-center",
    "bg-top",
    "bg-bottom",
    "bg-left",
    "bg-right",
    "bg-no-repeat",

    // Responsive display
    {
      pattern: /^(block|inline-block|inline|flex|inline-flex|grid|hidden)$/,
      variants: ["sm", "md", "lg"],
    },
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        success: "var(--success)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      height: {
        125: "31.25rem",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
