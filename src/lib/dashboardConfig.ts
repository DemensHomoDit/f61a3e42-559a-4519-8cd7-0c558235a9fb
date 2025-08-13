import { getSettings, putSetting } from "@/api/client";

export type DashboardWidgetKey = "kpi" | "objects" | "tasks" | "warnings" | "charts" | "employees" | "materials" | "notifications" | "map" | "tasks_table";

export interface DashboardConfig {
  order: DashboardWidgetKey[];
  hidden: DashboardWidgetKey[];
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  order: ["kpi", "map", "objects", "tasks", "tasks_table", "employees", "materials", "warnings", "charts", "notifications"],
  hidden: [],
};

const SETTINGS_KEY = "dashboard_config";
const ALL_KEYS = DEFAULT_DASHBOARD_CONFIG.order as DashboardWidgetKey[];

function normalizeConfig(input: Partial<DashboardConfig> | null | undefined): DashboardConfig {
  const inOrder = Array.isArray(input?.order) ? (input!.order as DashboardWidgetKey[]) : [];
  const inHidden = Array.isArray(input?.hidden) ? (input!.hidden as DashboardWidgetKey[]) : [];

  // Удаляем неизвестные ключи и дубли, сохраняем порядок пользователя
  const knownOrdered = inOrder.filter((k): k is DashboardWidgetKey => ALL_KEYS.includes(k as DashboardWidgetKey));
  const dedupOrdered = Array.from(new Set(knownOrdered));
  // Добавляем недостающие виджеты из дефолта в конец
  const missing = ALL_KEYS.filter(k => !dedupOrdered.includes(k));
  const mergedOrder = [...dedupOrdered, ...missing];

  // hidden: только известные ключи, без дубликатов
  const mergedHidden = Array.from(new Set(inHidden.filter((k): k is DashboardWidgetKey => ALL_KEYS.includes(k as DashboardWidgetKey))));

  return { order: mergedOrder, hidden: mergedHidden };
}

function loadFromLocalStorage(): DashboardConfig | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeConfig(parsed);
  } catch {
    return null;
  }
}

function saveToLocalStorage(cfg: DashboardConfig) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(cfg)); } catch {}
}

export async function loadDashboardConfig(): Promise<DashboardConfig> {
  // 1) Локально
  const local = loadFromLocalStorage();
  if (local) return normalizeConfig(local);

  // 2) Бэкенд
  try {
    const rows = await getSettings();
    const found = rows.find((r: any) => r.key === SETTINGS_KEY);
    if (!found) return DEFAULT_DASHBOARD_CONFIG;
    const val = typeof found.value === "string" ? found.value : JSON.stringify(found.value);
    const parsed = JSON.parse(val);
    return normalizeConfig(parsed);
  } catch {
    return DEFAULT_DASHBOARD_CONFIG;
  }
}

export async function saveDashboardConfig(cfg: DashboardConfig): Promise<void> {
  const normalized = normalizeConfig(cfg);
  saveToLocalStorage(normalized);
  await putSetting(SETTINGS_KEY, normalized);
} 