import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { useFinanceData } from '@/modules/finances/hooks/useFinanceData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getObjects, getUsers, createInvoice, createPurchaseAuto, createSalary, createWarehouseConsumption } from '@/api/client';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  Package, 
  Users, 
  Truck,
  Plus,
  Eye,
  Edit,
  Calendar,
  Target,
  PieChart,
  BarChart3
} from 'lucide-react';

const ObjectFinanceDetails: React.FC = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [operationType, setOperationType] = React.useState<'income' | 'expense' | 'salary' | 'consumption'>('income');
  const [operationForm, setOperationForm] = React.useState({
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    user_id: '',
    customer: '',
    number: '',
    status: 'pending',
    item: '',
    quantity: '1',
    unit: 'шт',
    unit_price: ''
  });

  // Хелпер для русских статусов
  const getStatusInRussian = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Ожидает',
      'completed': 'Завершено',
      'issued': 'Выдано',
      'paid': 'Оплачено',
      'unpaid': 'Не оплачено',
      'partial': 'Частично оплачено',
      'cancelled': 'Отменено'
    };
    return statusMap[status?.toLowerCase()] || status || '—';
  };

  // Загрузка данных
  const { data: objects = [] } = useQuery({ queryKey: ['objects'], queryFn: getObjects });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const financeData = useFinanceData();

  // Mutations
  const createIncomeMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance'] });
      toast({ title: 'Счёт создан', status: 'success' });
      onClose();
      resetForm();
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: createPurchaseAuto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance'] });
      toast({ title: 'Закупка создана', status: 'success' });
      onClose();
      resetForm();
    }
  });

  const createSalaryMutation = useMutation({
    mutationFn: createSalary,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance'] });
      toast({ title: 'Зарплата начислена', status: 'success' });
      onClose();
      resetForm();
    }
  });

  const createConsumptionMutation = useMutation({
    mutationFn: createWarehouseConsumption,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance'] });
      toast({ title: 'Списание создано', status: 'success' });
      onClose();
      resetForm();
    }
  });

  // Найти текущий объект
  const currentObject = useMemo(() => {
    return objects.find((obj: any) => obj.id === Number(objectId));
  }, [objects, objectId]);

  // Финансовые данные по объекту
  const objectFinance = useMemo(() => {
    if (!financeData || !objectId) return null;

    const objId = Number(objectId);
    
    // Доходы (счета)
    const invoices = (financeData.invoices || []).filter((inv: any) => inv.object_id === objId);
    const totalIncome = invoices.reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);

    // Расходы
    const purchases = (financeData.purchases || []).filter((p: any) => p.object_id === objId);
    const totalPurchases = purchases.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const salaries = (financeData.salaries || []).filter((s: any) => s.object_id === objId);
    const totalSalaries = salaries.reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0);

    const consumption = (financeData.warehouseConsumption || []).filter((c: any) => c.object_id === objId);
    const totalConsumption = consumption.reduce((sum: number, c: any) => sum + Number(c.total_amount || 0), 0);

    const otherExpenses = (financeData.otherExpenses || []).filter((e: any) => e.object_id === objId);
    const totalOtherExpenses = otherExpenses.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

    const totalExpenses = totalPurchases + totalSalaries + totalConsumption + totalOtherExpenses;
    const profit = totalIncome - totalExpenses;

    return {
      income: totalIncome,
      expenses: {
        purchases: totalPurchases,
        salaries: totalSalaries,
        consumption: totalConsumption,
        other: totalOtherExpenses,
        total: totalExpenses
      },
      profit,
      invoices,
      purchases,
      salaries,
      consumption,
      otherExpenses
    };
  }, [financeData, objectId]);

  const resetForm = () => {
    setOperationForm({
      amount: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      user_id: '',
      customer: '',
      number: '',
      status: 'pending',
      item: '',
      quantity: '1',
      unit: 'шт',
      unit_price: ''
    });
  };

  const handleAddOperation = (type: typeof operationType) => {
    setOperationType(type);
    resetForm();
    onOpen();
  };

  const handleSubmitOperation = () => {
    const baseData = {
      object_id: Number(objectId),
      date: operationForm.date,
      amount: Number(operationForm.amount)
    };

    switch (operationType) {
      case 'income':
        createIncomeMutation.mutate({
          ...baseData,
          number: operationForm.number,
          customer: operationForm.customer,
          comment: operationForm.description,
          status: operationForm.status
        });
        break;
      case 'expense':
        createExpenseMutation.mutate({
          ...baseData,
          item: operationForm.item,
          notes: operationForm.description,
          status: operationForm.status,
          qty: Number(operationForm.quantity),
          unit: operationForm.unit
        });
        break;
      case 'salary':
        createSalaryMutation.mutate({
          ...baseData,
          user_id: Number(operationForm.user_id),
          reason: operationForm.description,
          type: 'salary'
        });
        break;
      case 'consumption':
        createConsumptionMutation.mutate({
          object_id: Number(objectId),
          item_name: operationForm.item,
          quantity: Number(operationForm.quantity),
          unit: operationForm.unit,
          unit_price: Number(operationForm.unit_price),
          total_amount: Number(operationForm.amount),
          consumption_date: operationForm.date,
          reason: operationForm.description
        });
        break;
    }
  };

  if (!currentObject) {
    return (
      <Box p={8} textAlign="center">
        <Heading size="lg" color="red.500">Объект не найден</Heading>
        <Button mt={4} onClick={() => navigate('/finances')}>
          Вернуться к финансам
        </Button>
      </Box>
    );
  }

  if (!objectFinance) {
    return (
      <Box p={8} textAlign="center">
        <Heading size="lg">Загрузка...</Heading>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Финансы объекта: {currentObject.name} — ПромСтрой Контроль</title>
        <meta name="description" content={`Детальные финансы объекта ${currentObject.name}`} />
      </Helmet>

      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1400px" mx="auto">
        {/* Заголовок с навигацией */}
        <HStack justify="space-between" align="center">
          <HStack gap={4}>
            <IconButton
              aria-label="Назад"
              icon={<ArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/finances')}
            />
            <Box>
              <Heading size="lg" color="brand.500">{currentObject.name}</Heading>
              <Text color="text.secondary" mt={1}>Детальные финансы объекта</Text>
            </Box>
          </HStack>
          <HStack gap={2}>
            <Button 
              leftIcon={<Plus />} 
              colorScheme="green" 
              size="sm"
              onClick={() => handleAddOperation('income')}
            >
              Счёт
            </Button>
            <Button 
              leftIcon={<Plus />} 
              colorScheme="red" 
              size="sm"
              onClick={() => handleAddOperation('expense')}
            >
              Закупка
            </Button>
            <Button 
              leftIcon={<Plus />} 
              colorScheme="purple" 
              size="sm"
              onClick={() => handleAddOperation('salary')}
            >
              Зарплата
            </Button>
            <Button 
              leftIcon={<Plus />} 
              colorScheme="orange" 
              size="sm"
              onClick={() => handleAddOperation('consumption')}
            >
              Списание
            </Button>
          </HStack>
        </HStack>

        {/* Основная статистика */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm">
                  <HStack gap={2}>
                    <TrendingUp color="green" size={16} />
                    <Text>Доходы</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="green.600">
                  ₽{objectFinance.income.toLocaleString('ru-RU')}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm">
                  <HStack gap={2}>
                    <TrendingDown color="red" size={16} />
                    <Text>Расходы</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="red.600">
                  ₽{objectFinance.expenses.total.toLocaleString('ru-RU')}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm">
                  <HStack gap={2}>
                    <DollarSign color="blue" size={16} />
                    <Text>Прибыль</Text>
                  </HStack>
                </StatLabel>
                <StatNumber 
                  fontSize="2xl" 
                  fontWeight="bold" 
                  color={objectFinance.profit >= 0 ? 'blue.600' : 'red.600'}
                >
                  ₽{objectFinance.profit.toLocaleString('ru-RU')}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm">
                  <HStack gap={2}>
                    <Target color="purple" size={16} />
                    <Text>Рентабельность</Text>
                  </HStack>
                </StatLabel>
                <StatNumber 
                  fontSize="2xl" 
                  fontWeight="bold" 
                  color={objectFinance.profit >= 0 ? 'blue.600' : 'red.600'}
                >
                  {objectFinance.income > 0 
                    ? `${((objectFinance.profit / objectFinance.income) * 100).toFixed(1)}%`
                    : '—'
                  }
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Детализация расходов */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" color="gray.700">Структура расходов</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.600">Закупки</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    ₽{objectFinance.expenses.purchases.toLocaleString('ru-RU')}
                  </Text>
                </HStack>
                <Progress 
                  value={objectFinance.expenses.total > 0 ? (objectFinance.expenses.purchases / objectFinance.expenses.total) * 100 : 0}
                  colorScheme="blue"
                  size="sm"
                />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.600">Зарплаты</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    ₽{objectFinance.expenses.salaries.toLocaleString('ru-RU')}
                  </Text>
                </HStack>
                <Progress 
                  value={objectFinance.expenses.total > 0 ? (objectFinance.expenses.salaries / objectFinance.expenses.total) * 100 : 0}
                  colorScheme="purple"
                  size="sm"
                />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.600">Списания</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    ₽{objectFinance.expenses.consumption.toLocaleString('ru-RU')}
                  </Text>
                </HStack>
                <Progress 
                  value={objectFinance.expenses.total > 0 ? (objectFinance.expenses.consumption / objectFinance.expenses.total) * 100 : 0}
                  colorScheme="orange"
                  size="sm"
                />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.600">Прочее</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    ₽{objectFinance.expenses.other.toLocaleString('ru-RU')}
                  </Text>
                </HStack>
                <Progress 
                  value={objectFinance.expenses.total > 0 ? (objectFinance.expenses.other / objectFinance.expenses.total) * 100 : 0}
                  colorScheme="gray"
                  size="sm"
                />
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Детальные таблицы */}
        <Tabs variant="enclosed" colorScheme="green">
          <TabList>
            <Tab>
              <HStack gap={2}>
                <Receipt size={16} />
                <Text>Счета ({objectFinance.invoices.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack gap={2}>
                <Package size={16} />
                <Text>Закупки ({objectFinance.purchases.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack gap={2}>
                <Users size={16} />
                <Text>Зарплаты ({objectFinance.salaries.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack gap={2}>
                <Truck size={16} />
                <Text>Списания ({objectFinance.consumption.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Счета */}
            <TabPanel px={0}>
              <Card>
                <CardBody p={0}>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Номер</Th>
                        <Th>Дата</Th>
                        <Th>Заказчик</Th>
                        <Th>Сумма</Th>
                        <Th>Статус</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {objectFinance.invoices.map((invoice: any) => (
                        <Tr key={invoice.id}>
                          <Td fontWeight="medium">{invoice.number || `#${invoice.id}`}</Td>
                          <Td>{invoice.date}</Td>
                          <Td>{invoice.customer || '—'}</Td>
                          <Td fontWeight="bold" color="green.600">
                            ₽{Number(invoice.amount || 0).toLocaleString('ru-RU')}
                          </Td>
                          <Td>
                            <Badge colorScheme={invoice.status === 'paid' ? 'green' : 'yellow'}>
                              {getStatusInRussian(invoice.status)}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                      {objectFinance.invoices.length === 0 && (
                        <Tr>
                          <Td colSpan={5} textAlign="center" py={8}>
                            <Text color="gray.500">Нет счетов</Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Закупки */}
            <TabPanel px={0}>
              <Card>
                <CardBody p={0}>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Товар</Th>
                        <Th>Дата</Th>
                        <Th>Количество</Th>
                        <Th>Сумма</Th>
                        <Th>Статус</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {objectFinance.purchases.map((purchase: any) => (
                        <Tr key={purchase.id}>
                          <Td fontWeight="medium">{purchase.item}</Td>
                          <Td>{purchase.date}</Td>
                          <Td>{purchase.qty} {purchase.unit || 'шт'}</Td>
                          <Td fontWeight="bold" color="red.600">
                            ₽{Number(purchase.amount || 0).toLocaleString('ru-RU')}
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusInRussian(purchase.status) === 'Завершено' ? 'green' : 'yellow'}>
                              {getStatusInRussian(purchase.status)}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                      {objectFinance.purchases.length === 0 && (
                        <Tr>
                          <Td colSpan={5} textAlign="center" py={8}>
                            <Text color="gray.500">Нет закупок</Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Зарплаты */}
            <TabPanel px={0}>
              <Card>
                <CardBody p={0}>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Сотрудник</Th>
                        <Th>Дата</Th>
                        <Th>Причина</Th>
                        <Th>Сумма</Th>
                        <Th>Тип</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {objectFinance.salaries.map((salary: any) => {
                        const user = users.find((u: any) => u.id === salary.user_id);
                        return (
                          <Tr key={salary.id}>
                            <Td fontWeight="medium">{user?.full_name || `ID: ${salary.user_id}`}</Td>
                            <Td>{salary.date}</Td>
                            <Td>{salary.reason || '—'}</Td>
                            <Td fontWeight="bold" color="purple.600">
                              ₽{Number(salary.amount || 0).toLocaleString('ru-RU')}
                            </Td>
                            <Td>
                              <Badge colorScheme="purple">
                                {salary.type === 'bonus' ? 'Премия' : 'Зарплата'}
                              </Badge>
                            </Td>
                          </Tr>
                        );
                      })}
                      {objectFinance.salaries.length === 0 && (
                        <Tr>
                          <Td colSpan={5} textAlign="center" py={8}>
                            <Text color="gray.500">Нет начислений</Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Списания */}
            <TabPanel px={0}>
              <Card>
                <CardBody p={0}>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Материал</Th>
                        <Th>Дата</Th>
                        <Th>Количество</Th>
                        <Th>Цена за ед.</Th>
                        <Th>Сумма</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {objectFinance.consumption.map((cons: any) => (
                        <Tr key={cons.id}>
                          <Td fontWeight="medium">{cons.item_name}</Td>
                          <Td>{cons.consumption_date}</Td>
                          <Td>{cons.quantity} {cons.unit || 'шт'}</Td>
                          <Td>₽{Number(cons.unit_price || 0).toLocaleString('ru-RU')}</Td>
                          <Td fontWeight="bold" color="orange.600">
                            ₽{Number(cons.total_amount || 0).toLocaleString('ru-RU')}
                          </Td>
                        </Tr>
                      ))}
                      {objectFinance.consumption.length === 0 && (
                        <Tr>
                          <Td colSpan={5} textAlign="center" py={8}>
                            <Text color="gray.500">Нет списаний</Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Модалка для добавления операций */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {operationType === 'income' && 'Новый счёт'}
              {operationType === 'expense' && 'Новая закупка'}
              {operationType === 'salary' && 'Начисление зарплаты'}
              {operationType === 'consumption' && 'Списание материалов'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack gap={4} align="stretch">
                {operationType === 'income' && (
                  <>
                    <FormControl isRequired>
                      <FormLabel>Номер счёта</FormLabel>
                      <Input 
                        value={operationForm.number}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, number: e.target.value }))}
                        placeholder="Номер счёта"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Заказчик</FormLabel>
                      <Input 
                        value={operationForm.customer}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, customer: e.target.value }))}
                        placeholder="Название заказчика"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Сумма</FormLabel>
                      <Input 
                        type="number"
                        value={operationForm.amount}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Сумма в рублях"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Комментарий</FormLabel>
                      <Textarea 
                        value={operationForm.description}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Описание услуг"
                      />
                    </FormControl>
                  </>
                )}

                {operationType === 'expense' && (
                  <>
                    <FormControl isRequired>
                      <FormLabel>Товар/Материал</FormLabel>
                      <Input 
                        value={operationForm.item}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, item: e.target.value }))}
                        placeholder="Название товара"
                      />
                    </FormControl>
                    <HStack gap={4}>
                      <FormControl>
                        <FormLabel>Количество</FormLabel>
                        <Input 
                          type="number"
                          value={operationForm.quantity}
                          onChange={(e) => setOperationForm(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder="Количество"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Единица</FormLabel>
                        <Input 
                          value={operationForm.unit}
                          onChange={(e) => setOperationForm(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="шт, кг, м"
                        />
                      </FormControl>
                    </HStack>
                    <FormControl isRequired>
                      <FormLabel>Общая сумма</FormLabel>
                      <Input 
                        type="number"
                        value={operationForm.amount}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Сумма в рублях"
                      />
                    </FormControl>
                  </>
                )}

                {operationType === 'salary' && (
                  <>
                    <FormControl isRequired>
                      <FormLabel htmlFor="employee-select">Сотрудник</FormLabel>
                      <Select 
                        id="employee-select"
                        value={operationForm.user_id}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, user_id: e.target.value }))}
                        placeholder="Выберите сотрудника"
                        title="Выберите сотрудника"
                        aria-label="Сотрудник"
                      >
                        {users.map((user: any) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name || user.username}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Сумма</FormLabel>
                      <Input 
                        type="number"
                        value={operationForm.amount}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Сумма в рублях"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Причина начисления</FormLabel>
                      <Input 
                        value={operationForm.description}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Зарплата, премия, аванс"
                      />
                    </FormControl>
                  </>
                )}

                {operationType === 'consumption' && (
                  <>
                    <FormControl isRequired>
                      <FormLabel>Материал</FormLabel>
                      <Input 
                        value={operationForm.item}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, item: e.target.value }))}
                        placeholder="Название материала"
                      />
                    </FormControl>
                    <HStack gap={4}>
                      <FormControl>
                        <FormLabel>Количество</FormLabel>
                        <Input 
                          type="number"
                          value={operationForm.quantity}
                          onChange={(e) => setOperationForm(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder="Количество"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Единица</FormLabel>
                        <Input 
                          value={operationForm.unit}
                          onChange={(e) => setOperationForm(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="шт, кг, м"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Цена за ед.</FormLabel>
                        <Input 
                          type="number"
                          value={operationForm.unit_price}
                          onChange={(e) => {
                            const unitPrice = e.target.value;
                            const quantity = operationForm.quantity;
                            const total = (Number(unitPrice) * Number(quantity)).toString();
                            setOperationForm(prev => ({ 
                              ...prev, 
                              unit_price: unitPrice,
                              amount: total
                            }));
                          }}
                          placeholder="Цена"
                        />
                      </FormControl>
                    </HStack>
                    <FormControl>
                      <FormLabel>Общая сумма</FormLabel>
                      <Input 
                        type="number"
                        value={operationForm.amount}
                        onChange={(e) => setOperationForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Автоматически"
                        isReadOnly
                      />
                    </FormControl>
                  </>
                )}

                <FormControl>
                  <FormLabel>Дата</FormLabel>
                  <Input 
                    type="date"
                    value={operationForm.date}
                    onChange={(e) => setOperationForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack gap={3}>
                <Button variant="ghost" onClick={onClose}>Отмена</Button>
                <Button 
                  colorScheme="green" 
                  onClick={handleSubmitOperation}
                  isLoading={
                    createIncomeMutation.isPending || 
                    createExpenseMutation.isPending || 
                    createSalaryMutation.isPending ||
                    createConsumptionMutation.isPending
                  }
                  isDisabled={
                    !operationForm.amount || 
                    (operationType === 'income' && (!operationForm.number || !operationForm.customer)) ||
                    (operationType === 'expense' && !operationForm.item) ||
                    (operationType === 'salary' && !operationForm.user_id) ||
                    (operationType === 'consumption' && !operationForm.item)
                  }
                >
                  Создать
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default ObjectFinanceDetails; 