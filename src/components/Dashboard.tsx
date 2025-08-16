import {
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  HStack,
  VStack,
  Icon,
  Badge,
  Progress,
  Button,
  Input,
  Divider,
  Skeleton,
  SkeletonText,
  Tooltip as CTooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  Select as CSelect,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox
} from "@chakra-ui/react";
import {
  Building, Users, CheckSquare, DollarSign, TrendingUp, Clock, AlertTriangle, Bell, Sparkles, Package, Map as MapIcon, Settings as SettingsIcon
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getObjects as apiObjects, getUsers as apiUsers, getTasks as apiTasks, getPurchases, getSalaries, getAbsences, getMetrics, getReadNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearReadNotifications } from "@/api/client";
import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_DASHBOARD_CONFIG, loadDashboardConfig, saveDashboardConfig, type DashboardConfig, type DashboardWidgetKey } from "@/lib/dashboardConfig";
import { ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, Legend, CartesianGrid, LineChart, Line } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { NotificationsModal } from "./dashboard/NotificationsModal";

// Простое геокодирование через Nominatim с локальным кэшем
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const key = `geo_${address}`;
  const cached = localStorage.getItem(key);
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'ru' } });
  if (!res.ok) return null;
  const data = await res.json();
  const first = Array.isArray(data) && data[0];
  if (!first) return null;
  const point = { lat: Number(first.lat), lon: Number(first.lon) };
  localStorage.setItem(key, JSON.stringify(point));
  return point;
}

