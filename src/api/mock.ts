// Lightweight mock API backed by local JSON snapshot
import db from "../data/db.json";
import type {
  ObjectEntity,
  Task,
  User,
  Assignment,
  ObjectStage,
  ObjectMaterial,
  Purchase,
  Salary,
  Absence,
  Timesheet,
  Setting,
  NotificationItem,
  TechCard,
  Conversation,
  MessageItem,
  Brigade,
  BrigadeMember,
  ChecklistItem,
  LogItem,
  UserRole,
} from "../types";

// The JSON structure follows inspect_db.py summary
interface DbSummary {
  details?: Record<string, { count: number; sample: any[] }>;
}

const root = db as unknown as DbSummary;

// Mock пользователи с ролями для демонстрации
const mockUsers: User[] = [
  {
    id: 1,
    full_name: "Иванов Иван Иванович",
    position: "Генеральный директор",
    role: "admin",
    phone: "+7 (999) 123-45-67",
    is_admin: 1,
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: 2,
    full_name: "Петров Петр Петрович",
    position: "Менеджер проектов",
    role: "manager",
    phone: "+7 (999) 234-56-78",
    is_admin: 0,
    created_at: "2024-01-02",
    updated_at: "2024-01-02"
  },
  {
    id: 3,
    full_name: "Сидоров Сидор Сидорович",
    position: "Прораб",
    role: "foreman",
    phone: "+7 (999) 345-67-89",
    is_admin: 0,
    created_at: "2024-01-03",
    updated_at: "2024-01-03"
  },
  {
    id: 4,
    full_name: "Козлов Козел Козлович",
    position: "Рабочий",
    role: "worker",
    phone: "+7 (999) 456-78-90",
    is_admin: 0,
    created_at: "2024-01-04",
    updated_at: "2024-01-04"
  },
  {
    id: 5,
    full_name: "Бухгалтерова Анна Петровна",
    position: "Главный бухгалтер",
    role: "accountant",
    phone: "+7 (999) 567-89-01",
    is_admin: 0,
    created_at: "2024-01-05",
    updated_at: "2024-01-05"
  }
];

// Mock токены для демонстрации
const mockTokens = new Map<string, User>();

export function getObjects(): ObjectEntity[] {
  return (root.details?.objects?.sample as ObjectEntity[]) ?? [];
}

export function getObjectById(id: number): ObjectEntity | undefined {
  return getObjects().find((o) => o.id === id);
}

export function getTasks(): Task[] {
  return (root.details?.tasks?.sample as Task[]) ?? [];
}

export function getUsers(): User[] {
  return mockUsers;
}

