#!/usr/bin/env python3
import requests
import json

def test_pdf_api():
    print("🔍 Тестируем API endpoint для PDF генерации...")
    
    base_url = "http://127.0.0.1:8000"
    
    # Проверяем здоровье сервера
    try:
        health_response = requests.get(f"{base_url}/api/health")
        print(f"🏥 Здоровье сервера: {health_response.status_code}")
        if health_response.status_code != 200:
            print("❌ Сервер не отвечает!")
            return False
    except Exception as e:
        print(f"❌ Не удалось подключиться к серверу: {e}")
        return False
    
    # Получаем список счетов
    try:
        invoices_response = requests.get(f"{base_url}/api/invoices")
        invoices = invoices_response.json()
        print(f"📋 Найдено счетов: {len(invoices)}")
        
        if not invoices:
            print("❌ Нет счетов для тестирования!")
            return False
            
        # Берем первый счет
        test_invoice = invoices[0]
        invoice_id = test_invoice['id']
        print(f"🧪 Тестируем с счетом ID: {invoice_id}")
        
    except Exception as e:
        print(f"❌ Ошибка получения счетов: {e}")
        return False
    
    # Тестируем генерацию PDF
    try:
        pdf_response = requests.get(f"{base_url}/api/invoices/{invoice_id}/generate-pdf")
        print(f"📄 PDF генерация: {pdf_response.status_code}")
        
        if pdf_response.status_code == 200:
            result = pdf_response.json()
            print(f"✅ PDF API response: {result}")
            
            # Проверяем что в ответе есть нужные поля
            if 'pdf_url' in result and 'filename' in result:
                print(f"📎 PDF URL: {result['pdf_url']}")
                print(f"📝 Filename: {result['filename']}")
                
                # Пробуем скачать PDF
                try:
                    pdf_file_response = requests.get(f"{base_url}{result['pdf_url']}")
                    if pdf_file_response.status_code == 200:
                        file_size = len(pdf_file_response.content)
                        print(f"📊 Размер скачанного PDF: {file_size:,} байт")
                        
                        if file_size > 1000:
                            print("🎉 PDF API работает корректно!")
                            return True
                        else:
                            print("❌ PDF файл слишком маленький")
                            return False
                    else:
                        print(f"❌ Не удалось скачать PDF: {pdf_file_response.status_code}")
                        return False
                except Exception as e:
                    print(f"❌ Ошибка скачивания PDF: {e}")
                    return False
            else:
                print("❌ Неправильный формат ответа API")
                return False
        else:
            print(f"❌ Ошибка PDF генерации: {pdf_response.status_code}")
            print(f"Ответ: {pdf_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка PDF API: {e}")
        return False

if __name__ == "__main__":
    test_pdf_api() 