export function Dashboard() {
  const { user } = useAuth();
  const { userRole, getRoleName, userPermissions } = usePermissions();
  const queryClient = useQueryClient();
  
  const { data: metrics, isLoading: mLoading } = useQuery({ queryKey: ["metrics"], queryFn: getMetrics, refetchInterval: 30_000 });
  const { data: objects = [], isLoading: oLoading } = useQuery({ queryKey: ["objects"], queryFn: apiObjects, refetchInterval: 30_000 });
  const { data: users = [], isLoading: uLoading } = useQuery({ queryKey: ["users"], queryFn: apiUsers, refetchInterval: 60_000 });
  const { data: tasks = [], isLoading: tLoading } = useQuery({ queryKey: ["tasks"], queryFn: apiTasks, refetchInterval: 20_000 });
  const { data: purchases = [], isLoading: pLoading } = useQuery({ queryKey: ["purchases"], queryFn: getPurchases, refetchInterval: 60_000 });
  const { data: salaries = [], isLoading: sLoading } = useQuery({ queryKey: ["salaries"], queryFn: getSalaries, refetchInterval: 60_000 });
  const { data: absences = [], isLoading: aLoading } = useQuery({ queryKey: ["absences"], queryFn: getAbsences, refetchInterval: 60_000 });
  const { data: readNotificationsData = [], isLoading: rnLoading } = useQuery({ queryKey: ["readNotifications"], queryFn: getReadNotifications, refetchInterval: 30_000 });
  
  // Мутации для работы с прочитанными уведомлениями
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readNotifications"] });
    }
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readNotifications"] });
    }
  });
  
  const clearReadMutation = useMutation({
    mutationFn: clearReadNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readNotifications"] });
    }
  });
  
  // Преобразуем массив в Set для удобства
  const readNotifications = useMemo(() => new Set(readNotificationsData), [readNotificationsData]);
  
  // Подсчет просроченных задач
  const overdueCount = useMemo(() => {
    const now = Date.now();
    return (tasks as any[]).filter((t:any) => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline).getTime();
      return !isNaN(d) && d < now && t.status !== 'done';
    }).length;
  }, [tasks]);

  // Сотрудники, которые не вышли на работу сегодня
  const absentEmployees = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todayAbsences = (absences as any[]).filter((a: any) => {
      const absenceDate = a.date ? new Date(a.date).toISOString().split('T')[0] : null;
      return absenceDate === today;
    });
    
    // Получаем ID сотрудников, которые сегодня отсутствуют
    const absentUserIds = new Set(todayAbsences.map((a: any) => a.user_id));
    
    // Возвращаем сотрудников, которые сегодня отсутствуют
    return (users as any[]).filter((u: any) => absentUserIds.has(u.id));
  }, [absences, users]);

  // Сотрудники без задач (простой)
  const idleEmployees = useMemo(() => {
    const assignedUserIds = new Set((tasks as any[]).map((t: any) => t.assignee_id).filter(Boolean));
    return (users as any[]).filter((u: any) => !assignedUserIds.has(u.id));
  }, [tasks, users]);

  // Объекты без активных задач
  const inactiveObjects = useMemo(() => {
    const objectsWithTasks = new Set((tasks as any[]).filter((t: any) => t.status !== 'done').map((t: any) => t.object_id));
    return (objects as any[]).filter((o: any) => !objectsWithTasks.has(o.id));
  }, [tasks, objects]);
  
  // Реальные уведомления: формируем из задач и закупок
  const notificationsDerived = useMemo(() => {
    const out: { id: string; title: string; type: string; date?: string; read?: boolean }[] = [];
    
    // Уведомления о задачах
    (tasks as any[]).forEach((t: any) => {
      if (t.status === 'overdue') {
        out.push({ id: `t-${t.id}`, title: `Просрочена задача: ${t.title}`, type: 'warning', date: t.deadline, read: false });
      }
      if (t.status === 'done') {
        out.push({ id: `td-${t.id}`, title: `Задача выполнена: ${t.title}`, type: 'success', date: t.completed_at, read: true });
      }
    });
    
    // Уведомления о закупках
    (purchases as any[]).forEach((p: any) => {
      const st = (p.status ?? '').toLowerCase();
      if (st === 'completed') {
        out.push({ id: `p-${p.id}`, title: `Закупка выполнена: ${p.item}`, type: 'success', date: p.date, read: true });
      } else {
        out.push({ id: `p-${p.id}`, title: `Новая закупка: ${p.item}`, type: 'info', date: p.date, read: false });
      }
    });
    
    // Уведомления о предупреждениях
    if (overdueCount > 0) {
      out.push({ id: 'w-overdue', title: `Просрочено задач: ${overdueCount}`, type: 'warning', date: new Date().toISOString(), read: false });
    }
    
    if (absentEmployees.length > 0) {
      out.push({ id: 'w-absent', title: `Не вышли на работу: ${absentEmployees.length} сотрудников`, type: 'warning', date: new Date().toISOString(), read: false });
    }
    
    if (idleEmployees.length > 0) {
      out.push({ id: 'w-idle', title: `Сотрудников в простое: ${idleEmployees.length}`, type: 'info', date: new Date().toISOString(), read: false });
    }
    
    if (inactiveObjects.length > 0) {
      out.push({ id: 'w-inactive', title: `Объектов без активных задач: ${inactiveObjects.length}`, type: 'info', date: new Date().toISOString(), read: false });
    }
    
    return out.slice(0, 20);
  }, [tasks, purchases, overdueCount, absentEmployees.length, idleEmployees.length, inactiveObjects.length]);
  
  // Обновляем количество непрочитанных уведомлений
  const actualUnreadCount = useMemo(() => {
    // Считаем только те уведомления, которые не прочитаны
    return notificationsDerived.filter(n => !readNotifications.has(n.id)).length;
  }, [notificationsDerived, readNotifications]);
  const criticalTasks = useMemo(() => {
    const now = Date.now();
    return (tasks as any[]).filter((t:any) => {
      if (t.status === 'done') return false;
      const dl = t.deadline ? new Date(t.deadline).getTime() : NaN;
      const overdueByDate = !isNaN(dl) && dl < now;
      return t.status === 'overdue' || overdueByDate;
    });
  }, [tasks]);

  // "Материалы": агрегируем реальные закупки по номенклатуре как приближение остатков
  const topMaterials = useMemo(() => {
    const byName = new Map<string, { name: string; total: number; count: number }>();
    (purchases as any[]).forEach((p: any) => {
      const name = p.item ?? '—';
      const amount = typeof p.amount === 'number' ? p.amount : Number(p.amount ?? 0);
      const cur = byName.get(name) ?? { name, total: 0, count: 0 };
      cur.total += amount || 0;
      cur.count += 1;
      byName.set(name, cur);
    });
    return Array.from(byName.values()).sort((a,b)=> b.total - a.total).slice(0,5);
  }, [purchases]);

  const num = (v: unknown): number => (typeof v === "number" ? v : typeof v === "string" ? parseFloat(v.replace(/[^0-9.-]/g, "")) || 0 : 0);
  const payables = metrics?.finance?.payables ?? 0;
  const incomes = 0; // заглушка под интеграцию
  const overdueTasks = metrics?.tasks?.overdue ?? 0;

  const STATUS_RU: Record<string,string> = { new: 'Новые', in_progress: 'В работе', overdue: 'Просрочены', done: 'Завершены' };
  const LEGEND_RU: Record<string,string> = { purchases: 'Закупки', salaries: 'Зарплаты', absences: 'Удержания/Авансы' };
  const TYPE_RU: Record<string,string> = { warning: 'Внимание', error: 'Ошибка', success: 'Готово', info: 'Инфо', task: 'Задача', finance: 'Финансы', purchase: 'Закупка', system: 'Система' };
  const formatMonthLabel = (m?: string) => {
    if (!m) return '';
    const [y, mm] = m.split('-');
    if (!y || !mm) return m;
    return `${mm}.${y}`;
  };
  const formatDateParts = (iso?: string) => {
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
  const formatDateOnly = (iso?: string) => {
    if (!iso) return 'дата —';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'дата —';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `дата ${dd}.${mm}.${yyyy}`;
  };
  const formatTimeRange = (startIso?: string, endIso?: string) => {
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

  // Build finance monthly bars (покупки/зарплаты/удержания)
  const monthKey = (d?: string) => {
    if (!d) return ""; const dt = new Date(d); if (isNaN(dt.getTime())) return ""; return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
  };
  const financeMonthlyFull = useMemo(() => {
    const acc: Record<string, { month: string; purchases: number; salaries: number; absences: number }>= {};
    (purchases as any[]).forEach(p => { const k = monthKey(p.date); if (!k) return; acc[k] = acc[k] || { month:k, purchases:0, salaries:0, absences:0 }; acc[k].purchases += Number(typeof p.amount==='number'?p.amount:(p.amount??0))||0; });
    (salaries as any[]).forEach(s => { const k = monthKey(s.date); if (!k) return; acc[k] = acc[k] || { month:k, purchases:0, salaries:0, absences:0 }; acc[k].salaries += Number(s.amount||0); });
    (absences as any[]).forEach(a => { const k = monthKey(a.date); if (!k) return; acc[k] = acc[k] || { month:k, purchases:0, salaries:0, absences:0 }; acc[k].absences += Number(a.amount||0); });
    return Object.values(acc).sort((a,b)=> a.month.localeCompare(b.month));
  }, [purchases, salaries, absences]);

  // Помесячные ряды по статусам задач
  const taskMonthlyFull = useMemo(() => {
    const acc: Record<string, { month: string; new: number; in_progress: number; overdue: number; done: number }>= {};
    (tasks as any[]).forEach((t:any) => {
      const d = t.created_at || t.deadline || t.completed_at;
      const k = monthKey(d);
      if (!k) return;
      acc[k] = acc[k] || { month:k, new:0, in_progress:0, overdue:0, done:0 };
      const s = (t.status ?? 'new') as 'new'|'in_progress'|'overdue'|'done';
      if (acc[k][s] !== undefined) acc[k][s] += 1;
    });
    return Object.values(acc).sort((a,b)=> a.month.localeCompare(b.month));
  }, [tasks]);

  // Период для графиков (мес.)
  const [chartMonths, setChartMonths] = useState(6);
  // Объединённая шкала месяцев (из задач и финансов)
  const monthsUnion = useMemo(() => {
    const set = new Set<string>();
    financeMonthlyFull.forEach(d => set.add(d.month));
    taskMonthlyFull.forEach(d => set.add(d.month));
    return Array.from(set.values()).sort((a,b)=> a.localeCompare(b));
  }, [financeMonthlyFull, taskMonthlyFull]);
  const [fromMonth, setFromMonth] = useState<string>('');
  const [toMonth, setToMonth] = useState<string>('');
  // Инициализация периода при наличии данных
  useMemo(() => {
    if (!monthsUnion.length) return;
    if (!fromMonth) {
      const start = monthsUnion.slice(Math.max(0, monthsUnion.length - chartMonths))[0];
      if (start) setFromMonth(start);
    }
    if (!toMonth) {
      const end = monthsUnion[monthsUnion.length - 1];
      if (end) setToMonth(end);
    }
  }, [monthsUnion]);
  const monthsPeriod = useMemo(() => monthsUnion.filter(m => (!fromMonth || m >= fromMonth) && (!toMonth || m <= toMonth)), [monthsUnion, fromMonth, toMonth]);
  const financeMonthlyPeriod = useMemo(() => monthsPeriod.map(m => financeMonthlyFull.find(d=>d.month===m) ?? { month:m, purchases:0, salaries:0, absences:0 }), [monthsPeriod, financeMonthlyFull]);
  const taskMonthlyPeriod = useMemo(() => monthsPeriod.map(m => taskMonthlyFull.find(d=>d.month===m) ?? { month:m, new:0, in_progress:0, overdue:0, done:0 }), [monthsPeriod, taskMonthlyFull]);

  // Поиск
  const [q, setQ] = useState("");
  const searchMatches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [] as { type: string; label: string; to: string }[];
    const res: { type: string; label: string; to: string }[] = [];
    objects.forEach((o: any) => { if ((o.name||'').toLowerCase().includes(query)) res.push({ type:'Объект', label:o.name, to:`/objects/${o.id}` }); });
    users.forEach((u: any) => { if ((u.full_name||'').toLowerCase().includes(query)) res.push({ type:'Сотрудник', label:u.full_name, to:`/people/${u.id}` }); });
    tasks.forEach((t: any) => { if ((t.title||'').toLowerCase().includes(query)) res.push({ type:'Задача', label:t.title, to:`/tasks/${t.id}` }); });
    return res.slice(0,10);
  }, [q, objects, users, tasks]);

  // Конфигурация и DnD
  const [cfg, setCfg] = useState<DashboardConfig>(DEFAULT_DASHBOARD_CONFIG);
  useEffect(() => {
    let alive = true;
    loadDashboardConfig().then(cfg => { if (alive) setCfg(cfg); });
    return () => { alive = false; };
  }, []);
  const [dragKey, setDragKey] = useState<DashboardWidgetKey | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const ALL_WIDGETS: DashboardWidgetKey[] = Array.from(new Set(DEFAULT_DASHBOARD_CONFIG.order));
  
  // Функция для отметки всех уведомлений как прочитанных
  const markAllAsRead = () => {
    const allNotificationIds = notificationsDerived.map(n => n.id);
    
    if (allNotificationIds.length === 0) {
      return;
    }
    
    markAllAsReadMutation.mutate(allNotificationIds);
  };
  
  // Функция для отметки одного уведомления как прочитанного
  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };
  
  // Функция для очистки прочитанных уведомлений
  const clearRead = () => {
    clearReadMutation.mutate();
  };
  
  // Очистка старых прочитанных уведомлений (которых больше нет в списке)
  useEffect(() => {
    const currentNotificationIds = new Set(notificationsDerived.map(n => n.id));
    const newReadSet = new Set(Array.from(readNotifications).filter(id => currentNotificationIds.has(id)));
    
    if (newReadSet.size !== readNotifications.size) {
      // setReadNotifications(newReadSet); // Теперь очистка происходит на сервере
    }
  }, [notificationsDerived, readNotifications]);
  
  // Фильтры таблицы последних задач
  const [ttStatus, setTtStatus] = useState<string>('all');
  const [ttAssignee, setTtAssignee] = useState<string>('all');

  const toggleWidget = async (key: DashboardWidgetKey) => {
    const next: DashboardConfig = {
      ...cfg,
      hidden: cfg.hidden.includes(key) ? cfg.hidden.filter(k => k !== key) : [...cfg.hidden, key],
    };
    setCfg(next);
    await saveDashboardConfig(next);
  };

  const onDrop = async (target: DashboardWidgetKey, dragged: DashboardWidgetKey | null) => {
    if (!dragged || dragged === target) return;
    const next: DashboardConfig = {
      ...cfg,
      order: cfg.order.filter(k => k !== dragged),
    };
    const targetIndex = next.order.indexOf(target);
    next.order.splice(targetIndex, 0, dragged);
    setCfg(next);
    await saveDashboardConfig(next);
  };

  // Employees KPI (топ-5 по числу задач как приближение продуктивности)
  const userTaskCount = useMemo(() => {
    const map = new Map<number, number>();
    (tasks as any[]).forEach((t) => {
      const uid = t.assignee_id as number | null;
      if (!uid) return;
      map.set(uid, (map.get(uid) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a,b)=> b[1]-a[1]);
  }, [tasks]);
  const topProductive = useMemo(() => userTaskCount.slice(0,5).map(([id, c]) => ({ id, count:c, name: (users as any[]).find(u=>u.id===id)?.full_name ?? `ID ${id}`})), [userTaskCount, users]);
  const topIdle = useMemo(() => {
    const assigned = new Set(userTaskCount.map(([id]) => id));
    const idle = (users as any[]).filter(u => !assigned.has(u.id)).slice(0,5);
    return idle.map(u => ({ id:u.id, name:u.full_name, count:0 }));
  }, [userTaskCount, users]);

  const loadingAny = mLoading || oLoading || uLoading || tLoading || pLoading || sLoading || aLoading || rnLoading;

  const sections: Record<DashboardWidgetKey, JSX.Element> = {
    kpi: (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Box className="modern-stats-card" as={Link} to="/objects">
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <Text className="text-3xl font-bold text-gray-800">
                {objects.length}
              </Text>
              <Text className="text-gray-600 text-sm">
                Объектов (всего)
              </Text>
            </VStack>
            <Box className="modern-stats-icon">
              <Building size={24} color="white" />
            </Box>
            </HStack>
        </Box>
        
        <Box className="modern-stats-card" as={Link} to="/people">
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <Text className="text-3xl font-bold text-gray-800">
                {users.length}
              </Text>
              <Text className="text-gray-600 text-sm">
                Сотрудников
              </Text>
            </VStack>
            <Box className="modern-stats-icon">
              <Users size={24} color="white" />
            </Box>
            </HStack>
        </Box>
        
        <Box className="modern-stats-card" as={Link} to="/tasks">
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <Text className="text-3xl font-bold text-gray-800">
                {tasks.length}
              </Text>
              <Text className="text-gray-600 text-sm">
                Задач
              </Text>
            </VStack>
            <Box className="modern-stats-icon">
              <CheckSquare size={24} color="white" />
            </Box>
            </HStack>
        </Box>
        
        <Box className="modern-stats-card" as={Link} to="/finances">
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <Text className="text-3xl font-bold text-gray-800">
                ₽{payables.toLocaleString('ru-RU')}
              </Text>
              <Text className="text-gray-600 text-sm">
                Выплаты к оплате
              </Text>
            </VStack>
            <Box className="modern-stats-icon">
              <DollarSign size={24} color="white" />
            </Box>
            </HStack>
        </Box>
      </SimpleGrid>
    ),
    
    objects: (
      <Box className="modern-card">
        <HStack justify="space-between" align="center" mb={4}>
          <Text className="text-lg font-semibold text-gray-800">
            Объекты в работе
          </Text>
          <Button 
            className="modern-button-secondary"
            size="sm" 
            onClick={() => toggleWidget('objects')}
          >
            <AlertTriangle size={16} />
            </Button>
          </HStack>
        
          {oLoading ? (
          <VStack align="stretch" spacing={3}>
            <Box className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <Box className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <Box className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </VStack>
          ) : (
          <VStack align="stretch" spacing={3}>
            {objects.slice(0, 3).map((o: any) => (
              <HStack 
                as={Link} 
                to={`/objects/${o.id}`} 
                key={o.id} 
                justify="space-between" 
                p={4} 
                className="bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <VStack align="start" spacing={1}>
                  <Text className="font-semibold text-gray-800">{o.name}</Text>
                  <Text className="text-sm text-gray-600">{o.address || 'Адрес не указан'}</Text>
                </VStack>
                <Box className="modern-badge-success">
                  В работе
                </Box>
              </HStack>
            ))}
            {objects.length > 3 && (
              <Button 
                className="modern-button-secondary w-full"
                as={Link} 
                to="/objects"
              >
                Показать все ({objects.length})
              </Button>
            )}
          </VStack>
          )}
      </Box>
    ),
    
    tasks: (
      <Box className="modern-card">
        <HStack justify="space-between" align="center" mb={4}>
          <Text className="text-lg font-semibold text-gray-800">
            Критические задачи
          </Text>
          <Button 
            className="modern-button-secondary"
            size="sm" 
            onClick={() => toggleWidget('tasks')}
          >
            <AlertTriangle size={16} />
            </Button>
          </HStack>
        
          {tLoading ? (
          <VStack align="stretch" spacing={3}>
            <Box className="h-16 bg-gray-200 rounded-xl animate-pulse" />
            <Box className="h-16 bg-gray-200 rounded-xl animate-pulse" />
            <Box className="h-16 bg-gray-200 rounded-xl animate-pulse" />
          </VStack>
          ) : (
          <VStack align="stretch" spacing={3}>
              {criticalTasks.slice(0, 3).map((t: any) => {
                const statusText = (STATUS_RU as any)[t.status ?? 'new'] ?? '—';
                const assignee = (users as any[]).find((u:any) => u.id === t.assignee_id);
                return (
                <HStack 
                  as={Link} 
                  to={`/tasks/${t.id}`} 
                  key={t.id} 
                  justify="space-between" 
                  p={4} 
                  className="bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                <VStack align="start" spacing={1}>
                    <Text className="font-semibold text-gray-800">{t.title}</Text>
                    <Text className="text-sm text-gray-600">Исполнитель: {assignee?.full_name ?? '—'}</Text>
                    <Text className="text-sm text-gray-600">{formatDateOnly(t.deadline)}</Text>
                </VStack>
                  <Box className="modern-badge-warning">
                    {statusText}
                  </Box>
              </HStack>
                );
              })}
              {criticalTasks.length === 0 && (
              <Text className="text-gray-600 text-center py-4">
                Критических задач нет
              </Text>
              )}
            {tasks.length > 3 && (
              <Button 
                className="modern-button-secondary w-full"
                as={Link} 
                to="/tasks"
              >
                Показать все ({tasks.length})
              </Button>
            )}
          </VStack>
          )}
      </Box>
    ),
    
    warnings: (
      <Box className="modern-card">
        <HStack justify="space-between" align="center" mb={4}>
          <Text className="text-lg font-semibold text-gray-800">
            Предупреждения
          </Text>
          <Button 
            className="modern-button-secondary"
            size="sm" 
            onClick={() => toggleWidget('warnings')}
          >
            <AlertTriangle size={16} />
            </Button>
          </HStack>
        
          {loadingAny ? (
          <VStack align="stretch" spacing={3}>
            <Box className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <Box className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </VStack>
          ) : (
          <VStack align="stretch" spacing={3}>
            {overdueCount > 0 && (
              <HStack p={4} className="bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle size={20} color="#FF9AA2" />
                <Text className="text-sm text-red-700">
                  Просрочено задач: {overdueCount}
                </Text>
            </HStack>
            )}
            
            {absentEmployees.length > 0 && (
              <HStack p={4} className="bg-orange-50 rounded-xl border border-orange-200">
                <Users size={20} color="#FFB3BA" />
                <Text className="text-sm text-orange-700">
                  Не вышли на работу: {absentEmployees.length} чел.
                </Text>
            </HStack>
            )}
            
            {idleEmployees.length > 0 && (
              <HStack p={4} className="bg-yellow-50 rounded-xl border border-yellow-200">
                <Clock size={20} color="#FFD93D" />
                <Text className="text-sm text-yellow-700">
                  Сотрудников в простое: {idleEmployees.length} чел.
                </Text>
              </HStack>
            )}
            
            {inactiveObjects.length > 0 && (
              <HStack p={4} className="bg-blue-50 rounded-xl border border-blue-200">
                <Building size={20} color="#A5B4FC" />
                <Text className="text-sm text-blue-700">
                  Объектов без активных задач: {inactiveObjects.length}
                </Text>
              </HStack>
            )}
            
            {overdueCount === 0 && absentEmployees.length === 0 && idleEmployees.length === 0 && inactiveObjects.length === 0 && (
              <HStack p={4} className="bg-green-50 rounded-xl border border-green-200">
                <CheckSquare size={20} color="#86EFAC" />
                <Text className="text-sm text-green-700">
                  Все в порядке! Нет критических предупреждений
                </Text>
              </HStack>
            )}
          </VStack>
          )}
      </Box>
    ),
    
    charts: (
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Box className="modern-chart-card">
          <HStack justify="space-between" align="center" mb={4}>
            <Text className="text-lg font-semibold text-gray-800">
              Статус задач (помесячно)
            </Text>
            <HStack spacing={2}>
                <FormControl maxW="44">
                <FormLabel className="text-sm text-gray-600 mb-1">С месяца</FormLabel>
                <Input 
                  type="month" 
                  className="modern-search"
                  value={fromMonth} 
                  max={toMonth || undefined} 
                  onChange={(e)=> setFromMonth(e.target.value)} 
                />
                </FormControl>
                <FormControl maxW="44">
                <FormLabel className="text-sm text-gray-600 mb-1">По месяц</FormLabel>
                <Input 
                  type="month" 
                  className="modern-search"
                  value={toMonth} 
                  min={fromMonth || undefined} 
                  onChange={(e)=> setToMonth(e.target.value)} 
                />
                </FormControl>
              </HStack>
            </HStack>
          
            {tLoading ? (
            <Box className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={taskMonthlyPeriod}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickFormatter={formatMonthLabel} stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <RTooltip 
                  formatter={(v:any, n:any)=>[v, (STATUS_RU as any)[n] ?? n]} 
                  labelFormatter={(l)=>`Месяц: ${formatMonthLabel(l as any)}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                  <Legend formatter={(v)=> (STATUS_RU as any)[v] ?? v} />
                <Line type="monotone" dataKey="new" name="Новые" stroke="#B5EAD7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="in_progress" name="В работе" stroke="#C7CEEA" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="overdue" name="Просрочены" stroke="#FF9AA2" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="done" name="Завершены" stroke="#D5AAFF" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
            )}
        </Box>
        
        <Box className="modern-chart-card">
          <HStack justify="space-between" align="center" mb={4}>
            <Text className="text-lg font-semibold text-gray-800">
              Расходы по месяцам
            </Text>
          </HStack>
          
            {(pLoading || sLoading || aLoading) ? (
            <Box className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={financeMonthlyPeriod}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickFormatter={formatMonthLabel} stroke="#6b7280" />
                <YAxis tickFormatter={(v)=>`₽${Number(v).toLocaleString('ru-RU')}`} stroke="#6b7280" />
                <RTooltip 
                  formatter={(v:any, n:any)=>[`₽${Number(v).toLocaleString('ru-RU')}`, (LEGEND_RU as any)[n] ?? n]} 
                  labelFormatter={(l)=>`Месяц: ${formatMonthLabel(l as any)}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                  <Legend formatter={(v)=> (LEGEND_RU as any)[v] ?? v} />
                <Line type="monotone" dataKey="purchases" name="Закупки" stroke="#B5EAD7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="salaries" name="Зарплаты" stroke="#C7CEEA" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="absences" name="Удержания/Авансы" stroke="#D5AAFF" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
            )}
        </Box>
      </SimpleGrid>
    ),
    
    employees: (
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box className="modern-card">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            ТОП‑5 продуктивных
          </Text>
          {uLoading || tLoading ? (
            <VStack align="stretch" spacing={2}>
              {[1,2,3,4,5].map(i => (
                <Box key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
              ))}
            </VStack>
          ) : (
              <VStack align="stretch" spacing={2}>
                {topProductive.map(u => (
                <HStack key={u.id} justify="space-between" p={3} className="bg-gray-50 rounded-lg">
                  <Text className="text-gray-800">{u.name}</Text>
                  <Box className="modern-badge-success">
                    {u.count}
                  </Box>
                  </HStack>
                ))}
              </VStack>
            )}
        </Box>
        
        <Box className="modern-card">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            ТОП‑5 с простоем
          </Text>
          {uLoading || tLoading ? (
            <VStack align="stretch" spacing={2}>
              {[1,2,3,4,5].map(i => (
                <Box key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
              ))}
            </VStack>
          ) : (
              <VStack align="stretch" spacing={2}>
                {topIdle.map(u => (
                <HStack key={u.id} justify="space-between" p={3} className="bg-gray-50 rounded-lg">
                  <Text className="text-gray-800">{u.name}</Text>
                  <Box className="modern-badge">
                    {u.count}
                  </Box>
                  </HStack>
                ))}
              </VStack>
            )}
        </Box>
      </SimpleGrid>
    ),
    
    materials: (
      <Box className="modern-card">
        <HStack justify="space-between" align="center" mb={4}>
          <Text className="text-lg font-semibold text-gray-800">
            Материалы: ТОП по закупкам
          </Text>
          <Package size={20} color="#6b7280" />
          </HStack>
        
        {pLoading ? (
          <VStack align="stretch" spacing={2}>
            {[1,2,3,4,5].map(i => (
              <Box key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </VStack>
        ) : (
            <VStack align="stretch" spacing={2}>
              {topMaterials.map((m: any) => (
              <HStack 
                as={Link} 
                to="/finances" 
                key={m.name} 
                justify="space-between" 
                p={3} 
                className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Text className="text-gray-800">{m.name}</Text>
                <HStack spacing={2}>
                  <Box className="modern-badge">
                    {m.count} шт.
                  </Box>
                  <Text className="text-gray-600">₽{Number(m.total).toLocaleString('ru-RU')}</Text>
                  </HStack>
                </HStack>
              ))}
            <Button 
              className="modern-button-secondary w-full"
              as={Link} 
              to="/finances"
            >
              Открыть закупки
            </Button>
            </VStack>
          )}
      </Box>
    ),
    
    notifications: (
      <Box className="modern-card">
        <HStack justify="space-between" align="center" mb={4}>
          <HStack spacing={3}>
            <Box className="relative">
              <Bell size={20} color="#6b7280" />
              {actualUnreadCount > 0 && (
                <Box
                  position="absolute"
                  top="-2"
                  right="-2"
                  className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {actualUnreadCount > 99 ? '99+' : actualUnreadCount}
                </Box>
              )}
            </Box>
            <Text className="text-lg font-semibold text-gray-800">
              Уведомления
            </Text>
          </HStack>
          <Button
            className="modern-button-secondary"
            size="sm"
            onClick={() => setIsNotificationsOpen(true)}
          >
            Все уведомления
          </Button>
        </HStack>
        
        {loadingAny ? (
          <VStack align="stretch" spacing={2}>
            {[1,2,3,4,5].map(i => (
              <Box key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </VStack>
        ) : (
            <VStack align="stretch" spacing={2}>
              {notificationsDerived.slice(0,5).map((n) => {
                const to = n.id.startsWith('t-') || n.id.startsWith('td-') ? `/tasks/${n.id.split('-')[1]}` : n.id.startsWith('p-') ? '/finances' : '/notifications';
                return (
                <HStack 
                  as={Link} 
                  to={to} 
                  key={n.id} 
                  justify="space-between" 
                  p={3} 
                  className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => markAsRead(n.id)}
                >
                  <VStack align="start" spacing={1} flex="1">
                    <Text className="text-gray-800 text-sm">{n.title ?? 'Событие'}</Text>
                    {n.date && (
                      <Text className="text-gray-500 text-xs">
                        {formatDateOnly(n.date)}
                      </Text>
                    )}
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Box className={`modern-badge ${n.type === 'warning' ? 'modern-badge-warning' : n.type === 'error' ? 'modern-badge-warning' : n.type === 'success' ? 'modern-badge-success' : ''}`}>
                      {TYPE_RU[n.type] ?? 'Инфо'}
                    </Box>
                    {!readNotifications.has(n.id) && (
                      <Box className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </VStack>
                </HStack>
              );
            })}
            {notificationsDerived.length === 0 && (
              <Box className="text-center py-8">
                <Bell size={32} color="#9ca3af" className="mx-auto mb-2" />
                <Text className="text-gray-500">Нет уведомлений</Text>
              </Box>
            )}
            </VStack>
          )}
      </Box>
    ),
    
    map: (
      <Box className="modern-card">
        <HStack justify="space-between" align="center" mb={4}>
          <VStack align="start" spacing={1}>
            <Text className="text-lg font-semibold text-gray-800">
              Карта объектов
            </Text>
            <Text className="text-sm text-gray-600">
              Географическое расположение строительных объектов
            </Text>
          </VStack>
          <MapIcon size={20} color="#6b7280" />
          </HStack>
        
        {/* Легенда карты */}
        <HStack spacing={4} mb={4} className="bg-gray-50 p-3 rounded-lg">
          <HStack spacing={2}>
            <Box className="w-4 h-4 rounded-full bg-[#FF9AA2] border-2 border-white shadow-sm" />
            <Text className="text-sm text-gray-600">Просроченные задачи</Text>
          </HStack>
          <HStack spacing={2}>
            <Box className="w-4 h-4 rounded-full bg-[#B5EAD7] border-2 border-white shadow-sm" />
            <Text className="text-sm text-gray-600">Активные задачи</Text>
          </HStack>
          <HStack spacing={2}>
            <Box className="w-4 h-4 rounded-full bg-[#C7CEEA] border-2 border-white shadow-sm" />
            <Text className="text-sm text-gray-600">Нет задач</Text>
          </HStack>
          <Button 
            className="modern-button-secondary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Обновить карту
          </Button>
        </HStack>
        
        <Box className="border-t border-gray-200 rounded-lg overflow-hidden h-80">
          <LeafletMap objects={objects as any[]} loading={oLoading} tasks={tasks as any[]} />
          </Box>
      </Box>
    ),
    
    tasks_table: (
      <Box className="modern-card">
        <HStack justify="space-between" align="center" mb={4}>
          <Text className="text-lg font-semibold text-gray-800">
            Последние задачи
          </Text>
          <HStack spacing={3}>
              <FormControl maxW="48">
              <FormLabel className="text-sm text-gray-600 mb-1">Статус</FormLabel>
              <CSelect 
                value={ttStatus} 
                onChange={(e)=> setTtStatus(e.target.value)}
                className="modern-search"
                aria-label="Фильтр по статусу"
              >
                  <option value="all">Все</option>
                  <option value="new">Новые</option>
                  <option value="in_progress">В работе</option>
                  <option value="overdue">Просроченные</option>
                  <option value="done">Завершенные</option>
                </CSelect>
              </FormControl>
              <FormControl maxW="56">
              <FormLabel className="text-sm text-gray-600 mb-1">Исполнитель</FormLabel>
              <CSelect 
                value={ttAssignee} 
                onChange={(e)=> setTtAssignee(e.target.value)}
                className="modern-search"
                aria-label="Фильтр по исполнителю"
              >
                  <option value="all">Все</option>
                  {(users as any[]).map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </CSelect>
              </FormControl>
            </HStack>
          </HStack>
        
        {tLoading ? (
          <VStack align="stretch" spacing={2}>
            {[1,2,3,4,5,6,7,8].map(i => (
              <Box key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </VStack>
        ) : (
          <Box className="modern-table">
            <Box className="modern-table-header">
              <HStack justify="space-between" className="modern-table-cell">
                <Text className="font-semibold text-gray-800">Задача</Text>
                <Text className="font-semibold text-gray-800">Объект</Text>
                <Text className="font-semibold text-gray-800">Исполнитель</Text>
                <Text className="font-semibold text-gray-800">Срок</Text>
                <Text className="font-semibold text-gray-800">Статус</Text>
              </HStack>
            </Box>
                {((tasks as any[])
                  .filter((r:any)=> (ttStatus === 'all' || r.status === ttStatus) && (ttAssignee === 'all' || String(r.assignee_id) === ttAssignee))
                  .slice(0,8)).map((r:any)=> {
                  const obj = (objects as any[]).find((o) => o.id === r.object_id);
                  const assignee = (users as any[]).find((u) => u.id === r.assignee_id);
                  const statusText = (STATUS_RU as any)[r.status ?? 'new'] ?? '—';
                  return (
                <HStack 
                  key={r.id} 
                  className="modern-table-row modern-table-cell"
                  justify="space-between"
                >
                  <Text className="font-semibold text-gray-800">
                    <Link to={`/tasks/${r.id}`} className="text-green-600 hover:text-green-700">
                      {r.title}
                    </Link>
                  </Text>
                  <Text className="text-gray-800">
                    {obj ? (
                      <Link to={`/objects/${obj.id}`} className="text-green-600 hover:text-green-700">
                        {obj.name}
                      </Link>
                    ) : '—'}
                  </Text>
                  <Text className="text-gray-800">
                    {assignee ? (
                      <Link to={`/people/${assignee.id}`} className="text-green-600 hover:text-green-700">
                        {assignee.full_name}
                      </Link>
                    ) : '—'}
                  </Text>
                        <VStack align="start" spacing={0}>
                    <Text className="text-gray-800">{formatDateOnly(r.deadline)}</Text>
                    <Text className="text-gray-600 text-sm">{formatTimeRange(r.start_time, r.end_time)}</Text>
                        </VStack>
                  <Box className={`modern-badge ${r.status === 'overdue' ? 'modern-badge-warning' : r.status === 'done' ? 'modern-badge-success' : r.status === 'in_progress' ? 'modern-badge' : 'modern-badge'}`}>
                    {statusText}
                  </Box>
                </HStack>
                  );
                })}
          </Box>
          )}
      </Box>
    ),
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box className="bg-gray-50 min-h-screen p-6">
      {/* Современный хедер */}
      <Box className="modern-header mb-8">
      <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text className="text-2xl font-bold text-gray-800">
              Дашборд
            </Text>
            <Text className="text-gray-600">
              {user?.position || 'Администратор'}
            </Text>
          </VStack>
          
          {/* Поиск, уведомления и настройки */}
          <HStack spacing={4}>
            <Input 
              className="modern-search w-80"
              placeholder="Поиск..."
              value={q} 
              onChange={(e) => setQ(e.target.value)}
            />
            
            {/* Колокольчик уведомлений */}
            <Button
              className="modern-button-blue"
              size="sm"
              onClick={() => setIsNotificationsOpen(true)}
              position="relative"
            >
              <Bell size={16} />
              {actualUnreadCount > 0 && (
                <Box
                  position="absolute"
                  top="-2"
                  right="-2"
                  className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {actualUnreadCount > 99 ? '99+' : actualUnreadCount}
              </Box>
            )}
            </Button>
            
            <Button 
              className="modern-button-green"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <SettingsIcon size={16} />
            Настроить
          </Button>
        </HStack>
      </HStack>
      </Box>

      {/* Поиск результаты */}
      {q && searchMatches.length > 0 && (
        <Box className="modern-card mb-6">
          <VStack align="stretch" spacing={3}>
            <Text className="font-semibold text-gray-800">Результаты поиска</Text>
            {searchMatches.map((m, idx) => (
              <HStack
                key={idx}
                as={Link}
                to={m.to}
                onClick={() => setQ("")}
                className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                justify="space-between"
              >
              <VStack align="start" spacing={1}>
                  <Text className="text-gray-500 text-sm">
                    {m.type}
                  </Text>
                  <Text className="font-medium text-gray-800">
                    {m.label}
                </Text>
              </VStack>
                <Box className="modern-badge">
                  Открыть
                </Box>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Виджеты */}
      <VStack spacing={6} align="stretch">
        <AnimatePresence>
        {cfg.order
          .filter(key => !cfg.hidden.includes(key))
          .map((key) => (
              <motion.div
                key={key}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                draggable
                onDragStart={() => setDragKey(key)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(key, dragKey)}
              >
              {sections[key]}
              </motion.div>
          ))}
        </AnimatePresence>
      </VStack>

      {/* Модалка настроек дашборда */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} size="lg">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent className="modern-card">
          <ModalHeader className="text-gray-800">Настройки дашборда</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text className="text-gray-600 text-sm mb-4">
              Выберите, какие виджеты показывать. Порядок можно менять перетаскиванием на странице.
            </Text>
            <VStack align="stretch" spacing={2}>
              {ALL_WIDGETS.map((key) => (
                <HStack key={key} justify="space-between" py={2}>
                  <Text className="text-gray-800">
                    {(
                    {
                      kpi: "Сводка",
                      map: "Карта объектов",
                      objects: "Объекты",
                      tasks: "Критические задачи",
                      tasks_table: "Последние задачи",
                      employees: "Сотрудники",
                      materials: "Материалы",
                      warnings: "Предупреждения",
                      charts: "Графики",
                      notifications: "Уведомления",
                    } as Record<DashboardWidgetKey, string>
                    )[key]}
                  </Text>
                  <Checkbox
                    isChecked={!cfg.hidden.includes(key)}
                    onChange={() => toggleWidget(key)}
                    colorScheme="green"
                    aria-label={`Переключить видимость: ${key}`}
                  />
                </HStack>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                className="modern-button-secondary"
                onClick={async () => {
                  const next = { ...DEFAULT_DASHBOARD_CONFIG };
                  setCfg(next);
                  await saveDashboardConfig(next);
                }}
              >
                Сбросить
              </Button>
              <Button
                className="modern-button"
                onClick={() => setIsSettingsOpen(false)}
              >
                Готово
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно уведомлений */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notificationsDerived}
        unreadCount={actualUnreadCount}
        loading={loadingAny}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        formatDateOnly={formatDateOnly}
        TYPE_RU={TYPE_RU}
        readNotifications={readNotifications}
      />
    </Box>
  );
}

function LeafletMap({ objects, loading, tasks }: { objects: any[]; loading: boolean; tasks: any[] }) {
  const mapId = useMemo(() => "map_" + Math.random().toString(36).slice(2), []);
  const [mapData, setMapData] = useState<Array<{
    object: any;
    position: { lat: number; lon: number };
    tasks: any[];
  }>>([]);
  const mapRef = useRef<any>(null);
  
  // Подготовка данных для карты
  useEffect(() => {
    const prepareMapData = async () => {
      console.log('=== ПОДГОТОВКА ДАННЫХ КАРТЫ ===');
      console.log('Объекты:', objects);
      console.log('Задачи:', tasks);
      
      if (!objects.length) {
        console.log('Нет объектов для отображения');
        return;
      }
      
      const data = [];
      let processedCount = 0;
      let geocodedCount = 0;
      
      // Обрабатываем реальные объекты
      for (const obj of objects.slice(0, 15)) { // Ограничиваем для производительности
        processedCount++;
        const addr = obj.address || obj.name;
        if (!addr) {
          console.log(`Объект ${obj.id} (${obj.name}) не имеет адреса`);
          continue;
        }
        
        console.log(`Геокодируем: ${addr}`);
        const position = await geocodeAddress(addr);
        if (!position) {
          console.log(`Не удалось геокодировать адрес: ${addr}`);
          continue;
        }
        
        geocodedCount++;
        // Получаем задачи для этого объекта
        const objectTasks = tasks.filter((t: any) => t.object_id === obj.id);
        
        data.push({
          object: obj,
          position,
          tasks: objectTasks
        });
        
        console.log(`Успешно добавлен объект: ${obj.name} -> ${position.lat}, ${position.lon} (${objectTasks.length} задач)`);
      }
      
      console.log(`Обработано: ${processedCount}, геокодировано: ${geocodedCount}, объектов на карте: ${data.length}`);
      setMapData(data);
    };
    
    prepareMapData();
  }, [objects, tasks]);

    // Инициализация карты
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).L || !mapData.length) {
      console.log('Карта не инициализируется:', {
        window: typeof window !== 'undefined',
        L: !!(window as any).L,
        mapDataLength: mapData.length
      });
      return;
    }
    
    const timer = setTimeout(() => {
      const L = (window as any).L;
      const container = document.getElementById(mapId);
      if (!container) {
        console.log('Контейнер карты не найден');
        return;
      }
      
      // Удаляем предыдущую карту, если она существует
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.log('Ошибка при удалении предыдущей карты:', error);
        }
        mapRef.current = null;
      }
      
      // Очищаем контейнер
      container.innerHTML = '';
      
      console.log('Создаем карту с реальными данными...');
      console.log('MapData:', mapData);
      
      try {
        const map = L.map(container).setView([61.0042, 69.0019], 10); // Ханты-Мансийск
        mapRef.current = map;
        
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const group = L.layerGroup().addTo(map);

        // Создаем маркеры для реальных объектов
        mapData.forEach(({ object, position, tasks }) => {
          console.log(`Создаем маркер для: ${object.name} на ${position.lat}, ${position.lon}`);
          const activeTasks = tasks.filter((t: any) => t.status !== 'done').length;
          const overdueTasks = tasks.filter((t: any) => t.status === 'overdue').length;
          
          // Создаем кастомную иконку в зависимости от статуса
          const iconColor = overdueTasks > 0 ? '#FF9AA2' : activeTasks > 0 ? '#B5EAD7' : '#C7CEEA';
          
          const customIcon = L.divIcon({
            html: `<div style="background: ${iconColor}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${activeTasks > 0 ? activeTasks : '0'}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          
          // Создаем содержимое попапа
          const popupContent = `
            <div style="min-width: 250px; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 16px; font-weight: 600;">
                ${object.name}
              </h3>
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
                ${object.address || 'Адрес не указан'}
              </p>
              <div style="margin: 0 0 12px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #6b7280;">Активных задач:</span>
                  <span style="color: #374151; font-weight: 600;">${activeTasks}</span>
                </div>
                ${overdueTasks > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: #dc2626;">Просрочено:</span>
                    <span style="color: #dc2626; font-weight: 600;">${overdueTasks}</span>
                  </div>
                ` : ''}
              </div>
              <div style="display: flex; gap: 8px;">
                <a href="/objects/${object.id}" 
                   style="background: #3f6b4e; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;"
                   target="_self">
                  Открыть объект
                </a>
                <a href="/tasks?object=${object.id}" 
                   style="background: #9bbf87; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;"
                   target="_self">
                  Задачи
                </a>
              </div>
            </div>
          `;
          
          L.marker([position.lat, position.lon], { icon: customIcon })
            .addTo(group)
            .bindPopup(popupContent, { maxWidth: 300 });
        });
        
        // Подгоняем карту под все маркеры
      try {
        const bounds = group.getBounds();
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds.pad(0.1));
            console.log('Карта подогнана под маркеры');
          }
        } catch (error) {
          console.error('Ошибка при подгонке карты:', error);
        }
        
        console.log('Карта с реальными данными создана!');
      } catch (error) {
        console.error('Ошибка при создании карты:', error);
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.log('Ошибка при очистке карты:', error);
        }
        mapRef.current = null;
      }
    };
  }, [mapId, mapData]);

  if (loading) {
    return (
      <Box className="h-80 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
        <Text className="text-gray-600">Загрузка карты...</Text>
      </Box>
    );
  }

  if (!objects.length) {
    return (
      <Box className="h-80 bg-gray-50 rounded-xl flex items-center justify-center">
        <VStack spacing={3}>
          <MapIcon size={48} color="#9ca3af" />
          <Text className="text-gray-600">Объекты не найдены</Text>
        </VStack>
      </Box>
    );
  }

  if (!mapData.length) {
    return (
      <Box className="h-80 bg-gray-50 rounded-xl flex items-center justify-center">
        <VStack spacing={3}>
          <MapIcon size={48} color="#9ca3af" />
          <Text className="text-gray-600">Не удалось загрузить карту</Text>
          <Text className="text-gray-500 text-sm">Проверьте адреса объектов</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box id={mapId} w="100%" h="100%" aria-label="Карта объектов" title="Карта объектов" />
  );
}