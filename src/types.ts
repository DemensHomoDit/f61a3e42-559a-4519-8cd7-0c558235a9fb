export interface User {
  id: number;
  chat_id?: number;
  full_name: string;
  position?: string | null;
  phone?: string | null;
  email?: string | null;
  username?: string | null;
  gender?: string | null;
  status?: string | null;
  is_admin?: number;
  role?: UserRole;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

// Система ролей и прав
export type UserRole = 'admin' | 'manager' | 'foreman' | 'worker' | 'accountant';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'approve';
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

// Константы ролей и прав
export const USER_ROLES: Record<UserRole, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  foreman: 'Прораб',
  worker: 'Рабочий',
  accountant: 'Бухгалтер'
};

export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'admin',
    description: 'Полный доступ ко всем модулям',
    permissions: [
      { id: 'objects.full', name: 'Объекты', description: 'Полный доступ к объектам', resource: 'objects', action: 'create' },
      { id: 'tasks.full', name: 'Задачи', description: 'Полный доступ к задачам', resource: 'tasks', action: 'create' },
      { id: 'finances.full', name: 'Финансы', description: 'Полный доступ к финансам', resource: 'finances', action: 'create' },
      { id: 'materials.full', name: 'Материалы', description: 'Полный доступ к материалам', resource: 'materials', action: 'create' },
      { id: 'users.full', name: 'Пользователи', description: 'Управление пользователями', resource: 'users', action: 'create' }
    ]
  },
  {
    role: 'manager',
    description: 'Управление проектами и финансами',
    permissions: [
      { id: 'objects.read', name: 'Объекты', description: 'Просмотр и редактирование объектов', resource: 'objects', action: 'read' },
      { id: 'tasks.full', name: 'Задачи', description: 'Полный доступ к задачам', resource: 'tasks', action: 'create' },
      { id: 'finances.read', name: 'Финансы', description: 'Просмотр финансов', resource: 'finances', action: 'read' },
      { id: 'materials.read', name: 'Материалы', description: 'Просмотр материалов', resource: 'materials', action: 'read' }
    ]
  },
  {
    role: 'foreman',
    description: 'Управление работами на объекте',
    permissions: [
      { id: 'objects.read', name: 'Объекты', description: 'Просмотр объектов', resource: 'objects', action: 'read' },
      { id: 'tasks.full', name: 'Задачи', description: 'Полный доступ к задачам', resource: 'tasks', action: 'create' },
      { id: 'materials.read', name: 'Материалы', description: 'Просмотр и заявки на материалы', resource: 'materials', action: 'read' }
    ]
  },
  {
    role: 'worker',
    description: 'Выполнение задач',
    permissions: [
      { id: 'tasks.read', name: 'Задачи', description: 'Просмотр назначенных задач', resource: 'tasks', action: 'read' },
      { id: 'tasks.update', name: 'Задачи', description: 'Обновление статуса задач', resource: 'tasks', action: 'update' }
    ]
  },
  {
    role: 'accountant',
    description: 'Финансовый учет',
    permissions: [
      { id: 'finances.full', name: 'Финансы', description: 'Полный доступ к финансам', resource: 'finances', action: 'create' },
      { id: 'objects.read', name: 'Объекты', description: 'Просмотр объектов', resource: 'objects', action: 'read' }
    ]
  }
];

export interface ObjectEntity {
  id: number;
  name: string;
  description?: string | null;
  topic_id?: number | null;
  address?: string | null;
  plan?: string | null;
  goal?: string | null;
  actions?: string | null;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  assignee_id?: number | null;
  priority?: string | null;
  deadline?: string | null;
  status?: string | null;
  message_id?: number | null;
  object_id?: number | null;
  work_date?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  created_by?: number | null;
  task_type?: string | null;
  created_at?: string | null;
  pay_amount?: number | null;
  expected_minutes?: number | null;
  actual_minutes?: number | null;
  tech_card_id?: number | null;
  pay_type?: string | null;
  pay_rate?: number | null;
  currency?: string | null;
  unit?: string | null;
  planned_volume?: number | null;
  auto_pay?: number | null;
}

export interface Assignment {
  id: number;
  object_id: number;
  user_id: number;
  date?: string;
}

export interface ObjectStage {
  id: number;
  object_id: number;
  name: string;
  description?: string | null;
  status?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  end_date?: string | null;
  progress?: number | null;
}

