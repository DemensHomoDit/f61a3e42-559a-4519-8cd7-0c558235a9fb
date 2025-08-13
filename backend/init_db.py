#!/usr/bin/env python3
"""
Инициализация базы данных
"""

import sqlite3
import os

def init_database():
    """Создает таблицы в базе данных"""
    
    db_path = '../bot.db'
    
    try:
        with sqlite3.connect(db_path) as con:
            cur = con.cursor()
            
            print("🗄️ Создаем таблицы...")
            
            # Таблица счетов
            cur.execute("""
                CREATE TABLE IF NOT EXISTS invoices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    number TEXT,
                    date TEXT,
                    amount REAL,
                    status TEXT,
                    due_date TEXT,
                    customer TEXT,
                    customer_details TEXT,
                    description TEXT,
                    object_id INTEGER,
                    comment TEXT,
                    file_url TEXT,
                    payment_terms TEXT,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            
            # Таблица настроек
            cur.execute("""
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                )
            """)
            
            # Таблица клиентов
            cur.execute("""
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
            """)
            
            # Таблица кассовых операций
            cur.execute("""
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
            """)
            
            con.commit()
            print("✅ Все таблицы созданы успешно!")
            
    except Exception as e:
        print(f"❌ Ошибка инициализации БД: {e}")

if __name__ == "__main__":
    init_database() 