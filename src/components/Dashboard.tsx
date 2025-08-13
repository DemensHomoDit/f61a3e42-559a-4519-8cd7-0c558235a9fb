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
import { useQuery } from "@tanstack/react-query";
import { getObjects as apiObjects, getUsers as apiUsers, getTasks as apiTasks, getPurchases, getSalaries, getAbsences, getMetrics } from "@/api/client";
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_DASHBOARD_CONFIG, loadDashboardConfig, saveDashboardConfig, type DashboardConfig, type DashboardWidgetKey } from "@/lib/dashboardConfig";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid, Label as RLabel, LineChart, Line } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

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
  
  const { data: metrics, isLoading: mLoading } = useQuery({ queryKey: ["metrics"], queryFn: getMetrics, refetchInterval: 30_000 });
  const { data: objects = [], isLoading: oLoading } = useQuery({ queryKey: ["objects"], queryFn: apiObjects, refetchInterval: 30_000 });
  const { data: users = [], isLoading: uLoading } = useQuery({ queryKey: ["users"], queryFn: apiUsers, refetchInterval: 60_000 });
  const { data: tasks = [], isLoading: tLoading } = useQuery({ queryKey: ["tasks"], queryFn: apiTasks, refetchInterval: 20_000 });
  const { data: purchases = [], isLoading: pLoading } = useQuery({ queryKey: ["purchases"], queryFn: getPurchases, refetchInterval: 60_000 });
  const { data: salaries = [], isLoading: sLoading } = useQuery({ queryKey: ["salaries"], queryFn: getSalaries, refetchInterval: 60_000 });
  const { data: absences = [], isLoading: aLoading } = useQuery({ queryKey: ["absences"], queryFn: getAbsences, refetchInterval: 60_000 });
  // Реальные уведомления: формируем из задач и закупок
  const notificationsDerived = useMemo(() => {
    const out: { id: string; title: string; type: string; date?: string; read?: boolean }[] = [];
    (tasks as any[]).forEach((t: any) => {
      if (t.status === 'overdue') {
        out.push({ id: `t-${t.id}`, title: `Просрочена задача: ${t.title}`, type: 'warning', date: t.deadline, read: false });
      }
      if (t.status === 'done') {
        out.push({ id: `td-${t.id}`, title: `Задача выполнена: ${t.title}`, type: 'success', date: t.completed_at, read: true });
      }
    });
    (purchases as any[]).forEach((p: any) => {
      const st = (p.status ?? '').toLowerCase();
      if (st === 'completed') out.push({ id: `p-${p.id}`, title: `Закупка выполнена: ${p.item}`, type: 'success', date: p.date, read: true });
      else out.push({ id: `p-${p.id}`, title: `Новая закупка: ${p.item}`, type: 'info', date: p.date, read: false });
    });
    return out.slice(0, 20);
  }, [tasks, purchases]);
  const unreadCount = notificationsDerived.filter(n => !n.read).length;
  const overdueCount = useMemo(() => {
    const now = Date.now();
    return (tasks as any[]).filter((t:any) => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline).getTime();
      return !isNaN(d) && d < now && t.status !== 'done';
    }).length;
  }, [tasks]);
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

  // Build task status distribution
  const taskStatusData = useMemo(() => {
    const map: Record<string, number> = {};
    (tasks as any[]).forEach(t => { const s = (t.status ?? 'new'); map[s] = (map[s] ?? 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tasks]);
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
  const taskStatusLocalized = useMemo(() => taskStatusData.map(d => ({ name: STATUS_RU[d.name] ?? d.name, value: d.value })), [taskStatusData]);
  const COLORS = ["#2d6c3f", "#3a8547", "#6ea96f", "#94a3b8"]; // зелёные/серые

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
  const ALL_WIDGETS: DashboardWidgetKey[] = Array.from(new Set(DEFAULT_DASHBOARD_CONFIG.order));
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

  const loadingAny = mLoading || oLoading || uLoading || tLoading || pLoading || sLoading || aLoading;

  const sections: Record<DashboardWidgetKey, JSX.Element> = {
    kpi: (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Card as={Link} to="/objects" _hover={{ boxShadow: 'md' }}>
          <CardHeader p={4}>
            <HStack justify="space-between">
              <Heading size="sm" color="brand.500">Объекты (всего)</Heading>
              <Icon as={Building} boxSize={4} color="brand.500" />
            </HStack>
          </CardHeader>
          <CardBody pt={0} px={4} pb={4}>
            {oLoading ? <Skeleton height="28px" /> : <Text fontSize="2xl" fontWeight="bold" color="text.primary">{objects.length}</Text>}
            <HStack spacing={1} color="text.secondary" fontSize="xs">
              <Icon as={TrendingUp} boxSize={3} />
              <Text>+0</Text>
            </HStack>
          </CardBody>
        </Card>
        <Card as={Link} to="/people" _hover={{ boxShadow: 'md' }}>
          <CardHeader p={4}>
            <HStack justify="space-between">
              <Heading size="sm" color="brand.500">Сотрудники</Heading>
              <Icon as={Users} boxSize={4} color="brand.500" />
            </HStack>
          </CardHeader>
          <CardBody pt={0} px={4} pb={4}>
            {uLoading ? <Skeleton height="28px" /> : <Text fontSize="2xl" fontWeight="bold" color="text.primary">{users.length}</Text>}
            <Text fontSize="xs" color="text.secondary">в системе</Text>
          </CardBody>
        </Card>
        <Card as={Link} to="/tasks" _hover={{ boxShadow: 'md' }}>
          <CardHeader p={4}>
            <HStack justify="space_between">
              <Heading size="sm" color="brand.500">Задачи</Heading>
              <Icon as={CheckSquare} boxSize={4} color="brand.500" />
            </HStack>
          </CardHeader>
          <CardBody pt={0} px={4} pb={4}>
            {tLoading ? <Skeleton height="28px" /> : <Text fontSize="2xl" fontWeight="bold" color="text.primary">{tasks.length}</Text>}
            <HStack spacing={1} fontSize="xs" color="text.secondary">
              <Icon as={Clock} boxSize={3} />
              <Text>просрочено: {overdueTasks}</Text>
            </HStack>
          </CardBody>
        </Card>
        <Card as={Link} to="/finances" _hover={{ boxShadow: 'md' }}>
          <CardHeader p={4}>
            <HStack justify="space-between">
              <Heading size="sm" color="brand.500">Выплаты к оплате</Heading>
              <Icon as={DollarSign} boxSize={4} color="brand.500" />
            </HStack>
          </CardHeader>
          <CardBody pt={0} px={4} pb={4}>
            {mLoading ? <Skeleton height="28px" /> : <Text fontSize="2xl" fontWeight="bold" color="text.primary">₽{payables.toLocaleString('ru-RU')}</Text>}
            <Text fontSize="xs" color="text.secondary">за период (демо)</Text>
          </CardBody>
        </Card>
      </SimpleGrid>
    ),
    objects: (
      <Card>
        <CardHeader p={4}>
          <HStack justify="space-between">
            <Heading size="sm">Объекты в работе</Heading>
            <Button variant="ghost" size="sm" onClick={() => toggleWidget('objects')}>
              <Icon as={AlertTriangle} boxSize={4} />
            </Button>
          </HStack>
        </CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          {oLoading ? (
            <VStack align="stretch" spacing={3}><Skeleton height="44px" /><Skeleton height="44px" /><Skeleton height="44px" /></VStack>
          ) : (
          <VStack align="stretch" spacing={3}>
            {objects.slice(0, 3).map((o: any) => (
              <HStack as={Link} to={`/objects/${o.id}`} key={o.id} justify="space-between" p={3} bg="table.rowAlt" rounded="md" _hover={{ bg: 'gray.50' }}>
                <VStack align="start" spacing={1}>
                  <Text fontWeight={600} color="brand.500">{o.name}</Text>
                  <Text fontSize="sm" color="text.secondary">{o.address || 'Адрес не указан'}</Text>
                </VStack>
                <Badge colorScheme="green">В работе</Badge>
              </HStack>
            ))}
            {objects.length > 3 && (
              <Button variant="ghost" size="sm" as={Link} to="/objects">
                Показать все ({objects.length})
              </Button>
            )}
          </VStack>
          )}
        </CardBody>
      </Card>
    ),
    tasks: (
      <Card>
        <CardHeader p={4}>
          <HStack justify="space-between">
            <Heading size="sm">Критические задачи</Heading>
            <Button variant="ghost" size="sm" onClick={() => toggleWidget('tasks')}>
              <Icon as={AlertTriangle} boxSize={4} />
            </Button>
          </HStack>
        </CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          {tLoading ? (
            <VStack align="stretch" spacing={3}><Skeleton height="44px" /><Skeleton height="44px" /><Skeleton height="44px" /></VStack>
          ) : (
          <VStack align="stretch" spacing={3}>
              {criticalTasks.slice(0, 3).map((t: any) => {
                const statusText = (STATUS_RU as any)[t.status ?? 'new'] ?? '—';
                const assignee = (users as any[]).find((u:any) => u.id === t.assignee_id);
                return (
                  <HStack as={Link} to={`/tasks/${t.id}`} key={t.id} justify="space-between" p={3} bg="table.rowAlt" rounded="md" _hover={{ bg: 'gray.50' }}>
                <VStack align="start" spacing={1}>
                  <Text fontWeight={600}>{t.title}</Text>
                      <Text fontSize="sm" color="text.secondary">Исполнитель: {assignee?.full_name ?? '—'}</Text>
                      <Text fontSize="sm" color="text.secondary">{formatDateOnly(t.deadline)}</Text>
                      <Text fontSize="sm" color="text.secondary">{formatTimeRange(t.start_time, t.end_time)}</Text>
                </VStack>
                    <Badge colorScheme={t.status === 'overdue' ? 'red' : 'red'}>{statusText}</Badge>
              </HStack>
                );
              })}
              {criticalTasks.length === 0 && (
                <Text fontSize="sm" color="text.secondary">Критических задач нет</Text>
              )}
            {tasks.length > 3 && (
              <Button variant="ghost" size="sm" as={Link} to="/tasks">
                Показать все ({tasks.length})
              </Button>
            )}
          </VStack>
          )}
        </CardBody>
      </Card>
    ),
    warnings: (
      <Card>
        <CardHeader p={4}>
          <HStack justify="space-between">
            <Heading size="sm">Предупреждения</Heading>
            <Button variant="ghost" size="sm" onClick={() => toggleWidget('warnings')}>
              <Icon as={AlertTriangle} boxSize={4} />
            </Button>
          </HStack>
        </CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          {loadingAny ? (
            <VStack align="stretch" spacing={3}><Skeleton height="44px" /><Skeleton height="44px" /></VStack>
          ) : (
          <VStack align="stretch" spacing={3}>
            <HStack p={3} bg="red.50" rounded="md" borderWidth="1px" borderColor="red.200">
              <Icon as={AlertTriangle} boxSize={4} color="red.500" />
                <Text fontSize="sm" color="red.700">Просрочено задач: {overdueCount}</Text>
            </HStack>
            <HStack p={3} bg="orange.50" rounded="md" borderWidth="1px" borderColor="orange.200">
              <Icon as={Bell} boxSize={4} color="orange.500" />
              <Text fontSize="sm" color="orange.700">Непрочитанных уведомлений: {unreadCount}</Text>
            </HStack>
          </VStack>
          )}
        </CardBody>
      </Card>
    ),
    charts: (
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        <Card>
          <CardHeader p={4}>
            <HStack justify="space-between" align="center">
              <Heading size="sm">Статус задач (помесячно)</Heading>
              <HStack>
                <FormControl maxW="44">
                  <FormLabel htmlFor="fromMonth" mb={1}>С месяца</FormLabel>
                  <Input id="fromMonth" type="month" aria-label="С месяца" title="С месяца" value={fromMonth} max={toMonth || undefined} onChange={(e)=> setFromMonth(e.target.value)} />
                </FormControl>
                <FormControl maxW="44">
                  <FormLabel htmlFor="toMonth" mb={1}>По месяц</FormLabel>
                  <Input id="toMonth" type="month" aria-label="По месяц" title="По месяц" value={toMonth} min={fromMonth || undefined} onChange={(e)=> setToMonth(e.target.value)} />
                </FormControl>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody pt={0} px={4} pb={4}>
            {tLoading ? (
              <Skeleton height="220px" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={taskMonthlyPeriod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={formatMonthLabel} />
                  <YAxis allowDecimals={false} />
                  <RTooltip formatter={(v:any, n:any)=>[v, (STATUS_RU as any)[n] ?? n]} labelFormatter={(l)=>`Месяц: ${formatMonthLabel(l as any)}`} />
                  <Legend formatter={(v)=> (STATUS_RU as any)[v] ?? v} />
                  <Line type="monotone" dataKey="new" name="Новые" stroke="#6ea96f" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="in_progress" name="В работе" stroke="#2d6c3f" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="overdue" name="Просрочены" stroke="#e53e3e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="done" name="Завершены" stroke="#94a3b8" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader p={4}>
            <Heading size="sm">Расходы по месяцам (линии)</Heading>
          </CardHeader>
          <CardBody pt={0} px={4} pb={4}>
            {(pLoading || sLoading || aLoading) ? (
              <Skeleton height="220px" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={financeMonthlyPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={formatMonthLabel} />
                  <YAxis tickFormatter={(v)=>`₽${Number(v).toLocaleString('ru-RU')}`} />
                  <RTooltip formatter={(v:any, n:any)=>[`₽${Number(v).toLocaleString('ru-RU')}`, (LEGEND_RU as any)[n] ?? n]} labelFormatter={(l)=>`Месяц: ${formatMonthLabel(l as any)}`} />
                  <Legend formatter={(v)=> (LEGEND_RU as any)[v] ?? v} />
                  <Line type="monotone" dataKey="purchases" name="Закупки" stroke="#3a8547" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="salaries" name="Зарплаты" stroke="#2d6c3f" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="absences" name="Удержания/Авансы" stroke="#94a3b8" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    ),
    employees: (
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card>
          <CardHeader p={4}><Heading size="sm">ТОП‑5 продуктивных</Heading></CardHeader>
          <CardBody pt={0} px={4} pb={4}>
            {uLoading || tLoading ? <SkeletonText noOfLines={5} /> : (
              <VStack align="stretch" spacing={2}>
                {topProductive.map(u => (
                  <HStack key={u.id} justify="space-between">
                    <Text>{u.name}</Text>
                    <Badge colorScheme="green">{u.count}</Badge>
                  </HStack>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader p={4}><Heading size="sm">ТОП‑5 с простоем</Heading></CardHeader>
          <CardBody pt={0} px={4} pb={4}>
            {uLoading || tLoading ? <SkeletonText noOfLines={5} /> : (
              <VStack align="stretch" spacing={2}>
                {topIdle.map(u => (
                  <HStack key={u.id} justify="space-between">
                    <Text>{u.name}</Text>
                    <Badge>{u.count}</Badge>
                  </HStack>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    ),
    materials: (
      <Card>
        <CardHeader p={4}>
          <HStack justify="space-between">
            <Heading size="sm">Материалы: ТОП по закупкам</Heading>
            <Icon as={Package} boxSize={4} color="brand.500" />
          </HStack>
        </CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          {pLoading ? <SkeletonText noOfLines={5} /> : (
            <VStack align="stretch" spacing={2}>
              {topMaterials.map((m: any) => (
                <HStack as={Link} to="/finances" key={m.name} justify="space-between" _hover={{ bg: 'gray.50' }} p={1} rounded="md">
                  <Text>{m.name}</Text>
                  <HStack>
                    <Badge variant="subtle">{m.count} шт.</Badge>
                    <Text color="text.secondary">₽{Number(m.total).toLocaleString('ru-RU')}</Text>
                  </HStack>
                </HStack>
              ))}
              <Button as={Link} to="/finances" variant="ghost" size="sm">Открыть закупки</Button>
            </VStack>
          )}
        </CardBody>
      </Card>
    ),
    notifications: (
      <Card>
        <CardHeader p={4}>
          <HStack justify="space-between">
            <Heading size="sm">Уведомления</Heading>
            <Badge colorScheme={unreadCount ? 'orange' : 'gray'}>{unreadCount}</Badge>
          </HStack>
        </CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          {loadingAny ? <SkeletonText noOfLines={5} /> : (
            <VStack align="stretch" spacing={2}>
              {notificationsDerived.slice(0,5).map((n) => {
                const to = n.id.startsWith('t-') || n.id.startsWith('td-') ? `/tasks/${n.id.split('-')[1]}` : n.id.startsWith('p-') ? '/finances' : '/notifications';
                return (
                <HStack as={Link} to={to} key={n.id} justify="space-between" _hover={{ bg: 'gray.50' }} p={1} rounded="md">
                  <Text>{n.title ?? 'Событие'}</Text>
                  <Badge colorScheme={n.type === 'warning' ? 'orange' : n.type === 'error' ? 'red' : n.type === 'success' ? 'green' : 'blue'}>{TYPE_RU[n.type] ?? 'Инфо'}</Badge>
                </HStack>
              )})}
              <Button as={Link} to="/notifications" size="sm" variant="ghost">Все уведомления</Button>
            </VStack>
          )}
        </CardBody>
      </Card>
    ),
    map: (
      <Card>
        <CardHeader p={4}>
          <HStack justify="space-between">
            <Heading size="sm">Карта объектов</Heading>
            <Icon as={MapIcon} boxSize={4} color="brand.500" />
          </HStack>
        </CardHeader>
        <CardBody pt={0} px={0} pb={4}>
          <Box position="relative" borderTopWidth="1px" borderColor="green.200" rounded="md" h="320px" overflow="hidden">
            <LeafletMap objects={objects as any[]} loading={oLoading} />
          </Box>
        </CardBody>
      </Card>
    ),
    tasks_table: (
      <Card>
        <CardHeader p={4}>
          <HStack justify="space_between" align="center">
            <Heading size="sm">Последние задачи</Heading>
            <HStack>
              <FormControl maxW="48">
                <FormLabel id="ttStatusLabel" htmlFor="ttStatus">Статус</FormLabel>
                <CSelect id="ttStatus" aria-labelledby="ttStatusLabel" aria-label="Фильтр по статусу" title="Фильтр по статусу" value={ttStatus} onChange={(e)=> setTtStatus(e.target.value)}>
                  <option value="all">Все</option>
                  <option value="new">Новые</option>
                  <option value="in_progress">В работе</option>
                  <option value="overdue">Просроченные</option>
                  <option value="done">Завершенные</option>
                </CSelect>
              </FormControl>
              <FormControl maxW="56">
                <FormLabel id="ttAssigneeLabel" htmlFor="ttAssignee">Исполнитель</FormLabel>
                <CSelect id="ttAssignee" aria-labelledby="ttAssigneeLabel" aria-label="Фильтр по исполнителю" title="Фильтр по исполнителю" value={ttAssignee} onChange={(e)=> setTtAssignee(e.target.value)}>
                  <option value="all">Все</option>
                  {(users as any[]).map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </CSelect>
              </FormControl>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          {tLoading ? <SkeletonText noOfLines={6} /> : (
            <Table size="sm" variant="stripedGreen">
              <Thead>
                <Tr>
                  <Th>Задача</Th>
                  <Th>Объект</Th>
                  <Th>Исполнитель</Th>
                  <Th>Срок</Th>
                  <Th isNumeric>Статус</Th>
                </Tr>
              </Thead>
              <Tbody>
                {((tasks as any[])
                  .filter((r:any)=> (ttStatus === 'all' || r.status === ttStatus) && (ttAssignee === 'all' || String(r.assignee_id) === ttAssignee))
                  .slice(0,8)).map((r:any)=> {
                  const obj = (objects as any[]).find((o) => o.id === r.object_id);
                  const assignee = (users as any[]).find((u) => u.id === r.assignee_id);
                  const statusText = (STATUS_RU as any)[r.status ?? 'new'] ?? '—';
                  return (
                    <Tr key={r.id}>
                      <Td fontWeight={600} color="brand.500"><Link to={`/tasks/${r.id}`}>{r.title}</Link></Td>
                      <Td>{obj ? <Link to={`/objects/${obj.id}`}>{obj.name}</Link> : '—'}</Td>
                      <Td>{assignee ? <Link to={`/people/${assignee.id}`}>{assignee.full_name}</Link> : '—'}</Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text>{formatDateOnly(r.deadline)}</Text>
                          <Text color="text.secondary">{formatTimeRange(r.start_time, r.end_time)}</Text>
                        </VStack>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme={r.status === 'overdue' ? 'red' : r.status === 'done' ? 'green' : r.status === 'in_progress' ? 'blue' : 'gray'}>{statusText}</Badge>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    ),
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
      <HStack justify="space-between" align="center">
        <Box>
          <Heading size="lg" color="brand.500">Дашборд</Heading>
          <Text color="text.secondary" mt={1}>Обзор компании и ключевые показатели</Text>
        </Box>
        <HStack spacing={3}>
          <Box position="relative">
            <Input 
              placeholder="Быстрый поиск..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)}
              maxW="300px"
            />
            {q && searchMatches.length > 0 && (
              <Box position="absolute" zIndex={50} mt={1} w="full" rounded="md" borderWidth="1px" bg="white" p={2} maxH="60" overflowY="auto" boxShadow="card">
                {searchMatches.map((m, idx) => (
                  <Box key={idx} fontSize="sm" px={2} py={1} _hover={{ bg: "table.rowAlt" }} rounded="md">
                    <Link to={m.to} onClick={() => setQ("")}>
                      <Box as="span" color="text.secondary" mr={2}>{m.type}:</Box> {m.label}
                    </Link>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Icon as={SettingsIcon} boxSize={4} mr={2} />
            Настроить
          </Button>
        </HStack>
      </HStack>

      {/* Информация о пользователе */}
      {user && (
        <Card variant="outline" bg="blue.50" borderColor="blue.200">
          <CardBody p={4}>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <HStack spacing={3}>
                  <Text fontWeight="medium" color="blue.700">
                    Добро пожаловать, {user.full_name}!
                  </Text>
                  <Badge colorScheme="blue" variant="subtle">
                    {user.position || 'Должность не указана'}
                  </Badge>
                  <Badge colorScheme="green" variant="subtle">
                    {userRole ? getRoleName(userRole) : 'Роль не назначена'}
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="blue.600">
                  Ваши права: {userPermissions.length > 0 ? userPermissions.map(p => p.name).join(', ') : 'Базовые права'}
                </Text>
              </VStack>
              <HStack spacing={2}>
                <Text fontSize="sm" color="blue.600">
                  Телефон: {user.phone || 'Не указан'}
                </Text>
                {user.is_admin && (
                  <Badge colorScheme="red" variant="solid">
                    Администратор
                  </Badge>
                )}
              </HStack>
            </HStack>
          </CardBody>
        </Card>
      )}

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
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Настройки дашборда</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="text.secondary" mb={3}>Выберите, какие виджеты показывать. Порядок можно менять перетаскиванием на странице.</Text>
            <VStack align="stretch" spacing={2}>
              {ALL_WIDGETS.map((key) => (
                <HStack key={key} justify="space-between" py={1}>
                  <Text textTransform="none">{(
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
                  )[key]}</Text>
                  <Checkbox
                    isChecked={!cfg.hidden.includes(key)}
                    onChange={() => toggleWidget(key)}
                    aria-label={`Переключить видимость: ${key}`}
                  >Показать</Checkbox>
                </HStack>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={async () => { const next = { ...DEFAULT_DASHBOARD_CONFIG }; setCfg(next); await saveDashboardConfig(next); }}>Сбросить по умолчанию</Button>
              <Button onClick={() => setIsSettingsOpen(false)}>Готово</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function LeafletMap({ objects, loading }: { objects: any[]; loading: boolean }) {
  // отрисовываем карту после mount
  const mapId = "map_" + Math.random().toString(36).slice(2);
  const [ready, setReady] = useState(false);

  useMemo(() => { setReady(true); }, []);

  useMemo(() => {
    if (!ready || typeof window === 'undefined' || !(window as any).L) return;
    const L = (window as any).L as any;
    const container = document.getElementById(mapId);
    if (!container) return;

    // Инициализация карты
    const map = L.map(container).setView([55.7558, 37.6173], 10); // Москва по умолчанию
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const group = L.layerGroup().addTo(map);

    (async () => {
      for (const o of objects.slice(0, 20)) {
        const addr = o.address || o.name;
        if (!addr) continue;
        const pt = await geocodeAddress(addr);
        if (!pt) continue;
        const marker = L.marker([pt.lat, pt.lon]).bindPopup(`<b>${o.name}</b><br/>${addr}<br/><a href="/objects/${o.id}" target="_self" rel="noopener">Открыть объект</a><br/><a href="https://www.openstreetmap.org/?mlat=${pt.lat}&mlon=${pt.lon}#map=16/${pt.lat}/${pt.lon}" target="_blank" rel="noopener">Открыть в OpenStreetMap</a>`);
        group.addLayer(marker);
      }
      try {
        const bounds = group.getBounds();
        if (bounds && bounds.isValid()) map.fitBounds(bounds.pad(0.2));
      } catch {}
    })();

    return () => { map.remove(); };
  }, [ready, objects]);

  return (
    <Box id={mapId} w="100%" h="100%" aria-label="Карта объектов" title="Карта объектов" />
  );
}