from fastapi import FastAPI, HTTPException, Header, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import sqlite3
from typing import Any, Dict, List, Optional
from datetime import datetime, date
from pydantic import BaseModel
import hashlib
import json

# Импортируем PDF генератор
try:
    from pdf_generator import generate_invoice_pdf as pdf_gen
    PDF_AVAILABLE = True
    print("✅ PDF генератор успешно загружен")
except ImportError as e:
    PDF_AVAILABLE = False
    print(f"❌ PDF генератор недоступен: {e}")
except Exception as e:
    PDF_AVAILABLE = False
    print(f"❌ Ошибка загрузки PDF генератора: {e}")

CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "bot.db")
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "uploads")

app = FastAPI(title="UgraBuilders API", version="0.1.0")

# CORS for Vite dev server and possible hosts
origins_env = os.getenv("SITE_ORIGIN")
origins: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]
if origins_env:
    origins.append(origins_env)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list({o for o in origins if o}),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Статика для загруженных файлов счетов
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")


def _connect() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def _rows_to_dicts(rows: List[sqlite3.Row]) -> List[Dict[str, Any]]:
    return [dict(r) for r in rows]


def _init_schema() -> None:
    """Создаём недостающие таблицы, если их нет."""
    with _connect() as con:
        cur = con.cursor()
        # Номенклатура
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                unit TEXT,
                type TEXT,
                width REAL,
                height REAL,
                length REAL,
                depth REAL,
                price REAL,
                created_at TEXT
            )
            """
        )
        # Поставщики
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                phone TEXT,
                email TEXT,
                url TEXT,
                address TEXT,
                notes TEXT,
                created_at TEXT
            )
            """
        )
        # Заказчики
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                phone TEXT,
                email TEXT,
                url TEXT,
                address TEXT,
                notes TEXT,
                created_at TEXT
            )
            """
        )
        # Счета
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number TEXT,
                date TEXT,
                amount REAL,
                status TEXT,
                due_date TEXT,
                customer TEXT,
                object_id INTEGER,
                comment TEXT,
                file_url TEXT,
                created_at TEXT
            )
            """
        )
        # Бюджеты по объектам
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS budgets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                object_id INTEGER,
                category TEXT,
                planned_amount REAL,
                actual_amount REAL,
                month TEXT,
                year INTEGER,
                notes TEXT,
                created_at TEXT
            )
            """
        )
        # Кассовые операции
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS cash_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT,
                amount REAL,
                category TEXT,
                description TEXT,
                date TEXT,
                payment_method TEXT,
                object_id INTEGER,
                user_id INTEGER,
                notes TEXT,
                created_at TEXT
            )
            """
        )
        # Унифицированные оплаты (деньги проведены по источнику)
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_type TEXT NOT NULL,
                source_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                date TEXT,
                method TEXT,
                counterparty TEXT,
                object_id INTEGER,
                notes TEXT,
                created_at TEXT
            )
            """
        )
        # Складские списания материалов по объектам
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS warehouse_consumption (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                object_id INTEGER NOT NULL,
                item_id INTEGER,
                item_name TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit TEXT,
                unit_price REAL,
                total_amount REAL NOT NULL,
                consumption_date TEXT NOT NULL,
                reason TEXT,
                user_id INTEGER,
                created_at TEXT
            )
            """
        )
        # Прочие расходы
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS other_expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT,
                amount REAL,
                date TEXT,
                object_id INTEGER,
                supplier_id INTEGER,
                description TEXT,
                payment_status TEXT,
                due_date TEXT,
                created_at TEXT
            )
            """
        )
        # Заявки на закупки
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS purchase_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_name TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit TEXT,
                description TEXT,
                urgency TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'pending',
                requested_by INTEGER,
                object_id INTEGER,
                estimated_price REAL,
                supplier_suggestion TEXT,
                due_date TEXT,
                approved_by INTEGER,
                approved_at TEXT,
                rejected_reason TEXT,
                purchase_id INTEGER,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )
        # Доп. колонки для purchases (если ранее не было)
        cur.execute("PRAGMA table_info('purchases')")
        cols = {row[1] for row in cur.fetchall()}
        add_cols: List[str] = []
        if 'qty' not in cols:
            add_cols.append("ALTER TABLE purchases ADD COLUMN qty REAL")
        if 'unit' not in cols:
            add_cols.append("ALTER TABLE purchases ADD COLUMN unit TEXT")
        if 'type' not in cols:
            add_cols.append("ALTER TABLE purchases ADD COLUMN type TEXT")
        if 'supplier_id' not in cols:
            add_cols.append("ALTER TABLE purchases ADD COLUMN supplier_id INTEGER")
        if 'url' not in cols:
            add_cols.append("ALTER TABLE purchases ADD COLUMN url TEXT")
        if 'receipt_file' not in cols:
            add_cols.append("ALTER TABLE purchases ADD COLUMN receipt_file TEXT")
        if 'created_at' not in cols:
            add_cols.append("ALTER TABLE purchases ADD COLUMN created_at TEXT")
        if 'payment_status' not in cols:
            add_cols.append("ALTER TABLE purchases ADD COLUMN payment_status TEXT")
        if 'due_date' not in cols:
            add_cols.append("ALTER TABLE purchases ADD COLUMN due_date TEXT")
        for stmt in add_cols:
            try:
                cur.execute(stmt)
            except Exception:
                pass
        # Доп. колонки для salaries (оплата)
        cur.execute("PRAGMA table_info('salaries')")
        s_cols = {row[1] for row in cur.fetchall()}
        if 'paid' not in s_cols:
            try:
                cur.execute("ALTER TABLE salaries ADD COLUMN paid INTEGER DEFAULT 0")
            except Exception:
                pass
        if 'paid_at' not in s_cols:
            try:
                cur.execute("ALTER TABLE salaries ADD COLUMN paid_at TEXT")
            except Exception:
                pass
        
        # Доп. колонки для objects
        cur.execute("PRAGMA table_info('objects')")
        o_cols = {row[1] for row in cur.fetchall()}
        add_object_cols: List[str] = []
        if 'description' not in o_cols:
            add_object_cols.append("ALTER TABLE objects ADD COLUMN description TEXT")
        if 'address' not in o_cols:
            add_object_cols.append("ALTER TABLE objects ADD COLUMN address TEXT")
        if 'start_date' not in o_cols:
            add_object_cols.append("ALTER TABLE objects ADD COLUMN start_date TEXT")
        if 'end_date' not in o_cols:
            add_object_cols.append("ALTER TABLE objects ADD COLUMN end_date TEXT")
        if 'budget' not in o_cols:
            add_object_cols.append("ALTER TABLE objects ADD COLUMN budget REAL")
        if 'status' not in o_cols:
            add_object_cols.append("ALTER TABLE objects ADD COLUMN status TEXT DEFAULT 'active'")
        if 'created_at' not in o_cols:
            add_object_cols.append("ALTER TABLE objects ADD COLUMN created_at TEXT")
        for stmt in add_object_cols:
            try:
                cur.execute(stmt)
            except Exception:
                pass
        
        # Доп. колонки для users
        cur.execute("PRAGMA table_info('users')")
        u_cols = {row[1] for row in cur.fetchall()}
        add_user_cols: List[str] = []
        if 'username' not in u_cols:
            add_user_cols.append("ALTER TABLE users ADD COLUMN username TEXT")
        if 'full_name' not in u_cols:
            add_user_cols.append("ALTER TABLE users ADD COLUMN full_name TEXT")
        if 'role' not in u_cols:
            add_user_cols.append("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'employee'")
        if 'phone' not in u_cols:
            add_user_cols.append("ALTER TABLE users ADD COLUMN phone TEXT")
        if 'email' not in u_cols:
            add_user_cols.append("ALTER TABLE users ADD COLUMN email TEXT")
        if 'position' not in u_cols:
            add_user_cols.append("ALTER TABLE users ADD COLUMN position TEXT")
        if 'department' not in u_cols:
            add_user_cols.append("ALTER TABLE users ADD COLUMN department TEXT")
        if 'hire_date' not in u_cols:
            add_user_cols.append("ALTER TABLE users ADD COLUMN hire_date TEXT")
        if 'salary' not in u_cols:
            add_user_cols.append("ALTER TABLE users ADD COLUMN salary REAL")
        if 'created_at' not in u_cols:
            add_user_cols.append("ALTER TABLE users ADD COLUMN created_at TEXT")
        for stmt in add_user_cols:
            try:
                cur.execute(stmt)
            except Exception:
                pass
        
        # Таблица документов
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                amount REAL,
                due_date TEXT,
                file_path TEXT,
                file_name TEXT,
                file_size INTEGER,
                mime_type TEXT,
                invoice_id INTEGER,
                object_id INTEGER,
                created_at TEXT,
                updated_at TEXT,
                FOREIGN KEY (invoice_id) REFERENCES invoices (id),
                FOREIGN KEY (object_id) REFERENCES objects (id)
            )
            """
        )
        
        # Добавляем недостающие колонки для счетов
        cur.execute("PRAGMA table_info(invoices)")
        invoice_cols = {r[1] for r in cur.fetchall()}
        
        add_invoice_cols = []
        if 'customer_details' not in invoice_cols:
            add_invoice_cols.append("ALTER TABLE invoices ADD COLUMN customer_details TEXT")
        if 'description' not in invoice_cols:
            add_invoice_cols.append("ALTER TABLE invoices ADD COLUMN description TEXT")
        if 'updated_at' not in invoice_cols:
            add_invoice_cols.append("ALTER TABLE invoices ADD COLUMN updated_at TEXT")
        
        for stmt in add_invoice_cols:
            try:
                cur.execute(stmt)
            except Exception:
                pass
        
        con.commit()


