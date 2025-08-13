#!/usr/bin/env python3
import sqlite3
import json
from pathlib import Path

DB_PATH = str(Path(__file__).resolve().parent.parent / "bot.db")

def debug_load_setting(key: str):
    print(f"\n🔍 Отладка _load_setting для ключа: {key}")
    print(f"📁 Путь к БД: {DB_PATH}")
    
    try:
        con = sqlite3.connect(DB_PATH)
        print("✅ Подключение к БД успешно")
        
        cur = con.cursor()
        cur.execute("CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT)")
        print("✅ Таблица settings проверена/создана")
        
        cur.execute("SELECT value FROM settings WHERE key=?", (key,))
        row = cur.fetchone()
        print(f"🔍 Результат SQL запроса: {row}")
        
        con.close()
        
        if not row:
            print("❌ Запись не найдена")
            return None
            
        val = row[0]
        print(f"📄 Сырое значение: {repr(val)}")
        
        # Если пустое значение
        if not val:
            print("❌ Пустое значение")
            return None
            
        try:
            # Пробуем парсить как JSON
            print("🔄 Пробуем парсить как JSON...")
            obj = json.loads(val)
            print(f"✅ JSON парсинг успешен: {type(obj)} = {repr(obj)}")
            
            if isinstance(obj, str):
                print("✅ Возвращаем как строку")
                return obj
            if isinstance(obj, dict) and 'value' in obj:
                result = str(obj['value'])
                print(f"✅ Извлекаем value из dict: {repr(result)}")
                return result
            result = str(obj)
            print(f"✅ Преобразуем в строку: {repr(result)}")
            return result
        except (json.JSONDecodeError, TypeError) as e:
            print(f"⚠️ JSON парсинг не удался: {e}")
            print(f"✅ Возвращаем как простую строку: {repr(val)}")
            return val
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return None

# Тестируем общие настройки (без банковских)
keys = ['app_name', 'app_version', 'default_currency']

for key in keys:
    result = debug_load_setting(key)
    print(f"🎯 Результат для {key}: {repr(result)}")
    print("-" * 50) 