#!/usr/bin/env python3
import requests
import sqlite3
from pdf_generator import generate_invoice_pdf

def test_invoice_1():
    print("🧪 Тестируем счет ID=1...")
    
    # Сначала получим данные счета напрямую из БД
    try:
        con = sqlite3.connect('../bot.db')
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        
        cur.execute("SELECT * FROM invoices WHERE id = 1")
        invoice_row = cur.fetchone()
        
        if not invoice_row:
            print("❌ Счет ID=1 не найден!")
            return False
        
        invoice_data = dict(invoice_row)
        print(f"📋 Данные счета: {invoice_data}")
        
        # Тестируем PDF генерацию напрямую
        print("🔄 Тестируем PDF генерацию напрямую...")
        try:
            output_path = "test_invoice_1.pdf"
            result_path = generate_invoice_pdf(invoice_data, output_path)
            print(f"✅ PDF создан: {result_path}")
        except Exception as e:
            print(f"❌ Ошибка PDF генерации: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        con.close()
        
        # Теперь тестируем через API
        print("🌐 Тестируем через API...")
        try:
            response = requests.get("http://127.0.0.1:8000/api/invoices/1/generate-pdf")
            print(f"📄 API статус: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ API ответ: {result}")
                return True
            else:
                print(f"❌ API ошибка: {response.status_code}")
                print(f"Ответ: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Ошибка API: {e}")
            return False
        
    except Exception as e:
        print(f"❌ Общая ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_invoice_1() 