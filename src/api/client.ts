import { ObjectEntity, User, Task, Purchase, Salary, Absence, Timesheet, Setting, ObjectMaterial, NotificationItem, Item, Supplier, Customer, Invoice, Budget, CashTransaction, OtherExpense, Payment, Document, WarehouseConsumption } from '@/types';

let AUTH_TOKEN: string | null = null;

export function setAuthToken(token: string | null) { AUTH_TOKEN = token; }

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const API_PREFIX = (import.meta as any).env?.VITE_API_PREFIX ?? "/api";

function resolvePath(path: string): string {
  if (path.startsWith("/api")) return `${API_PREFIX}${path.slice(4)}`;
  return path;
}

function apiUrl(path: string): string {
  return `${BASE_URL}${resolvePath(path)}`;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (AUTH_TOKEN) headers.set("Authorization", `Bearer ${AUTH_TOKEN}`);
  const res = await fetch(apiUrl(path), { ...init, headers });
  if (!res.ok) {
    let details = '';
    try { details = await res.text(); } catch {}
    try {
      const parsed = JSON.parse(details);
      if (parsed && typeof parsed === 'object' && parsed.detail) {
        throw new Error(JSON.stringify({ detail: parsed.detail }));
      }
    } catch {}
    throw new Error(`API ${path} failed: ${res.status} ${details ? '- ' + details : ''}`);
  }
  return res.json();
}