// Mock функции для аутентификации
export function login(username: string, password: string): Promise<{ token: string; user: User }> {
  console.log('Mock API: login called with:', { username, password });
  
  return new Promise((resolve, reject) => {
    // В демо-режиме принимаем любые данные
    if (username && password) {
      console.log('Mock API: username and password provided, proceeding...');
      
      // Находим пользователя по имени или создаем демо-пользователя
      let user = mockUsers.find(u => 
        u.full_name.toLowerCase().includes(username.toLowerCase()) ||
        u.position?.toLowerCase().includes(username.toLowerCase())
      );
      
      if (!user) {
        console.log('Mock API: creating new demo user');
        // Создаем демо-пользователя с ролью admin
        user = {
          id: Date.now(),
          full_name: username,
          position: "Демо-пользователь",
          role: "admin",
          phone: "+7 (999) 000-00-00",
          is_admin: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockUsers.push(user);
      } else {
        console.log('Mock API: found existing user:', user);
      }
      
      const token = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      mockTokens.set(token, user);
      
      console.log('Mock API: generated token and resolving...');
      
      setTimeout(() => {
        console.log('Mock API: resolving with:', { token, user });
        resolve({ token, user });
      }, 500); // Имитируем задержку сети
    } else {
      console.log('Mock API: username or password missing, rejecting...');
      setTimeout(() => {
        reject(new Error('Неверные данные для входа'));
      }, 500);
    }
  });
}

export function me(token?: string): Promise<User> {
  console.log('Mock API: me called with token:', token);
  
  return new Promise((resolve, reject) => {
    // В демо-режиме возвращаем первого пользователя-админа
    const user = mockUsers.find(u => u.role === 'admin') || mockUsers[0];
    
    if (user) {
      console.log('Mock API: me resolving with user:', user);
      setTimeout(() => {
        resolve(user);
      }, 300);
    } else {
      console.log('Mock API: me rejecting - no user found');
      setTimeout(() => {
        reject(new Error('Пользователь не найден'));
      }, 300);
    }
  });
}

// Функция для обработки API запросов в демо-режиме
export function getMockData(path: string): any {
  const pathParts = path.split('/').filter(Boolean);
  
  switch (pathParts[0]) {
    case 'api':
      return getMockData(pathParts.slice(1).join('/'));
    
    case 'objects':
      return getObjects();
    
    case 'users':
      return getUsers();
    
    case 'tasks':
      return getTasks();
    
    case 'purchases':
      return getPurchases();
    
    case 'salaries':
      return getSalaries();
    
    case 'absences':
      return getAbsences();
    
    case 'timesheets':
      return getTimesheets();
    
    case 'settings':
      return getSettings();
    
    case 'notifications':
      return getNotifications();
    
    case 'materials':
      return getObjectMaterials();
    
    case 'items':
      return []; // Пустой массив для каталога
    
    case 'suppliers':
      return []; // Пустой массив для поставщиков
    
    case 'customers':
      return []; // Пустой массив для заказчиков
    
    case 'invoices':
      return []; // Пустой массив для счетов
    
    case 'budgets':
      return []; // Пустой массив для бюджетов
    
    case 'cash':
      return []; // Пустой массив для кассовых операций
    
    case 'expenses':
      if (pathParts[1] === 'other') {
        return []; // Пустой массив для прочих расходов
      }
      return [];
    
    case 'payments':
      return []; // Пустой массив для платежей
    
    case 'documents':
      return []; // Пустой массив для документов
    
    case 'warehouse':
      if (pathParts[1] === 'consumption') {
        return []; // Пустой массив для складских операций
      }
      return [];
    
    case 'purchase-requests':
      return []; // Пустой массив для заявок на закупки
    
    default:
      return [];
  }
}

export function getAssignments(): Assignment[] {
  return (root.details?.assignments?.sample as Assignment[]) ?? [];
}

export function getObjectStages(): ObjectStage[] {
  return (root.details?.object_stages?.sample as ObjectStage[]) ?? [];
}

export function getObjectMaterials(): ObjectMaterial[] {
  return (root.details?.object_materials?.sample as ObjectMaterial[]) ?? [];
}

export function getPurchases(): Purchase[] {
  return (root.details?.purchases?.sample as Purchase[]) ?? [];
}

export function getSalaries(): Salary[] {
  return (root.details?.salaries?.sample as Salary[]) ?? [];
}

export function getAbsences(): Absence[] {
  return (root.details?.absences?.sample as Absence[]) ?? [];
}

export function getTimesheets(): Timesheet[] {
  return (root.details?.timesheets?.sample as Timesheet[]) ?? [];
}

export function getSettings(): Setting[] {
  return (root.details?.settings?.sample as Setting[]) ?? [
    { key: "photo_required", value: "true" },
    { key: "volume_required", value: "true" },
  ];
}

export function getNotifications(): NotificationItem[] {
  return [
    { id: "n1", type: "task", title: "Новая задача", message: "Проверить опалубку", date: new Date().toISOString(), read: false },
    { id: "n2", type: "finance", title: "Закупка согласована", date: new Date().toISOString(), read: true },
  ];
}

// Helpers
export function getUsersAssignedToObject(objectId: number): User[] {
  const assignedUserIds = new Set(
    getAssignments()
      .filter((a) => a.object_id === objectId)
      .map((a) => a.user_id)
  );
  return getUsers().filter((u) => assignedUserIds.has(u.id));
}

export function getObjectTasks(objectId: number): Task[] {
  return getTasks().filter((t) => t.object_id === objectId);
}

export function getObjectStagesByObjectId(objectId: number): ObjectStage[] {
  return getObjectStages().filter((s) => s.object_id === objectId);
}

export function getObjectMaterialsByObjectId(objectId: number): ObjectMaterial[] {
  return getObjectMaterials().filter((m) => m.object_id === objectId);
}

export function getObjectFinance(objectId: number) {
  const purchases = getPurchases().filter((p) => p.object_id === objectId);
  const salaries = getSalaries().filter((s) => s.object_id === objectId);
  const absences = getAbsences().filter((a) => a.object_id === objectId);
  // Coerce amounts to number where possible
  const num = (v: unknown): number => (typeof v === "number" ? v : typeof v === "string" ? parseFloat(v.replace(/[^0-9.-]/g, "")) || 0 : 0);
  const totals = {
    purchases: purchases.reduce((sum, p) => sum + num(p.amount), 0),
    salaries: salaries.reduce((sum, s) => sum + num(s.amount), 0),
    absences: absences.reduce((sum, a) => sum + num(a.amount), 0),
  };
  return { purchases, salaries, absences, totals };
}

export function getUserTimesheets(userId: number): Timesheet[] {
  return getTimesheets().filter((t) => t.user_id === userId);
}

export function getUserFinance(userId: number) {
  const salaries = getSalaries().filter((s) => s.user_id === userId);
  const absences = getAbsences().filter((a) => a.user_id === userId);
  const num = (v: unknown): number => (typeof v === "number" ? v : typeof v === "string" ? parseFloat(v.replace(/[^0-9.-]/g, "")) || 0 : 0);
  const totals = {
    salaries: salaries.reduce((sum, s) => sum + num(s.amount), 0),
    absences: absences.reduce((sum, a) => sum + num(a.amount), 0),
  };
  return { salaries, absences, totals };
}

export function getTechCards(): TechCard[] {
  return (root.details?.tech_cards?.sample as TechCard[]) ?? [];
}

export function getConversations(): Conversation[] {
  return [
    { id: "c1", title: "Общий чат" },
    { id: "c2", title: "Объект А", object_id: 1 },
  ];
}

export function getMessages(conversationId: string): MessageItem[] {
  const now = new Date().toISOString();
  return [
    { id: "m1", conversation_id: conversationId, author_id: 1, text: "Привет!", created_at: now },
    { id: "m2", conversation_id: conversationId, author_id: 4, text: "Начинаем работы в 9:00", created_at: now },
  ];
}

export function getBrigades(): Brigade[] {
  return [
    { id: 1, name: "Бригада №1", lead_user_id: 4 },
    { id: 2, name: "Бригада №2", lead_user_id: 5 },
  ];
}

export function getBrigadeMembers(): BrigadeMember[] {
  return [
    { brigade_id: 1, user_id: 4 },
    { brigade_id: 1, user_id: 3 },
    { brigade_id: 2, user_id: 5 },
  ];
}

export function getChecklist(taskId: number): ChecklistItem[] {
  return [
    { id: "c1", task_id: taskId, title: "Изучить техкарту", done: false },
    { id: "c2", task_id: taskId, title: "Подготовить инструмент", done: true },
  ];
}

export function getLogs(): LogItem[] {
  return (root.details?.logs?.sample as LogItem[]) ?? [];
}

export function getAnalyticsSummary() {
  return {
    risks: { materials: "high", personnel: "medium", weather: "low" },
    performance: { topWorkers: 3, lowWorkers: 2 },
  };
} 