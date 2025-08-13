from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Регистрируем шрифты для поддержки русского языка
try:
    # Используем встроенные шрифты reportlab с поддержкой UTF-8
    from reportlab.pdfbase.cidfonts import UnicodeCIDFont
    from reportlab.pdfbase import pdfmetrics
    
    # Регистрируем стандартные шрифты с поддержкой Unicode
    pdfmetrics.registerFont(UnicodeCIDFont('HeiseiMin-W3'))
    pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKakuGo-W5'))
    
    # Используем Arial Unicode или аналогичный
    default_font = 'HeiseiMin-W3'  # Поддерживает русский
    bold_font = 'HeiseiKakuGo-W5'  # Жирный с поддержкой русского
    
    print("✅ Шрифты с поддержкой русского языка загружены")
    
except Exception as e:
    print(f"⚠️ Не удалось загрузить Unicode шрифты, используем стандартные: {e}")
    # Fallback - попробуем другой подход
    try:
        from reportlab.lib.fonts import addMapping
        from reportlab.pdfbase.ttfonts import TTFont
        import os
        
        # Попробуем найти системные шрифты
        if os.name == 'nt':  # Windows
            font_dirs = [
                r'C:\Windows\Fonts',
                r'C:\Program Files\Common Files\Microsoft Shared\Fonts'
            ]
            
            for font_dir in font_dirs:
                arial_path = os.path.join(font_dir, 'arial.ttf')
                arial_bold_path = os.path.join(font_dir, 'arialbd.ttf')
                
                if os.path.exists(arial_path):
                    pdfmetrics.registerFont(TTFont('Arial-Unicode', arial_path))
                    default_font = 'Arial-Unicode'
                    print(f"✅ Найден Arial: {arial_path}")
                    break
                    
                if os.path.exists(arial_bold_path):
                    pdfmetrics.registerFont(TTFont('Arial-Bold-Unicode', arial_bold_path))
                    bold_font = 'Arial-Bold-Unicode'
                    break
            else:
                # Если не нашли Arial, используем Helvetica (без русского)
                default_font = 'Helvetica'
                bold_font = 'Helvetica-Bold'
                print("⚠️ Русские шрифты не найдены, текст может отображаться некорректно")
        else:
            default_font = 'Helvetica'
            bold_font = 'Helvetica-Bold'
            print("⚠️ Русские шрифты не настроены для данной ОС")
            
    except Exception as e2:
        default_font = 'Helvetica'
        bold_font = 'Helvetica-Bold'
        print(f"⚠️ Fallback к стандартным шрифтам: {e2}")

def get_status_russian(status: str) -> str:
    """Переводит статус счета на русский язык"""
    status_map = {
        'pending': 'Ожидает оплаты',
        'paid': 'Оплачен',
        'overdue': 'Просрочен',
        'cancelled': 'Отменен',
        'draft': 'Черновик'
    }
    return status_map.get(status, status)

def get_object_info(object_id: Optional[int]) -> Optional[Dict[str, Any]]:
    """Получает информацию об объекте строительства"""
    if not object_id:
        return None
    
    try:
        import sqlite3
        import os
        
        # Путь к БД относительно текущего файла
        db_path = os.path.join(os.path.dirname(__file__), '..', 'bot.db')
        
        with sqlite3.connect(db_path) as con:
            con.row_factory = sqlite3.Row
            cur = con.cursor()
            cur.execute("SELECT * FROM objects WHERE id = ?", (object_id,))
            row = cur.fetchone()
            
            if row:
                return dict(row)
    except Exception as e:
        print(f"Ошибка получения информации об объекте: {e}")
    
    return None

