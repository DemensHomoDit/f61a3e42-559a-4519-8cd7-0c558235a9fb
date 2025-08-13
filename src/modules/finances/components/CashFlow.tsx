import { Box, Heading, Text, HStack, VStack, Button, Input, Select, Table, Thead, Tbody, Tr, Th, Td, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useDisclosure, IconButton, Tooltip, SimpleGrid, Stat, StatLabel, StatNumber, Icon } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCashTransactions, createCashTransaction, updateCashTransaction, deleteCashTransaction } from "@/api/client";

import type { CashTransaction } from "@/types";

interface CashFlowProps {
  objects: any[];
  users: any[];
}

export const CashFlow = ({ objects, users }: CashFlowProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const qc = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [editingTransaction, setEditingTransaction] = useState<CashTransaction | null>(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    payment_method: 'cash',
    object_id: '',
    user_id: '',
    notes: ''
  });

  const { data: transactions = [] } = useQuery({ queryKey: ['cash'], queryFn: getCashTransactions, retry: 0, refetchOnWindowFocus: false });

  const createMut = useMutation({
    mutationFn: async () => createCashTransaction({
      type: formData.type as 'income' | 'expense',
      amount: Number(formData.amount) || 0,
      category: formData.category || null,
      description: formData.description || null,
      date: formData.date || null,
      payment_method: formData.payment_method || 'cash',
      object_id: formData.object_id ? Number(formData.object_id) : null,
      user_id: formData.user_id ? Number(formData.user_id) : null,
      notes: formData.notes || null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cash'] }); onClose(); resetForm(); }
  });
  const updateMut = useMutation({
    mutationFn: async () => editingTransaction ? updateCashTransaction(editingTransaction.id, {
      type: formData.type as 'income' | 'expense',
      amount: Number(formData.amount) || 0,
      category: formData.category || null,
      description: formData.description || null,
      date: formData.date || null,
      payment_method: formData.payment_method || 'cash',
      object_id: formData.object_id ? Number(formData.object_id) : null,
      user_id: formData.user_id ? Number(formData.user_id) : null,
      notes: formData.notes || null,
    }) : Promise.resolve(null),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cash'] }); onClose(); resetForm(); }
  });
  const deleteMut = useMutation({
    mutationFn: async (id: number) => deleteCashTransaction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cash'] })
  });

  const categories = {
    income: ['Аванс', 'Оплата', 'Возврат', 'Прочие доходы'],
    expense: ['Материалы', 'Зарплаты', 'Транспорт', 'Оборудование', 'Накладные расходы', 'Прочие']
  };

  const paymentMethods = [
    { value: 'cash', label: 'Наличные', icon: Wallet },
    { value: 'bank', label: 'Банковский счёт', icon: CreditCard },
    { value: 'card', label: 'Банковская карта', icon: CreditCard }
  ];

  const months = [
    { value: '01', label: 'Январь' },
    { value: '02', label: 'Февраль' },
    { value: '03', label: 'Март' },
    { value: '04', label: 'Апрель' },
    { value: '05', label: 'Май' },
    { value: '06', label: 'Июнь' },
    { value: '07', label: 'Июль' },
    { value: '08', label: 'Август' },
    { value: '09', label: 'Сентябрь' },
    { value: '10', label: 'Октябрь' },
    { value: '11', label: 'Ноябрь' },
    { value: '12', label: 'Декабрь' }
  ];

  const filteredTransactions = useMemo(() => {
    return (transactions as any[]).filter((item: any) => {
      if (selectedType && item.type !== selectedType) return false;
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedObject && item.object_id !== Number(selectedObject)) return false;
      if (selectedMonth && item.date?.slice(5, 7) !== selectedMonth) return false;
      return true;
    });
  }, [transactions, selectedType, selectedCategory, selectedObject, selectedMonth]);

  const cashSummary = useMemo(() => {
    const txs = transactions as any[];
    const totalIncome = txs
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    
    const totalExpenses = txs
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    
    const balance = totalIncome - totalExpenses;
    
    const byMethod = paymentMethods.map(method => {
      const methodTransactions = txs.filter((t: any) => t.payment_method === method.value);
      const methodIncome = methodTransactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      const methodExpenses = methodTransactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      
      return {
        ...method,
        income: methodIncome,
        expenses: methodExpenses,
        net: methodIncome - methodExpenses
      };
    });

    return { totalIncome, totalExpenses, balance, byMethod };
  }, [transactions]);

  const handleSubmit = () => {
    if (editingTransaction) updateMut.mutate();
    else createMut.mutate();
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      payment_method: 'cash',
      object_id: '',
      user_id: '',
      notes: ''
    });
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: String(transaction.amount || ''),
      category: transaction.category || '',
      description: transaction.description || '',
      date: transaction.date || new Date().toISOString().slice(0, 10),
      payment_method: transaction.payment_method || 'cash',
      object_id: transaction.object_id ? String(transaction.object_id) : '',
      user_id: transaction.user_id ? String(transaction.user_id) : '',
      notes: transaction.notes || ''
    });
    onOpen();
  };

  const handleDelete = (id: number) => { deleteMut.mutate(id); };

  const getCategoryColor = (type: string, category: string) => {
    if (type === 'income') return 'green';
    if (category === 'Материалы') return 'blue';
    if (category === 'Зарплаты') return 'purple';
    if (category === 'Транспорт') return 'orange';
    return 'gray';
  };

  return (
    <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="md" color="gray.800">Кассовый учёт</Heading>
          <Text color="text.secondary" fontSize="sm">Учёт наличных и безналичных операций</Text>
        </Box>
        <Button 
          leftIcon={<Icon as={Plus} />} 
          colorScheme="green" 
          borderRadius="full"
          onClick={() => { resetForm(); onOpen(); }}
        >
          Добавить операцию
        </Button>
      </HStack>

      {/* KPI */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Stat bg="green.50" p={4} borderRadius="xl" border="1px solid" borderColor="green.200">
          <StatLabel color="green.600" fontSize="sm" fontWeight="medium">Приходы</StatLabel>
          <StatNumber fontSize="xl" fontWeight="bold" color="green.700">
            ₽{cashSummary.totalIncome.toLocaleString('ru-RU')}
          </StatNumber>
        </Stat>
        <Stat bg="red.50" p={4} borderRadius="xl" border="1px solid" borderColor="red.200">
          <StatLabel color="red.600" fontSize="sm" fontWeight="medium">Расходы</StatLabel>
          <StatNumber fontSize="xl" fontWeight="bold" color="red.700">
            ₽{cashSummary.totalExpenses.toLocaleString('ru-RU')}
          </StatNumber>
        </Stat>
        <Stat bg={cashSummary.balance >= 0 ? "blue.50" : "orange.50"} p={4} borderRadius="xl" border="1px solid" borderColor={cashSummary.balance >= 0 ? "blue.200" : "orange.200"}>
          <StatLabel color={cashSummary.balance >= 0 ? "blue.600" : "orange.600"} fontSize="sm" fontWeight="medium">Баланс</StatLabel>
          <StatNumber fontSize="xl" fontWeight="bold" color={cashSummary.balance >= 0 ? "blue.700" : "orange.700"}>
            ₽{cashSummary.balance.toLocaleString('ru-RU')}
          </StatNumber>
        </Stat>
      </SimpleGrid>

      {/* Сводка по способам оплаты */}
      <Box mb={6}>
        <Heading size="sm" mb={4}>По способам оплаты</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {cashSummary.byMethod.map((method) => (
            <Box key={method.value} p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
              <HStack mb={3}>
                <Icon as={method.icon} color="gray.600" />
                <Text fontWeight="medium" color="gray.700">{method.label}</Text>
              </HStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="green.600">
                  +₽{method.income.toLocaleString('ru-RU')}
                </Text>
                <Text fontSize="sm" color="red.600">
                  -₽{method.expenses.toLocaleString('ru-RU')}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color={method.net >= 0 ? "green.600" : "red.600"}>
                  {method.net >= 0 ? '+' : ''}₽{method.net.toLocaleString('ru-RU')}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Фильтры */}
      <HStack gap={4} mb={6} flexWrap="wrap">
        <FormControl minW="32">
          <FormLabel htmlFor="cashType" fontSize="sm" color="gray.600">Тип</FormLabel>
          <Select 
            id="cashType"
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            placeholder="Все типы"
            aria-label="Фильтр по типу операции"
            title="Фильтр по типу операции"
          >
            <option value="income">Приходы</option>
            <option value="expense">Расходы</option>
          </Select>
        </FormControl>
        
        <FormControl minW="40">
          <FormLabel htmlFor="cashCategory" fontSize="sm" color="gray.600">Категория</FormLabel>
          <Select 
            id="cashCategory"
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            placeholder="Все категории"
            aria-label="Фильтр по категории"
            title="Фильтр по категории"
          >
            {selectedType === 'income' && categories.income.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            {selectedType === 'expense' && categories.expense.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            {!selectedType && [...categories.income, ...categories.expense].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </FormControl>
        
        <FormControl minW="48">
          <FormLabel htmlFor="cashObject" fontSize="sm" color="gray.600">Объект</FormLabel>
          <Select 
            id="cashObject"
            value={selectedObject} 
            onChange={(e) => setSelectedObject(e.target.value)}
            placeholder="Все объекты"
            aria-label="Фильтр по объекту"
            title="Фильтр по объекту"
          >
            {objects.map(obj => (
              <option key={obj.id} value={obj.id}>{obj.name}</option>
            ))}
          </Select>
        </FormControl>
        
        <FormControl minW="32">
          <FormLabel htmlFor="cashMonth" fontSize="sm" color="gray.600">Месяц</FormLabel>
          <Select 
            id="cashMonth"
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            placeholder="Все месяцы"
            aria-label="Фильтр по месяцу"
            title="Фильтр по месяцу"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </Select>
        </FormControl>
      </HStack>

      {/* Таблица транзакций */}
      <Box>
        <Heading size="sm" mb={4}>Операции</Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Дата</Th>
                <Th>Тип</Th>
                <Th>Категория</Th>
                <Th>Описание</Th>
                <Th>Способ оплаты</Th>
                <Th>Объект</Th>
                <Th isNumeric>Сумма</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredTransactions.map((transaction) => {
                const object = objects.find(obj => obj.id === transaction.object_id);
                const paymentMethod = paymentMethods.find(m => m.value === transaction.payment_method);
                
                return (
                  <Tr key={transaction.id}>
                    <Td>{new Date(transaction.date).toLocaleDateString('ru-RU')}</Td>
                    <Td>
                      <Badge 
                        colorScheme={transaction.type === 'income' ? 'green' : 'red'} 
                        borderRadius="full" 
                        px={3}
                      >
                        {transaction.type === 'income' ? 'Приход' : 'Расход'}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={getCategoryColor(transaction.type, transaction.category)} 
                        borderRadius="full" 
                        px={3}
                      >
                        {transaction.category}
                      </Badge>
                    </Td>
                    <Td maxW="48" isTruncated title={transaction.description}>
                      {transaction.description}
                    </Td>
                    <Td>
                      <HStack gap={2}>
                        <Icon as={paymentMethod?.icon || Wallet} size={16} />
                        <Text fontSize="sm">{paymentMethod?.label}</Text>
                      </HStack>
                    </Td>
                    <Td>{object?.name || '—'}</Td>
                    <Td isNumeric>
                      <Text 
                        color={transaction.type === 'income' ? 'green.600' : 'red.600'}
                        fontWeight="medium"
                      >
                        {transaction.type === 'income' ? '+' : '-'}₽{transaction.amount.toLocaleString('ru-RU')}
                      </Text>
                    </Td>
                    <Td>
                      <HStack gap={2}>
                        <Tooltip label="Редактировать">
                          <IconButton
                            aria-label="Редактировать операцию"
                            icon={<Icon as={Edit} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEdit(transaction)}
                          />
                        </Tooltip>
                        <Tooltip label="Удалить">
                          <IconButton
                            aria-label="Удалить операцию"
                            icon={<Icon as={Trash2} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(transaction.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Модалка добавления/редактирования */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl" boxShadow="xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" pb={4}>
            <Heading size="md" color="gray.800">
              {editingTransaction ? 'Редактировать операцию' : 'Добавить операцию'}
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack gap={4}>
              <HStack gap={4} w="100%">
                <FormControl>
                  <FormLabel htmlFor="cashFormType" fontSize="sm" color="gray.600">Тип операции</FormLabel>
                  <Select 
                    id="cashFormType"
                    value={formData.type} 
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    aria-label="Тип операции"
                    title="Тип операции"
                  >
                    <option value="income">Приход</option>
                    <option value="expense">Расход</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600">Сумма, ₽</FormLabel>
                  <Input 
                    value={formData.amount} 
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    type="number"
                    placeholder="0"
                    borderRadius="lg"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                  />
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel htmlFor="cashFormCategory" fontSize="sm" color="gray.600">Категория</FormLabel>
                <Select 
                  id="cashFormCategory"
                  value={formData.category} 
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Выберите категорию"
                  aria-label="Выбор категории"
                  title="Выбор категории"
                >
                  {categories[formData.type as keyof typeof categories].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" color="gray.600">Описание</FormLabel>
                <Input 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Краткое описание операции"
                  borderRadius="lg"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                />
              </FormControl>
              
              <HStack gap={4} w="100%">
                <FormControl>
                  <FormLabel htmlFor="cashFormDate" fontSize="sm" color="gray.600">Дата</FormLabel>
                  <Input 
                    id="cashFormDate"
                    value={formData.date} 
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    type="date"
                    borderRadius="lg"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="cashFormMethod" fontSize="sm" color="gray.600">Способ оплаты</FormLabel>
                  <Select 
                    id="cashFormMethod"
                    value={formData.payment_method} 
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                    aria-label="Способ оплаты"
                    title="Способ оплаты"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
              
              <HStack gap={4} w="100%">
                <FormControl>
                  <FormLabel htmlFor="cashFormObject" fontSize="sm" color="gray.600">Объект</FormLabel>
                  <Select 
                    id="cashFormObject"
                    value={formData.object_id} 
                    onChange={(e) => setFormData(prev => ({ ...prev, object_id: e.target.value }))}
                    placeholder="Выберите объект"
                    aria-label="Выбор объекта"
                    title="Выбор объекта"
                  >
                    {objects.map(obj => (
                      <option key={obj.id} value={obj.id}>{obj.name}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="cashFormUser" fontSize="sm" color="gray.600">Ответственный</FormLabel>
                  <Select 
                    id="cashFormUser"
                    value={formData.user_id} 
                    onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                    placeholder="Выберите сотрудника"
                    aria-label="Выбор сотрудника"
                    title="Выбор сотрудника"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.full_name || user.name}</option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel fontSize="sm" color="gray.600">Примечания</FormLabel>
                <Input 
                  value={formData.notes} 
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Дополнительная информация"
                  borderRadius="lg"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100" pt={4}>
            <HStack gap={3}>
              <Button 
                variant="ghost" 
                colorScheme="gray"
                onClick={onClose}
                borderRadius="full"
              >
                Отмена
              </Button>
              <Button 
                variant="solid" 
                colorScheme="green"
                onClick={handleSubmit}
                borderRadius="full"
                px={6}
                isDisabled={!formData.amount || !formData.category || !formData.description}
              >
                {editingTransaction ? 'Сохранить' : 'Создать'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 