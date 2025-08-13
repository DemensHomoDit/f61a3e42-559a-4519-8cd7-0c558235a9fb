#!/usr/bin/env python3
import sqlite3

def check_invoices():
    print("🔍 Проверяем счета в базе данных...")
    
    try:
        con = sqlite3.connect('../bot.db')
        cur = con.cursor()
        
        cur.execute('SELECT id, number, amount, customer, status, object_id FROM invoices ORDER BY id')
        invoices = cur.fetchall()
        
        if invoices:
            print(f"📋 Найдено счетов: {len(invoices)}")
            for invoice in invoices:
                print(f"   ID: {invoice[0]}, №{invoice[1]}, {invoice[2]} руб., {invoice[3]}, статус: {invoice[4]}, объект: {invoice[5]}")
        else:
            print("❌ Счета не найдены в БД")
        
        con.close()
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")

if __name__ == "__main__":
    check_invoices() 