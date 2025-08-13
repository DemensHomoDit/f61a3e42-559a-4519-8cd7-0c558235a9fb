import { Box, Heading, Text, HStack, VStack, Button, Input, Select, Table, Thead, Tbody, Tr, Th, Td, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useDisclosure, IconButton, Tooltip } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOtherExpenses, createOtherExpense, updateOtherExpense, deleteOtherExpense, getSuppliers } from "@/api/client";
import { Edit, Trash2, Plus } from "lucide-react";

import type { OtherExpense } from "@/types";

export function OtherExpensesTable({ objects }: { objects: any[] }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({ queryKey: ['other_expenses'], queryFn: getOtherExpenses, retry: 0, refetchOnWindowFocus: false });
  const { data: suppliers = [] } = useQuery<any[]>({ queryKey: ['suppliers'], queryFn: getSuppliers, retry: 0, refetchOnWindowFocus: false });

  const [selectedObject, setSelectedObject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editing, setEditing] = useState<OtherExpense | null>(null);
  const [form, setForm] = useState({ category: '', amount: '', date: new Date().toISOString().slice(0,10), object_id: '', supplier_id: '', description: '', payment_status: 'unpaid', due_date: '' });

  const createMut = useMutation({
    mutationFn: async ()=> createOtherExpense({
      category: form.category || null,
      amount: Number(form.amount) || 0,
      date: form.date || null,
      object_id: form.object_id ? Number(form.object_id) : null,
      supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
      description: form.description || null,
      payment_status: form.payment_status || 'unpaid',
      due_date: form.due_date || null,
    }),
    onSuccess: ()=> { qc.invalidateQueries({ queryKey: ['other_expenses'] }); onClose(); resetForm(); }
  });
  const updateMut = useMutation({
    mutationFn: async ()=> editing ? updateOtherExpense(editing.id, {
      category: form.category || null,
      amount: Number(form.amount) || 0,
      date: form.date || null,
      object_id: form.object_id ? Number(form.object_id) : null,
      supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
      description: form.description || null,
      payment_status: form.payment_status || 'unpaid',
      due_date: form.due_date || null,
    }) : Promise.resolve(null),
    onSuccess: ()=> { qc.invalidateQueries({ queryKey: ['other_expenses'] }); onClose(); resetForm(); }
  });
  const deleteMut = useMutation({ mutationFn: async (id: number)=> deleteOtherExpense(id), onSuccess: ()=> qc.invalidateQueries({ queryKey: ['other_expenses'] }) });

  const filtered = useMemo(() => (rows as any[]).filter((r: any) => {
    if (selectedObject && String(r.object_id||'') !== selectedObject) return false;
    if (selectedStatus && String(r.payment_status||'') !== selectedStatus) return false;
    if (selectedCategory && String(r.category||'') !== selectedCategory) return false;
    return true;
  }), [rows, selectedObject, selectedStatus, selectedCategory]);

  const categories = useMemo(()=> Array.from(new Set(rows.map(r=> String(r.category||'').trim()).filter(Boolean))).sort(), [rows]);

  function resetForm() {
    setEditing(null);
    setForm({ category: '', amount: '', date: new Date().toISOString().slice(0,10), object_id: '', supplier_id: '', description: '', payment_status: 'unpaid', due_date: '' });
  }

  function openEdit(row?: any) {
    if (row) {
      setEditing(row);
      setForm({
        category: row.category || '',
        amount: String(row.amount || ''),
        date: (row.date || '').slice(0,10),
        object_id: row.object_id ? String(row.object_id) : '',
        supplier_id: row.supplier_id ? String(row.supplier_id) : '',
        description: row.description || '',
        payment_status: row.payment_status || 'unpaid',
        due_date: (row.due_date || '').slice(0,10)
      });
    } else {
      resetForm();
    }
    onOpen();
  }

  return (
    <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
      <HStack justify="space-between" mb={4} align="center">
        <Heading size="sm">Прочие расходы</Heading>
        <Button leftIcon={<Plus size={16} />} colorScheme="green" borderRadius="full" onClick={()=> openEdit()}>Добавить</Button>
      </HStack>

      <HStack gap={3} flexWrap="wrap" mb={4}>
        <FormControl minW="48">
          <FormLabel htmlFor="otherObj" fontSize="sm" color="gray.600">Объект</FormLabel>
          <Select id="otherObj" value={selectedObject} onChange={(e)=> setSelectedObject(e.target.value)} aria-label="Фильтр по объекту" title="Фильтр по объекту" placeholder="Все объекты">
            {objects.map(o=> <option key={o.id} value={o.id}>{o.name}</option>)}
          </Select>
        </FormControl>
        <FormControl minW="40">
          <FormLabel htmlFor="otherCat" fontSize="sm" color="gray.600">Категория</FormLabel>
          <Select id="otherCat" value={selectedCategory} onChange={(e)=> setSelectedCategory(e.target.value)} aria-label="Фильтр по категории" title="Фильтр по категории" placeholder="Все категории">
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormControl>
        <FormControl minW="32">
          <FormLabel htmlFor="otherStat" fontSize="sm" color="gray.600">Статус оплаты</FormLabel>
          <Select id="otherStat" value={selectedStatus} onChange={(e)=> setSelectedStatus(e.target.value)} aria-label="Фильтр по статусу" title="Фильтр по статусу" placeholder="Все">
            <option value="unpaid">Не оплачен</option>
            <option value="partial">Частично</option>
            <option value="paid">Оплачен</option>
          </Select>
        </FormControl>
      </HStack>

      <Box overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Дата</Th>
              <Th>Категория</Th>
              <Th>Объект</Th>
              <Th>Поставщик</Th>
              <Th isNumeric>Сумма</Th>
              <Th>Статус</Th>
              <Th>Срок</Th>
              <Th>Описание</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map(r=> {
              const obj = objects.find(o=> o.id === r.object_id);
              const supp = suppliers.find((s:any)=> s.id === r.supplier_id);
              return (
                <Tr key={r.id}>
                  <Td>{(r.date||'').slice(0,10) || '—'}</Td>
                  <Td><Badge colorScheme="purple" borderRadius="full" px={3}>{r.category||'—'}</Badge></Td>
                  <Td>{obj?.name || '—'}</Td>
                  <Td>{supp?.name || (r.supplier_id ? `ID ${r.supplier_id}` : '—')}</Td>
                  <Td isNumeric>₽{Number(r.amount||0).toLocaleString('ru-RU')}</Td>
                  <Td>
                    {r.payment_status === 'paid' ? <Badge colorScheme="green">Оплачен</Badge>
                      : r.payment_status === 'partial' ? <Badge colorScheme="yellow">Частично</Badge>
                      : <Badge colorScheme="red">Не оплачен</Badge>}
                  </Td>
                  <Td>{(r.due_date||'').slice(0,10) || '—'}</Td>
                  <Td maxW="56" isTruncated title={r.description||''}>{r.description || '—'}</Td>
                  <Td>
                    <HStack gap={2}>
                      <Tooltip label="Редактировать"><IconButton aria-label="Редактировать" size="sm" icon={<Edit size={16} />} variant="ghost" onClick={()=> openEdit(r)} /></Tooltip>
                      <Tooltip label="Удалить"><IconButton aria-label="Удалить" size="sm" colorScheme="red" icon={<Trash2 size={16} />} variant="ghost" onClick={()=> deleteMut.mutate(r.id)} /></Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl" boxShadow="xl">
          <ModalHeader>{editing ? 'Редактировать расход' : 'Добавить расход'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack gap={4}>
              <HStack gap={4} w="100%">
                <FormControl>
                  <FormLabel htmlFor="oeDate">Дата</FormLabel>
                  <Input id="oeDate" type="date" value={form.date} onChange={(e)=> setForm(v=> ({...v, date: e.target.value}))} />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="oeAmount">Сумма, ₽</FormLabel>
                  <Input id="oeAmount" type="number" value={form.amount} onChange={(e)=> setForm(v=> ({...v, amount: e.target.value}))} />
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel htmlFor="oeCat">Категория</FormLabel>
                <Input id="oeCat" value={form.category} onChange={(e)=> setForm(v=> ({...v, category: e.target.value}))} placeholder="Напр. Налоги" />
              </FormControl>
              <HStack gap={4} w="100%">
                <FormControl>
                  <FormLabel htmlFor="oeObj">Объект</FormLabel>
                  <Select id="oeObj" value={form.object_id} onChange={(e)=> setForm(v=> ({...v, object_id: e.target.value}))} placeholder="—" aria-label="Объект" title="Объект">
                    {objects.map(o=> <option key={o.id} value={o.id}>{o.name}</option>)}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="oeSupp">Поставщик</FormLabel>
                  <Select id="oeSupp" value={form.supplier_id} onChange={(e)=> setForm(v=> ({...v, supplier_id: e.target.value}))} placeholder="—" aria-label="Поставщик" title="Поставщик">
                    {suppliers.map((s:any)=> <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </FormControl>
              </HStack>
              <HStack gap={4} w="100%">
                <FormControl>
                  <FormLabel htmlFor="oeStatus">Статус оплаты</FormLabel>
                  <Select id="oeStatus" value={form.payment_status} onChange={(e)=> setForm(v=> ({...v, payment_status: e.target.value}))} aria-label="Статус оплаты" title="Статус оплаты">
                    <option value="unpaid">Не оплачен</option>
                    <option value="partial">Частично</option>
                    <option value="paid">Оплачен</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="oeDue">Срок оплаты</FormLabel>
                  <Input id="oeDue" type="date" value={form.due_date} onChange={(e)=> setForm(v=> ({...v, due_date: e.target.value}))} />
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel htmlFor="oeDesc">Описание</FormLabel>
                <Input id="oeDesc" value={form.description} onChange={(e)=> setForm(v=> ({...v, description: e.target.value}))} placeholder="Краткое описание" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={onClose}>Отмена</Button>
              <Button colorScheme="green" onClick={()=> editing ? updateMut.mutate() : createMut.mutate()} isDisabled={!form.amount || !form.category}>Сохранить</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 