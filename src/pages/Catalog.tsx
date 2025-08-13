import { Helmet } from "react-helmet-async";
import { Box, Heading, Text, HStack, Button, Tabs, TabList, Tab, TabPanels, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Input, FormControl, FormLabel, Select as CSelect, Textarea, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useToast, Badge } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { useCatalog } from "@/modules/catalog/hooks/useCatalog";
import { Pencil, Trash2 } from "lucide-react";
import { allowedUnits } from "@/lib/units";
import { downloadCSV } from "@/lib/export";

const canonical = typeof window !== 'undefined' ? window.location.href : '';
const typeRu = (t?: string) => t === 'consumables' ? 'Расходники' : t === 'tools' ? 'Инструмент' : 'Материалы';

const Catalog = () => {
  const { items, suppliers, customers, createItem, createSupp, createCust, patchItem, patchSupp, patchCust, removeItem, removeSupp, removeCust } = useCatalog();
  const toast = useToast();
  const itemDlg = useDisclosure();
  const suppDlg = useDisclosure();
  const custDlg = useDisclosure();
  const [newItem, setNewItem] = useState({
    name: '', type: 'materials', category: '', unit: 'шт', brand: '', sku: '', price: '', price_effective_from: '', default_supplier_id: '', url: '', specs: '',
    length: '', width: '', height: '', dimension_unit: 'мм', newCategory: ''
  });
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', website: '', address: '', note: '' });
  const [newCustomer, setNewCustomer] = useState({ name: '', contact: '', inn: '', kpp: '', email: '', phone: '', address: '', note: '' });
  const [editingItem, setEditingItem] = useState<any|null>(null);
  const [editingSupplier, setEditingSupplier] = useState<any|null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any|null>(null);

  const categories = useMemo(()=> Array.from(new Set((items as any[]).map(i=> String(i.category||'').trim()).filter(Boolean))), [items]);

  return (
    <>
      <Helmet>
        <title>Справочники — ПромСтрой Контроль</title>
        <meta name="description" content="Каталог: номенклатура, поставщики, заказчики." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="lg" color="gray.800">Справочники</Heading>
            <Text color="gray.600" mt={1} fontSize="md">Номенклатура, поставщики, заказчики</Text>
          </Box>
        </HStack>

        <Tabs variant="enclosed" colorScheme="green">
          <TabList>
            <Tab>Номенклатура</Tab>
            <Tab>Поставщики</Tab>
            <Tab>Заказчики</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <Box mb={6}>
                <HStack justify="space-between" align="center" mb={4}>
                  <Heading size="md" color="gray.800">Номенклатура</Heading>
                  <HStack gap={2}>
                    <Button 
                      variant="outline" 
                      colorScheme="gray" 
                      borderRadius="full"
                      size="sm"
                      onClick={() => downloadCSV('catalog_items.csv', items as any[])}
                    >
                      Экспорт CSV
                    </Button>
                    <Button 
                      variant="solid" 
                      colorScheme="green" 
                      borderRadius="full"
                      size="sm"
                      onClick={()=> { setEditingItem(null); setNewItem({ name: '', type: 'materials', category: '', unit: 'шт', brand: '', sku: '', price: '', price_effective_from: '', default_supplier_id: '', url: '', specs: '', length: '', width: '', height: '', dimension_unit: 'мм', newCategory: '' }); itemDlg.onOpen(); }}
                    >
                      Добавить номенклатуру
                    </Button>
                  </HStack>
                </HStack>
                <Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Наименование</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Тип</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Категория</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Ед.</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Размеры</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600" isNumeric>Цена</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600" isNumeric>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(items as any[]).map((i)=> (
                        <Tr key={i.id} _hover={{ bg: "gray.50" }}>
                          <Td px={4} py={3} fontWeight="500">{i.name}</Td>
                          <Td px={4} py={3}>
                            <Badge colorScheme="blue" borderRadius="full" px={2} py={1} fontSize="xs">
                              {typeRu(i.type)}
                            </Badge>
                          </Td>
                          <Td px={4} py={3} fontSize="sm">{i.category ?? '—'}</Td>
                          <Td px={4} py={3} fontSize="sm">{i.unit ?? 'шт'}</Td>
                          <Td px={4} py={3} fontSize="sm">{[i.length,i.width,i.height].some((v: any)=> v!=null && String(v).trim()!=='') ? `${i.length??''}${i.length?'×':''}${i.width??''}${i.width?'×':''}${i.height??''} ${i.dimension_unit??''}` : '—'}</Td>
                          <Td px={4} py={3} isNumeric fontSize="sm">{Number(i.price??0).toLocaleString('ru-RU')}</Td>
                          <Td px={4} py={3} isNumeric>
                            <HStack justify="flex-end">
                              <Button size="xs" variant="outline" colorScheme="green" borderRadius="full" onClick={()=> { setEditingItem(i); setNewItem({ name: i.name, type: i.type, category: i.category??'', unit: i.unit??'шт', brand: i.brand??'', sku: i.sku??'', price: String(i.price??''), price_effective_from: i.price_effective_from??'', default_supplier_id: i.default_supplier_id?String(i.default_supplier_id):'', url: i.url??'', specs: i.specs??'', length: String(i.length??''), width: String(i.width??''), height: String(i.height??''), dimension_unit: i.dimension_unit??'мм', newCategory: '' }); itemDlg.onOpen(); }} leftIcon={<Pencil size={14} />}>Ред.</Button>
                              <Button size="xs" variant="outline" colorScheme="green" borderRadius="full" onClick={async ()=>{ try { await removeItem.mutateAsync(Number(i.id)); toast({ title: 'Удалено', status: 'success' }); } catch(e:any){ toast({ title: 'Ошибка удаления', description: e?.message, status: 'error' }); } }}> <Trash2 size={14} /> </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel px={0}>
              <Box mb={6}>
                <HStack justify="space-between" align="center" mb={4}>
                  <Heading size="md" color="gray.800">Поставщики</Heading>
                  <HStack gap={2}>
                    <Button 
                      variant="outline" 
                      colorScheme="gray" 
                      borderRadius="full"
                      size="sm"
                      onClick={() => downloadCSV('catalog_suppliers.csv', suppliers as any[])}
                    >
                      Экспорт CSV
                    </Button>
                    <Button 
                      variant="solid" 
                      colorScheme="green" 
                      borderRadius="full"
                      size="sm"
                      onClick={()=> { setEditingSupplier(null); setNewSupplier({ name: '', contact: '', website: '', address: '', note: '' }); suppDlg.onOpen(); }}
                    >
                      Добавить поставщика
                    </Button>
                  </HStack>
                </HStack>
                <Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Наименование</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Контакт</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Сайт</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Адрес</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600" isNumeric>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(suppliers as any[]).map((s)=> (
                        <Tr key={s.id} _hover={{ bg: "gray.50" }}>
                          <Td px={4} py={3} fontWeight="500">{s.name}</Td>
                          <Td px={4} py={3} fontSize="sm">{s.contact ?? '—'}</Td>
                          <Td px={4} py={3} fontSize="sm">{s.website ?? '—'}</Td>
                          <Td px={4} py={3} fontSize="sm">{s.address ?? '—'}</Td>
                          <Td px={4} py={3} isNumeric>
                            <HStack justify="flex-end">
                              <Button size="xs" variant="outline" colorScheme="green" borderRadius="full" onClick={()=> { setEditingSupplier(s); setNewSupplier({ name: s.name, contact: s.contact??'', website: s.website??'', address: s.address??'', note: s.note??'' }); suppDlg.onOpen(); }} leftIcon={<Pencil size={14} />}>Ред.</Button>
                              <Button size="xs" variant="outline" colorScheme="green" borderRadius="full" onClick={async ()=>{ try { await removeSupp.mutateAsync(Number(s.id)); toast({ title: 'Удалено', status: 'success' }); } catch(e:any){ toast({ title: 'Ошибка удаления', description: e?.message, status: 'error' }); } }}> <Trash2 size={14} /> </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel px={0}>
              <Box mb={6}>
                <HStack justify="space-between" align="center" mb={4}>
                  <Heading size="md" color="gray.800">Заказчики</Heading>
                  <HStack gap={2}>
                    <Button 
                      variant="outline" 
                      colorScheme="gray" 
                      borderRadius="full"
                      size="sm"
                      onClick={() => downloadCSV('catalog_customers.csv', customers as any[])}
                    >
                      Экспорт CSV
                    </Button>
                    <Button 
                      variant="solid" 
                      colorScheme="green" 
                      borderRadius="full"
                      size="sm"
                      onClick={()=> { setEditingCustomer(null); setNewCustomer({ name: '', contact: '', inn: '', kpp: '', email: '', phone: '', address: '', note: '' }); custDlg.onOpen(); }}
                    >
                      Добавить заказчика
                    </Button>
                  </HStack>
                </HStack>
                <Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Наименование</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Контакт</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">ИНН</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">КПП</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Email</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Телефон</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600">Адрес</Th>
                        <Th px={4} py={3} fontSize="sm" color="gray.600" isNumeric>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(customers as any[]).map((c)=> (
                        <Tr key={c.id} _hover={{ bg: "gray.50" }}>
                          <Td px={4} py={3} fontWeight="500">{c.name}</Td>
                          <Td px={4} py={3} fontSize="sm">{c.contact ?? '—'}</Td>
                          <Td px={4} py={3} fontSize="sm">{c.inn ?? '—'}</Td>
                          <Td px={4} py={3} fontSize="sm">{c.kpp ?? '—'}</Td>
                          <Td px={4} py={3} fontSize="sm">{c.email ?? '—'}</Td>
                          <Td px={4} py={3} fontSize="sm">{c.phone ?? '—'}</Td>
                          <Td px={4} py={3} fontSize="sm">{c.address ?? '—'}</Td>
                          <Td px={4} py={3} isNumeric>
                            <HStack justify="flex-end">
                              <Button size="xs" variant="outline" colorScheme="green" borderRadius="full" onClick={()=> { setEditingCustomer(c); setNewCustomer({ name: c.name, contact: c.contact??'', inn: c.inn??'', kpp: c.kpp??'', email: c.phone??'', phone: c.phone??'', address: c.address??'', note: c.note??'' }); custDlg.onOpen(); }} leftIcon={<Pencil size={14} />}>Ред.</Button>
                              <Button size="xs" variant="outline" colorScheme="green" borderRadius="full" onClick={async ()=>{ try { await removeCust.mutateAsync(Number(c.id)); toast({ title: 'Удалено', status: 'success' }); } catch(e:any){ toast({ title: 'Ошибка удаления', description: e?.message, status: 'error' }); } }}> <Trash2 size={14} /> </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Модалка: Добавить/Редактировать номенклатуру */}
        <Modal isOpen={itemDlg.isOpen} onClose={itemDlg.onClose} isCentered>
          <ModalOverlay />
          <ModalContent borderRadius="xl" boxShadow="xl">
            <ModalHeader>{editingItem ? 'Редактировать номенклатуру' : 'Добавить номенклатуру'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <HStack gap={3} align="flex-start" flexWrap="wrap">
                <FormControl minW="xs">
                  <FormLabel htmlFor="itemName" fontSize="sm" color="gray.600">Наименование</FormLabel>
                  <Input id="itemName" value={newItem.name} onChange={(e)=> setNewItem(i=>({ ...i, name: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="44">
                  <FormLabel htmlFor="itemType" fontSize="sm" color="gray.600">Тип</FormLabel>
                  <CSelect id="itemType" title="Тип номенклатуры" aria-label="Тип номенклатуры" value={newItem.type} onChange={(e)=> setNewItem(i=>({ ...i, type: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}>
                    <option value="materials">Материалы</option>
                    <option value="consumables">Расходники</option>
                    <option value="tools">Инструмент</option>
                  </CSelect>
                </FormControl>
                <FormControl minW="44">
                  <FormLabel htmlFor="itemCategory" fontSize="sm" color="gray.600">Категория</FormLabel>
                  <CSelect id="itemCategory" title="Категория" aria-label="Категория" value={newItem.category || (newItem.newCategory ? 'new' : '')} onChange={(e)=> setNewItem(i=>({ ...i, category: e.target.value==='new'?'':e.target.value, newCategory: e.target.value==='new'? i.newCategory : '' }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}>
                    <option value="">—</option>
                    {categories.map(c=> <option key={c} value={c}>{c}</option>)}
                    <option value="new">(Новая категория)</option>
                  </CSelect>
                </FormControl>
                {(!newItem.category) && (
                  <FormControl minW="44">
                    <FormLabel htmlFor="itemNewCategory" fontSize="sm" color="gray.600">Новая категория</FormLabel>
                    <Input id="itemNewCategory" value={newItem.newCategory} onChange={(e)=> setNewItem(i=>({ ...i, newCategory: e.target.value }))} placeholder="Напр. Электрика" borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                  </FormControl>
                )}
                <FormControl minW="32">
                  <FormLabel htmlFor="itemUnit" fontSize="sm" color="gray.600">Ед.</FormLabel>
                  <CSelect id="itemUnit" title="Единица измерения" aria-label="Единица измерения" value={newItem.unit} onChange={(e)=> setNewItem(i=>({ ...i, unit: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}>
                    {allowedUnits.map(u=> <option key={u.code} value={u.code}>{u.label}</option>)}
                  </CSelect>
                </FormControl>
              </HStack>
              <HStack gap={3} mt={3} align="flex-start" flexWrap="wrap">
                <FormControl minW="40">
                  <FormLabel htmlFor="itemBrand" fontSize="sm" color="gray.600">Бренд</FormLabel>
                  <Input id="itemBrand" value={newItem.brand} onChange={(e)=> setNewItem(i=>({ ...i, brand: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="40">
                  <FormLabel htmlFor="itemSku" fontSize="sm" color="gray.600">Артикул</FormLabel>
                  <Input id="itemSku" value={newItem.sku} onChange={(e)=> setNewItem(i=>({ ...i, sku: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="44">
                  <FormLabel htmlFor="itemPrice" fontSize="sm" color="gray.600">Цена, ₽</FormLabel>
                  <Input id="itemPrice" value={newItem.price} onChange={(e)=> setNewItem(i=>({ ...i, price: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="44">
                  <FormLabel htmlFor="itemPriceFrom" fontSize="sm" color="gray.600">С даты</FormLabel>
                  <Input id="itemPriceFrom" type="date" value={newItem.price_effective_from} onChange={(e)=> setNewItem(i=>({ ...i, price_effective_from: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
              </HStack>
              <HStack gap={3} mt={3} align="flex-start" flexWrap="wrap">
                <FormControl minW="28">
                  <FormLabel htmlFor="len" fontSize="sm" color="gray.600">Длина</FormLabel>
                  <Input id="len" value={newItem.length} onChange={(e)=> setNewItem(i=>({ ...i, length: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="28">
                  <FormLabel htmlFor="wid" fontSize="sm" color="gray.600">Ширина</FormLabel>
                  <Input id="wid" value={newItem.width} onChange={(e)=> setNewItem(i=>({ ...i, width: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="28">
                  <FormLabel htmlFor="hei" fontSize="sm" color="gray.600">Высота</FormLabel>
                  <Input id="hei" value={newItem.height} onChange={(e)=> setNewItem(i=>({ ...i, height: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="28">
                  <FormLabel htmlFor="dimUnit" fontSize="sm" color="gray.600">Ед. размеров</FormLabel>
                  <CSelect id="dimUnit" title="Единицы размеров" aria-label="Единицы размеров" value={newItem.dimension_unit} onChange={(e)=> setNewItem(i=>({ ...i, dimension_unit: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}>
                    <option value="мм">мм</option>
                    <option value="см">см</option>
                    <option value="м">м</option>
                  </CSelect>
                </FormControl>
              </HStack>
              <HStack gap={3} mt={3} align="flex-start" flexWrap="wrap">
                <FormControl minW="sm">
                  <FormLabel htmlFor="itemSupplier" fontSize="sm" color="gray.600">Поставщик по умолчанию</FormLabel>
                  <CSelect id="itemSupplier" title="Поставщик по умолчанию" aria-label="Поставщик по умолчанию" value={newItem.default_supplier_id} onChange={(e)=> setNewItem(i=>({ ...i, default_supplier_id: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}>
                    <option value="">—</option>
                    {(suppliers as any[]).map((s)=> <option key={s.id} value={s.id}>{s.name}</option>)}
                  </CSelect>
                </FormControl>
                <FormControl minW="sm">
                  <FormLabel htmlFor="itemUrl" fontSize="sm" color="gray.600">Ссылка на магазин</FormLabel>
                  <Input id="itemUrl" placeholder="https://..." value={newItem.url} onChange={(e)=> setNewItem(i=>({ ...i, url: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
              </HStack>
              <FormControl mt={3}>
                <FormLabel htmlFor="itemSpecs" fontSize="sm" color="gray.600">Характеристики</FormLabel>
                <Textarea id="itemSpecs" placeholder="Описание, размеры, вес, и т.д." value={newItem.specs} onChange={(e)=> setNewItem(i=>({ ...i, specs: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button variant="ghost" onClick={itemDlg.onClose} borderRadius="full">Отмена</Button>
                <Button variant="solid" colorScheme="green" borderRadius="full" onClick={async ()=>{
                  if (!newItem.name.trim()) { toast({ title: 'Укажите наименование', status: 'warning' }); return; }
                  const categoryFinal = newItem.category || newItem.newCategory || undefined;
                  try {
                    const payload: any = {
                      name: newItem.name.trim(),
                      type: newItem.type,
                      category: categoryFinal,
                      unit: newItem.unit || undefined,
                      brand: newItem.brand || undefined,
                      sku: newItem.sku || undefined,
                      price: Number(newItem.price||0)||0,
                      price_effective_from: newItem.price_effective_from || undefined,
                      default_supplier_id: newItem.default_supplier_id ? Number(newItem.default_supplier_id) : undefined,
                      url: newItem.url || undefined,
                      specs: newItem.specs || undefined,
                      length: newItem.length ? Number(newItem.length) : undefined,
                      width: newItem.width ? Number(newItem.width) : undefined,
                      height: newItem.height ? Number(newItem.height) : undefined,
                      dimension_unit: newItem.dimension_unit || undefined,
                    };
                    if (editingItem?.id) {
                      await patchItem.mutateAsync({ id: Number(editingItem.id), payload });
                      toast({ title: 'Номенклатура обновлена', status: 'success' });
                    } else {
                      await createItem.mutateAsync(payload);
                      toast({ title: 'Номенклатура добавлена', status: 'success' });
                    }
                    itemDlg.onClose();
                    setNewItem({ name: '', type: 'materials', category: '', unit: 'шт', brand: '', sku: '', price: '', price_effective_from: '', default_supplier_id: '', url: '', specs: '', length: '', width: '', height: '', dimension_unit: 'мм', newCategory: '' });
                    setEditingItem(null);
                  } catch (e: any) {
                    toast({ title: 'Не удалось сохранить', description: e?.message, status: 'error' });
                  }
                }}>{editingItem ? 'Сохранить' : 'Создать'}</Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Модалка: Добавить/Редактировать поставщика */}
        <Modal isOpen={suppDlg.isOpen} onClose={suppDlg.onClose} isCentered>
          <ModalOverlay />
          <ModalContent borderRadius="xl" boxShadow="xl">
            <ModalHeader>{editingSupplier ? 'Редактировать поставщика' : 'Добавить поставщика'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <HStack gap={3} align="flex-start" flexWrap="wrap">
                <FormControl minW="sm">
                  <FormLabel htmlFor="supName" fontSize="sm" color="gray.600">Наименование</FormLabel>
                  <Input id="supName" value={newSupplier.name} onChange={(e)=> setNewSupplier(s=>({ ...s, name: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="sm">
                  <FormLabel htmlFor="supContact" fontSize="sm" color="gray.600">Контакт</FormLabel>
                  <Input id="supContact" placeholder="телефон/email" value={newSupplier.contact} onChange={(e)=> setNewSupplier(s=>({ ...s, contact: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
              </HStack>
              <HStack gap={3} mt={3} align="flex-start" flexWrap="wrap">
                <FormControl minW="sm">
                  <FormLabel htmlFor="supWebsite" fontSize="sm" color="gray.600">Сайт</FormLabel>
                  <Input id="supWebsite" placeholder="https://..." value={newSupplier.website} onChange={(e)=> setNewSupplier(s=>({ ...s, website: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="sm">
                  <FormLabel htmlFor="supAddress" fontSize="sm" color="gray.600">Адрес</FormLabel>
                  <Input id="supAddress" value={newSupplier.address} onChange={(e)=> setNewSupplier(s=>({ ...s, address: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
              </HStack>
              <FormControl mt={3}>
                <FormLabel htmlFor="supNote" fontSize="sm" color="gray.600">Примечание</FormLabel>
                <Textarea id="supNote" value={newSupplier.note} onChange={(e)=> setNewSupplier(s=>({ ...s, note: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button variant="ghost" onClick={suppDlg.onClose} borderRadius="full">Отмена</Button>
                <Button variant="solid" colorScheme="green" borderRadius="full" onClick={async ()=>{
                  if (!newSupplier.name.trim()) { toast({ title: 'Укажите наименование', status: 'warning' }); return; }
                  try {
                    const payload = {
                      name: newSupplier.name.trim(),
                      contact: newSupplier.contact || undefined,
                      website: newSupplier.website || undefined,
                      address: newSupplier.address || undefined,
                      note: newSupplier.note || undefined,
                    };
                    if (editingSupplier?.id) {
                      await patchSupp.mutateAsync({ id: Number(editingSupplier.id), payload });
                      toast({ title: 'Поставщик обновлён', status: 'success' });
                    } else {
                      await createSupp.mutateAsync(payload);
                      toast({ title: 'Поставщик добавлен', status: 'success' });
                    }
                    suppDlg.onClose();
                    setNewSupplier({ name: '', contact: '', website: '', address: '', note: '' });
                    setEditingSupplier(null);
                  } catch (e: any) {
                    toast({ title: 'Не удалось сохранить', description: e?.message, status: 'error' });
                  }
                }}>{editingSupplier ? 'Сохранить' : 'Создать'}</Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Модалка: Добавить/Редактировать заказчика */}
        <Modal isOpen={custDlg.isOpen} onClose={custDlg.onClose} isCentered>
          <ModalOverlay />
          <ModalContent borderRadius="xl" boxShadow="xl">
            <ModalHeader>{editingCustomer ? 'Редактировать заказчика' : 'Добавить заказчика'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <HStack gap={3} align="flex-start" flexWrap="wrap">
                <FormControl minW="sm">
                  <FormLabel htmlFor="custName" fontSize="sm" color="gray.600">Наименование</FormLabel>
                  <Input id="custName" value={newCustomer.name} onChange={(e)=> setNewCustomer(c=>({ ...c, name: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="sm">
                  <FormLabel htmlFor="custContact" fontSize="sm" color="gray.600">Контакт</FormLabel>
                  <Input id="custContact" value={newCustomer.contact} onChange={(e)=> setNewCustomer(c=>({ ...c, contact: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
              </HStack>
              <HStack gap={3} mt={3} align="flex-start" flexWrap="wrap">
                <FormControl minW="28">
                  <FormLabel htmlFor="custInn" fontSize="sm" color="gray.600">ИНН</FormLabel>
                  <Input id="custInn" value={newCustomer.inn} onChange={(e)=> setNewCustomer(c=>({ ...c, inn: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="28">
                  <FormLabel htmlFor="custKpp" fontSize="sm" color="gray.600">КПП</FormLabel>
                  <Input id="custKpp" value={newCustomer.kpp} onChange={(e)=> setNewCustomer(c=>({ ...c, kpp: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="44">
                  <FormLabel htmlFor="custEmail" fontSize="sm" color="gray.600">Email</FormLabel>
                  <Input id="custEmail" type="email" value={newCustomer.email} onChange={(e)=> setNewCustomer(c=>({ ...c, email: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
                <FormControl minW="44">
                  <FormLabel htmlFor="custPhone" fontSize="sm" color="gray.600">Телефон</FormLabel>
                  <Input id="custPhone" value={newCustomer.phone} onChange={(e)=> setNewCustomer(c=>({ ...c, phone: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
                </FormControl>
              </HStack>
              <FormControl mt={3}>
                <FormLabel htmlFor="custAddress" fontSize="sm" color="gray.600">Адрес</FormLabel>
                <Input id="custAddress" value={newCustomer.address} onChange={(e)=> setNewCustomer(c=>({ ...c, address: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
              </FormControl>
              <FormControl mt={3}>
                <FormLabel htmlFor="custNote" fontSize="sm" color="gray.600">Примечание</FormLabel>
                <Textarea id="custNote" value={newCustomer.note} onChange={(e)=> setNewCustomer(c=>({ ...c, note: e.target.value }))} borderRadius="lg" borderColor="gray.200" _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button variant="ghost" onClick={custDlg.onClose} borderRadius="full">Отмена</Button>
                <Button variant="solid" colorScheme="green" borderRadius="full" onClick={async ()=>{
                  if (!newCustomer.name.trim()) { toast({ title: 'Укажите наименование', status: 'warning' }); return; }
                  try {
                    const payload = {
                      name: newCustomer.name.trim(),
                      contact: newCustomer.contact || undefined,
                      inn: newCustomer.inn || undefined,
                      kpp: newCustomer.kpp || undefined,
                      email: newCustomer.email || undefined,
                      phone: newCustomer.phone || undefined,
                      address: newCustomer.address || undefined,
                      note: newCustomer.note || undefined,
                    };
                    if (editingCustomer?.id) {
                      await patchCust.mutateAsync({ id: Number(editingCustomer.id), payload });
                      toast({ title: 'Заказчик обновлён', status: 'success' });
                    } else {
                      await createCust.mutateAsync(payload);
                      toast({ title: 'Заказчик добавлен', status: 'success' });
                    }
                    custDlg.onClose();
                    setNewCustomer({ name: '', contact: '', inn: '', kpp: '', email: '', phone: '', address: '', note: '' });
                    setEditingCustomer(null);
                  } catch (e: any) {
                    toast({ title: 'Не удалось сохранить', description: e?.message, status: 'error' });
                  }
                }}>{editingCustomer ? 'Сохранить' : 'Создать'}</Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default Catalog; 