export interface ObjectMaterial {
  id: number;
  object_id: number;
  name: string;
  qty?: number | null;
  unit?: string | null;
  notes?: string | null;
}

export interface Purchase {
  id: number;
  item: string;
  assignee_id?: number | null;
  status?: string | null;
  amount?: string | null;
  user_id?: number | null;
  date?: string | null;
  notes?: string | null;
  object_id?: number | null;
  payment_status?: string | null;
  supplier_id?: number | null;
  qty?: number | null;
  unit?: string | null;
}

export interface Salary {
  id: number;
  user_id: number;
  amount: number;
  date?: string | null;
  reason?: string | null;
  type?: string | null;
  task_id?: number | null;
  object_id?: number | null;
}

export interface Absence {
  id: number;
  user_id: number;
  type?: string | null;
  amount?: number | null;
  date?: string | null;
  comment?: string | null;
  task_id?: number | null;
  object_id?: number | null;
}

export interface Timesheet {
  id: number;
  user_id: number;
  object_id?: number | null;
  task_id?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number | null;
  kind?: string | null;
  comment?: string | null;
}

export interface Setting {
  key: string;
  value: string;
}

export interface NotificationItem {
  id: string;
  type: "task" | "purchase" | "finance" | "system";
  title: string;
  message?: string;
  date?: string;
  read?: boolean;
}

export interface TechCard {
  id: number;
  title: string;
  description?: string | null;
  steps_json?: string | null;
  default_expected_minutes?: number | null;
  default_pay_type?: string | null;
  default_pay_rate?: number | null;
  unit?: string | null;
  tags?: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  object_id?: number | null;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  author_id: number;
  text: string;
  created_at: string;
}

export interface Brigade {
  id: number;
  name: string;
  lead_user_id?: number | null;
}

export interface BrigadeMember {
  brigade_id: number;
  user_id: number;
}

export interface ChecklistItem {
  id: string;
  task_id: number;
  title: string;
  done: boolean;
}

export interface LogItem {
  id: number;
  user_id?: number | null;
  action: string;
  timestamp?: string | null;
}

// Финансовые типы
export interface Invoice {
  id: number;
  number?: string;
  date?: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  customer?: string;
  object_id?: number;
  comment?: string;
  paid_at?: string;
  supplier?: string;
  customer_details?: string;
  description?: string; // Временное поле для совместимости
}

export interface PurchaseRequest {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  description?: string;
  object_id?: number;
  requested_by: number;
  estimated_price?: number;
  due_date?: string;
  supplier_suggestion?: string;
  rejected_reason?: string;
  created_at?: string;
  approved_at?: string;
}

export interface BudgetRow {
  id: number;
  object_id: number;
  category: string;
  planned_amount: number;
  actual_amount: number;
  month: string;
  year: number;
}

export interface ObjectFinance {
  id: number;
  name: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface Employee {
  uid: string;
  full_name: string;
  advances: number;
  debt: number;
  user?: User; // Заменяем any на User
  accrued?: number; // Временное поле для совместимости
  paid?: number; // Временное поле для совместимости
}

export interface Document {
  id: number;
  type: string;
  title: string;
  description?: string;
  file_path?: string;
  invoice_id?: number;
  created_at?: string;
}

export interface Item {
  id: number;
  name: string;
  unit?: string;
  category?: string;
  price?: number;
  width?: number;
  height?: number;
  length?: number;
  depth?: number;
  type?: string;
  created_at?: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

// Дополнительные финансовые типы
export interface Budget {
  id: number;
  object_id: number;
  category: string;
  planned_amount: number;
  actual_amount: number;
  month: string;
  year: number;
  notes?: string;
  created_at?: string;
}

export interface CashTransaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date?: string;
  object_id?: number;
  user_id?: number;
  category?: string;
  payment_method?: string;
  created_at?: string;
}

export interface Payment {
  id: number;
  invoice_id?: number;
  amount: number;
  date?: string;
  method?: string;
  reference?: string;
  notes?: string;
  created_at?: string;
}

export interface OtherExpense {
  id: number;
  description: string;
  amount: number;
  date?: string;
  object_id?: number;
  category: string;
  supplier_id?: number;
  created_at?: string;
}

export interface WarehouseConsumption {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
  date?: string;
  object_id?: number;
  notes?: string;
  created_at?: string;
} 