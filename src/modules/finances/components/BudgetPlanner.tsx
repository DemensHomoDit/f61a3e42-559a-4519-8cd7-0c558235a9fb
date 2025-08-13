import { Box, Heading, Text, HStack, VStack, Button, Input, Select, Table, Thead, Tbody, Tr, Th, Td, Badge, Progress, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useDisclosure, IconButton, Tooltip, Icon } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "@/api/client";

interface BudgetItem {
  id: number;
  object_id: number;
  category: string;
  planned_amount: number;
  actual_amount: number;
  month: string;
  year: number;
  notes?: string;
}

interface BudgetPlannerProps {
  objects: any[];
  purchases: any[];
  salaries: any[];
  absences: any[];
}

export const BudgetPlanner = ({ objects = [], purchases = [], salaries = [], absences = [] }: BudgetPlannerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const qc = useQueryClient();
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [formData, setFormData] = useState({
    object_id: '',
    category: '',
    planned_amount: '',
    month: '',
    year: new Date().getFullYear(),
    notes: ''
  });

  const { data: budgets = [] } = useQuery<BudgetItem[]>({ queryKey: ['budgets'], queryFn: getBudgets, retry: 0, refetchOnWindowFocus: false });

  const createMut = useMutation({
    mutationFn: async () => createBudget({
      object_id: Number(formData.object_id) || null,
      category: formData.category || null,
      planned_amount: Number(formData.planned_amount) || 0,
      actual_amount: 0,
      month: formData.month || null,
      year: Number(formData.year) || null,
      notes: formData.notes || null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); onClose(); resetForm(); }
  });
  const updateMut = useMutation({
    mutationFn: async () => editingItem ? updateBudget(editingItem.id, {
      object_id: Number(formData.object_id) || null,
      category: formData.category || null,
      planned_amount: Number(formData.planned_amount) || 0,
      month: formData.month || null,
      year: Number(formData.year) || null,
      notes: formData.notes || null,
    }) : Promise.resolve(null),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); onClose(); resetForm(); }
  });
  const deleteMut = useMutation({
    mutationFn: async (id: number) => deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] })
  });

  const categories = ['Материалы', 'Зарплаты', 'Оборудование', 'Транспорт', 'Накладные расходы', 'Прочие'];

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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const filteredBudgets = useMemo(() => {
    return budgets.filter(item => {
      if (selectedObject && String(item.object_id) !== selectedObject) return false;
      if (selectedMonth && item.month !== selectedMonth) return false;
      if (selectedYear && item.year !== selectedYear) return false;
      return true;
    });
  }, [budgets, selectedObject, selectedMonth, selectedYear]);

  const budgetSummary = useMemo(() => {
    const summary = objects.map(obj => {
      const objectBudgets = budgets.filter(b => b.object_id === obj.id);
      const totalPlanned = objectBudgets.reduce((sum, b) => sum + (b.planned_amount || 0), 0);
      const totalActual = objectBudgets.reduce((sum, b) => sum + (b.actual_amount || 0), 0);
      
      const objectPurchases = purchases.filter(p => p.object_id === obj.id);
      const objectSalaries = salaries.filter(s => s.object_id === obj.id);
      const objectAbsences = absences.filter(a => a.object_id === obj.id);
      
      const totalExpenses = [...objectPurchases, ...objectSalaries, ...objectAbsences]
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      return {
        object: obj,
        planned: totalPlanned,
        actual: totalActual,
        expenses: totalExpenses,
        variance: totalPlanned - totalExpenses,
        utilization: totalPlanned > 0 ? (totalExpenses / totalPlanned) * 100 : 0
      };
    });

    return summary.sort((a, b) => b.planned - a.planned);
  }, [objects, budgets, purchases, salaries, absences]);

  const handleSubmit = () => {
    if (editingItem) updateMut.mutate();
    else createMut.mutate();
  };

  const resetForm = () => {
    setFormData({
      object_id: '',
      category: '',
      planned_amount: '',
      month: '',
      year: new Date().getFullYear(),
      notes: ''
    });
    setEditingItem(null);
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      object_id: String(item.object_id),
      category: item.category,
      planned_amount: String(item.planned_amount),
      month: item.month,
      year: item.year,
      notes: item.notes || ''
    });
    onOpen();
  };

  const handleDelete = (id: number) => { deleteMut.mutate(id); };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'green';
    if (variance < 0) return 'red';
    return 'gray';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <Icon as={TrendingDown} color="green.500" />;
    if (variance < 0) return <Icon as={TrendingUp} color="red.500" />;
    return null;
  };

  return (
    <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="md" color="gray.800">Бюджетное планирование</Heading>
          <Text color="text.secondary" fontSize="sm">Планирование и контроль бюджетов по объектам</Text>
        </Box>
        <Button 
          leftIcon={<Icon as={Plus} />} 
          colorScheme="green" 
          borderRadius="full"
          onClick={() => { resetForm(); onOpen(); }}
        >
          Добавить бюджет
        </Button>
      </HStack>

      {/* Фильтры */}
      <HStack gap={4} mb={6} flexWrap="wrap">
        <FormControl minW="48">
          <FormLabel htmlFor="budgetObject" fontSize="sm" color="gray.600">Объект</FormLabel>
          <Select 
            id="budgetObject"
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
          <FormLabel htmlFor="budgetMonth" fontSize="sm" color="gray.600">Месяц</FormLabel>
          <Select 
            id="budgetMonth"
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
        
        <FormControl minW="32">
          <FormLabel htmlFor="budgetYear" fontSize="sm" color="gray.600">Год</FormLabel>
          <Select 
            id="budgetYear"
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            aria-label="Фильтр по году"
            title="Фильтр по году"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
        </FormControl>
      </HStack>

      {/* Сводка по объектам */}
      <Box mb={6}>
        <Heading size="sm" mb={4}>Сводка по объектам</Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Объект</Th>
                <Th isNumeric>Планируемый бюджет</Th>
                <Th isNumeric>Фактические расходы</Th>
                <Th isNumeric>Отклонение</Th>
                <Th>Использование</Th>
              </Tr>
            </Thead>
            <Tbody>
              {budgetSummary.map((summary) => (
                <Tr key={summary.object.id}>
                  <Td fontWeight="medium">{summary.object.name}</Td>
                  <Td isNumeric>₽{summary.planned.toLocaleString('ru-RU')}</Td>
                  <Td isNumeric>₽{summary.expenses.toLocaleString('ru-RU')}</Td>
                  <Td isNumeric>
                    <HStack justify="flex-end" gap={2}>
                      {getVarianceIcon(summary.variance)}
                      <Text color={`${getVarianceColor(summary.variance)}.500`}>
                        ₽{Math.abs(summary.variance).toLocaleString('ru-RU')}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Box>
                      <Progress 
                        value={summary.utilization} 
                        colorScheme={summary.utilization > 100 ? 'red' : 'green'} 
                        size="sm" 
                        borderRadius="full"
                      />
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        {summary.utilization.toFixed(1)}%
                      </Text>
                    </Box>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Детализация бюджетов */}
      <Box>
        <Heading size="sm" mb={4}>Детализация бюджетов</Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Объект</Th>
                <Th>Категория</Th>
                <Th>Период</Th>
                <Th isNumeric>Планируемая сумма</Th>
                <Th isNumeric>Фактическая сумма</Th>
                <Th>Отклонение</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredBudgets.map((item) => {
                const object = objects.find(obj => obj.id === item.object_id);
                const monthLabel = months.find(m => m.value === item.month)?.label;
                const variance = item.planned_amount - item.actual_amount;
                
                return (
                  <Tr key={item.id}>
                    <Td>{object?.name || '—'}</Td>
                    <Td>
                      <Badge colorScheme="blue" borderRadius="full" px={3}>
                        {item.category}
                      </Badge>
                    </Td>
                    <Td>{monthLabel} {item.year}</Td>
                    <Td isNumeric>₽{item.planned_amount.toLocaleString('ru-RU')}</Td>
                    <Td isNumeric>₽{item.actual_amount.toLocaleString('ru-RU')}</Td>
                    <Td>
                      <HStack gap={2}>
                        {getVarianceIcon(variance)}
                        <Badge 
                          colorScheme={getVarianceColor(variance)} 
                          borderRadius="full" 
                          px={2}
                        >
                          ₽{Math.abs(variance).toLocaleString('ru-RU')}
                        </Badge>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack gap={2}>
                        <Tooltip label="Редактировать">
                          <IconButton
                            aria-label="Редактировать бюджет"
                            icon={<Icon as={Edit} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEdit(item)}
                          />
                        </Tooltip>
                        <Tooltip label="Удалить">
                          <IconButton
                            aria-label="Удалить бюджет"
                            icon={<Icon as={Trash2} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(item.id)}
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
              {editingItem ? 'Редактировать бюджет' : 'Добавить бюджет'}
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack gap={4}>
              <FormControl>
                <FormLabel htmlFor="budgetFormObject" fontSize="sm" color="gray.600">Объект</FormLabel>
                <Select 
                  id="budgetFormObject"
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
                <FormLabel htmlFor="budgetFormCategory" fontSize="sm" color="gray.600">Категория</FormLabel>
                <Select 
                  id="budgetFormCategory"
                  value={formData.category} 
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Выберите категорию"
                  aria-label="Выбор категории"
                  title="Выбор категории"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </FormControl>
              
              <HStack gap={4} w="100%">
                <FormControl>
                  <FormLabel htmlFor="budgetFormMonth" fontSize="sm" color="gray.600">Месяц</FormLabel>
                  <Select 
                    id="budgetFormMonth"
                    value={formData.month} 
                    onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                    placeholder="Месяц"
                    aria-label="Выбор месяца"
                    title="Выбор месяца"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="budgetFormYear" fontSize="sm" color="gray.600">Год</FormLabel>
                  <Select 
                    id="budgetFormYear"
                    value={formData.year} 
                    onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                    aria-label="Выбор года"
                    title="Выбор года"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel fontSize="sm" color="gray.600">Планируемая сумма, ₽</FormLabel>
                <Input 
                  value={formData.planned_amount} 
                  onChange={(e) => setFormData(prev => ({ ...prev, planned_amount: e.target.value }))}
                  type="number"
                  placeholder="0"
                  borderRadius="lg"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                />
              </FormControl>
              
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
                isDisabled={!formData.object_id || !formData.category || !formData.planned_amount || !formData.month}
              >
                {editingItem ? 'Сохранить' : 'Создать'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 