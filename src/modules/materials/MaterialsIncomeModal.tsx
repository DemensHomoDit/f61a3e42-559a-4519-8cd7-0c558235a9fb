import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, VStack, HStack, FormControl, FormLabel, Select as CSelect, Input, Button, useToast } from '@chakra-ui/react';
import { CatalogPicker } from '@/modules/catalog/components/CatalogPicker';
import { allowedUnits, normalizeUnit } from '@/lib/units';
import { createPurchaseAuto } from '@/api/client';

interface MaterialsIncomeModalProps {
	isOpen: boolean;
	onClose: () => void;
	form: any;
	setForm: React.Dispatch<React.SetStateAction<any>>;
	objects: any[];
	onCreated: (created: any) => Promise<void> | void;
}

export const MaterialsIncomeModal: React.FC<MaterialsIncomeModalProps> = ({ isOpen, onClose, form, setForm, objects, onCreated }) => {
	const toast = useToast();

	const handleSubmit = async () => {
		try {
			const item = (form.item || '').trim();
			const qtyNum = form.qty ? Number(form.qty) : NaN;
			const unit = (form.unit || '').trim() || 'шт';
			const type = (form.type || 'materials');
			const amountNum = form.amount ? Number(form.amount) : NaN;
			if (!item) {
				toast({ title: 'Укажите наименование', status: 'warning' });
				return;
			}
			if (!isFinite(qtyNum) || qtyNum <= 0) {
				toast({ title: 'Укажите корректное количество', status: 'warning' });
				return;
			}
			const created = await createPurchaseAuto({
				item,
				amount: isFinite(amountNum) && amountNum > 0 ? amountNum : undefined,
				qty: qtyNum,
				unit: String(normalizeUnit(unit)),
				type,
				object_id: form.object_id ? Number(form.object_id) : undefined,
				assignee_id: undefined,
				supplier_id: (form as any).supplier_id ? Number((form as any).supplier_id) : undefined,
				url: (form as any).url,
				date: form.date || new Date().toISOString().slice(0,10),
				status: 'stock_in'
			});
			await onCreated(created);
			toast({ title: 'Приход оформлен', status: 'success' });
			onClose();
		} catch (e: any) {
			const msg = e?.message || 'Не удалось оформить приход';
			try {
				const parsed = JSON.parse(msg);
				if (parsed?.detail) {
					toast({ title: 'Ошибка', description: parsed.detail, status: 'error' });
					return;
				}
			} catch {}
			toast({ title: 'Не удалось оформить приход', description: msg, status: 'error' });
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} isCentered>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Приход материалов на склад</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<VStack align="stretch" spacing={3}>
						<FormControl>
							<FormLabel htmlFor="incomeTypeToggle">Тип</FormLabel>
							<HStack id="incomeTypeToggle" role="tablist">
								{[
									{ key: 'materials', label: 'Материалы' },
									{ key: 'consumables', label: 'Расходники' },
									{ key: 'tools', label: 'Инструмент' },
								].map(opt => (
									<Button
										key={opt.key}
										onClick={()=> setForm((f:any)=>({ ...f, type: opt.key as any }))}
										variant={form.type === opt.key ? 'gradient' : 'outline'}
										aria-pressed={form.type === opt.key}
									>{opt.label}</Button>
								))}
							</HStack>
						</FormControl>
						<FormControl isRequired>
							<FormLabel htmlFor="incomeItem">Наименование</FormLabel>
							<Input id="incomeItem" placeholder="Напр. Саморез 3.5x25" value={form.item} onChange={(e)=> setForm((f:any)=>({...f, item: e.target.value}))} />
						</FormControl>
						<HStack>
							<FormControl isRequired>
								<FormLabel htmlFor="incomeQty">Количество</FormLabel>
								<Input id="incomeQty" value={form.qty} onChange={(e)=> setForm((f:any)=>({...f, qty: e.target.value}))} placeholder="Напр. 100" />
							</FormControl>
							<FormControl>
								<FormLabel htmlFor="incomeUnit">Ед.</FormLabel>
								<CSelect id="incomeUnit" title="Единица измерения для прихода" aria-label="Единица измерения для прихода" value={normalizeUnit(form.unit) as any} onChange={(e)=> setForm((f:any)=>({...f, unit: e.target.value}))}>
									{allowedUnits.map(u=> <option key={u.code} value={u.code}>{u.label}</option>)}
								</CSelect>
							</FormControl>
						</HStack>
						<CatalogPicker value={{ item: form.item, type: form.type as any, supplier_id: (form as any).supplier_id, price: form.amount, url: (form as any).url }} onChange={(v)=> setForm((f:any)=>({ ...f, item: v.item ?? f.item, amount: v.price ?? f.amount, ...(v.supplier_id!=null?{ supplier_id: v.supplier_id }:{}), ...(v.url!=null?{ url: v.url }:{}), }))} />
						<HStack>
							<FormControl>
								<FormLabel htmlFor="incomeAmount">Цена за единицу, ₽</FormLabel>
								<Input id="incomeAmount" value={form.amount} onChange={(e)=> setForm((f:any)=>({...f, amount: e.target.value}))} placeholder="Напр. 1500" />
							</FormControl>
							<FormControl>
								<FormLabel htmlFor="incomeTotal">Итого, ₽</FormLabel>
								<Input id="incomeTotal" isReadOnly value={(()=>{ const q = Number(form.qty||0)||0; const p = Number(form.amount||0)||0; return (q*p).toFixed(2); })()} />
							</FormControl>
						</HStack>
						<HStack>
							<FormControl>
								<FormLabel htmlFor="incomeObject">Объект (необязательно)</FormLabel>
								<CSelect id="incomeObject" title="Объект для прихода (необязательно)" aria-label="Объект для прихода" value={form.object_id} onChange={(e)=> setForm((f:any)=>({...f, object_id: e.target.value}))}>
									<option value="">—</option>
									{objects.map((o:any)=> <option key={o.id} value={o.id}>{o.name}</option>)}
								</CSelect>
							</FormControl>
						</HStack>
						<FormControl>
							<FormLabel htmlFor="incomeDate">Дата</FormLabel>
							<Input id="incomeDate" type="date" value={form.date} onChange={(e)=> setForm((f:any)=>({...f, date: e.target.value}))} />
						</FormControl>
					</VStack>
				</ModalBody>
				<ModalFooter>
					<HStack>
						<Button variant="ghost" onClick={onClose}>Отмена</Button>
						<Button variant="gradient" onClick={handleSubmit}>Добавить на склад</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}; 