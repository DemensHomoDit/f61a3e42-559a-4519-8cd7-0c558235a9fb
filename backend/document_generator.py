#!/usr/bin/env python3
"""
Генератор документов по шаблонам
Поддерживает: договоры, акты выполненных работ, дополнительные соглашения
"""

import os
import sqlite3
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

# Попробуем импортировать библиотеки для работы с документами
try:
    from docx import Document
    from docx.shared import Inches
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    print("⚠️ python-docx не установлен. Установите для генерации документов: pip install python-docx")

try:
    from jinja2 import Template
    JINJA2_AVAILABLE = True
except ImportError:
    JINJA2_AVAILABLE = False
    print("⚠️ jinja2 не установлен. Установите для шаблонов: pip install jinja2")


class DocumentGenerator:
    """Генератор документов по шаблонам"""
    
    def __init__(self):
        self.templates_dir = Path(__file__).parent / "templates"
        self.output_dir = Path(__file__).parent.parent / "uploads"
        
        # Создаем директории если их нет
        self.templates_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)
        
        # Создаем базовые шаблоны если их нет
        self._ensure_base_templates()
    
    def _ensure_base_templates(self):
        """Создает базовые шаблоны если их нет"""
        
        # Шаблон договора
        contract_template = """
ДОГОВОР ПОДРЯДА № {{ contract_number }}
{{ contract_date }}

ЗАКАЗЧИК: {{ customer_name }}
{% if customer_details %}{{ customer_details }}{% endif %}

ПОДРЯДЧИК: ООО "УграСтройГрупп"
ИНН: 8601234567, КПП: 860101001
Адрес: г. Сургут, ул. Энергетиков, д. 1

ПРЕДМЕТ ДОГОВОРА:
{{ work_description }}

Объект: {{ object_name }}
{% if object_address %}Адрес объекта: {{ object_address }}{% endif %}

СТОИМОСТЬ РАБОТ: {{ total_amount }} рублей
{% if total_amount_words %}({{ total_amount_words }}){% endif %}

СРОКИ ВЫПОЛНЕНИЯ:
Начало работ: {{ start_date }}
Окончание работ: {{ end_date }}

Срок действия договора: до {{ contract_end_date }}

ПОДПИСИ СТОРОН:

ЗАКАЗЧИК: _________________

ПОДРЯДЧИК: _________________ 
           (директор)
"""
        
        # Шаблон акта выполненных работ
        act_template = """
АКТ ВЫПОЛНЕННЫХ РАБОТ № {{ act_number }}
{{ act_date }}

По договору № {{ contract_number }} от {{ contract_date }}

ЗАКАЗЧИК: {{ customer_name }}
ПОДРЯДЧИК: ООО "УграСтройГрупп"

ВЫПОЛНЕННЫЕ РАБОТЫ:
{{ work_description }}

Объект: {{ object_name }}
Период выполнения: с {{ period_start }} по {{ period_end }}

СТОИМОСТЬ ВЫПОЛНЕННЫХ РАБОТ: {{ amount }} рублей
{% if amount_words %}({{ amount_words }}){% endif %}

Работы выполнены полностью и в срок, качество соответствует договору.

ПОДПИСИ СТОРОН:

ЗАКАЗЧИК: _________________     ПОДРЯДЧИК: _________________
"""
        
        # Сохраняем шаблоны
        templates = {
            "contract.txt": contract_template,
            "act.txt": act_template
        }
        
        for filename, content in templates.items():
            template_path = self.templates_dir / filename
            if not template_path.exists():
                template_path.write_text(content, encoding='utf-8')
                print(f"✅ Создан шаблон: {filename}")
    
    def generate_contract(self, data: Dict[str, Any]) -> str:
        """Генерирует договор"""
        template_path = self.templates_dir / "contract.txt"
        
        if not template_path.exists():
            raise FileNotFoundError("Шаблон договора не найден")
        
        if not JINJA2_AVAILABLE:
            return self._generate_simple_document("contract", data)
        
        # Загружаем шаблон
        template_content = template_path.read_text(encoding='utf-8')
        template = Template(template_content)
        
        # Заполняем данными
        filled_content = template.render(**data)
        
        # Сохраняем результат
        filename = f"contract_{data.get('contract_number', datetime.now().strftime('%Y%m%d'))}_{datetime.now().strftime('%H%M%S')}.txt"
        output_path = self.output_dir / filename
        output_path.write_text(filled_content, encoding='utf-8')
        
        print(f"✅ Договор создан: {filename}")
        return f"/files/{filename}"
    
    def generate_act(self, data: Dict[str, Any]) -> str:
        """Генерирует акт выполненных работ"""
        template_path = self.templates_dir / "act.txt"
        
        if not template_path.exists():
            raise FileNotFoundError("Шаблон акта не найден")
        
        if not JINJA2_AVAILABLE:
            return self._generate_simple_document("act", data)
        
        # Загружаем шаблон
        template_content = template_path.read_text(encoding='utf-8')
        template = Template(template_content)
        
        # Заполняем данными
        filled_content = template.render(**data)
        
        # Сохраняем результат
        filename = f"act_{data.get('act_number', datetime.now().strftime('%Y%m%d'))}_{datetime.now().strftime('%H%M%S')}.txt"
        output_path = self.output_dir / filename
        output_path.write_text(filled_content, encoding='utf-8')
        
        print(f"✅ Акт создан: {filename}")
        return f"/files/{filename}"
    
    def _generate_simple_document(self, doc_type: str, data: Dict[str, Any]) -> str:
        """Генерирует простой документ без шаблонизатора"""
        if doc_type == "contract":
            content = f"""
ДОГОВОР ПОДРЯДА № {data.get('contract_number', 'б/н')}
{data.get('contract_date', datetime.now().strftime('%d.%m.%Y'))}

ЗАКАЗЧИК: {data.get('customer_name', '')}
ПОДРЯДЧИК: ООО "УграСтройГрупп"

ПРЕДМЕТ ДОГОВОРА: {data.get('work_description', '')}
ОБЪЕКТ: {data.get('object_name', '')}
СТОИМОСТЬ: {data.get('total_amount', 0)} рублей

СРОКИ: с {data.get('start_date', '')} по {data.get('end_date', '')}

ПОДПИСИ СТОРОН:
ЗАКАЗЧИК: _________________
ПОДРЯДЧИК: _________________
"""
        elif doc_type == "act":
            content = f"""
АКТ ВЫПОЛНЕННЫХ РАБОТ № {data.get('act_number', 'б/н')}
{data.get('act_date', datetime.now().strftime('%d.%m.%Y'))}

По договору № {data.get('contract_number', '')}

ЗАКАЗЧИК: {data.get('customer_name', '')}
ПОДРЯДЧИК: ООО "УграСтройГрупп"

ВЫПОЛНЕННЫЕ РАБОТЫ: {data.get('work_description', '')}
ОБЪЕКТ: {data.get('object_name', '')}
СТОИМОСТЬ: {data.get('amount', 0)} рублей

ПОДПИСИ СТОРОН:
ЗАКАЗЧИК: _________________
ПОДРЯДЧИК: _________________
"""
        else:
            content = f"Документ типа {doc_type}\nДанные: {data}"
        
        filename = f"{doc_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        output_path = self.output_dir / filename
        output_path.write_text(content, encoding='utf-8')
        
        return f"/files/{filename}"
    
    def get_template_fields(self, template_type: str) -> Dict[str, str]:
        """Возвращает поля шаблона для фронтенда"""
        if template_type == "contract":
            return {
                "contract_number": "Номер договора",
                "contract_date": "Дата договора",
                "customer_name": "Наименование заказчика",
                "customer_details": "Реквизиты заказчика",
                "work_description": "Описание работ",
                "object_name": "Наименование объекта",
                "object_address": "Адрес объекта",
                "total_amount": "Общая стоимость",
                "start_date": "Дата начала работ",
                "end_date": "Дата окончания работ",
                "contract_end_date": "Дата окончания договора"
            }
        elif template_type == "act":
            return {
                "act_number": "Номер акта",
                "act_date": "Дата акта",
                "contract_number": "Номер договора",
                "contract_date": "Дата договора",
                "customer_name": "Наименование заказчика",
                "work_description": "Описание выполненных работ",
                "object_name": "Наименование объекта",
                "period_start": "Начало периода",
                "period_end": "Конец периода",
                "amount": "Стоимость работ"
            }
        else:
            return {}
    
    def generate_document_from_invoice(self, invoice_id: int, doc_type: str) -> str:
        """Генерирует документ на основе данных счета"""
        try:
            with sqlite3.connect('../bot.db') as con:
                con.row_factory = sqlite3.Row
                cur = con.cursor()
                
                # Получаем данные счета
                cur.execute("""
                    SELECT i.*, o.name as object_name, o.address as object_address
                    FROM invoices i
                    LEFT JOIN objects o ON i.object_id = o.id
                    WHERE i.id = ?
                """, (invoice_id,))
                
                invoice = cur.fetchone()
                if not invoice:
                    raise ValueError(f"Счет {invoice_id} не найден")
                
                # Подготавливаем данные для документа
                data = {
                    "customer_name": invoice['customer'] or '',
                    "customer_details": invoice.get('customer_details', ''),
                    "work_description": invoice.get('description', 'Строительные работы'),
                    "object_name": invoice.get('object_name', ''),
                    "object_address": invoice.get('object_address', ''),
                    "total_amount": invoice['amount'] or 0,
                    "amount": invoice['amount'] or 0,
                    "contract_date": datetime.now().strftime('%d.%m.%Y'),
                    "act_date": datetime.now().strftime('%d.%m.%Y'),
                    "start_date": datetime.now().strftime('%d.%m.%Y'),
                    "end_date": (datetime.now().replace(month=datetime.now().month+1) if datetime.now().month < 12 
                               else datetime.now().replace(year=datetime.now().year+1, month=1)).strftime('%d.%m.%Y'),
                    "period_start": datetime.now().strftime('%d.%m.%Y'),
                    "period_end": datetime.now().strftime('%d.%m.%Y')
                }
                
                # Генерируем номера документов
                if doc_type == "contract":
                    data["contract_number"] = f"П-{invoice_id}-{datetime.now().strftime('%Y')}"
                    data["contract_end_date"] = datetime.now().replace(year=datetime.now().year+1).strftime('%d.%m.%Y')
                    return self.generate_contract(data)
                elif doc_type == "act":
                    data["act_number"] = f"А-{invoice_id}-{datetime.now().strftime('%Y')}"
                    data["contract_number"] = f"П-{invoice_id}-{datetime.now().strftime('%Y')}"
                    return self.generate_act(data)
                else:
                    raise ValueError(f"Неподдерживаемый тип документа: {doc_type}")
                    
        except Exception as e:
            print(f"❌ Ошибка генерации документа: {e}")
            raise


