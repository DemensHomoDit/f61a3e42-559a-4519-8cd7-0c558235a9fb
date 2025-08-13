#!/usr/bin/env python3
from pdf_generator import generate_invoice_pdf
import sqlite3
import os

def test_pdf_generation():
    print("🔍 Тестируем PDF генерацию...")
    
    # Подключаемся к БД
    con = sqlite3.connect('../bot.db')
    cur = con.cursor()
    
    # Создаем тестовый счет если его нет
    cur.execute('SELECT COUNT(*) FROM invoices')
    count = cur.fetchone()[0]
    
    if count == 0:
        print("📝 Создаем тестовый счет...")
        cur.execute('''
        INSERT INTO invoices (number, date, amount, status, customer, description, customer_details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ''', ('TEST-001', '2024-01-15', 150000.0, 'pending', 'ООО "Тестовый Клиент"', 
              'Строительные работы по договору подряда', 
              'ИНН: 1234567890, КПП: 123456789, Адрес: г.Тест, ул.Тестовая, 1'))
        con.commit()
    
    # Получаем счет для тестирования
    cur.execute('SELECT * FROM invoices ORDER BY id DESC LIMIT 1')
    invoice_row = cur.fetchone()
    
    if not invoice_row:
        print("❌ Счета не найдены!")
        return False
    
    # Преобразуем в словарь
    columns = [description[0] for description in cur.description]
    invoice_data = dict(zip(columns, invoice_row))
    
    print(f"📋 Данные счета: №{invoice_data.get('number', invoice_data['id'])}, {invoice_data.get('amount', 0)} руб.")
    
    # Генерируем PDF
    output_path = 'test_invoice.pdf'
    try:
        result_path = generate_invoice_pdf(invoice_data, output_path)
        file_size = os.path.getsize(result_path)
        print(f"✅ PDF успешно создан: {result_path}")
        print(f"📊 Размер файла: {file_size:,} байт")
        
        # Проверяем что файл действительно создался
        if os.path.exists(result_path) and file_size > 1000:
            print("🎉 PDF генерация работает корректно!")
            return True
        else:
            print("❌ PDF файл пустой или поврежден")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка генерации PDF: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        con.close()

if __name__ == "__main__":
    test_pdf_generation() 