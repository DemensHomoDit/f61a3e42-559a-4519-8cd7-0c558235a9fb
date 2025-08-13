#!/usr/bin/env python3
from pdf_generator import generate_invoice_pdf
import os

def test_russian_text():
    print("🔍 Тестируем русский текст в PDF...")
    
    # Создаем тестовые данные с русским текстом
    test_invoice = {
        'id': 999,
        'number': 'ТЕСТ-2024-001',
        'date': '2024-12-31',
        'amount': 123456.78,
        'status': 'pending',
        'due_date': '2025-01-15',
        'customer': 'ООО "Строительная Компания Мечта"',
        'customer_details': 'ИНН: 7812345678, КПП: 781234567, Адрес: г. Санкт-Петербург, ул. Невский проспект, д. 123',
        'description': 'Комплексные строительно-монтажные работы по возведению жилого дома с использованием современных технологий и материалов',
        'object_id': 1  # Будет искать объект в БД
    }
    
    try:
        output_path = "test_russian_invoice.pdf"
        result_path = generate_invoice_pdf(test_invoice, output_path)
        
        file_size = os.path.getsize(result_path)
        print(f"✅ PDF с русским текстом создан: {result_path}")
        print(f"📊 Размер файла: {file_size:,} байт")
        
        if file_size > 5000:  # Больше 5KB означает что PDF полноценный
            print("🎉 PDF выглядит полноценным! Откройте его и проверьте русский текст.")
            return True
        else:
            print("⚠️ PDF файл подозрительно маленький")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_russian_text() 