# Хешируем пароль с использованием SHA-256
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Проверяем хешированный пароль
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

# Создаем пользователя с хешированным паролем при инициализации
def _init_users() -> None:
    """Создаём пользователя, если его нет."""
    with _connect() as con:
        cur = con.cursor()
        # Создаем таблицу для хранения пользователей с хешированными паролями
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS auth_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                full_name TEXT,
                role TEXT DEFAULT 'admin'
            )
            """
        )
        
        # Проверяем, существует ли пользователь DemensHomo
        cur.execute("SELECT id FROM auth_users WHERE username = ?", ("DemensHomo",))
        if not cur.fetchone():
            # Создаем пользователя с хешированным паролем
            password_hash = hash_password("8950Madmax")
            cur.execute(
                "INSERT INTO auth_users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
                ("DemensHomo", password_hash, "DemensHomo", "admin")
            )
            con.commit()
            print("✅ Создан пользователь DemensHomo")

# Вызываем инициализацию пользователей при запуске
_init_schema()
_init_users()

# Токены для реальных пользователей
REAL_TOKENS = {}

DEMO_TOKEN = "demo-admin-token"
DEMO_USER = {"id": 1, "full_name": "Админ", "role": "admin"}

@app.post("/api/auth/login")
def auth_login(payload: Dict[str, Any]) -> JSONResponse:
    username = str(payload.get("username", ""))
    password = str(payload.get("password", ""))
    
    # Поддерживаем демо-режим для обратной совместимости
    if username == "admin" and password == "admin":
        return JSONResponse({"token": DEMO_TOKEN, "user": DEMO_USER})
    
    # Реальная аутентификация с хешированием пароля
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT id, password_hash, full_name, role FROM auth_users WHERE username = ?", (username,))
        user_record = cur.fetchone()
        
        if user_record and verify_password(password, user_record["password_hash"]):
            # Генерируем токен
            import uuid
            token = f"token_{uuid.uuid4().hex}"
            
            # Сохраняем токен в памяти
            user_data = {
                "id": user_record["id"],
                "username": username,
                "full_name": user_record["full_name"],
                "role": user_record["role"]
            }
            REAL_TOKENS[token] = user_data
            
            return JSONResponse({
                "token": token,
                "user": user_data
            })
    
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.get("/api/auth/me")
def auth_me(authorization: str | None = Header(default=None)) -> JSONResponse:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = authorization.replace("Bearer ", "")
    
    # Проверяем демо-токен
    if token == DEMO_TOKEN:
        return JSONResponse(DEMO_USER)
    
    # Проверяем реальный токен
    if token in REAL_TOKENS:
        return JSONResponse(REAL_TOKENS[token])
    
    raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/api/health")
def health() -> Dict[str, Any]:
    return {"status": "ok", "db_exists": os.path.exists(DB_PATH)}


@app.get("/api/objects")
def get_objects() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM objects ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))


@app.get("/api/users")
def get_users() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM users ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))


@app.get("/api/tasks")
def get_tasks() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM tasks ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))


@app.get("/api/purchases")
def get_purchases() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM purchases ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))


@app.get("/api/salaries")
def get_salaries() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM salaries ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))


@app.get("/api/absences")
def get_absences() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM absences ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))


@app.get("/api/timesheets")
def get_timesheets() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM timesheets ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))


@app.get("/api/settings")
def get_settings() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT key, value FROM settings")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))


@app.put("/api/settings/{key}")
def put_setting(key: str, value: Dict[str, Any]) -> JSONResponse:
    # Accepts JSON body and saves as string
    val = json.dumps(value) if isinstance(value, dict) else str(value)
    with _connect() as con:
        cur = con.cursor()
        cur.execute("INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (key, val))
        con.commit()
    return JSONResponse({"ok": True, "key": key})


@app.get("/api/metrics")
def get_metrics() -> JSONResponse:
    """Aggregate basic KPIs for dashboard."""
    now_iso = datetime.now().isoformat()
    today = date.today().isoformat()
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT COUNT(*) AS c FROM objects")
        objects_total = cur.fetchone()[0]
        # Treat all as active for demo; in real app add status column
        objects_active = objects_total

        cur.execute("SELECT COUNT(*) FROM users")
        users_total = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM tasks")
        tasks_total = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM tasks WHERE status IN ('overdue')")
        tasks_overdue = cur.fetchone()[0]
        # If 'overdue' not used, detect by deadline < now and not completed
        if tasks_overdue == 0:
            try:
                cur.execute("SELECT COUNT(*) FROM tasks WHERE (deadline IS NOT NULL AND datetime(deadline) < datetime('now')) AND (completed_at IS NULL)")
                tasks_overdue = cur.fetchone()[0]
            except Exception:
                tasks_overdue = 0

        # Workers working now: timesheets with open interval (end_time NULL) today
        try:
            cur.execute(
                """
                SELECT COUNT(DISTINCT user_id) FROM timesheets
                WHERE (date(start_time) = date('now') OR start_time IS NULL)
                  AND (end_time IS NULL)
            """
            )
            workers_working_now = cur.fetchone()[0]
        except Exception:
            workers_working_now = 0

        # Payables (salaries)
        try:
            cur.execute("SELECT COALESCE(SUM(amount),0) FROM salaries")
            payables = cur.fetchone()[0] or 0
        except Exception:
            payables = 0

        # Absences total
        try:
            cur.execute("SELECT COALESCE(SUM(amount),0) FROM absences")
            abs_total = cur.fetchone()[0] or 0
        except Exception:
            abs_total = 0

    metrics = {
        "objects": {"total": objects_total, "active": objects_active, "completed": 0},
        "users": {"total": users_total, "working_now": workers_working_now},
        "tasks": {"total": tasks_total, "overdue": tasks_overdue},
        "finance": {"payables": payables, "absences": abs_total, "income": 0},
        "statist": {"idle_minutes": 0, "smoke_minutes": 0},
        "generated_at": now_iso,
    }
    return JSONResponse(metrics)


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    assignee_id: int | None = None
    priority: str | None = None
    deadline: str | None = None
    status: str | None = "new"
    object_id: int | None = None
    task_type: str | None = "work"


@app.post("/api/tasks")
def create_task(payload: TaskCreate) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """
            INSERT INTO tasks (
                title, description, assignee_id, priority, deadline, status,
                object_id, created_by, task_type, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            """,
            (
                payload.title,
                payload.description,
                payload.assignee_id,
                payload.priority,
                payload.deadline,
                payload.status or "new",
                payload.object_id,
                1,
                payload.task_type or "work",
            ),
        )
        task_id = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM tasks WHERE id= ?", (task_id,))
        return JSONResponse(dict(cur.fetchone()))


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[int] = None
    priority: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None
    object_id: Optional[int] = None
    task_type: Optional[str] = None


@app.patch("/api/tasks/{task_id}")
def update_task(task_id: int, payload: TaskUpdate) -> JSONResponse:
    fields = []
    values: list[Any] = []
    for key, val in payload.model_dump(exclude_none=True).items():
        fields.append(f"{key} = ?")
        values.append(val)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    values.append(task_id)
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM tasks WHERE id= ?", (task_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Task not found")
        return JSONResponse(dict(row))

class PurchaseCreate(BaseModel):
    item: str
    assignee_id: int | None = None
    status: str | None = None
    amount: float | None = None
    user_id: int | None = None
    date: str | None = None
    notes: str | None = None
    object_id: int | None = None
    # Расширенные поля
    qty: float | None = None
    unit: str | None = None
    type: str | None = None
    supplier_id: int | None = None
    url: str | None = None

class PurchaseUpdate(BaseModel):
    item: str | None = None
    assignee_id: int | None = None
    status: str | None = None
    amount: float | None = None
    user_id: int | None = None
    date: str | None = None
    notes: str | None = None
    object_id: int | None = None
    qty: float | None = None
    unit: str | None = None
    type: str | None = None
    supplier_id: int | None = None
    url: str | None = None

async def _parse_purchase_request(request: Request) -> Dict[str, Any]:
    content_type = request.headers.get("content-type", "")
    data: Dict[str, Any] = {}
    upload: UploadFile | None = None
    if content_type.startswith("application/json"):
        body = await request.json()
        if isinstance(body, dict):
            data = body
    else:
        form = await request.form()
        for k, v in form.items():
            if k == "receipt" and isinstance(v, UploadFile):
                upload = v
            else:
                data[k] = v
    # Синонимы и приведение типов
    if 'quantity' in data and 'qty' not in data:
        data['qty'] = data.get('quantity')
    if 'count' in data and 'qty' not in data:
        data['qty'] = data.get('count')
    if 'units' in data and 'unit' not in data:
        data['unit'] = data.get('units')
    if 'category' in data and 'type' not in data:
        data['type'] = data.get('category')
    for f in ("amount", "qty", "assignee_id", "user_id", "object_id", "supplier_id"):
        if f in data and data[f] is not None and data[f] != "":
            try:
                if f in ("amount", "qty"):
                    data[f] = float(str(data[f]).replace(" ", "").replace(",", "."))
                else:
                    data[f] = int(data[f])
            except Exception:
                pass
    return {"data": data, "file": upload}

# Подсчёт доступного остатка по ключу item|unit|type
IN_STATUSES = ("stock_in", "completed", "complete", "done", "received")
OUT_STATUSES = ("issued", "writeoff", "spent")

def _available_for(con: sqlite3.Connection, item: str, unit: Optional[str], mtype: Optional[str]) -> float:
    """Возвращает доступный остаток по ключу item|unit|type с учётом нормализации:
    - сравнение unit в нижнем регистре
    - типы '' и 'materials' считаются эквивалентными
    """
    cur = con.cursor()
    unit_norm = (unit or '').strip().lower()
    unit_norm = unit_norm.replace('.', '')
    type_norm = (mtype or '').strip().lower()
    # Пустой тип и 'materials' считаем одним множеством
    type_candidates = ['materials', ''] if type_norm in ('', 'materials') else [type_norm]
    type_placeholders = ','.join(['?'] * len(type_candidates)) or "?"
    # Единицы: '' и 'шт' считаем эквивалентными (учтём также 'шт.')
    if unit_norm in ('', 'шт', 'шт.'):
      unit_candidates = ['', 'шт', 'шт.']
    else:
      unit_candidates = [unit_norm]
    unit_placeholders = ','.join(['?'] * len(unit_candidates)) or "?"

    # Вход
    cur.execute(
        f"""
        SELECT COALESCE(SUM(qty),0) FROM purchases
        WHERE lower(item)=lower(?)
          AND lower(REPLACE(COALESCE(unit,''),'.','')) IN ({unit_placeholders})
          AND lower(COALESCE(type,'')) IN ({type_placeholders})
          AND status IN ({','.join(['?']*len(IN_STATUSES))})
        """,
        (item, *unit_candidates, *type_candidates, *IN_STATUSES),
    )
    inflow = cur.fetchone()[0] or 0.0

    # Расход
    cur.execute(
        f"""
        SELECT COALESCE(SUM(qty),0) FROM purchases
        WHERE lower(item)=lower(?)
          AND lower(REPLACE(COALESCE(unit,''),'.','')) IN ({unit_placeholders})
          AND lower(COALESCE(type,'')) IN ({type_placeholders})
          AND status IN ({','.join(['?']*len(OUT_STATUSES))})
        """,
        (item, *unit_candidates, *type_candidates, *OUT_STATUSES),
    )
    outflow = cur.fetchone()[0] or 0.0
    return float(inflow) - float(outflow)

# Заменяем эндпоинты purchases на версии с поддержкой multipart

@app.post("/api/purchases")
async def create_purchase(request: Request) -> JSONResponse:
    parsed = await _parse_purchase_request(request)
    data = parsed["data"]
    upload: UploadFile | None = parsed["file"]

    if not str(data.get("item", "")).strip():
        raise HTTPException(status_code=400, detail="item is required")

    # Валидация на недостаток остатков при списании
    status = (data.get("status") or "").lower()
    qty = float(data.get("qty") or 0)
    if status in OUT_STATUSES and qty > 0:
        with _connect() as con:
            available = _available_for(con, data.get("item"), data.get("unit"), data.get("type"))
        if qty > available + 1e-9:
            available_disp = max(0.0, float(available))
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "stock_insufficient",
                    "message": f"Недостаточно на складе. Доступно: {available_disp} {data.get('unit') or ''}. Запрошено: {qty} {data.get('unit') or ''}.",
                    "available": available_disp,
                    "requested": float(qty),
                    "unit": data.get("unit"),
                    "type": data.get("type"),
                    "item": data.get("item"),
                },
            )

    receipt_path: Optional[str] = None
    if upload:
        safe_name = f"purchase_{int(datetime.now().timestamp())}_{upload.filename or 'file'}"
        dest_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(dest_path, "wb") as f:
            f.write(await upload.read())
        receipt_path = f"/files/{safe_name}"

    # Дата/создание по умолчанию
    if not data.get("date"):
        data["date"] = date.today().isoformat()

    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """
            INSERT INTO purchases(item, assignee_id, status, amount, user_id, date, notes, object_id, qty, unit, type, supplier_id, url, receipt_file, created_at)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            """,
            (
                data.get("item"),
                data.get("assignee_id"),
                data.get("status"),
                str(data.get("amount")) if data.get("amount") is not None else None,
                data.get("user_id"),
                data.get("date"),
                data.get("notes"),
                data.get("object_id"),
                data.get("qty"),
                data.get("unit"),
                data.get("type"),
                data.get("supplier_id"),
                data.get("url"),
                receipt_path,
            ),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM purchases WHERE id= ?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/purchases/{purchase_id}")
async def update_purchase(purchase_id: int, request: Request) -> JSONResponse:
    parsed = await _parse_purchase_request(request)
    data = parsed["data"]
    upload: UploadFile | None = parsed["file"]

    updates: Dict[str, Any] = {}
    for key in ("item", "assignee_id", "status", "amount", "user_id", "date", "notes", "object_id", "qty", "unit", "type", "supplier_id", "url"):
        if key in data and data[key] is not None:
            updates[key] = str(data[key]) if key == "amount" else data[key]

    if upload:
        safe_name = f"purchase_{purchase_id}_{int(datetime.now().timestamp())}_{upload.filename or 'file'}"
        dest_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(dest_path, "wb") as f:
            f.write(await upload.read())
        updates["receipt_file"] = f"/files/{safe_name}"

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Если меняем статус/qty на списание — проверим остаток
    new_status = (updates.get("status") or "").lower()
    new_qty = float(updates.get("qty") or 0)
    # Получим старую запись для ключа item|unit|type
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT item, unit, type, status, qty FROM purchases WHERE id= ?", (purchase_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Purchase not found")
        item0, unit0, type0, status0, qty0 = row[0], row[1], row[2], (row[3] or '').lower(), float(row[4] or 0)
        target_status = new_status or status0
        target_qty = new_qty if updates.get("qty") is not None else qty0
        target_item = updates.get("item") or item0
        target_unit = updates.get("unit") or unit0
        target_type = updates.get("type") or type0
        if target_status in OUT_STATUSES and target_qty > 0:
            available = _available_for(con, target_item, target_unit, target_type)
            # Если старая запись тоже была списанием, вернём её qty в доступный остаток
            if status0 in OUT_STATUSES:
                available += qty0
            if target_qty > available + 1e-9:
                available_disp = max(0.0, float(available))
                raise HTTPException(
                    status_code=400,
                    detail={
                        "code": "stock_insufficient",
                        "message": f"Недостаточно на складе. Доступно: {available_disp} {target_unit or ''}. Запрошено: {target_qty} {target_unit or ''}.",
                        "available": available_disp,
                        "requested": float(target_qty),
                        "unit": target_unit,
                        "type": target_type,
                        "item": target_item,
                    },
                )
        # Применяем апдейт
        fields = [f"{k} = ?" for k in updates.keys()]
        values = list(updates.values()) + [purchase_id]
        cur.execute(f"UPDATE purchases SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM purchases WHERE id= ?", (purchase_id,))
        row2 = cur.fetchone()
        return JSONResponse(dict(row2))

class SalaryCreate(BaseModel):
    user_id: int
    amount: float
    date: str | None = None
    reason: str | None = None
    type: str | None = None
    task_id: int | None = None
    object_id: int | None = None

class SalaryUpdate(BaseModel):
    user_id: int | None = None
    amount: float | None = None
    date: str | None = None
    reason: str | None = None
    type: str | None = None
    task_id: int | None = None
    object_id: int | None = None

@app.post("/api/salaries")
def create_salary(payload: SalaryCreate) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO salaries(user_id, amount, date, reason, type, task_id, object_id)
                 VALUES(?, ?, ?, ?, ?, ?, ?)""",
            (payload.user_id, payload.amount, payload.date, payload.reason, payload.type, payload.task_id, payload.object_id),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM salaries WHERE id= ?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/salaries/{salary_id}")
def update_salary(salary_id: int, payload: SalaryUpdate) -> JSONResponse:
    fields = []
    values: list[Any] = []
    for k, v in payload.model_dump(exclude_none=True).items():
        fields.append(f"{k} = ?")
        values.append(v)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    values.append(salary_id)
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE salaries SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM salaries WHERE id= ?", (salary_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Salary not found")
        return JSONResponse(dict(row))

