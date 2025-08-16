export const formatMonthLabel = (m?: string) => {
  if (!m) return '';
  const [y, mm] = m.split('-');
  if (!y || !mm) return m;
  return `${mm}.${y}`;
};

export const formatDateParts = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `дата ${dd}.${mm}.${yyyy} время: ${hh}:${mi}`;
};

export const formatDateOnly = (iso?: string) => {
  if (!iso) return 'дата —';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'дата —';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `дата ${dd}.${mm}.${yyyy}`;
};

export const formatTimeRange = (startIso?: string, endIso?: string) => {
  const fmt = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mi}`;
  };
  const s = fmt(startIso);
  const e = fmt(endIso);
  if (s && e) return `время: с ${s} до ${e}`;
  if (s && !e) return `время: с ${s}`;
  if (!s && e) return `время: до ${e}`;
  return 'время: —';
};

export const monthKey = (d?: string) => {
  if (!d) return ""; 
  const dt = new Date(d); 
  if (isNaN(dt.getTime())) return ""; 
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
};

export const STATUS_RU: Record<string,string> = { 
  new: 'Новые', 
  in_progress: 'В работе', 
  overdue: 'Просрочены', 
  done: 'Завершены' 
};

export const LEGEND_RU: Record<string,string> = { 
  purchases: 'Закупки', 
  salaries: 'Зарплаты', 
  absences: 'Удержания/Авансы' 
};

export const TYPE_RU: Record<string,string> = { 
  warning: 'Внимание', 
  error: 'Ошибка', 
  success: 'Готово', 
  info: 'Инфо', 
  task: 'Задача', 
  finance: 'Финансы', 
  purchase: 'Закупка', 
  system: 'Система' 
}; 