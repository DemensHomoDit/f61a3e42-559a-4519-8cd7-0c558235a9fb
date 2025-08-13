export type UnitCode = 'шт' | 'м' | 'м2' | 'м3' | 'кг' | 'мп';

export const allowedUnits: Array<{ code: UnitCode; label: string }> = [
  { code: 'шт', label: 'шт (штуки)' },
  { code: 'м',  label: 'м (метры)' },
  { code: 'м2', label: 'м² (кв. метры)' },
  { code: 'м3', label: 'м³ (куб. метры)' },
  { code: 'кг', label: 'кг (килограммы)' },
  { code: 'мп', label: 'м.п. (пог. метры)' },
];

export function normalizeUnit(input?: string): UnitCode | string {
  if (!input) return 'шт';
  const s = String(input).toLowerCase().replace(/\s+/g, '').replace(',', '.');
  const map: Record<string, UnitCode> = {
    'шт': 'шт', 'штука': 'шт', 'штук': 'шт', 'pc': 'шт', 'pcs': 'шт',
    'м': 'м', 'метр': 'м', 'метры': 'м', 'm': 'м', 'meter': 'м',
    'м2': 'м2', 'м^2': 'м2', 'м²': 'м2', 'квм': 'м2', 'кв.м': 'м2', 'квметр': 'м2', 'm2': 'м2', 'sqm': 'м2',
    'м3': 'м3', 'м^3': 'м3', 'м³': 'м3', 'кубм': 'м3', 'куб.м': 'м3', 'кубметр': 'м3', 'm3': 'м3', 'cbm': 'м3',
    'кг': 'кг', 'килограмм': 'кг', 'kg': 'кг',
    'мп': 'мп', 'м.п': 'мп', 'м/п': 'мп', 'погм': 'мп', 'пог.м': 'мп', 'погметр': 'мп', 'lm': 'мп',
  };
  return map[s] ?? input;
}

export function unitLabelOf(code?: string): string {
  const found = allowedUnits.find(u => u.code === code);
  return found?.label ?? String(code ?? '');
} 