class AbsenceCreate(BaseModel):
    user_id: int
    type: str | None = None
    amount: float | None = None
    date: str | None = None
    comment: str | None = None
    task_id: int | None = None
    object_id: int | None = None

class AbsenceUpdate(BaseModel):
    user_id: int | None = None
    type: str | None = None
    amount: float | None = None
    date: str | None = None
    comment: str | None = None
    task_id: int | None = None
    object_id: int | None = None

@app.post("/api/absences")
def create_absence(payload: AbsenceCreate) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO absences(user_id, type, amount, date, comment, task_id, object_id)
                 VALUES(?, ?, ?, ?, ?, ?, ?)""",
            (payload.user_id, payload.type, payload.amount, payload.date, payload.comment, payload.task_id, payload.object_id),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM absences WHERE id= ?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/absences/{absence_id}")
def update_absence(absence_id: int, payload: AbsenceUpdate) -> JSONResponse:
    fields = []
    values: list[Any] = []
    for k, v in payload.model_dump(exclude_none=True).items():
        fields.append(f"{k} = ?")
        values.append(v)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    values.append(absence_id)
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE absences SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM absences WHERE id= ?", (absence_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Absence not found")
        return JSONResponse(dict(row))

# ===== Новые реальные эндпоинты для каталога и счетов =====

# ITEMS
class ItemCreate(BaseModel):
    name: str
    unit: Optional[str] = None
    type: Optional[str] = None
    width: Optional[float] = None
    height: Optional[float] = None
    length: Optional[float] = None
    depth: Optional[float] = None
    price: Optional[float] = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    type: Optional[str] = None
    width: Optional[float] = None
    height: Optional[float] = None
    length: Optional[float] = None
    depth: Optional[float] = None
    price: Optional[float] = None

@app.get("/api/items")
def api_get_items() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM items ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.post("/api/items")
def api_create_item(payload: ItemCreate) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        try:
            cur.execute(
                """INSERT INTO items(name, unit, type, width, height, length, depth, price, created_at)
                     VALUES(?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
                (payload.name, payload.unit, payload.type, payload.width, payload.height, payload.length, payload.depth, payload.price),
            )
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="Item with this name already exists")
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM items WHERE id= ?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/items/{item_id}")
def api_update_item(item_id: int, payload: ItemUpdate) -> JSONResponse:
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = [f"{k} = ?" for k in updates.keys()]
    values = list(updates.values()) + [item_id]
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE items SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM items WHERE id= ?", (item_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Item not found")
        return JSONResponse(dict(row))