def generate_invoice_pdf(invoice_data: Dict[str, Any], output_path: str) -> str:
    """
    Генерирует профессиональный PDF счет на основе данных
    
    Args:
        invoice_data: Словарь с данными счета
        output_path: Путь для сохранения PDF файла
    
    Returns:
        Путь к созданному PDF файлу
    """
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=1.5*cm,
        bottomMargin=2*cm
    )
    
    # Стили
    styles = getSampleStyleSheet()
    
    # Создаем кастомные стили
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        fontName=bold_font,
        alignment=TA_CENTER,
        spaceAfter=20,
        textColor=colors.HexColor('#1A365D'),
        borderWidth=2,
        borderColor=colors.HexColor('#3182CE'),
        borderPadding=10
    )
    
    company_style = ParagraphStyle(
        'CompanyStyle',
        parent=styles['Normal'],
        fontSize=11,
        fontName=bold_font,
        alignment=TA_LEFT,
        textColor=colors.HexColor('#2D3748'),
        spaceAfter=4
    )
    
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Normal'],
        fontSize=12,
        fontName=bold_font,
        alignment=TA_LEFT,
        spaceAfter=8,
        textColor=colors.HexColor('#2B6CB0'),
        borderWidth=1,
        borderColor=colors.HexColor('#E2E8F0'),
        backColor=colors.HexColor('#F7FAFC'),
        borderPadding=5
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        fontName=default_font,
        alignment=TA_LEFT,
        spaceAfter=4,
        textColor=colors.HexColor('#2D3748')
    )
    
    # Контент документа
    story = []
    
    # Заголовок с номером счета
    invoice_number = invoice_data.get('number', f"№{invoice_data.get('id', 'XXX')}")
    invoice_date = invoice_data.get('date', datetime.now().strftime('%d.%m.%Y'))
    
    story.append(Paragraph(f"СЧЕТ НА ОПЛАТУ {invoice_number}", title_style))
    story.append(Paragraph(f"от {invoice_date}", ParagraphStyle('DateStyle', parent=normal_style, alignment=TA_CENTER, fontSize=12, spaceAfter=20)))
    
    # Блок информации о компании и счете
    header_table_data = [
        [Paragraph("<b>ООО 'УграСтройка'</b>", company_style), 
         Paragraph(f"<b>Дата выставления:</b> {invoice_date}", normal_style)],
        [Paragraph("ИНН: 1234567890, КПП: 123456789", normal_style), 
         Paragraph(f"<b>Срок оплаты:</b> {invoice_data.get('due_date', 'по договору')}", normal_style)],
        [Paragraph("ОГРН: 1234567890123", normal_style), 
         Paragraph(f"<b>Статус:</b> {get_status_russian(invoice_data.get('status', 'pending'))}", normal_style)],
        [Paragraph("Адрес: 628400, ХМАО-Югра, г. Сургут", normal_style), 
         Paragraph(f"<b>Валюта:</b> Российский рубль", normal_style)],
        [Paragraph("ул. Ленина, д.1, оф.100", normal_style), ""],
        [Paragraph("Тел: +7 (3462) 12-34-56", normal_style), ""],
        [Paragraph("Email: info@ugrastroyka.ru", normal_style), ""]
    ]
    
    header_table = Table(header_table_data, colWidths=[9*cm, 8*cm])
    header_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), default_font),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDF2F7')),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(header_table)
    story.append(Spacer(1, 0.4*inch))
    
    # Информация о заказчике
    story.append(Paragraph("ПЛАТЕЛЬЩИК", header_style))
    customer_info = invoice_data.get('customer', 'Не указан')
    customer_details = invoice_data.get('customer_details', '')
    
    customer_text = f"<b>{customer_info}</b>"
    if customer_details:
        customer_text += f"<br/>{customer_details}"
    
    customer_table = Table([[Paragraph(customer_text, normal_style)]], colWidths=[17*cm])
    customer_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), default_font),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(customer_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Информация об объекте (если есть)
    object_info = get_object_info(invoice_data.get('object_id'))
    if object_info:
        story.append(Paragraph("ОБЪЕКТ СТРОИТЕЛЬСТВА", header_style))
        object_text = f"<b>{object_info['name']}</b>"
        if object_info.get('address'):
            object_text += f"<br/>Адрес: {object_info['address']}"
        if object_info.get('description'):
            object_text += f"<br/>Описание: {object_info['description']}"
        
        object_table = Table([[Paragraph(object_text, normal_style)]], colWidths=[17*cm])
        object_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), default_font),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        story.append(object_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Описание работ/услуг
    story.append(Paragraph("ВЫПОЛНЕННЫЕ РАБОТЫ И ОКАЗАННЫЕ УСЛУГИ", header_style))
    
    # Таблица с работами
    amount = float(invoice_data.get('amount', 0))
    description = invoice_data.get('description') or 'Строительно-монтажные работы'
    
    work_data = [
        [Paragraph("<b>№</b>", ParagraphStyle('TableHeader', parent=normal_style, fontName=bold_font, alignment=TA_CENTER)),
         Paragraph("<b>Наименование работ, услуг</b>", ParagraphStyle('TableHeader', parent=normal_style, fontName=bold_font, alignment=TA_CENTER)),
         Paragraph("<b>Ед.<br/>изм.</b>", ParagraphStyle('TableHeader', parent=normal_style, fontName=bold_font, alignment=TA_CENTER)),
         Paragraph("<b>Кол-во</b>", ParagraphStyle('TableHeader', parent=normal_style, fontName=bold_font, alignment=TA_CENTER)),
         Paragraph("<b>Цена<br/>(руб.)</b>", ParagraphStyle('TableHeader', parent=normal_style, fontName=bold_font, alignment=TA_CENTER)),
         Paragraph("<b>Сумма<br/>(руб.)</b>", ParagraphStyle('TableHeader', parent=normal_style, fontName=bold_font, alignment=TA_CENTER))],
        ["1", 
         Paragraph(description, normal_style),
         "комплекс", 
         "1", 
         f"{amount:,.2f}".replace(',', ' '), 
         f"{amount:,.2f}".replace(',', ' ')]
    ]
    
    work_table = Table(work_data, colWidths=[1*cm, 7*cm, 2*cm, 1.5*cm, 2.75*cm, 2.75*cm])
    work_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), default_font),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#718096')),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDF2F7')),
        ('FONTNAME', (0, 0), (-1, 0), bold_font),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(work_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Итоговая сумма
    vat_rate = 20  # НДС 20%
    subtotal = amount
    vat_amount = subtotal * vat_rate / 100
    total_with_vat = subtotal + vat_amount
    
    total_data = [
        ["", "", "", "", "Итого без НДС:", f"{subtotal:,.2f} руб.".replace(',', ' ')],
        ["", "", "", "", f"НДС ({vat_rate}%):", f"{vat_amount:,.2f} руб.".replace(',', ' ')],
        ["", "", "", "", Paragraph("<b>ИТОГО К ОПЛАТЕ:</b>", ParagraphStyle('TotalStyle', parent=normal_style, fontName=bold_font, fontSize=11)), 
         Paragraph(f"<b>{total_with_vat:,.2f} руб.</b>".replace(',', ' '), ParagraphStyle('TotalStyle', parent=normal_style, fontName=bold_font, fontSize=11))]
    ]
    
    total_table = Table(total_data, colWidths=[1*cm, 7*cm, 2*cm, 1.5*cm, 2.75*cm, 2.75*cm])
    total_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), default_font),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (4, 0), (4, -1), 'RIGHT'),
        ('ALIGN', (5, 0), (5, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (4, 0), (-1, -1), 0.5, colors.HexColor('#718096')),
        ('BACKGROUND', (4, 2), (-1, 2), colors.HexColor('#E6FFFA')),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    
    story.append(total_table)
    story.append(Spacer(1, 0.4*inch))
    
    # Реквизиты для оплаты
    story.append(Paragraph("БАНКОВСКИЕ РЕКВИЗИТЫ", header_style))
    
    bank_info = [
        ["Получатель:", "ООО 'УграСтройка'"],
        ["ИНН/КПП:", "1234567890 / 123456789"],
        ["Банк:", "ПАО Сбербанк"],
        ["БИК:", "047102651"],
        ["Корр. счет:", "30101810500000000651"],
        ["Расч. счет:", "40702810926000123456"],
        ["Назначение платежа:", f"Оплата по счету {invoice_number} от {invoice_date}"]
    ]
    
    bank_table = Table(bank_info, colWidths=[4*cm, 13*cm])
    bank_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), default_font),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('FONTNAME', (0, 0), (0, -1), bold_font),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    
    story.append(bank_table)
    story.append(Spacer(1, 0.5*inch))
    
    # Подписи
    signature_data = [
        ["Руководитель", "________________", "И.О. Фамилия"],
        ["", "", ""],
        ["Главный бухгалтер", "________________", "И.О. Фамилия"]
    ]
    
    signature_table = Table(signature_data, colWidths=[4*cm, 4*cm, 4*cm])
    signature_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), default_font),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('FONTNAME', (0, 0), (0, -1), bold_font),
        ('FONTNAME', (0, 2), (0, 2), bold_font),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    
    story.append(signature_table)
    
    # Примечание
    story.append(Spacer(1, 0.3*inch))
    note_style = ParagraphStyle('NoteStyle', parent=normal_style, fontSize=8, textColor=colors.HexColor('#718096'), alignment=TA_CENTER)
    story.append(Paragraph("Счет действителен к оплате в течение 5 банковских дней", note_style))
    story.append(Paragraph(f"Счет сформирован автоматически {datetime.now().strftime('%d.%m.%Y в %H:%M')}", note_style))
    
    # Генерируем PDF
    doc.build(story)
    
    return output_path


def generate_act_pdf(act_data: Dict[str, Any], output_path: str) -> str:
    """Генерирует PDF акта выполненных работ"""
    
    doc = SimpleDocTemplate(output_path, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'ActTitle',
        parent=styles['Heading1'],
        fontSize=16,
        fontName=bold_font,
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    story.append(Paragraph("АКТ ВЫПОЛНЕННЫХ РАБОТ", title_style))
    story.append(Paragraph(f"№{act_data.get('number', act_data.get('id', ''))} от {act_data.get('date', datetime.now().strftime('%d.%m.%Y'))}", title_style))
    
    # Здесь можно добавить больше содержимого для акта
    
    doc.build(story)
    return output_path


def get_pdf_template_info():
    """Возвращает информацию о доступных шаблонах PDF"""
    return {
        "invoice": {
            "name": "Счет на оплату",
            "description": "Стандартный счет с реквизитами компании",
            "generator": generate_invoice_pdf
        },
        "act": {
            "name": "Акт выполненных работ",
            "description": "Акт приемки выполненных работ",
            "generator": generate_act_pdf
        }
    } 