export function getObjects() { return fetchJson<ObjectEntity[]>("/api/objects"); }
export function getUsers() { return fetchJson<User[]>("/api/users"); }
export function getTasks() { return fetchJson<Task[]>("/api/tasks"); }
export function getPurchases() { return fetchJson<Purchase[]>("/api/purchases"); }
export function getSalaries() { return fetchJson<Salary[]>("/api/salaries"); }
export function getAbsences() { return fetchJson<Absence[]>("/api/absences"); }
export function getTimesheets() { return fetchJson<Timesheet[]>("/api/timesheets"); }
export function getSettings() { return fetchJson<Setting[]>("/api/settings"); }
export function putSetting(key: string, value: unknown) {
  return fetchJson<{ ok: boolean; key: string }>(`/api/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
}
export function login(username: string, password: string) {
  return fetchJson<{ token: string; user: User }>(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}
export function me() { 
  return fetchJson<User>(`/api/auth/me`); 
}
export function getMetrics() { return fetchJson<any>(`/api/metrics`); }
export function createTask(payload: Partial<Task>) {
  return fetchJson<Task>(`/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
export function updateTask(id: number, payload: Partial<Task>) {
  return fetchJson<Task>(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
export function createPurchase(payload: Partial<Purchase>) {
  return fetchJson<Purchase>(`/api/purchases`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
export async function createPurchaseMultipart(payload: { item: string; amount?: number | string; qty?: number; unit?: string; type?: string; object_id?: number; assignee_id?: number; date?: string; receipt?: File | null; status?: string; supplier_id?: number; url?: string; }) {
  const form = new FormData();
  form.append("item", payload.item);
  if (payload.amount != null) form.append("amount", String(payload.amount));
  if (payload.qty != null) { form.append("qty", String(payload.qty)); form.append("quantity", String(payload.qty)); form.append("count", String(payload.qty)); }
  if (payload.unit) { form.append("unit", payload.unit); form.append("units", payload.unit); }
  if (payload.type) { form.append("type", payload.type); form.append("category", payload.type); }
  if (payload.object_id != null) form.append("object_id", String(payload.object_id));
  if (payload.assignee_id != null) form.append("assignee_id", String(payload.assignee_id));
  if (payload.supplier_id != null) form.append("supplier_id", String(payload.supplier_id));
  if (payload.url) form.append("url", payload.url);
  if (payload.date) form.append("date", payload.date);
  if (payload.status) form.append("status", payload.status);
  if (payload.receipt) form.append("receipt", payload.receipt);
  const headers: HeadersInit = {};
  if (AUTH_TOKEN) (headers as any)["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  const res = await fetch(apiUrl(`/api/purchases`), { method: "POST", headers, body: form });
  if (!res.ok) {
    let details = '';
    try { details = await res.text(); } catch {}
    try {
      const parsed = JSON.parse(details);
      if (parsed && typeof parsed === 'object' && parsed.detail) {
        throw new Error(JSON.stringify({ detail: parsed.detail }));
      }
    } catch {}
    throw new Error(`API /api/purchases failed: ${res.status} ${details ? '- ' + details : ''}`);
  }
  return res.json();
}

export async function createPurchaseAuto(payload: { item: string; amount?: number; qty?: number; unit?: string; type?: string; object_id?: number; assignee_id?: number; date?: string; receipt?: File | null; status?: string; supplier_id?: number; url?: string; }) {
  const normalized = {
    item: String(payload.item ?? '').trim(),
    amount: payload.amount != null ? Number(payload.amount) : undefined,
    qty: payload.qty != null ? Number(payload.qty) : undefined,
    unit: payload.unit || 'шт',
    type: payload.type || 'materials',
    object_id: payload.object_id,
    assignee_id: payload.assignee_id,
    supplier_id: payload.supplier_id,
    url: payload.url,
    date: payload.date || new Date().toISOString().slice(0,10),
    status: payload.status,
  } as any;
  normalized.quantity = normalized.qty;
  normalized.count = normalized.qty;
  normalized.category = normalized.type;
  normalized.units = normalized.unit;

  try {
    return await createPurchaseMultipart({ ...normalized, receipt: payload.receipt ?? null });
  } catch (eMp: any) {
    const msg = String(eMp?.message || '');
    if (msg.includes('"detail"')) {
      throw eMp;
    }
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (AUTH_TOKEN) (headers as any)['Authorization'] = `Bearer ${AUTH_TOKEN}`;
      const res = await fetch(apiUrl(`/api/purchases`), { method: 'POST', headers, body: JSON.stringify(normalized) });
      if (!res.ok) {
        let details = '';
        try { details = await res.text(); } catch {}
        try {
          const parsed = JSON.parse(details);
          if (parsed && typeof parsed === 'object' && parsed.detail) {
            throw new Error(JSON.stringify({ detail: parsed.detail }));
          }
        } catch {}
        throw new Error(`JSON failed ${res.status} ${details ? '- ' + details : ''}`);
      }
      return res.json();
    } catch (eJson) {
      throw new Error(`API /api/purchases failed: ${String((eMp as any)?.message || eMp)}; ${String((eJson as any)?.message || eJson)}`);
    }
  }
}
export function createSalary(payload: Partial<Salary>) {
  return fetchJson<Salary>(`/api/salaries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
export function updateSalary(id: number, payload: Partial<Salary>) {
  return fetchJson<Salary>(`/api/salaries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
export function createAbsence(payload: Partial<Absence>) {
  return fetchJson<Absence>(`/api/absences`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
export function updateAbsence(id: number, payload: Partial<Absence>) {
  return fetchJson<Absence>(`/api/absences/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}

// Новые реальные источники
export function getMaterials() { return fetchJson<ObjectMaterial[]>("/api/materials"); }
export function getNotifications() { return fetchJson<NotificationItem[]>("/api/notifications"); }
export function getMaterialsHistory() { return fetchJson<ObjectMaterial[]>("/api/materials/history"); }

// Каталог номенклатуры и поставщики
export function getCatalogItems() { return fetchJson<Item[]>("/api/items"); }
export function createCatalogItem(payload: Partial<Item>) { return fetchJson<Item>("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function updateCatalogItem(id: number, payload: Partial<Item>) { return fetchJson<Item>(`/api/items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function getSuppliers() { return fetchJson<Supplier[]>("/api/suppliers"); }
export function createSupplier(payload: Partial<Supplier>) { return fetchJson<Supplier>("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function updateSupplier(id: number, payload: Partial<Supplier>) { return fetchJson<Supplier>(`/api/suppliers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function deleteCatalogItem(id: number) { return fetchJson<{ success: boolean }>(`/api/items/${id}`, { method: "DELETE" }); }
export function deleteSupplier(id: number) { return fetchJson<{ success: boolean }>(`/api/suppliers/${id}`, { method: "DELETE" }); }

// Клиенты и счета
export function getCustomers() { return fetchJson<Customer[]>("/api/customers"); }
export function createCustomer(payload: Partial<Customer>) { return fetchJson<Customer>("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function updateCustomer(id: number, payload: Partial<Customer>) { return fetchJson<Customer>(`/api/customers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function deleteCustomer(id: number) { return fetchJson<{ success: boolean }>(`/api/customers/${id}`, { method: "DELETE" }); }
export function getInvoices() { return fetchJson<Invoice[]>("/api/invoices"); }
export function createInvoice(payload: Partial<Invoice>) { return fetchJson<Invoice>("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function updateInvoice(id: number, payload: Partial<Invoice>) { return fetchJson<Invoice>(`/api/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function deleteInvoice(id: number) { return fetchJson<{ success: boolean }>(`/api/invoices/${id}`, { method: "DELETE" }); }
export function generateInvoicePdf(id: number) { return fetchJson<{ url: string }>(`/api/invoices/${id}/generate-pdf`); }

// Бюджеты, движения денег, прочие расходы
export function getBudgets() { return fetchJson<Budget[]>("/api/budgets"); }
export function createBudget(payload: Partial<Budget>) { return fetchJson<Budget>("/api/budgets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function updateBudget(id: number, payload: Partial<Budget>) { return fetchJson<Budget>(`/api/budgets/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function deleteBudget(id: number) { return fetchJson<{ success: boolean }>(`/api/budgets/${id}`, { method: "DELETE" }); }
export function getCashTransactions() { return fetchJson<CashTransaction[]>("/api/cash"); }
export function createCashTransaction(payload: Partial<CashTransaction>) { return fetchJson<CashTransaction>("/api/cash", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function updateCashTransaction(id: number, payload: Partial<CashTransaction>) { return fetchJson<CashTransaction>(`/api/cash/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function deleteCashTransaction(id: number) { return fetchJson<{ success: boolean }>(`/api/cash/${id}`, { method: "DELETE" }); }
export function getOtherExpenses() { return fetchJson<OtherExpense[]>("/api/expenses/other"); }
export function createOtherExpense(payload: Partial<OtherExpense>) { return fetchJson<OtherExpense>("/api/expenses/other", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function updateOtherExpense(id: number, payload: Partial<OtherExpense>) { return fetchJson<OtherExpense>(`/api/expenses/other/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function deleteOtherExpense(id: number) { return fetchJson<{ success: boolean }>(`/api/expenses/other/${id}`, { method: "DELETE" }); }
export function getFinanceJournal() { return fetchJson<any[]>("/api/finance/journal"); }
export function getReceivables() { return fetchJson<any[]>("/api/finance/receivables"); }
export function getPayables() { return fetchJson<any[]>("/api/finance/payables"); }
export function getPnL() { return fetchJson<any>("/api/finance/pnl"); }
export function getCashFlow() { return fetchJson<any>("/api/finance/cashflow"); }

// Материалы / склад
export function getWarehouseConsumption() { return fetchJson<WarehouseConsumption[]>("/api/warehouse/consumption"); }
export function createWarehouseConsumption(payload: Partial<WarehouseConsumption>) { return fetchJson<WarehouseConsumption>("/api/warehouse/consumption", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function updateWarehouseConsumption(id: number, payload: Partial<WarehouseConsumption>) { return fetchJson<WarehouseConsumption>(`/api/warehouse/consumption/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function deleteWarehouseConsumption(id: number) { return fetchJson<{ success: boolean }>(`/api/warehouse/consumption/${id}`, { method: "DELETE" }); }

// Заявки на закупку
export function getPurchaseRequests() { return fetchJson<any[]>("/api/purchase-requests"); }
export function createPurchaseRequest(payload: any) { return fetchJson<any>("/api/purchase-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function updatePurchaseRequest(id: number, payload: any) { return fetchJson<any>(`/api/purchase-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function deletePurchaseRequest(id: number) { return fetchJson<{ success: boolean }>(`/api/purchase-requests/${id}`, { method: "DELETE" }); }

// Документы
export function getDocuments() { return fetchJson<Document[]>("/api/documents"); }
export function createDocument(payload: Partial<Document>) { return fetchJson<Document>("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function updateDocument(id: number, payload: Partial<Document>) { return fetchJson<Document>(`/api/documents/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
export function deleteDocument(id: number) { return fetchJson<{ success: boolean }>(`/api/documents/${id}`, { method: "DELETE" }); }

export function createUser(payload: Partial<User>) {
  return fetchJson<User>(`/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateUser(id: number, payload: Partial<User>) {
  return fetchJson<User>(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: number) {
  return fetchJson<{ success: boolean }>(`/api/users/${id}`, {
    method: "DELETE",
  });
}