@app.delete("/api/items/{item_id}")
def api_delete_item(item_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM items WHERE id= ?", (item_id,))
        con.commit()
        return JSONResponse({"ok": True})

# SUPPLIERS
class SupplierCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    url: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    url: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

@app.get("/api/suppliers")
def api_get_suppliers() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM suppliers ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.post("/api/suppliers")
def api_create_supplier(payload: SupplierCreate) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        try:
            cur.execute(
                """INSERT INTO suppliers(name, phone, email, url, address, notes, created_at)
                     VALUES(?, ?, ?, ?, ?, ?, datetime('now'))""",
                (payload.name, payload.phone, payload.email, payload.url, payload.address, payload.notes),
            )
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="Supplier with this name already exists")
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM suppliers WHERE id= ?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/suppliers/{supplier_id}")
def api_update_supplier(supplier_id: int, payload: SupplierUpdate) -> JSONResponse:
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = [f"{k} = ?" for k in updates.keys()]
    values = list(updates.values()) + [supplier_id]
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE suppliers SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM suppliers WHERE id= ?", (supplier_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Supplier not found")
        return JSONResponse(dict(row))

@app.delete("/api/suppliers/{supplier_id}")
def api_delete_supplier(supplier_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM suppliers WHERE id= ?", (supplier_id,))
        con.commit()
        return JSONResponse({"ok": True})

# CUSTOMERS
class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    url: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    url: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

@app.get("/api/customers")
def api_get_customers() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM customers ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.post("/api/customers")
def api_create_customer(payload: CustomerCreate) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        try:
            cur.execute(
                """INSERT INTO customers(name, phone, email, url, address, notes, created_at)
                     VALUES(?, ?, ?, ?, ?, ?, datetime('now'))""",
                (payload.name, payload.phone, payload.email, payload.url, payload.address, payload.notes),
            )
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="Customer with this name already exists")
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM customers WHERE id= ?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/customers/{customer_id}")
def api_update_customer(customer_id: int, payload: CustomerUpdate) -> JSONResponse:
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = [f"{k} = ?" for k in updates.keys()]
    values = list(updates.values()) + [customer_id]
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE customers SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM customers WHERE id= ?", (customer_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")
        return JSONResponse(dict(row))