# Функции для тестирования
def test_document_generation():
    """Тестирует генерацию документов"""
    print("🧪 Тестируем генерацию документов...")
    
    generator = DocumentGenerator()
    
    # Тестовые данные для договора
    contract_data = {
        "contract_number": "П-001-2024",
        "contract_date": "15.12.2024",
        "customer_name": "ООО \"Тестовый Заказчик\"",
        "customer_details": "ИНН: 1234567890, КПП: 123456789",
        "work_description": "Строительство жилого дома",
        "object_name": "Коттедж на ул. Тестовой",
        "object_address": "г. Сургут, ул. Тестовая, 123",
        "total_amount": 2500000,
        "start_date": "20.12.2024",
        "end_date": "20.06.2025",
        "contract_end_date": "31.12.2025"
    }
    
    # Тестовые данные для акта
    act_data = {
        "act_number": "А-001-2024",
        "act_date": "15.12.2024",
        "contract_number": "П-001-2024",
        "contract_date": "15.11.2024",
        "customer_name": "ООО \"Тестовый Заказчик\"",
        "work_description": "Фундаментные работы",
        "object_name": "Коттедж на ул. Тестовой",
        "period_start": "01.12.2024",
        "period_end": "15.12.2024",
        "amount": 500000
    }
    
    try:
        # Генерируем договор
        contract_path = generator.generate_contract(contract_data)
        print(f"✅ Договор создан: {contract_path}")
        
        # Генерируем акт
        act_path = generator.generate_act(act_data)
        print(f"✅ Акт создан: {act_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        return False


if __name__ == "__main__":
    test_document_generation() 