export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Layout spacing constants
export const LAYOUT = {
  SIDEBAR_WIDTH: 256,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  HEADER_HEIGHT: 64,
  PAGE_PADDING: {
    mobile: 16,
    desktop: 24,
  },
  CONTENT_MAX_WIDTH: 1400,
} as const;

// Public page layout constants
export const PUBLIC_LAYOUT = {
  PAGE_PADDING_Y: {
    mobile: 'py-12',
    tablet: 'md:py-16',
    desktop: 'lg:py-20',
  },
  SECTION_SPACING: {
    tight: 'space-y-8',
    default: 'space-y-12',
    loose: 'space-y-16',
  },
  MAX_WIDTH: {
    narrow: 'max-w-3xl',    // About, single-column content
    default: 'max-w-5xl',   // Most pages
    wide: 'max-w-6xl',      // Projects, galleries
    full: 'max-w-7xl',      // Homepage, wide layouts
  },
} as const;

// Admin manager layout constants
export const ADMIN_MANAGER = {
  HEADER_SPACING: 'space-y-4',
  CONTENT_SPACING: 'space-y-6',
  CARD_PADDING: {
    mobile: 'p-4',
    desktop: 'md:p-6',
  },
  MOBILE_BOTTOM_PADDING: 'pb-20 md:pb-0', // Account for mobile nav
} as const;

// Component spacing constants
export const COMPONENT_SPACING = {
  HERO_SECTION: 'py-16 lg:py-32',
  SECTION_GAP: 'gap-12 lg:gap-16',
  CARD_GAP: 'gap-4 md:gap-6',
} as const;

// Breakpoints (align with Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
export const HABIT_WINDOW_DAYS = 14;
export const HABIT_LOGS_LOOKBACK_DAYS = 30;
export const LEARNING_SESSIONS_LIMIT = 100;
export const STREAK_ALIVE_THRESHOLD_DAYS = 1;
export const DAY_OF_WEEK_MIN = 0;
export const DAY_OF_WEEK_MAX = 6;
export const DAY_OF_MONTH_MIN = 1;
export const DAY_OF_MONTH_MAX = 31;

export const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKET_NAME || "assets";

export const NOTE_COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#facc15", // yellow
  "#4ade80", // green
  "#22d3ee", // cyan
  "#60a5fa", // blue
  "#c084fc", // purple
  "#818cf8", // indigo
] as const;

export const HABIT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
] as const;

export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
] as const;

export const DEFAULT_HABIT_COLOR = "#3b82f6";

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "inprogress",
  DONE: "done",
} as const;

export type TaskStatusValue = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.TODO, label: "To Do" },
  { value: TASK_STATUS.IN_PROGRESS, label: "In Progress" },
  { value: TASK_STATUS.DONE, label: "Done" },
] as const;

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type TaskPriorityValue =
  (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export const TASK_PRIORITY_OPTIONS = [
  { value: TASK_PRIORITY.LOW, label: "Low" },
  { value: TASK_PRIORITY.MEDIUM, label: "Medium" },
  { value: TASK_PRIORITY.HIGH, label: "High" },
] as const;

export const TRANSACTION_TYPE = {
  EARNING: "earning",
  EXPENSE: "expense",
} as const;

export type TransactionTypeValue =
  (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

export const FREQUENCY = {
  DAILY: "daily",
  WEEKLY: "weekly",
  BI_WEEKLY: "bi-weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type FrequencyValue = (typeof FREQUENCY)[keyof typeof FREQUENCY];

export const FREQUENCY_OPTIONS = [
  { value: FREQUENCY.DAILY, label: "Daily" },
  { value: FREQUENCY.WEEKLY, label: "Weekly" },
  { value: FREQUENCY.BI_WEEKLY, label: "Bi-weekly (Every 2 Weeks)" },
  { value: FREQUENCY.MONTHLY, label: "Monthly" },
  { value: FREQUENCY.YEARLY, label: "Yearly" },
] as const;

export const LEARNING_STATUS = {
  TO_LEARN: "To Learn",
  LEARNING: "Learning",
  PRACTICING: "Practicing",
  MASTERED: "Mastered",
} as const;

export type LearningStatusValue =
  (typeof LEARNING_STATUS)[keyof typeof LEARNING_STATUS];

export const LEARNING_STATUS_OPTIONS = [
  { value: LEARNING_STATUS.TO_LEARN, label: "To Learn" },
  { value: LEARNING_STATUS.LEARNING, label: "Learning" },
  { value: LEARNING_STATUS.PRACTICING, label: "Practicing" },
  { value: LEARNING_STATUS.MASTERED, label: "Mastered" },
] as const;

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
] as const;

export const THEME_PRESETS = [
  { value: "theme-blueprint", label: "Blueprint" },
  { value: "theme-dracula", label: "Dracula" },
  { value: "theme-nord", label: "Nord" },
  { value: "theme-tokyo-night", label: "Tokyo Night" },
  { value: "theme-catppuccin-mocha", label: "Catppuccin Mocha" },
  { value: "theme-github-dark", label: "GitHub Dark" },
  { value: "theme-onedark-pro", label: "One Dark Pro" },
  { value: "theme-rose-pine", label: "Rosé Pine" },
  { value: "theme-monokai", label: "Monokai" },
  { value: "theme-ayu-dark", label: "Ayu Dark" },
  { value: "theme-solarized-light", label: "Solarized Light" },
  { value: "theme-catppuccin-latte", label: "Catppuccin Latte" },
  { value: "theme-github-light", label: "GitHub Light" },
  { value: "theme-arctic", label: "Arctic Frost" },
  { value: "theme-paper", label: "Paper White" },
  { value: "theme-cyberpunk", label: "Cyberpunk" },
  { value: "theme-ocean", label: "Ocean Deep" },
  { value: "theme-matrix", label: "Matrix" },
  { value: "theme-hc-dark", label: "High Contrast Dark" },
  { value: "theme-hc-light", label: "High Contrast Light" },
] as const;