@app.delete("/api/customers/{customer_id}")
def api_delete_customer(customer_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM customers WHERE id= ?", (customer_id,))
        con.commit()
        return JSONResponse({"ok": True})

# INVOICES (поддержка JSON и multipart)

@app.get("/api/invoices")
def api_get_invoices() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM invoices ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

async def _parse_invoice_request(request: Request) -> Dict[str, Any]:
    content_type = request.headers.get("content-type", "")
    data: Dict[str, Any] = {}
    upload: UploadFile | None = None
    if content_type.startswith("application/json"):
        body = await request.json()
        if isinstance(body, dict):
            data = body
    else:
        form = await request.form()
        for k, v in form.items():
            if k == "file" and isinstance(v, UploadFile):
                upload = v
            else:
                data[k] = v
    # Нормализация типов
    for num_key in ("amount", "object_id"):
        if num_key in data and data[num_key] is not None:
            try:
                data[num_key] = float(data[num_key]) if num_key == "amount" else int(data[num_key])
            except Exception:
                pass
    return {"data": data, "file": upload}

@app.post("/api/invoices")
async def api_create_invoice(request: Request) -> JSONResponse:
    parsed = await _parse_invoice_request(request)
    data = parsed["data"]
    upload: UploadFile | None = parsed["file"]

    file_url: Optional[str] = None
    if upload:
        # сохраняем файл
        safe_name = f"inv_{int(datetime.now().timestamp())}_{upload.filename or 'file'}"
        dest_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(dest_path, "wb") as f:
            f.write(await upload.read())
        file_url = f"/files/{safe_name}"

    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO invoices(number, date, amount, status, due_date, customer, object_id, comment, file_url, created_at)
                 VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
            (
                data.get("number"),
                data.get("date"),
                data.get("amount"),
                data.get("status"),
                data.get("due_date"),
                data.get("customer"),
                data.get("object_id"),
                data.get("comment"),
                file_url or data.get("file_url"),
            ),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM invoices WHERE id= ?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/invoices/{invoice_id}")
async def api_update_invoice(invoice_id: int, request: Request) -> JSONResponse:
    parsed = await _parse_invoice_request(request)
    data = parsed["data"]
    upload: UploadFile | None = parsed["file"]

    file_url: Optional[str] = None
    if upload:
        safe_name = f"inv_{invoice_id}_{int(datetime.now().timestamp())}_{upload.filename or 'file'}"
        dest_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(dest_path, "wb") as f:
            f.write(await upload.read())
        file_url = f"/files/{safe_name}"

    # собираем апдейт
    updates: Dict[str, Any] = {}
    for key in ("number", "date", "amount", "status", "due_date", "customer", "object_id", "comment"):
        if key in data and data[key] is not None:
            updates[key] = data[key]
    if file_url:
        updates["file_url"] = file_url

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    fields = [f"{k} = ?" for k in updates.keys()]
    values = list(updates.values()) + [invoice_id]
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE invoices SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM invoices WHERE id= ?", (invoice_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return JSONResponse(dict(row))

@app.delete("/api/invoices/{invoice_id}")
def api_delete_invoice(invoice_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM invoices WHERE id= ?", (invoice_id,))
        con.commit()
        return JSONResponse({"ok": True})

# ===== Бюджеты =====

@app.get("/api/budgets")
def api_get_budgets() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM budgets ORDER BY id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.post("/api/budgets")
async def api_create_budget(request: Request) -> JSONResponse:
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO budgets(object_id, category, planned_amount, actual_amount, month, year, notes, created_at)
                   VALUES(?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
            (
                data.get("object_id"),
                data.get("category"),
                data.get("planned_amount"),
                data.get("actual_amount", 0),
                data.get("month"),
                data.get("year"),
                data.get("notes"),
            ),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM budgets WHERE id=?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/budgets/{budget_id}")
async def api_update_budget(budget_id: int, request: Request) -> JSONResponse:
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    updates: Dict[str, Any] = {}
    for key in ("object_id", "category", "planned_amount", "actual_amount", "month", "year", "notes"):
        if key in data and data[key] is not None:
            updates[key] = data[key]
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = [f"{k} = ?" for k in updates.keys()]
    values = list(updates.values()) + [budget_id]
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE budgets SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM budgets WHERE id=?", (budget_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Budget not found")
        return JSONResponse(dict(row))

@app.delete("/api/budgets/{budget_id}")
def api_delete_budget(budget_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM budgets WHERE id=?", (budget_id,))
        con.commit()
        return JSONResponse({"ok": True})

# ===== Кассовые операции =====

@app.get("/api/cash")
def api_get_cash() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM cash_transactions ORDER BY COALESCE(date, created_at) DESC, id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.post("/api/cash")
async def api_create_cash(request: Request) -> JSONResponse:
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO cash_transactions(type, amount, category, description, date, payment_method, object_id, user_id, notes, created_at)
                   VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
            (
                data.get("type"),
                data.get("amount"),
                data.get("category"),
                data.get("description"),
                data.get("date"),
                data.get("payment_method"),
                data.get("object_id"),
                data.get("user_id"),
                data.get("notes"),
            ),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM cash_transactions WHERE id=?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/cash/{cash_id}")
async def api_update_cash(cash_id: int, request: Request) -> JSONResponse:
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    updates: Dict[str, Any] = {}
    for key in ("type", "amount", "category", "description", "date", "payment_method", "object_id", "user_id", "notes"):
        if key in data and data[key] is not None:
            updates[key] = data[key]
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = [f"{k} = ?" for k in updates.keys()]
    values = list(updates.values()) + [cash_id]
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE cash_transactions SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM cash_transactions WHERE id=?", (cash_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Cash transaction not found")
        return JSONResponse(dict(row))

@app.delete("/api/cash/{cash_id}")
def api_delete_cash(cash_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM cash_transactions WHERE id= ?", (cash_id,))
        con.commit()
        return JSONResponse({"ok": True})

# ===== Оплаты =====

@app.get("/api/payments")
def api_get_payments() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM payments ORDER BY COALESCE(date, created_at) DESC, id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.post("/api/payments")
async def api_create_payment(request: Request) -> JSONResponse:
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO payments(source_type, source_id, amount, date, method, counterparty, object_id, notes, created_at)
                   VALUES(?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
            (
                data.get("source_type"),
                data.get("source_id"),
                data.get("amount"),
                data.get("date"),
                data.get("method"),
                data.get("counterparty"),
                data.get("object_id"),
                data.get("notes"),
            ),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM payments WHERE id=?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/payments/{payment_id}")
async def api_update_payment(payment_id: int, request: Request) -> JSONResponse:
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    updates: Dict[str, Any] = {}
    for key in ("source_type", "source_id", "amount", "date", "method", "counterparty", "object_id", "notes"):
        if key in data and data[key] is not None:
            updates[key] = data[key]
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = [f"{k} = ?" for k in updates.keys()]
    values = list(updates.values()) + [payment_id]
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE payments SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM payments WHERE id=?", (payment_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Payment not found")
        return JSONResponse(dict(row))

@app.delete("/api/payments/{payment_id}")
def api_delete_payment(payment_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM payments WHERE id=?", (payment_id,))
        con.commit()
        return JSONResponse({"ok": True})

# ===== Прочие расходы =====

@app.get("/api/expenses/other")
def api_get_other_expenses() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM other_expenses ORDER BY COALESCE(date, created_at) DESC, id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.post("/api/expenses/other")
async def api_create_other_expense(request: Request) -> JSONResponse:
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO other_expenses(category, amount, date, object_id, supplier_id, description, payment_status, due_date, created_at)
                   VALUES(?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
            (
                data.get("category"),
                data.get("amount"),
                data.get("date"),
                data.get("object_id"),
                data.get("supplier_id"),
                data.get("description"),
                data.get("payment_status"),
                data.get("due_date"),
            ),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM other_expenses WHERE id=?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/expenses/other/{expense_id}")
async def api_update_other_expense(expense_id: int, request: Request) -> JSONResponse:
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    updates: Dict[str, Any] = {}
    for key in ("category", "amount", "date", "object_id", "supplier_id", "description", "payment_status", "due_date"):
        if key in data and data[key] is not None:
            updates[key] = data[key]
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = [f"{k} = ?" for k in updates.keys()]
    values = list(updates.values()) + [expense_id]
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE other_expenses SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM other_expenses WHERE id=?", (expense_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Expense not found")
        return JSONResponse(dict(row))

@app.delete("/api/expenses/other/{expense_id}")
def api_delete_other_expense(expense_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM other_expenses WHERE id=?", (expense_id,))
        con.commit()
        return JSONResponse({"ok": True})

# ===== Централизованный финансовый журнал и дебиторка =====

@app.get("/api/finance/journal")
def api_finance_journal() -> JSONResponse:
    """Универсальный журнал: объединяем доходы/расходы из разных источников в один список."""
    with _connect() as con:
        cur = con.cursor()
        # Приводим суммы к REAL, даты к COALESCE(date, created_at)
        cur.execute(
            """
            SELECT COALESCE(i.date, i.created_at) AS date,
                   'income' AS kind,
                   'Счёт' AS category,
                   COALESCE(i.amount, 0) AS amount,
                   i.object_id AS object_id,
                   NULL AS user_id,
                   i.customer AS counterparty,
                   i.comment AS description,
                   'invoice' AS source,
                   i.id AS source_id,
                   i.status AS status
            FROM invoices i
            UNION ALL
            SELECT COALESCE(p.date, p.created_at) AS date,
                   'expense' AS kind,
                   COALESCE(p.type, 'Материалы') AS category,
                   COALESCE(CAST(p.amount AS REAL), 0) AS amount,
                   p.object_id AS object_id,
                   p.assignee_id AS user_id,
                   NULL AS counterparty,
                   p.notes AS description,
                   'purchase' AS source,
                   p.id AS source_id,
                   p.status AS status
            FROM purchases p
            UNION ALL
            SELECT s.date AS date,
                   'expense' AS kind,
                   'Зарплата' AS category,
                   COALESCE(s.amount, 0) AS amount,
                   s.object_id AS object_id,
                   s.user_id AS user_id,
                   NULL AS counterparty,
                   s.reason AS description,
                   'salary' AS source,
                   s.id AS source_id,
                   NULL AS status
            FROM salaries s
            UNION ALL
            SELECT a.date AS date,
                   'expense' AS kind,
                   'Удержания' AS category,
                   COALESCE(a.amount, 0) AS amount,
                   a.object_id AS object_id,
                   a.user_id AS user_id,
                   NULL AS counterparty,
                   a.comment AS description,
                   'absence' AS source,
                   a.id AS source_id,
                   a.type AS status
            FROM absences a
            UNION ALL
            SELECT COALESCE(c.date, c.created_at) AS date,
                   c.type AS kind,
                   COALESCE(c.category, CASE WHEN c.type='income' THEN 'Прочие доходы' ELSE 'Прочие расходы' END) AS category,
                   COALESCE(c.amount, 0) AS amount,
                   c.object_id AS object_id,
                   c.user_id AS user_id,
                   NULL AS counterparty,
                   c.description AS description,
                   'cash' AS source,
                   c.id AS source_id,
                   c.payment_method AS status
            FROM cash_transactions c
            UNION ALL
            SELECT COALESCE(date, created_at) AS date,
                   CASE WHEN COALESCE(amount,0) >= 0 THEN 'income' ELSE 'expense' END AS kind,
                   'Оплата' AS category,
                   COALESCE(amount,0) AS amount,
                   object_id,
                   NULL AS user_id,
                   counterparty,
                   notes AS description,
                   'payment' AS source,
                   id AS source_id,
                   method AS status
            FROM payments
            ORDER BY date DESC
            """
        )
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.get("/api/finance/receivables")
def api_finance_receivables() -> JSONResponse:
    """Дебиторка по счетам: все неоплаченные счета с просрочкой и сроками."""
    with _connect() as con:
        cur = con.cursor()
        # Собираем остаток по каждому счёту: сумма счета - суммы оплат
        cur.execute("SELECT id, number, date, due_date, customer, object_id, amount, status FROM invoices")
        invoices = [dict(r) for r in cur.fetchall()]
        # Оплаты по инвойсам
        cur.execute("SELECT source_id, COALESCE(SUM(amount),0) FROM payments WHERE source_type='invoice' GROUP BY source_id")
        paid_map = {int(r[0]): float(r[1]) for r in cur.fetchall() if r[0] is not None}
        res = []
        for inv in invoices:
            total = float(inv.get("amount") or 0)
            paid = float(paid_map.get(int(inv["id"]), 0.0))
            outstanding = max(0.0, total - paid)
            if outstanding <= 0:
                continue
            due = inv.get("due_date")
            days_overdue = 0
            if due:
                cur.execute("SELECT CAST((julianday('now') - julianday(?)) AS INTEGER)", (due,))
                days_overdue = int(cur.fetchone()[0] or 0)
            res.append({
                "id": inv["id"],
                "number": inv.get("number"),
                "date": inv.get("date"),
                "due_date": inv.get("due_date"),
                "customer": inv.get("customer"),
                "object_id": inv.get("object_id"),
                "amount": outstanding,
                "status": inv.get("status"),
                "days_overdue": max(0, days_overdue),
            })
        # сортировка по сроку
        res.sort(key=lambda r: (r.get("due_date") or r.get("date") or ""))
        return JSONResponse(res)

@app.get("/api/finance/payables")
def api_finance_payables() -> JSONResponse:
    """Кредиторка: поставщики (закупки, прочие расходы) и сотрудники (зарплаты unpaid)."""
    with _connect() as con:
        cur = con.cursor()
        # Остаток по закупкам: сумма - оплаты (по source_type=purchase)
        cur.execute("SELECT id, supplier_id, amount FROM purchases")
        purchases = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT source_id, COALESCE(SUM(amount),0) FROM payments WHERE source_type='purchase' GROUP BY source_id")
        pay_purchase = {int(r[0]): float(r[1]) for r in cur.fetchall() if r[0] is not None}
        purchases_owed: Dict[str, float] = {}
        for p in purchases:
            sup = str(p.get("supplier_id") or '')
            total = float((p.get("amount") or 0))
            paid = float(pay_purchase.get(int(p["id"]), 0.0))
            rest = max(0.0, total - paid)
            purchases_owed[sup] = purchases_owed.get(sup, 0.0) + rest
        # Остаток по прочим расходам
        cur.execute("SELECT id, supplier_id, amount FROM other_expenses")
        others = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT source_id, COALESCE(SUM(amount),0) FROM payments WHERE source_type='other' GROUP BY source_id")
        pay_other = {int(r[0]): float(r[1]) for r in cur.fetchall() if r[0] is not None}
        other_owed: Dict[str, float] = {}
        for o in others:
            sup = str(o.get("supplier_id") or '')
            total = float((o.get("amount") or 0))
            paid = float(pay_other.get(int(o["id"]), 0.0))
            rest = max(0.0, total - paid)
            other_owed[sup] = other_owed.get(sup, 0.0) + rest
        # Сотрудники по зарплате
        cur.execute(
            """
            SELECT s.id, s.user_id, s.amount FROM salaries s
            """
        )
        salaries = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT source_id, COALESCE(SUM(amount),0) FROM payments WHERE source_type='salary' GROUP BY source_id")
        pay_salary = {int(r[0]): float(r[1]) for r in cur.fetchall() if r[0] is not None}
        salaries_owed: Dict[str, float] = {}
        for s in salaries:
            uid = str(s.get("user_id") or '')
            total = float(s.get("amount") or 0)
            paid = float(pay_salary.get(int(s["id"]), 0.0))
            rest = max(0.0, total - paid)
            salaries_owed[uid] = salaries_owed.get(uid, 0.0) + rest
        res = {
            "suppliers": {k: purchases_owed.get(k,0) + other_owed.get(k,0) for k in set(purchases_owed)|set(other_owed)},
            "employees": salaries_owed,
        }
        return JSONResponse(res)

# ===== Финансовые отчёты: P&L и ДДС =====

@app.get("/api/finance/pnl")
def api_finance_pnl(frm: str | None = None, to: str | None = None, object_id: int | None = None) -> JSONResponse:
    """Отчёт прибыль/убыток по периодам (актуально: по дате документа)."""
    def within(d: str | None) -> bool:
        if not d:
            return True
        if frm and d < frm:
            return False
        if to and d > to:
            return False
        return True
    with _connect() as con:
        cur = con.cursor()
        # Доходы (инвойсы)
        cur.execute("SELECT date, amount, object_id FROM invoices")
        invoices = [dict(r) for r in cur.fetchall()]
        income_total = sum(float(i.get("amount") or 0) for i in invoices if within(i.get("date")) and (object_id is None or i.get("object_id") == object_id))
        # Расходы: закупки/зарплаты/прочие
        cur.execute("SELECT date, amount, object_id FROM purchases")
        purchases = [dict(r) for r in cur.fetchall()]
        purchases_total = sum(float((p.get("amount") or 0)) for p in purchases if within(p.get("date")) and (object_id is None or p.get("object_id") == object_id))
        cur.execute("SELECT date, amount, object_id FROM salaries")
        salaries = [dict(r) for r in cur.fetchall()]
        salaries_total = sum(float((s.get("amount") or 0)) for s in salaries if within(s.get("date")) and (object_id is None or s.get("object_id") == object_id))
        cur.execute("SELECT date, amount, object_id FROM other_expenses")
        others = [dict(r) for r in cur.fetchall()]
        others_total = sum(float((o.get("amount") or 0)) for o in others if within(o.get("date")) and (object_id is None or o.get("object_id") == object_id))
        expenses_total = purchases_total + salaries_total + others_total
        pnl = {
            "income": income_total,
            "expenses": {
                "purchases": purchases_total,
                "salaries": salaries_total,
                "other": others_total,
            },
            "profit": income_total - expenses_total,
        }
        return JSONResponse(pnl)

@app.get("/api/finance/cashflow")
def api_finance_cashflow(frm: str | None = None, to: str | None = None, object_id: int | None = None) -> JSONResponse:
    """Денежный поток: на основе кассовых операций и оплат."""
    def within(d: str | None) -> bool:
        if not d:
            return True
        if frm and d < frm:
            return False
        if to and d > to:
            return False
        return True
    with _connect() as con:
        cur = con.cursor()
        # Касса
        cur.execute("SELECT type, amount, date, payment_method, object_id FROM cash_transactions")
        cash = [dict(r) for r in cur.fetchall()]
        # Оплаты
        cur.execute("SELECT amount, date, method, object_id FROM payments")
        pay = [dict(r) for r in cur.fetchall()]
        inflow = 0.0
        outflow = 0.0
        by_method: Dict[str, Dict[str, float]] = {}
        # Учтём кассу
        for c in cash:
            if not within(c.get("date")) or (object_id is not None and c.get("object_id") != object_id):
                continue
            amt = float(c.get("amount") or 0)
            m = str(c.get("payment_method") or 'other')
            if c.get("type") == 'income':
                inflow += amt
                by_method.setdefault(m, {"income": 0.0, "expense": 0.0})["income"] += amt
            else:
                outflow += amt
                by_method.setdefault(m, {"income": 0.0, "expense": 0.0})["expense"] += amt
        # Учтём оплаты (они уже учитывают факт денег)
        for p in pay:
            if not within(p.get("date")) or (object_id is not None and p.get("object_id") != object_id):
                continue
            amt = float(p.get("amount") or 0)
            m = str(p.get("method") or 'other')
            if amt >= 0:
                inflow += amt
                by_method.setdefault(m, {"income": 0.0, "expense": 0.0})["income"] += amt
            else:
                outflow += abs(amt)
                by_method.setdefault(m, {"income": 0.0, "expense": 0.0})["expense"] += abs(amt)
        return JSONResponse({
            "inflow": inflow,
            "outflow": outflow,
            "net": inflow - outflow,
            "by_method": by_method,
        })

# ===== Материалы: агрегаты и история =====

@app.get("/api/materials")
def api_materials_stock() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            f"""
            SELECT item, unit, type,
                   COALESCE(SUM(CASE WHEN status IN ({','.join(['?']*len(IN_STATUSES))}) THEN COALESCE(qty,0) ELSE 0 END),0) AS in_qty,
                   COALESCE(SUM(CASE WHEN status IN ({','.join(['?']*len(OUT_STATUSES))}) THEN COALESCE(qty,0) ELSE 0 END),0) AS out_qty
            FROM purchases
            GROUP BY item, unit, type
            ORDER BY item COLLATE NOCASE
            """,
            (*IN_STATUSES, *OUT_STATUSES),
        )
        rows = cur.fetchall()
        res = []
        for r in rows:
            item, unit, mtype, in_q, out_q = r[0], r[1], r[2], float(r[3] or 0), float(r[4] or 0)
            res.append({
                "item": item,
                "unit": unit,
                "type": mtype,
                "in_qty": in_q,
                "out_qty": out_q,
                "balance": in_q - out_q,
            })
        return JSONResponse(res)

@app.get("/api/materials/history")
def api_materials_history() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            f"""
            SELECT id, item, qty, unit, type, status, object_id, assignee_id, supplier_id, url, date, notes, receipt_file, created_at
            FROM purchases
            WHERE status IN ({','.join(['?']*(len(IN_STATUSES)+len(OUT_STATUSES)))})
            ORDER BY COALESCE(date, created_at) DESC, id DESC
            """,
            (*IN_STATUSES, *OUT_STATUSES),
        )
        return JSONResponse(_rows_to_dicts(cur.fetchall())) 

@app.patch("/api/materials/history/{history_id}")
async def api_update_materials_history(history_id: int, request: Request) -> JSONResponse:
    """Обновление записи истории материалов"""
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    # Проверяем, что запись существует
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT id FROM purchases WHERE id = ?", (history_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="History record not found")
        
        # Собираем поля для обновления
        updates: Dict[str, Any] = {}
        for key in ("item", "qty", "unit", "type", "status", "object_id", "assignee_id", "date", "notes"):
            if key in data and data[key] is not None:
                updates[key] = data[key]
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Обновляем запись
        fields = [f"{k} = ?" for k in updates.keys()]
        values = list(updates.values()) + [history_id]
        cur.execute(f"UPDATE purchases SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        
        # Возвращаем обновленную запись
        cur.execute("SELECT * FROM purchases WHERE id = ?", (history_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="History record not found after update")
        return JSONResponse(dict(row))

@app.delete("/api/materials/history/{history_id}")
def api_delete_materials_history(history_id: int) -> JSONResponse:
    """Удаление записи истории материалов"""
    with _connect() as con:
        cur = con.cursor()
        # Проверяем, что запись существует
        cur.execute("SELECT id FROM purchases WHERE id = ?", (history_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="History record not found")
        
        # Удаляем запись
        cur.execute("DELETE FROM purchases WHERE id = ?", (history_id,))
        con.commit()
        return JSONResponse({"ok": True, "message": "History record deleted successfully"})

@app.delete("/api/purchases/{purchase_id}")
def api_delete_purchase(purchase_id: int) -> JSONResponse:
    """Удаление закупки"""
    with _connect() as con:
        cur = con.cursor()
        # Проверяем, что запись существует
        cur.execute("SELECT id FROM purchases WHERE id = ?", (purchase_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Purchase not found")
        
        # Удаляем запись
        cur.execute("DELETE FROM purchases WHERE id = ?", (purchase_id,))
        con.commit()
        return JSONResponse({"ok": True, "message": "Purchase deleted successfully"}) 

# ===== Складские списания =====

@app.get("/api/warehouse/consumption")
def api_get_warehouse_consumption() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM warehouse_consumption ORDER BY consumption_date DESC, id DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.post("/api/warehouse/consumption")
async def api_create_warehouse_consumption(request: Request) -> JSONResponse:
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO warehouse_consumption(
                object_id, item_id, item_name, quantity, unit, unit_price, 
                total_amount, consumption_date, reason, user_id, created_at
            ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
            (
                data.get("object_id"),
                data.get("item_id"),
                data.get("item_name"),
                data.get("quantity"),
                data.get("unit"),
                data.get("unit_price"),
                data.get("total_amount"),
                data.get("consumption_date"),
                data.get("reason"),
                data.get("user_id"),
            ),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM warehouse_consumption WHERE id=?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/warehouse/consumption/{consumption_id}")
async def api_update_warehouse_consumption(consumption_id: int, request: Request) -> JSONResponse:
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    with _connect() as con:
        cur = con.cursor()
        updates = []
        params = []
        for key, value in data.items():
            if key in ["object_id", "item_id", "item_name", "quantity", "unit", "unit_price", 
                      "total_amount", "consumption_date", "reason", "user_id"]:
                updates.append(f"{key} = ?")
                params.append(value)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        params.append(consumption_id)
        cur.execute(f"UPDATE warehouse_consumption SET {', '.join(updates)} WHERE id = ?", params)
        
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Warehouse consumption not found")
        
        con.commit()
        cur.execute("SELECT * FROM warehouse_consumption WHERE id=?", (consumption_id,))
        return JSONResponse(dict(cur.fetchone()))

@app.delete("/api/warehouse/consumption/{consumption_id}")
def api_delete_warehouse_consumption(consumption_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM warehouse_consumption WHERE id=?", (consumption_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Warehouse consumption not found")
        con.commit()
        return JSONResponse({"ok": True})

class ObjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None
    status: Optional[str] = "active"

class ObjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None
    status: Optional[str] = None

@app.post("/api/objects")
def create_object(payload: ObjectCreate) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO objects(name, description, address, start_date, end_date, budget, status, created_at)
               VALUES(?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
            (payload.name, payload.description, payload.address, payload.start_date, payload.end_date, payload.budget, payload.status),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM objects WHERE id=?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/objects/{object_id}")
def update_object(object_id: int, payload: ObjectUpdate) -> JSONResponse:
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = [f"{k} = ?" for k in updates.keys()]
    values = list(updates.values()) + [object_id]
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE objects SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM objects WHERE id=?", (object_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Object not found")
        return JSONResponse(dict(row))

@app.delete("/api/objects/{object_id}")
def delete_object(object_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM objects WHERE id=?", (object_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Object not found")
        con.commit()
        return JSONResponse({"ok": True})

class UserCreate(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: Optional[str] = "employee"
    phone: Optional[str] = None
    email: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[str] = None
    salary: Optional[float] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[str] = None
    salary: Optional[float] = None

@app.post("/api/users")
def create_user(payload: UserCreate) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO users(username, full_name, role, phone, email, position, department, hire_date, salary, created_at)
               VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
            (payload.username, payload.full_name, payload.role, payload.phone, payload.email, payload.position, payload.department, payload.hire_date, payload.salary),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM users WHERE id=?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/users/{user_id}")
def update_user(user_id: int, payload: UserUpdate) -> JSONResponse:
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = [f"{k} = ?" for k in updates.keys()]
    values = list(updates.values()) + [user_id]
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM users WHERE id=?", (user_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return JSONResponse(dict(row))

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM users WHERE id=?", (user_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        con.commit()
        return JSONResponse({"ok": True})

# ===== Заявки на закупки =====

class PurchaseRequestCreate(BaseModel):
    item_name: str
    quantity: float
    unit: Optional[str] = None
    description: Optional[str] = None
    urgency: Optional[str] = "medium"
    object_id: Optional[int] = None
    estimated_price: Optional[float] = None
    supplier_suggestion: Optional[str] = None
    due_date: Optional[str] = None

class PurchaseRequestUpdate(BaseModel):
    item_name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    urgency: Optional[str] = None
    status: Optional[str] = None
    object_id: Optional[int] = None
    estimated_price: Optional[float] = None
    supplier_suggestion: Optional[str] = None
    due_date: Optional[str] = None
    approved_by: Optional[int] = None
    rejected_reason: Optional[str] = None
    purchase_id: Optional[int] = None

@app.get("/api/purchase-requests")
def get_purchase_requests() -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM purchase_requests ORDER BY created_at DESC")
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.post("/api/purchase-requests")
def create_purchase_request(payload: PurchaseRequestCreate) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute(
            """INSERT INTO purchase_requests(
                item_name, quantity, unit, description, urgency, 
                object_id, estimated_price, supplier_suggestion, due_date, 
                requested_by, created_at, updated_at
            ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))""",
            (
                payload.item_name, payload.quantity, payload.unit, payload.description,
                payload.urgency, payload.object_id, payload.estimated_price,
                payload.supplier_suggestion, payload.due_date, 1  # TODO: get from auth
            ),
        )
        rid = cur.lastrowid
        con.commit()
        cur.execute("SELECT * FROM purchase_requests WHERE id=?", (rid,))
        return JSONResponse(dict(cur.fetchone()))

@app.patch("/api/purchase-requests/{request_id}")
def update_purchase_request(request_id: int, payload: PurchaseRequestUpdate) -> JSONResponse:
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Добавляем updated_at
    updates['updated_at'] = 'datetime("now")'
    
    fields = []
    values = []
    for key, value in updates.items():
        if key == 'updated_at':
            fields.append("updated_at = datetime('now')")
        else:
            fields.append(f"{key} = ?")
            values.append(value)
    
    values.append(request_id)
    
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE purchase_requests SET {', '.join(fields)} WHERE id = ?", values)
        con.commit()
        cur.execute("SELECT * FROM purchase_requests WHERE id=?", (request_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Purchase request not found")
        return JSONResponse(dict(row))

@app.delete("/api/purchase-requests/{request_id}")
def delete_purchase_request(request_id: int) -> JSONResponse:
    with _connect() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM purchase_requests WHERE id=?", (request_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Purchase request not found")
        con.commit()
        return JSONResponse({"ok": True})

# ===== Документы =====

class DocumentCreate(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[str] = None
    invoice_id: Optional[int] = None
    object_id: Optional[int] = None

class DocumentUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[str] = None

@app.get("/api/documents")
def get_documents(invoice_id: Optional[int] = None, object_id: Optional[int] = None) -> JSONResponse:
    """Получить документы с возможностью фильтрации по invoice_id или object_id"""
    with _connect() as con:
        cur = con.cursor()
        
        if invoice_id:
            cur.execute("SELECT * FROM documents WHERE invoice_id=? ORDER BY created_at DESC", (invoice_id,))
        elif object_id:
            cur.execute("SELECT * FROM documents WHERE object_id=? ORDER BY created_at DESC", (object_id,))
        else:
            cur.execute("SELECT * FROM documents ORDER BY created_at DESC")
        
        return JSONResponse(_rows_to_dicts(cur.fetchall()))

@app.post("/api/documents")
async def create_document(data: DocumentCreate, file: Optional[UploadFile] = None) -> JSONResponse:
    """Создать новый документ с возможностью загрузки файла"""
    
    file_path = None
    file_name = None
    file_size = None
    mime_type = None
    
    # Обрабатываем загрузку файла
    if file:
        import shutil
        import uuid
        
        # Генерируем уникальное имя файла
        file_ext = file.filename.split('.')[-1] if '.' in file.filename else ''
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Сохраняем файл
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_name = file.filename
        file_size = os.path.getsize(file_path)
        mime_type = file.content_type
        
        # Сохраняем относительный путь для API
        file_path = f"/files/{unique_filename}"
    
    with _connect() as con:
        cur = con.cursor()
        cur.execute("""
            INSERT INTO documents (
                type, title, description, amount, due_date, 
                file_path, file_name, file_size, mime_type,
                invoice_id, object_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.type, data.title, data.description, data.amount, data.due_date,
            file_path, file_name, file_size, mime_type,
            data.invoice_id, data.object_id, 
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        doc_id = cur.lastrowid
        con.commit()
        
        # Возвращаем созданный документ
        cur.execute("SELECT * FROM documents WHERE id=?", (doc_id,))
        document = dict(cur.fetchone())
        return JSONResponse(document)

@app.get("/api/documents/{doc_id}")
def get_document(doc_id: int) -> JSONResponse:
    """Получить документ по ID"""
    with _connect() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM documents WHERE id=?", (doc_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")
        return JSONResponse(dict(row))

@app.patch("/api/documents/{doc_id}")
def update_document(doc_id: int, data: DocumentUpdate) -> JSONResponse:
    """Обновить документ"""
    updates = []
    values = []
    
    for field, value in data.dict(exclude_unset=True).items():
        if value is not None:
            updates.append(f"{field}=?")
            values.append(value)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    updates.append("updated_at=?")
    values.append(datetime.now().isoformat())
    values.append(doc_id)
    
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE documents SET {', '.join(updates)} WHERE id=?", values)
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        con.commit()
        return JSONResponse({"ok": True})

@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: int) -> JSONResponse:
    """Удалить документ и связанный файл"""
    with _connect() as con:
        cur = con.cursor()
        
        # Получаем информацию о файле перед удалением
        cur.execute("SELECT file_path FROM documents WHERE id=?", (doc_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")
        
        file_path = row[0]
        
        # Удаляем запись из БД
        cur.execute("DELETE FROM documents WHERE id=?", (doc_id,))
        con.commit()
        
        # Удаляем файл с диска
        if file_path and file_path.startswith('/files/'):
            full_path = os.path.join(UPLOAD_DIR, file_path.replace('/files/', ''))
            try:
                if os.path.exists(full_path):
                    os.remove(full_path)
            except Exception:
                pass  # Игнорируем ошибки удаления файла
        
        return JSONResponse({"ok": True})

# ===== Расширенные API для счетов =====

class InvoiceUpdate(BaseModel):
    number: Optional[str] = None
    date: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    customer: Optional[str] = None
    customer_details: Optional[str] = None
    description: Optional[str] = None
    object_id: Optional[int] = None

@app.patch("/api/invoices/{invoice_id}")
def update_invoice(invoice_id: int, data: InvoiceUpdate) -> JSONResponse:
    """Обновить счет"""
    updates = []
    values = []
    
    for field, value in data.dict(exclude_unset=True).items():
        if value is not None:
            updates.append(f"{field}=?")
            values.append(value)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    updates.append("updated_at=?")
    values.append(datetime.now().isoformat())
    values.append(invoice_id)
    
    with _connect() as con:
        cur = con.cursor()
        cur.execute(f"UPDATE invoices SET {', '.join(updates)} WHERE id=?", values)
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        con.commit()
        return JSONResponse({"ok": True})

@app.delete("/api/invoices/{invoice_id}")
def delete_invoice(invoice_id: int) -> JSONResponse:
    """Удалить счет и все связанные документы"""
    with _connect() as con:
        cur = con.cursor()
        
        # Получаем связанные документы
        cur.execute("SELECT file_path FROM documents WHERE invoice_id=?", (invoice_id,))
        doc_files = [row[0] for row in cur.fetchall() if row[0]]
        
        # Удаляем связанные документы
        cur.execute("DELETE FROM documents WHERE invoice_id=?", (invoice_id,))
        
        # Удаляем счет
        cur.execute("DELETE FROM invoices WHERE id=?", (invoice_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        con.commit()
        
        # Удаляем файлы документов
        for file_path in doc_files:
            if file_path.startswith('/files/'):
                full_path = os.path.join(UPLOAD_DIR, file_path.replace('/files/', ''))
                try:
                    if os.path.exists(full_path):
                        os.remove(full_path)
                except Exception:
                    pass
        
        return JSONResponse({"ok": True})

@app.get("/api/invoices/{invoice_id}/generate-pdf")
def generate_invoice_pdf(invoice_id: int) -> JSONResponse:
    """Генерация PDF счета"""
    if not PDF_AVAILABLE:
        return JSONResponse({
            "pdf_url": f"/files/invoice_{invoice_id}_placeholder.pdf",
            "generated_at": datetime.now().isoformat(),
            "message": "PDF генератор недоступен. Установите reportlab для полной функциональности."
        })
    
    try:
        import uuid
        
        with _connect() as con:
            cur = con.cursor()
            cur.execute("SELECT * FROM invoices WHERE id=?", (invoice_id,))
            invoice = cur.fetchone()
            if not invoice:
                raise HTTPException(status_code=404, detail="Invoice not found")
            
            # Преобразуем данные счета в словарь
            invoice_data = dict(invoice)
            
            # Генерируем уникальное имя файла
            filename = f"invoice_{invoice_id}_{uuid.uuid4().hex[:8]}.pdf"
            output_path = os.path.join(UPLOAD_DIR, filename)
            
            # Генерируем PDF
            pdf_path = pdf_gen(invoice_data, output_path)
            
            return JSONResponse({
                "pdf_url": f"/files/{filename}",
                "generated_at": datetime.now().isoformat(),
                "invoice_id": invoice_id,
                "filename": filename
            })
            
    except Exception as e:
        print(f"❌ Ошибка генерации PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)