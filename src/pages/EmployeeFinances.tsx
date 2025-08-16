import { Helmet } from "react-helmet-async";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUser } from "@/api/client";
import type { User } from "@/types";
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  Badge,
  Divider,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Flex,
  Spacer,
  Image,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Minus,
  CreditCard,
  Wallet,
  PiggyBank,
  Receipt,
  FileText,
  Download,
  Filter,
  Search
} from "lucide-react";

interface FinancialRecord {
  id: number;
  type: 'salary' | 'advance' | 'bonus' | 'deduction';
  amount: number;
  date: string;
  description: string;
  status: 'pending' | 'paid' | 'cancelled';
}

const EmployeeFinances = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });
  const user = users.find(u => u.id === Number(userId));
  
  const [financialData, setFinancialData] = useState({
    baseSalary: '',
    hourlyRate: '',
    overtimeRate: '',
    bonusRate: ''
  });

  // Моковые данные финансовых записей
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([
    {
      id: 1,
      type: 'salary',
      amount: 45000,
      date: '2024-03-01',
      description: 'Зарплата за март 2024',
      status: 'paid'
    },
    {
      id: 2,
      type: 'advance',
      amount: 15000,
      date: '2024-03-15',
      description: 'Аванс за март 2024',
      status: 'paid'
    },
    {
      id: 3,
      type: 'bonus',
      amount: 5000,
      date: '2024-03-20',
      description: 'Бонус за качественную работу',
      status: 'pending'
    },
    {
      id: 4,
      type: 'deduction',
      amount: -2000,
      date: '2024-03-25',
      description: 'Штраф за опоздание',
      status: 'paid'
    }
  ]);

  const [newRecord, setNewRecord] = useState({
    type: 'salary' as FinancialRecord['type'],
    amount: '',
    date: '',
    description: '',
    status: 'pending' as FinancialRecord['status']
  });

  useEffect(() => {
    if (user) {
      setFinancialData({
        baseSalary: user.salary?.toString() || '',
        hourlyRate: '250', // Моковые данные
        overtimeRate: '375', // Моковые данные
        bonusRate: '10' // Моковые данные
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Данные обновлены', status: 'success' });
      onClose();
    },
    onError: () => {
      toast({ title: 'Ошибка обновления', status: 'error' });
    }
  });

  const handleSave = () => {
    if (user) {
      updateMutation.mutate({ 
        id: user.id, 
        data: { salary: parseFloat(financialData.baseSalary) || 0 } 
      });
    }
  };

  const handleAddRecord = () => {
    if (!newRecord.amount || !newRecord.date || !newRecord.description) {
      toast({ title: 'Заполните все поля', status: 'error' });
      return;
    }

    const record: FinancialRecord = {
      id: Date.now(),
      type: newRecord.type,
      amount: parseFloat(newRecord.amount),
      date: newRecord.date,
      description: newRecord.description,
      status: newRecord.status
    };

    setFinancialRecords(prev => [record, ...prev]);
    setNewRecord({
      type: 'salary',
      amount: '',
      date: '',
      description: '',
      status: 'pending'
    });
    onAddClose();
    toast({ title: 'Запись добавлена', status: 'success' });
  };

  const getTypeLabel = (type: FinancialRecord['type']) => {
    switch (type) {
      case 'salary': return 'Зарплата';
      case 'advance': return 'Аванс';
      case 'bonus': return 'Бонус';
      case 'deduction': return 'Удержание';
      default: return type;
    }
  };

  const getTypeColor = (type: FinancialRecord['type']) => {
    switch (type) {
      case 'salary': return 'green';
      case 'advance': return 'blue';
      case 'bonus': return 'purple';
      case 'deduction': return 'red';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: FinancialRecord['status']) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: FinancialRecord['status']) => {
    switch (status) {
      case 'paid': return 'Оплачено';
      case 'pending': return 'В ожидании';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const totalEarnings = financialRecords
    .filter(r => r.status === 'paid' && r.amount > 0)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalDeductions = financialRecords
    .filter(r => r.status === 'paid' && r.amount < 0)
    .reduce((sum, r) => sum + Math.abs(r.amount), 0);

  const pendingAmount = financialRecords
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  if (!user) {
    return (
      <Box className="bg-gray-50 min-h-screen p-6">
        <Text>Сотрудник не найден</Text>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Финансы сотрудника | UgraBuilders</title>
      </Helmet>

      <Box className="bg-gray-50 min-h-screen p-6">
        {/* Хедер */}
        <Box className="modern-header mb-8">
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <IconButton
                aria-label="Назад"
                icon={<ArrowLeft size={20} />}
                variant="ghost"
                onClick={() => navigate(`/people/${userId}/profile`)}
              />
              <VStack align="start" spacing={1}>
                <Text className="text-2xl font-bold text-gray-800">
                  Финансы сотрудника
                </Text>
                <Text className="text-gray-600">
                  {user.full_name}
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<Plus size={16} />}
                className="modern-button"
                size="sm"
                onClick={onAddOpen}
              >
                Добавить запись
              </Button>
              <Button
                leftIcon={<Edit size={16} />}
                className="modern-button-secondary"
                size="sm"
                onClick={onOpen}
              >
                Настройки
              </Button>
            </HStack>
          </HStack>
        </Box>

        <VStack spacing={6} align="stretch">
          {/* Статистика */}
          <SimpleGrid columns={4} spacing={6}>
            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <DollarSign size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {totalEarnings.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Общий заработок
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <Minus size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {totalDeductions.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Удержания
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <TrendingUp size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {(totalEarnings - totalDeductions).toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Чистый доход
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <Calendar size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {pendingAmount.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    В ожидании
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </SimpleGrid>

          {/* Таблица финансовых записей */}
          <Card className="modern-card">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md">Финансовые операции</Heading>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Фильтр"
                      icon={<Filter size={16} />}
                      size="sm"
                      variant="ghost"
                    />
                    <IconButton
                      aria-label="Поиск"
                      icon={<Search size={16} />}
                      size="sm"
                      variant="ghost"
                    />
                    <IconButton
                      aria-label="Экспорт"
                      icon={<Download size={16} />}
                      size="sm"
                      variant="ghost"
                    />
                  </HStack>
                </HStack>
                
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Дата</Th>
                        <Th>Тип</Th>
                        <Th>Описание</Th>
                        <Th isNumeric>Сумма</Th>
                        <Th>Статус</Th>
                        <Th>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {financialRecords.map((record) => (
                        <Tr key={record.id}>
                          <Td>{new Date(record.date).toLocaleDateString('ru-RU')}</Td>
                          <Td>
                            <Badge colorScheme={getTypeColor(record.type)} variant="subtle">
                              {getTypeLabel(record.type)}
                            </Badge>
                          </Td>
                          <Td>{record.description}</Td>
                          <Td isNumeric>
                            <Text 
                              color={record.amount >= 0 ? 'green.600' : 'red.600'}
                              fontWeight="600"
                            >
                              {record.amount >= 0 ? '+' : ''}{record.amount.toLocaleString()}₽
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(record.status)} variant="subtle">
                              {getStatusLabel(record.status)}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Редактировать"
                                icon={<Edit size={14} />}
                                size="sm"
                                variant="ghost"
                              />
                              <IconButton
                                aria-label="Детали"
                                icon={<FileText size={14} />}
                                size="sm"
                                variant="ghost"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Модальное окно настроек */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Настройки финансов</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Базовая зарплата (₽)</FormLabel>
                  <NumberInput value={financialData.baseSalary} onChange={(value) => setFinancialData(prev => ({ ...prev, baseSalary: value }))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Почасовая ставка (₽/час)</FormLabel>
                  <NumberInput value={financialData.hourlyRate} onChange={(value) => setFinancialData(prev => ({ ...prev, hourlyRate: value }))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Ставка сверхурочных (₽/час)</FormLabel>
                  <NumberInput value={financialData.overtimeRate} onChange={(value) => setFinancialData(prev => ({ ...prev, overtimeRate: value }))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Процент бонусов (%)</FormLabel>
                  <NumberInput value={financialData.bonusRate} onChange={(value) => setFinancialData(prev => ({ ...prev, bonusRate: value }))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onClose}>Отмена</Button>
                <Button 
                  className="modern-button"
                  onClick={handleSave}
                  isLoading={updateMutation.isPending}
                >
                  Сохранить
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Модальное окно добавления записи */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Добавить финансовую запись</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Тип операции</FormLabel>
                  <Select value={newRecord.type} onChange={(e) => setNewRecord(prev => ({ ...prev, type: e.target.value as FinancialRecord['type'] }))}>
                    <option value="salary">Зарплата</option>
                    <option value="advance">Аванс</option>
                    <option value="bonus">Бонус</option>
                    <option value="deduction">Удержание</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Сумма (₽)</FormLabel>
                  <NumberInput value={newRecord.amount} onChange={(value) => setNewRecord(prev => ({ ...prev, amount: value }))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Дата</FormLabel>
                  <Input 
                    type="date" 
                    value={newRecord.date} 
                    onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))} 
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Описание</FormLabel>
                  <Input 
                    value={newRecord.description} 
                    onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))} 
                    placeholder="Описание операции"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Статус</FormLabel>
                  <Select value={newRecord.status} onChange={(e) => setNewRecord(prev => ({ ...prev, status: e.target.value as FinancialRecord['status'] }))}>
                    <option value="pending">В ожидании</option>
                    <option value="paid">Оплачено</option>
                    <option value="cancelled">Отменено</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onAddClose}>Отмена</Button>
                <Button 
                  className="modern-button"
                  onClick={handleAddRecord}
                >
                  Добавить
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default EmployeeFinances; 