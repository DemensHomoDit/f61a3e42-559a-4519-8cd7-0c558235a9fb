import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getObjects, getUsers, getPurchases, getMaterials, createPurchaseAuto } from "@/api/client";
import { getMaterialsHistory } from "@/api/client";
// Убрано: фиксирующие PATCH-запросы на сервер, чтобы не сыпались ошибки в консоль

// Получаем токен авторизации из localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Базовый URL API
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const API_PREFIX = "/api";

// Функция для формирования URL API
const apiUrl = (path: string): string => {
  return `${BASE_URL}${path.startsWith("/api") ? path : `${API_PREFIX}${path}`}`;
};

// Создаем собственные функции для работы с закупками
const updatePurchase = async (id: number, payload: any): Promise<any> => {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  const res = await fetch(apiUrl(`/api/purchases/${id}`), {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API failed: ${res.status} - ${errorText}`);
  }
  
  return res.json();
};

const deletePurchase = async (id: number): Promise<{ success: boolean }> => {
  const headers = new Headers();
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  const res = await fetch(apiUrl(`/api/purchases/${id}`), {
    method: "DELETE",
    headers,
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API failed: ${res.status} - ${errorText}`);
  }
  
  return res.json();
};

// Создаем заглушки для функций updateHistory и deleteHistory, если они используются в коде
const updateHistory = async (id: number, payload: any): Promise<any> => {
  console.warn('updateHistory is not implemented');
  return { success: true };
};

const deleteHistory = async (id: number): Promise<{ success: boolean }> => {
  console.warn('deleteHistory is not implemented');
  return { success: true };
};

import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Select as CSelect,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Download, Pencil, Trash2 } from "lucide-react";
import { downloadCSV } from "@/lib/export";
import { motion, AnimatePresence } from "framer-motion";
import { CatalogPicker } from "@/modules/catalog/components/CatalogPicker";
import { allowedUnits, normalizeUnit } from "@/lib/units";
import { MaterialsIncomeModal } from "@/modules/materials/MaterialsIncomeModal";

const canonical = typeof window !== 'undefined' ? window.location.href : '';
const TYPE_MAP_STORAGE_KEY = 'materialTypeByItem';
const LOCAL_DELTAS_STORAGE_KEY = 'materialStockLocalDeltas';
const QTY_OVERRIDE_STORAGE_KEY = 'purchaseQtyOverrides';

const Materials = () => {
  const { data: purchases = [] } = useQuery<any[]>({ queryKey: ["purchases"], queryFn: getPurchases });
  const { data: objects = [] } = useQuery<any[]>({ queryKey: ["objects"], queryFn: getObjects });
  const { data: users = [] } = useQuery<any[]>({ queryKey: ["users"], queryFn: getUsers });
  const { data: history = [] } = useQuery<any[]>({ queryKey: ["materials.history"], queryFn: getMaterialsHistory });
  const { data: serverStocks = [] } = useQuery<any[]>({ queryKey: ["materials.stock"], queryFn: getMaterials });
  const qc = useQueryClient();
  const toast = useToast();
  const { isOpen: isIncomeOpen, onOpen: openIncome, onClose: closeIncome } = useDisclosure();

  const [tab, setTab] = useState<'consumables'|'tools'|'materials'>('materials');
  const [search, setSearch] = useState('');
  const [warehouseOnly, setWarehouseOnly] = useState(true);

  // Клиентское запоминание типа по наименованию (если бэкенд не возвращает type)
  const [typeMap, setTypeMap] = useState<Record<string, 'materials'|'consumables'|'tools'>>(()=>{
    try { return JSON.parse(localStorage.getItem(TYPE_MAP_STORAGE_KEY) || '{}'); } catch { return {}; }
  });
  const updateTypeMap = (name: string, t: 'materials'|'consumables'|'tools') => {
    const key = (name||'').trim().toLowerCase();
    const next = { ...typeMap, [key]: t };
    setTypeMap(next);
    try { localStorage.setItem(TYPE_MAP_STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  // Локальные оверрайды количества по id (если сервер не сохраняет qty)
  const [qtyOverrides, setQtyOverrides] = useState<Record<string, { qty: number; unit?: string }>>(()=>{
    try { return JSON.parse(localStorage.getItem(QTY_OVERRIDE_STORAGE_KEY) || '{}'); } catch { return {}; }
  });
  const setQtyOverride = (id: number, qty: number, unit?: string) => {
    if (!id || !isFinite(qty)) return;
    const key = String(id);
    const next = { ...qtyOverrides, [key]: { qty, unit } };
    setQtyOverrides(next);
    try { localStorage.setItem(QTY_OVERRIDE_STORAGE_KEY, JSON.stringify(next)); } catch {}
  };
  const clearQtyOverride = (id: number) => {
    const key = String(id);
    if (!(key in qtyOverrides)) return;
    const next = { ...qtyOverrides };
    delete next[key];
    setQtyOverrides(next);
    try { localStorage.setItem(QTY_OVERRIDE_STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  // Локальные дельты остатков по ключу item|unit|type
  const [localDeltas, setLocalDeltas] = useState<Record<string, number>>(()=>{
    try { return JSON.parse(localStorage.getItem(LOCAL_DELTAS_STORAGE_KEY) || '{}'); } catch { return {}; }
  });
  const applyDelta = (key: string, delta: number) => {
    if (!key || !isFinite(delta)) return;
    const next = { ...localDeltas, [key]: (localDeltas[key] || 0) + delta };
    setLocalDeltas(next);
    try { localStorage.setItem(LOCAL_DELTAS_STORAGE_KEY, JSON.stringify(next)); } catch {}
  };
  const getKeyFor = (item: string, unit: string, type: string) => `${String(item||'').trim()}|${String(normalizeUnit(unit))}|${String(type||'materials').trim()}`;

  const normType = (t?: string) => (t ?? '').toLowerCase();
  const normStatus = (s?: string) => (s ?? '').toLowerCase();
  const parseQty = (v: unknown): number => {
    if (v == null) return 0;
    const s = String(v).replace(/\s+/g, '').replace(',', '.');
    const n = Number(s);
    return isFinite(n) ? n : 0;
  };
  const isPurchasedStatus = (st: string) => st === '' || st === 'completed' || st === 'complete' || st === 'done' || st === 'received' || st === 'stock_in';
  const isIssuedStatus = (st: string) => st === 'issued' || st === 'writeoff' || st === 'spent';
  const typeLabel = (t?: string) => {
    const v = normType(t);
    if (v === 'consumables') return 'Расходники';
    if (v === 'tools') return 'Инструмент';
    return 'Материалы';
  };

  // Эвристика определения типа по названию (на случай пустого type)
  const guessTypeByName = (name: string): 'materials'|'consumables'|'tools' => {
    const n = (name||'').toLowerCase();
    const toolHints = ['бур', 'дрель', 'перфорат', 'молоток', 'лопат', 'шурупов', 'уровень', 'рулетк', 'пила', 'отверт', 'ключ', 'болгарк', 'кусач', 'степлер', 'ножов'];
    const consumableHints = ['перчат', 'пакет', 'салфет', 'абразив', 'мешк', 'скотч', 'термоклей', 'крепеж', 'бит', 'диск'];
    if (toolHints.some(h => n.includes(h))) return 'tools';
    if (consumableHints.some(h => n.includes(h))) return 'consumables';
    return 'materials';
  };

  // Нормализованные записи с вычисленным типом
  const normalized = useMemo(() => {
    return (purchases as any[]).map(p => {
      const rawType = normType(p.type ?? p.category);
      const nameKey = String(p.item||'').trim().toLowerCase();
      const mapped = typeMap[nameKey];
      const t: 'materials'|'consumables'|'tools' = (rawType === 'consumables' || rawType === 'tools' || rawType === 'materials')
        ? rawType as any
        : (mapped ?? guessTypeByName(p.item));
      return { ...p, _type: t };
    });
  }, [purchases, typeMap]);

  // Очистка оверрайдов, если сервер начал возвращать qty
  useEffect(()=>{
    const idsToClear: number[] = [];
    for (const p of normalized as any[]) {
      const id = Number(p.id);
      if (!id) continue;
      const serverQty = parseQty(p.qty ?? p.quantity ?? p.count);
      const hasOverride = qtyOverrides[String(id)]?.qty != null;
      if (hasOverride && serverQty > 0) idsToClear.push(id);
    }
    if (idsToClear.length) {
      const next = { ...qtyOverrides } as Record<string, { qty: number; unit?: string }>;
      for (const id of idsToClear) delete next[String(id)];
      setQtyOverrides(next);
      try { localStorage.setItem(QTY_OVERRIDE_STORAGE_KEY, JSON.stringify(next)); } catch {}
    }
  }, [normalized]);

  // Все записи закупок/выдач по фильтрам
  const filteredAll = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalized
      .filter(p => {
        const type = p._type as string;
        const byTab = tab === 'consumables' ? type === 'consumables' : tab === 'tools' ? type === 'tools' : type === 'materials';
        const byQ = !q || (String(p.item||'').toLowerCase().includes(q));
        return byTab && byQ;
      });
  }, [normalized, tab, search]);

  // Остатки: используем серверные агрегаты как источник истины + локальные дельты
  const stocks = useMemo(() => {
    // Сервер возвращает: { item, unit, type, in_qty, out_qty, balance }
    const q = search.trim().toLowerCase();
    const rows = (serverStocks as any[]).map(r => ({
      item: String(r.item || '').trim(),
      unit: String(normalizeUnit(r.unit || 'шт')),
      // serverType — сырой тип из БД; typeLabel вычислим отдельно
      serverType: normType(r.type),
      type: normType(r.type) || 'materials',
      remain: Number(r.balance || 0),
    }));
    // Фильтр по активной вкладке и поиску
    const filtered = rows.filter(r => {
      const byTab = tab === 'consumables' ? r.type === 'consumables' : tab === 'tools' ? r.type === 'tools' : (r.type === '' || r.type === 'materials');
      const byQ = !q || r.item.toLowerCase().includes(q);
      return byTab && byQ;
    });
    // Добавляем ключ для идентификации
    const withKeys = filtered.map(r => ({
      key: `${r.item}|${r.unit}|${r.type || 'materials'}`,
      ...r
    }));
    // Сортировка и фильтр режима отображения (без локальных дельт)
    const finalRows = withKeys.filter(r => warehouseOnly ? r.remain > 0 : true)
      .sort((a,b)=> a.item.localeCompare(b.item));
    return finalRows;
  }, [serverStocks, tab, search, warehouseOnly]);

  // состояние списания по строке
  const [issueKey, setIssueKey] = useState<string | null>(null);
  const [issue, setIssue] = useState<{ qty?: string; object_id?: string; assignee_id?: string; date?: string }>({ qty: '', object_id: '', assignee_id: '', date: '' });
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issueSuggestedQty, setIssueSuggestedQty] = useState<number | null>(null);
  // Состояния для редактирования
  const [editingHistory, setEditingHistory] = useState<any|null>(null);
  const [editingPurchase, setEditingPurchase] = useState<any|null>(null);
  const [isEditHistoryOpen, setIsEditHistoryOpen] = useState(false);
  const [isEditPurchaseOpen, setIsEditPurchaseOpen] = useState(false);
  
  // Состояния загрузки
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [isEditingPurchase, setIsEditingPurchase] = useState(false);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);
  const [isDeletingPurchase, setIsDeletingPurchase] = useState(false);
  
  // Формы редактирования
  const [editHistoryForm, setEditHistoryForm] = useState({
    item: '', qty: '', unit: '', type: '', status: '', object_id: '', assignee_id: '', date: ''
  });
  const [editPurchaseForm, setEditPurchaseForm] = useState({
    item: '', qty: '', unit: '', type: '', status: '', object_id: '', assignee_id: '', date: '', amount: ''
  });
  const submitIssue = async (row: { item:string; unit:string; type:string; serverType?: string }) => {
    try {
      const qtyNum = issue.qty ? Number(issue.qty) : NaN;
      if (!isFinite(qtyNum) || qtyNum <= 0) {
        toast({ title: 'Укажите корректное количество для списания', status: 'warning' });
        return;
      }
      const created = await createPurchaseAuto({
        item: row.item,
        qty: qtyNum,
        unit: row.unit,
        // Используем сырой тип, который реально есть в БД для этого товара (из серверной агрегации)
        type: row.serverType ?? row.type,
        object_id: issue.object_id ? Number(issue.object_id) : undefined,
        assignee_id: issue.assignee_id ? Number(issue.assignee_id) : undefined,
        date: issue.date || new Date().toISOString().slice(0,10),
        status: 'issued'
      });
      // Локально уменьшаем остаток
      applyDelta(getKeyFor(row.item, row.unit, row.type), -qtyNum);
      if (created?.id) setQtyOverride(Number(created.id), qtyNum, row.unit);
      // Полная инвалидация всех связанных кэшей для корректного отображения
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['purchases'] }),
        qc.invalidateQueries({ queryKey: ['materials.history'] }),
        qc.invalidateQueries({ queryKey: ['materials.stock'] })
      ]);
      // Сбрасываем локальные дельты после успешной операции
      setLocalDeltas({});
      toast({ title: 'Списано со склада', status: 'success' });
      setIssueKey(null);
      setIssue({ qty:'', object_id:'', assignee_id: '', date:'' });
      setIssueError(null);
      setIssueSuggestedQty(null);
    } catch (e: any) {
      const raw = String(e?.message || '');
      let available: number | null = null;
      let requested: number | null = null;
      let unitTxt: string | null = null;
      // 1) Пытаемся вытащить JSON { detail: {...} } из текста
      try {
        const jsonStart = raw.indexOf('{');
        if (jsonStart >= 0) {
          const jsonText = raw.slice(jsonStart).trim();
          const parsed = JSON.parse(jsonText);
          const detail = parsed?.detail ?? parsed;
          if (detail && typeof detail === 'object' && detail.code === 'stock_insufficient') {
            available = Number(detail.available ?? 0);
            requested = Number(detail.requested ?? 0);
            unitTxt = String(detail.unit ?? '') || row.unit;
          }
        }
      } catch {}
      // 2) Фолбэк: ищем числа в тексте
      if (available === null || requested === null) {
        const m = raw.match(/доступно\s(-?\d+(?:[\.,]\d+)?)[^\d]+(запрошено|попытка списать)\s(\d+(?:[\.,]\d+)?)/i);
        if (m) {
          available = Number((m[1] || '0').replace(',', '.'));
          requested = Number((m[3] || '0').replace(',', '.'));
        }
      }
      const shownAvailable = Math.max(0, available ?? 0);
      const nice = available != null && requested != null
        ? `Недостаточно на складе. Доступно: ${shownAvailable} ${unitTxt || row.unit}. Запрошено: ${requested} ${unitTxt || row.unit}.`
        : 'Не удалось списать. Проверьте количество.';
      setIssueError(nice);
      setIssueSuggestedQty(!isNaN(shownAvailable) ? shownAvailable : null);
      toast({ title: 'Недостаточно на складе', description: nice, status: 'warning', duration: 5000 });
      // Обновим серверные остатки, чтобы карточки сразу показали реальный баланс
      await qc.invalidateQueries({ queryKey: ['materials.stock'] });
    }
  };

  const [form, setForm] = useState<{ item: string; amount?: string; qty?: string; unit?: string; type?: string; object_id?: string; assignee_id?: string; date?: string; receipt?: File | null; }>(
    { item: '', amount: '', qty: '', unit: 'шт', type: 'materials', object_id: '', assignee_id: '', date: '', receipt: null }
  );

  // Функции редактирования и удаления
  const handleEditHistory = (record: any) => {
    setEditingHistory(record);
    setEditHistoryForm({
      item: record.item || '',
      qty: String(record.qty || record.quantity || record.count || ''),
      unit: record.unit || 'шт',
      type: record.type || 'materials',
      status: record.status || '',
      object_id: String(record.object_id || ''),
      assignee_id: String(record.assignee_id || ''),
      date: record.date || record.created_at || new Date().toISOString().slice(0,10)
    });
    setIsEditHistoryOpen(true);
  };

  const handleEditPurchase = (record: any) => {
    setEditingPurchase(record);
    setEditPurchaseForm({
      item: record.item || '',
      qty: String(record.qty || record.quantity || record.count || ''),
      unit: record.unit || 'шт',
      type: record.type || 'materials',
      status: record.status || '',
      object_id: String(record.object_id || ''),
      assignee_id: String(record.assignee_id || ''),
      date: record.date || new Date().toISOString().slice(0,10),
      amount: String(record.amount || record.price || '')
    });
    setIsEditPurchaseOpen(true);
  };

  const submitEditHistory = async () => {
    try {
      setIsEditingHistory(true);
      if (!editHistoryForm.item.trim()) {
        toast({ title: 'Укажите наименование', status: 'warning' });
        return;
      }
      
      const qtyNum = Number(editHistoryForm.qty);
      if (!isFinite(qtyNum) || qtyNum <= 0) {
        toast({ title: 'Укажите корректное количество', status: 'warning' });
        return;
      }
      
      if (!editHistoryForm.unit.trim()) {
        toast({ title: 'Укажите единицу измерения', status: 'warning' });
        return;
      }
      
      if (!editHistoryForm.type) {
        toast({ title: 'Выберите тип материала', status: 'warning' });
        return;
      }
      
      if (!editHistoryForm.status) {
        toast({ title: 'Выберите статус операции', status: 'warning' });
        return;
      }
      
      const payload = {
        item: editHistoryForm.item.trim(),
        qty: qtyNum,
        unit: editHistoryForm.unit,
        type: editHistoryForm.type,
        status: editHistoryForm.status,
        object_id: editHistoryForm.object_id ? Number(editHistoryForm.object_id) : undefined,
        assignee_id: editHistoryForm.assignee_id ? Number(editHistoryForm.assignee_id) : undefined,
        date: editHistoryForm.date
      };

      await updateHistory(editingHistory.id, payload);
      
      toast({ title: 'Запись истории обновлена', status: 'success' });
      setIsEditHistoryOpen(false);
      setEditingHistory(null);
      
      // Обновляем кэш
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['materials.history'] }),
        qc.invalidateQueries({ queryKey: ['materials.stock'] })
      ]);
    } catch (e: any) {
      const errorMsg = e?.message || 'Неизвестная ошибка при обновлении';
      toast({ title: 'Ошибка обновления', description: errorMsg, status: 'error', duration: 5000 });
    }
  };

  const submitEditPurchase = async () => {
    try {
      setIsEditingPurchase(true);
      if (!editPurchaseForm.item.trim()) {
        toast({ title: 'Укажите наименование', status: 'warning' });
        setIsEditingPurchase(false);
        return;
      }
      
      const qtyNum = Number(editPurchaseForm.qty);
      if (!isFinite(qtyNum) || qtyNum <= 0) {
        toast({ title: 'Укажите корректное количество', status: 'warning' });
        setIsEditingPurchase(false);
        return;
      }
      
      if (!editPurchaseForm.unit.trim()) {
        toast({ title: 'Укажите единицу измерения', status: 'warning' });
        setIsEditingPurchase(false);
        return;
      }
      
      if (!editPurchaseForm.type) {
        toast({ title: 'Выберите тип материала', status: 'warning' });
        setIsEditingPurchase(false);
        return;
      }
      
      if (!editPurchaseForm.status) {
        toast({ title: 'Выберите статус операции', status: 'warning' });
        setIsEditingPurchase(false);
        return;
      }
      
      const amountNum = Number(editPurchaseForm.amount);
      if (isFinite(amountNum) && amountNum < 0) {
        toast({ title: 'Цена не может быть отрицательной', status: 'warning' });
        setIsEditingPurchase(false);
        return;
      }
      
      const payload = {
        item: editPurchaseForm.item.trim(),
        qty: qtyNum,
        unit: editPurchaseForm.unit,
        type: editPurchaseForm.type,
        status: editPurchaseForm.status,
        object_id: editPurchaseForm.object_id ? Number(editPurchaseForm.object_id) : undefined,
        assignee_id: editPurchaseForm.assignee_id ? Number(editPurchaseForm.assignee_id) : undefined,
        date: editPurchaseForm.date,
        amount: isFinite(amountNum) ? amountNum : 0
      };

      await updatePurchase(editingPurchase.id, payload);
      
      toast({ title: 'Закупка обновлена', status: 'success' });
      setIsEditPurchaseOpen(false);
      setEditingPurchase(null);
      
      // Обновляем кэш
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['purchases'] }),
        qc.invalidateQueries({ queryKey: ['materials.history'] }),
        qc.invalidateQueries({ queryKey: ['materials.stock'] })
      ]);
    } catch (e: any) {
      const errorMsg = e?.message || 'Неизвестная ошибка при обновлении';
      toast({ title: 'Ошибка обновления', description: errorMsg, status: 'error', duration: 5000 });
    } finally {
      setIsEditingPurchase(false);
    }
  };

  const handleDeleteHistory = async (record: any) => {
    try {
      if (window.confirm(`Удалить запись "${record.item}"?`)) {
        setIsDeletingHistory(true);
        await deleteHistory(record.id);
        
        toast({ title: 'Запись удалена', status: 'success' });
        
        // Обновляем кэш
        await Promise.all([
          qc.invalidateQueries({ queryKey: ['materials.history'] }),
          qc.invalidateQueries({ queryKey: ['materials.stock'] })
        ]);
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'Неизвестная ошибка при удалении';
      toast({ title: 'Ошибка удаления', description: errorMsg, status: 'error', duration: 5000 });
    } finally {
      setIsDeletingHistory(false);
    }
  };

  const handleDeletePurchase = async (record: any) => {
    try {
      if (window.confirm(`Удалить закупку "${record.item}"?`)) {
        setIsDeletingPurchase(true);
        await deletePurchase(record.id);
        
        toast({ title: 'Закупка удалена', status: 'success' });
        
        // Обновляем кэш
        await Promise.all([
          qc.invalidateQueries({ queryKey: ['purchases'] }),
          qc.invalidateQueries({ queryKey: ['materials.history'] }),
          qc.invalidateQueries({ queryKey: ['materials.stock'] })
        ]);
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'Неизвестная ошибка при удалении';
      toast({ title: 'Ошибка удаления', description: errorMsg, status: 'error', duration: 5000 });
    } finally {
      setIsDeletingPurchase(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Материалы — ПромСтрой Контроль</title>
        <meta name="description" content="Управление материалами: склад, закупки, расходники и инструмент." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="lg" color="brand.500">Материалы</Heading>
            <Text color="text.secondary" mt={1}>Склад и закупки</Text>
          </Box>
          <Button variant="outline" as={Link} to="/finances">Оформить закупку в Финансах</Button>
        </HStack>

        {/* Вкладки по типам материалов */}
        <Tabs index={{ materials:0, consumables:1, tools:2 }[tab]} onChange={(i)=> setTab((['materials','consumables','tools'] as any)[i])} variant="soft-rounded" colorScheme="green">
          <TabList>
            <Tab>Материалы</Tab>
            <Tab>Расходники</Tab>
            <Tab>Инструмент</Tab>
          </TabList>
        </Tabs>

        {/* Новые вкладки: Склад, История, Закупки */}
        <Tabs variant="enclosed" colorScheme="green" mt={6}>
          <TabList>
            <Tab>Склад</Tab>
            <Tab>История</Tab>
            <Tab>Закупки</Tab>
          </TabList>
          <TabPanels>
            {/* Вкладка: Склад */}
            <TabPanel px={0}>
              <Box mb={6}>
                <HStack gap={3} align="center" mb={4} flexWrap="wrap">
                  <FormControl maxW="sm">
                    <FormLabel htmlFor="searchByName" mb={1} fontSize="sm" color="gray.600">Поиск по названию</FormLabel>
                    <Input 
                      id="searchByName" 
                      placeholder="Например: бур, цемент..." 
                      value={search} 
                      onChange={(e)=> setSearch(e.target.value)}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                    />
                  </FormControl>
                  <FormControl maxW="48">
                    <FormLabel id="stockViewLabel" htmlFor="stockView" mb={1} fontSize="sm" color="gray.600">Отображение</FormLabel>
                    <CSelect 
                      id="stockView" 
                      aria-labelledby="stockViewLabel" 
                      aria-label="Режим отображения" 
                      title="Режим отображения склада" 
                      value={warehouseOnly ? 'warehouse' : 'all'} 
                      onChange={(e)=> setWarehouseOnly(e.target.value==='warehouse')}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                    >
                      <option value="warehouse">На складе</option>
                      <option value="all">Все записи</option>
                    </CSelect>
                  </FormControl>
                </HStack>

                <Heading size="md" mb={4} color="gray.800">Остатки на складе</Heading>
                <HStack justify="space-between" align="center" mb={4}>
                  <Text color="gray.600" fontSize="sm">Управление складскими остатками</Text>
                  <HStack gap={2}>
                    <Button 
                      leftIcon={<Download size={16} />} 
                      variant="outline" 
                      colorScheme="gray"
                      borderRadius="full"
                      size="sm"
                      onClick={() => downloadCSV('materials_stock.csv', stocks)}
                    >
                      Экспорт CSV
                    </Button>
                    <Button 
                      leftIcon={<Plus size={16} />} 
                      variant="solid"
                      colorScheme="green"
                      borderRadius="full"
                      size="sm"
                      onClick={() => { setForm(f => ({ ...f, type: tab } as any)); openIncome(); }}
                    >
                      Добавить на склад
                    </Button>
                  </HStack>
                </HStack>
                
                {/* Карточки остатков */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                  <AnimatePresence initial={false}>
                    {stocks.slice(0, 50).map((r) => (
                      <Box
                        as={motion.div}
                        key={r.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        bg="white"
                        p={4}
                        borderRadius="xl"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.100"
                        _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                        transitionDuration="0.2s"
                      >
                        <VStack align="stretch" spacing={3}>
                          <Box>
                            <Text fontWeight="600" fontSize="md" color="gray.900" noOfLines={2}>
                              {r.item}
                            </Text>
                            <HStack mt={2} gap={2}>
                              <Badge colorScheme="blue" borderRadius="full" px={2} py={1} fontSize="xs">
                                {typeLabel(r.type)}
                              </Badge>
                              <Text fontSize="sm" color="gray.500">
                                {r.unit}
                              </Text>
              </HStack>
                          </Box>
                          
                          <Box>
                            <Text fontSize="2xl" fontWeight="bold" color={r.remain > 0 ? "green.600" : "red.600"}>
                              {r.remain}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              доступно
                            </Text>
                          </Box>

                          <Button
                            size="sm"
                            variant="solid"
                            colorScheme="green"
                            borderRadius="full"
                            onClick={() => { setIssueKey(r.key); setIssue({ qty:'', object_id:'', assignee_id:'', date:'' }); }}
                            isDisabled={r.remain <= 0}
                          >
                            Списать
                          </Button>
                        </VStack>
                      </Box>
                    ))}
                  </AnimatePresence>
        </SimpleGrid>

                {/* Форма списания */}
                <AnimatePresence>
                  {issueKey && (() => { 
                    const row = stocks.find(x => x.key === issueKey)!; 
                    return (
                      <Box
                        as={motion.div}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        mt={6}
                        p={6}
                        bg="gray.50"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <Heading size="md" mb={4} color="gray.800">
                          Списать: {row.item} ({row.remain} {row.unit})
                        </Heading>
                        <VStack align="stretch" spacing={4}>
                          <HStack gap={4}>
                            <FormControl isInvalid={!!issueError || (!!issue.qty && Number(issue.qty) > Number(row.remain))}>
                              <FormLabel htmlFor="issueQty" fontSize="sm" color="gray.600">Количество</FormLabel>
                              <Input 
                                id="issueQty" 
                                type="number"
                                min={0}
                                step="any"
                                max={Number(row.remain) || undefined}
                                value={issue.qty} 
                                onChange={(e) => setIssue(i => ({...i, qty: e.target.value}))} 
                                placeholder={`до ${row.remain}`}
                                borderRadius="lg"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                                isInvalid={!!issueError || (!!issue.qty && Number(issue.qty) > Number(row.remain))}
                              />
                              {(!!issue.qty && Number(issue.qty) > Number(row.remain)) ? (
                                <FormErrorMessage>На складе доступно: {row.remain} {row.unit}</FormErrorMessage>
                              ) : (
                                issueError && (<FormErrorMessage>{issueError}</FormErrorMessage>)
                              )}
                            </FormControl>
                            <FormControl>
                              <FormLabel htmlFor="issueUnit" fontSize="sm" color="gray.600">Единица</FormLabel>
            <Input 
                                id="issueUnit" 
                                isReadOnly 
                                value={row.unit}
                                bg="gray.100"
                                borderRadius="lg"
                              />
                            </FormControl>
                          </HStack>

                          {issueError && (
                            <Alert status="error" borderRadius="md">
                              <AlertIcon />
                              <VStack align="start" spacing={1} w="full">
                                <AlertTitle>Невозможно списать</AlertTitle>
                                <AlertDescription>
                                  {issueError}
                                  {typeof issueSuggestedQty === 'number' && (
                                    <Button ml={3} size="xs" variant="outline" colorScheme="red" onClick={() => setIssue(i => ({...i, qty: String(issueSuggestedQty)}))}>
                                      Подставить доступное
                                    </Button>
                                  )}
                                  {typeof issueSuggestedQty === 'number' && issueSuggestedQty > 0 && (
                                    <Button ml={2} size="xs" variant="solid" colorScheme="green" onClick={() => { setIssue(i => ({...i, qty: String(issueSuggestedQty)})); setTimeout(() => submitIssue(row), 0); }}>
                                      Списать доступное
                                    </Button>
                                  )}
                                </AlertDescription>
                              </VStack>
                            </Alert>
                          )}
                          
                          <HStack gap={4}>
                            <FormControl>
                              <FormLabel htmlFor="issueObject" fontSize="sm" color="gray.600">Объект</FormLabel>
                              <CSelect 
                                id="issueObject" 
                                title="Выбор объекта для списания" 
                                aria-label="Выбор объекта для списания" 
                                value={issue.object_id} 
                                onChange={(e) => setIssue(i => ({...i, object_id: e.target.value}))}
                                borderRadius="lg"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                              >
                                <option value="">—</option>
                                {objects.map((o:any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                              </CSelect>
                            </FormControl>
                            <FormControl>
                              <FormLabel htmlFor="issueAssignee" fontSize="sm" color="gray.600">Кому</FormLabel>
                              <CSelect 
                                id="issueAssignee" 
                                title="Выбор получателя" 
                                aria-label="Выбор получателя" 
                                value={issue.assignee_id} 
                                onChange={(e) => setIssue(i => ({...i, assignee_id: e.target.value}))}
                                borderRadius="lg"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                              >
                                <option value="">—</option>
                                {users.map((u:any) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                              </CSelect>
                            </FormControl>
                            <FormControl>
                              <FormLabel htmlFor="issueDate" fontSize="sm" color="gray.600">Дата</FormLabel>
                              <Input 
                                id="issueDate" 
                                type="date" 
                                value={issue.date} 
                                onChange={(e) => setIssue(i => ({...i, date: e.target.value}))}
                                borderRadius="lg"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                              />
                            </FormControl>
                          </HStack>
                          
                          <HStack justify="flex-end" pt={2}>
                            <Button 
                              variant="ghost" 
                              colorScheme="gray"
                              onClick={() => { setIssueKey(null); setIssueError(null); setIssueSuggestedQty(null); }}
                              borderRadius="full"
                            >
                              Отмена
                            </Button>
                            <Button 
                              variant="solid" 
                              colorScheme="green"
                              borderRadius="full"
                              onClick={() => submitIssue(row)}
                              isDisabled={!issue.qty || Number(issue.qty) <= 0 || Number(issue.qty) > Number(row.remain)}
                            >
                              Списать
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    ); 
                  })()}
                </AnimatePresence>
          </Box>
            </TabPanel>

            {/* Вкладка: История */}
            <TabPanel px={0}>
              <Box mb={6}>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md" color="gray.800">История движений</Heading>
                  <HStack gap={2}>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      colorScheme="gray"
                      borderRadius="full"
                      onClick={() => downloadCSV('materials_history.csv', history as any[])}
                    >
                      Экспорт CSV
                    </Button>
                  </HStack>
                </HStack>

                <Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Дата</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Наименование</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Тип</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600" isNumeric>Кол-во</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Ед.</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Статус</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Объект</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Кому</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Чек/Ссылка</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600" isNumeric>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                      {(history as any[])
                        .filter(h => {
                          const t = (h.type||'').toLowerCase();
                          return tab === 'materials' ? (t==='' || t==='materials') : tab === 'consumables' ? t==='consumables' : t==='tools';
                        })
                        .slice(0, 100)
                        .map((h: any) => (
                          <Tr key={`hist-${h.id}`} _hover={{ bg: "gray.50" }}>
                            <Td px={4} py={3} fontSize="sm">{h.date || h.created_at || '—'}</Td>
                            <Td px={4} py={3} fontWeight="500">{h.item}</Td>
                            <Td px={4} py={3}>
                              <Badge colorScheme="blue" borderRadius="full" px={2} py={1} fontSize="xs">
                                {typeLabel(h.type)}
                              </Badge>
                            </Td>
                            <Td px={4} py={3} isNumeric fontSize="sm">{Number(h.qty||0)}</Td>
                            <Td px={4} py={3} fontSize="sm">{h.unit || 'шт'}</Td>
                            <Td px={4} py={3}>
                              {(['issued','writeoff','spent'].includes(String(h.status||'').toLowerCase())) ? (
                                <Badge colorScheme="red" borderRadius="full" px={2} py={1} fontSize="xs">Списание</Badge>
                              ) : (
                                <Badge colorScheme="green" borderRadius="full" px={2} py={1} fontSize="xs">Приход</Badge>
                              )}
                            </Td>
                            <Td px={4} py={3} fontSize="sm">{objects.find((o:any) => String(o.id)===String(h.object_id))?.name ?? '—'}</Td>
                            <Td px={4} py={3} fontSize="sm">{users.find((u:any) => String(u.id)===String(h.assignee_id))?.full_name ?? '—'}</Td>
                            <Td px={4} py={3} fontSize="sm">
                              {h.receipt_file ? (
                                <Button size="xs" variant="link" colorScheme="blue" as="a" href={h.receipt_file} target="_blank" rel="noreferrer">
                                  Чек
                                </Button>
                              ) : h.url ? (
                                <Button size="xs" variant="link" colorScheme="blue" as="a" href={h.url} target="_blank" rel="noreferrer">
                                  Ссылка
                                </Button>
                              ) : '—'}
                            </Td>
                            <Td px={4} py={3} isNumeric>
                              <HStack justify="flex-end">
                                <Button 
                                  size="xs" 
                                  variant="outline" 
                                  colorScheme="green" 
                                  borderRadius="full"
                                  onClick={() => handleEditHistory(h)}
                                  leftIcon={<Pencil size={14} />}
                                  _hover={{ bg: 'green.50', borderColor: 'green.300' }}
                                  _active={{ bg: 'green.100' }}
                                >
                                  Ред.
                                </Button>
                                <Button 
                                  size="xs" 
                                  variant="outline" 
                                  colorScheme="red" 
                                  borderRadius="full"
                                  onClick={() => handleDeleteHistory(h)}
                                  _hover={{ bg: 'red.50', borderColor: 'red.300' }}
                                  _active={{ bg: 'red.100' }}
                                  isLoading={isDeletingHistory}
                                  loadingText="..."
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>

            {/* Вкладка: Закупки */}
            <TabPanel px={0}>
              <Box mb={6}>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md" color="gray.800">Все записи закупок</Heading>
                  <HStack gap={2}>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      colorScheme="gray"
                      borderRadius="full"
                      onClick={() => downloadCSV('materials.csv', filteredAll)}
                    >
                      Экспорт CSV
                    </Button>
                  </HStack>
                </HStack>
                
                <Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Наименование</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Тип</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Кол-во</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Ед.</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Статус</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Дата</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Объект</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600" isNumeric>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredAll.slice(0, 100).map((p: any) => (
                        <Tr key={`purchase-${p.id}`} _hover={{ bg: "gray.50" }}>
                          <Td px={4} py={3} fontWeight="500">{p.item}</Td>
                          <Td px={4} py={3}>
                            <Badge colorScheme="blue" borderRadius="full" px={2} py={1} fontSize="xs">
                              {typeLabel(p._type)}
                            </Badge>
                          </Td>
                          <Td px={4} py={3} fontSize="sm">{Number(p.qty || p.quantity || p.count || 0)}</Td>
                          <Td px={4} py={3} fontSize="sm">{p.unit || 'шт'}</Td>
                          <Td px={4} py={3}>
                            {isIssuedStatus(p.status || '') ? (
                              <Badge colorScheme="red" borderRadius="full" px={2} py={1} fontSize="xs">Списание</Badge>
                            ) : (
                              <Badge colorScheme="green" borderRadius="full" px={2} py={1} fontSize="xs">Приход</Badge>
                            )}
                          </Td>
                          <Td px={4} py={3} fontSize="sm">{p.date || '—'}</Td>
                          <Td px={4} py={3} fontSize="sm">{objects.find((o:any) => String(o.id)===String(p.object_id))?.name ?? '—'}</Td>
                          <Td px={4} py={3} isNumeric>
                            <HStack justify="flex-end">
                              <Button 
                                size="xs" 
                                variant="outline" 
                                colorScheme="green" 
                                borderRadius="full"
                                onClick={() => handleEditPurchase(p)}
                                leftIcon={<Pencil size={14} />}
                                _hover={{ bg: 'green.50', borderColor: 'green.300' }}
                                _active={{ bg: 'green.100' }}
                              >
                                Ред.
                              </Button>
                              <Button 
                                size="xs" 
                                variant="outline" 
                                colorScheme="red" 
                                borderRadius="full"
                                onClick={() => handleDeletePurchase(p)}
                                _hover={{ bg: 'red.50', borderColor: 'red.300' }}
                                _active={{ bg: 'red.100' }}
                                isLoading={isDeletingPurchase}
                                loadingText="..."
                              >
                                <Trash2 size={14} />
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Модалка: Приход на склад (без покупки) */}
        <MaterialsIncomeModal
          isOpen={isIncomeOpen}
          onClose={closeIncome}
          form={form}
          setForm={setForm}
          objects={objects}
          onCreated={async (created)=>{
            const item = (form.item || '').trim();
            const qtyNum = form.qty ? Number(form.qty) : NaN;
            const unit = (form.unit || '').trim() || 'шт';
            const type = (form.type || 'materials');
            applyDelta(getKeyFor(item, unit, type), qtyNum);
            if (created?.id) setQtyOverride(Number(created.id), qtyNum, unit);
            updateTypeMap(item, type as 'materials'|'consumables'|'tools');
            setForm(f=>({ ...f, item:'', qty:'', amount:'', date:'' }));
            setTab((type as 'materials'|'consumables'|'tools'));
            setSearch('');
            await Promise.all([
              qc.invalidateQueries({ queryKey: ['purchases'] }),
              qc.invalidateQueries({ queryKey: ['materials.history'] }),
              qc.invalidateQueries({ queryKey: ['materials.stock'] })
            ]);
            setLocalDeltas({});
          }}
        />
        
        {/* Модалка редактирования истории */}
        <Modal isOpen={isEditHistoryOpen} onClose={() => { setIsEditHistoryOpen(false); setEditingHistory(null); }} isCentered>
          <ModalOverlay />
          <ModalContent 
            as={motion.div} 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -12 }} 
            borderRadius="xl"
            boxShadow="xl"
          >
            <ModalHeader>Редактирование записи истории</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={3}>
                <FormControl>
                  <FormLabel htmlFor="editHistoryItem">Наименование</FormLabel>
                  <Input 
                    id="editHistoryItem" 
                    value={editHistoryForm.item} 
                    onChange={(e)=> setEditHistoryForm(h => ({...h, item: e.target.value}))}
                  />
                </FormControl>
                <HStack>
                  <FormControl>
                    <FormLabel htmlFor="editHistoryQty">Кол-во</FormLabel>
                    <Input id="editHistoryQty" value={editHistoryForm.qty} onChange={(e)=> setEditHistoryForm(h => ({...h, qty: e.target.value}))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="editHistoryUnit">Ед.</FormLabel>
                    <CSelect id="editHistoryUnit" title="Единица измерения для истории" aria-label="Единица измерения для истории" value={editHistoryForm.unit} onChange={(e)=> setEditHistoryForm(h => ({...h, unit: e.target.value}))}>
                      {allowedUnits.map(u=> <option key={u.code} value={u.code}>{u.label}</option>)}
                    </CSelect>
                  </FormControl>
                </HStack>
                <FormControl>
                  <FormLabel htmlFor="editHistoryType">Тип</FormLabel>
                  <CSelect id="editHistoryType" title="Тип материала для истории" aria-label="Тип материала для истории" value={editHistoryForm.type} onChange={(e)=> setEditHistoryForm(h => ({...h, type: e.target.value}))}>
                    <option value="materials">Материалы</option>
                    <option value="consumables">Расходники</option>
                    <option value="tools">Инструмент</option>
                  </CSelect>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="editHistoryStatus">Статус</FormLabel>
                  <CSelect id="editHistoryStatus" title="Статус операции для истории" aria-label="Статус операции для истории" value={editHistoryForm.status} onChange={(e)=> setEditHistoryForm(h => ({...h, status: e.target.value}))}>
                    <option value="stock_in">Приход</option>
                    <option value="issued">Списание</option>
                    <option value="writeoff">Списание</option>
                    <option value="spent">Списание</option>
                  </CSelect>
                </FormControl>
                <HStack>
                  <FormControl>
                    <FormLabel htmlFor="editHistoryObject">Объект</FormLabel>
                    <CSelect id="editHistoryObject" title="Объект для истории" aria-label="Объект для истории" value={editHistoryForm.object_id} onChange={(e)=> setEditHistoryForm(h => ({...h, object_id: e.target.value}))}>
                      <option value="">—</option>
                      {objects.map((o:any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </CSelect>
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="editHistoryAssignee">Кому</FormLabel>
                    <CSelect id="editHistoryAssignee" title="Исполнитель для истории" aria-label="Исполнитель для истории" value={editHistoryForm.assignee_id} onChange={(e)=> setEditHistoryForm(h => ({...h, assignee_id: e.target.value}))}>
                      <option value="">—</option>
                      {users.map((u:any) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                    </CSelect>
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="editHistoryDate">Дата</FormLabel>
                    <Input id="editHistoryDate" type="date" value={editHistoryForm.date} onChange={(e)=> setEditHistoryForm(h => ({...h, date: e.target.value}))} />
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button variant="ghost" onClick={() => { setIsEditHistoryOpen(false); setEditingHistory(null); }}>Отмена</Button>
                <Button variant="solid" colorScheme="green" onClick={submitEditHistory} isDisabled={!editHistoryForm.item.trim()} borderRadius="full" isLoading={isEditingHistory} loadingText="Сохранение...">Сохранить</Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Модалка редактирования закупки */}
        <Modal isOpen={isEditPurchaseOpen} onClose={() => { setIsEditPurchaseOpen(false); setEditingPurchase(null); }} isCentered>
          <ModalOverlay />
          <ModalContent 
            as={motion.div} 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -12 }} 
            borderRadius="xl"
            boxShadow="xl"
          >
            <ModalHeader>Редактирование закупки</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={3}>
                <FormControl>
                  <FormLabel htmlFor="editPurchaseItem">Наименование</FormLabel>
                  <Input 
                    id="editPurchaseItem" 
                    value={editPurchaseForm.item} 
                    onChange={(e)=> setEditPurchaseForm(p => ({...p, item: e.target.value}))}
                    borderRadius="lg"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                  />
                </FormControl>
                <HStack>
                  <FormControl>
                    <FormLabel htmlFor="editPurchaseQty">Кол-во</FormLabel>
                    <Input 
                      id="editPurchaseQty" 
                      value={editPurchaseForm.qty} 
                      onChange={(e)=> setEditPurchaseForm(p => ({...p, qty: e.target.value}))}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="editPurchaseUnit">Ед.</FormLabel>
                    <CSelect 
                      id="editPurchaseUnit" 
                      title="Единица измерения для закупки" 
                      aria-label="Единица измерения для закупки" 
                      value={editPurchaseForm.unit} 
                      onChange={(e)=> setEditPurchaseForm(p => ({...p, unit: e.target.value}))}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                    >
                      {allowedUnits.map(u=> <option key={u.code} value={u.code}>{u.label}</option>)}
                    </CSelect>
                  </FormControl>
                </HStack>
                <FormControl>
                  <FormLabel htmlFor="editPurchaseType">Тип</FormLabel>
                  <CSelect 
                    id="editPurchaseType" 
                    title="Тип материала для закупки" 
                    aria-label="Тип материала для закупки" 
                    value={editPurchaseForm.type} 
                    onChange={(e)=> setEditPurchaseForm(p => ({...p, type: e.target.value}))}
                    borderRadius="lg"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                  >
                    <option value="materials">Материалы</option>
                    <option value="consumables">Расходники</option>
                    <option value="tools">Инструмент</option>
                  </CSelect>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="editPurchaseStatus">Статус</FormLabel>
                  <CSelect 
                    id="editPurchaseStatus" 
                    title="Статус операции для закупки" 
                    aria-label="Статус операции для закупки" 
                    value={editPurchaseForm.status} 
                    onChange={(e)=> setEditPurchaseForm(p => ({...p, status: e.target.value}))}
                    borderRadius="lg"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                    >
                    <option value="stock_in">Приход</option>
                    <option value="issued">Списание</option>
                    <option value="writeoff">Списание</option>
                    <option value="spent">Списание</option>
                  </CSelect>
                </FormControl>
                <HStack>
                  <FormControl>
                    <FormLabel htmlFor="editPurchaseObject">Объект</FormLabel>
                    <CSelect 
                      id="editPurchaseObject" 
                      title="Объект для закупки" 
                      aria-label="Объект для закупки" 
                      value={editPurchaseForm.object_id} 
                      onChange={(e)=> setEditPurchaseForm(p => ({...p, object_id: e.target.value}))}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                    >
                      <option value="">—</option>
                      {objects.map((o:any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </CSelect>
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="editPurchaseAssignee">Кому</FormLabel>
                    <CSelect 
                      id="editPurchaseAssignee" 
                      title="Исполнитель для закупки" 
                      aria-label="Исполнитель для закупки" 
                      value={editPurchaseForm.assignee_id}
                      onChange={(e)=> setEditPurchaseForm(p => ({...p, assignee_id: e.target.value}))}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                    >
                      <option value="">—</option>
                      {users.map((u:any) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                    </CSelect>
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="editPurchaseDate">Дата</FormLabel>
                    <Input id="editPurchaseDate" type="date" value={editPurchaseForm.date} onChange={(e)=> setEditPurchaseForm(p => ({...p, date: e.target.value}))} />
                  </FormControl>
                </HStack>
                <HStack>
                  <FormControl>
                    <FormLabel htmlFor="editPurchaseAmount">Цена за единицу, ₽</FormLabel>
                    <Input id="editPurchaseAmount" value={editPurchaseForm.amount} onChange={(e)=> setEditPurchaseForm(p => ({...p, amount: e.target.value}))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Итого, ₽</FormLabel>
                    <Input isReadOnly value={(()=>{ const q = Number(editPurchaseForm.qty||0)||0; const p = Number(editPurchaseForm.amount||0)||0; return (q*p).toFixed(2); })()} />
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button variant="ghost" onClick={() => { setIsEditPurchaseOpen(false); setEditingPurchase(null); }}>Отмена</Button>
                <Button variant="solid" colorScheme="green" onClick={submitEditPurchase} isDisabled={!editPurchaseForm.item.trim()} borderRadius="full" isLoading={isEditingPurchase} loadingText="Сохранение...">Сохранить</Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default Materials;