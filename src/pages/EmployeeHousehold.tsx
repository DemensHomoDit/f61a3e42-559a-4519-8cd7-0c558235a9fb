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
  Image,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Checkbox,
  CheckboxGroup
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Home, 
  Utensils,
  Bed,
  Wifi,
  Car,
  Bus,
  MapPin,
  Calendar,
  Plus,
  Minus,
  FileText,
  Download,
  Filter,
  Search,
  Users,
  Building,
  Phone,
  Mail
} from "lucide-react";

interface HouseholdRecord {
  id: number;
  type: 'accommodation' | 'meals' | 'transport' | 'utilities';
  description: string;
  cost: number;
  date: string;
  status: 'active' | 'inactive' | 'pending';
  location?: string;
  details?: string;
}

const EmployeeHousehold = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });
  const user = users.find(u => u.id === Number(userId));
  
  const [householdData, setHouseholdData] = useState({
    accommodationType: '',
    accommodationAddress: '',
    roomNumber: '',
    mealsIncluded: false,
    transportProvided: false,
    transportType: '',
    utilitiesIncluded: false
  });

  // Моковые данные бытовых записей
  const [householdRecords, setHouseholdRecords] = useState<HouseholdRecord[]>([
    {
      id: 1,
      type: 'accommodation',
      description: 'Общежитие №3, комната 205',
      cost: 5000,
      date: '2024-03-01',
      status: 'active',
      location: 'ул. Строителей, 15',
      details: '2-местная комната, санузел, кухня'
    },
    {
      id: 2,
      type: 'meals',
      description: 'Питание в столовой',
      cost: 3000,
      date: '2024-03-01',
      status: 'active',
      details: '3-разовое питание, диетическое меню'
    },
    {
      id: 3,
      type: 'transport',
      description: 'Доставка на объект',
      cost: 1500,
      date: '2024-03-01',
      status: 'active',
      details: 'Автобус от общежития до объекта'
    },
    {
      id: 4,
      type: 'utilities',
      description: 'Коммунальные услуги',
      cost: 2000,
      date: '2024-03-01',
      status: 'active',
      details: 'Электричество, вода, отопление, интернет'
    }
  ]);

  const [newRecord, setNewRecord] = useState({
    type: 'accommodation' as HouseholdRecord['type'],
    description: '',
    cost: '',
    date: '',
    status: 'active' as HouseholdRecord['status'],
    location: '',
    details: ''
  });

  useEffect(() => {
    if (user) {
      setHouseholdData({
        accommodationType: user.accommodation_type || 'Общежитие',
        accommodationAddress: user.accommodation_address || 'ул. Строителей, 15',
        roomNumber: user.room_number || '205',
        mealsIncluded: user.meals_included ?? true,
        transportProvided: user.transport_provided ?? true,
        transportType: user.transport_type || 'Автобус',
        utilitiesIncluded: user.utilities_included ?? true
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
        data: { 
          accommodation_type: householdData.accommodationType,
          accommodation_address: householdData.accommodationAddress,
          room_number: householdData.roomNumber,
          meals_included: householdData.mealsIncluded,
          transport_provided: householdData.transportProvided,
          transport_type: householdData.transportType,
          utilities_included: householdData.utilitiesIncluded
        } 
      });
    }
  };

  const handleAddRecord = () => {
    if (!newRecord.description || !newRecord.cost || !newRecord.date) {
      toast({ title: 'Заполните все обязательные поля', status: 'error' });
      return;
    }

    const record: HouseholdRecord = {
      id: Date.now(),
      type: newRecord.type,
      description: newRecord.description,
      cost: parseFloat(newRecord.cost),
      date: newRecord.date,
      status: newRecord.status,
      location: newRecord.location || undefined,
      details: newRecord.details || undefined
    };

    setHouseholdRecords(prev => [record, ...prev]);
    setNewRecord({
      type: 'accommodation',
      description: '',
      cost: '',
      date: '',
      status: 'active',
      location: '',
      details: ''
    });
    onAddClose();
    toast({ title: 'Запись добавлена', status: 'success' });
  };

  const getTypeLabel = (type: HouseholdRecord['type']) => {
    switch (type) {
      case 'accommodation': return 'Проживание';
      case 'meals': return 'Питание';
      case 'transport': return 'Транспорт';
      case 'utilities': return 'Коммунальные услуги';
      default: return type;
    }
  };

  const getTypeColor = (type: HouseholdRecord['type']) => {
    switch (type) {
      case 'accommodation': return 'blue';
      case 'meals': return 'green';
      case 'transport': return 'purple';
      case 'utilities': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: HouseholdRecord['status']) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: HouseholdRecord['status']) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'inactive': return 'Неактивно';
      case 'pending': return 'В ожидании';
      default: return status;
    }
  };

  const totalMonthlyCost = householdRecords
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + r.cost, 0);

  const accommodationCost = householdRecords
    .filter(r => r.type === 'accommodation' && r.status === 'active')
    .reduce((sum, r) => sum + r.cost, 0);

  const mealsCost = householdRecords
    .filter(r => r.type === 'meals' && r.status === 'active')
    .reduce((sum, r) => sum + r.cost, 0);

  const transportCost = householdRecords
    .filter(r => r.type === 'transport' && r.status === 'active')
    .reduce((sum, r) => sum + r.cost, 0);

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
        <title>Бытовые условия | UgraBuilders</title>
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
                  Бытовые условия
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
                Добавить услугу
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
                  <Home size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {accommodationCost.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Проживание
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <Utensils size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {mealsCost.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Питание
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <Bus size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {transportCost.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Транспорт
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <Wifi size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {totalMonthlyCost.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Общая стоимость
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </SimpleGrid>

          {/* Текущие условия */}
          <Card className="modern-card">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Текущие условия проживания</Heading>
                
                <SimpleGrid columns={2} spacing={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Building size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Тип жилья</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {householdData.accommodationType}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <MapPin size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Адрес</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {householdData.accommodationAddress}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Users size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Комната</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          №{householdData.roomNumber}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                  
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Utensils size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Питание</Text>
                        <Badge colorScheme={householdData.mealsIncluded ? "green" : "red"} variant="subtle">
                          {householdData.mealsIncluded ? "Включено" : "Не включено"}
                        </Badge>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Bus size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Транспорт</Text>
                        <Badge colorScheme={householdData.transportProvided ? "green" : "red"} variant="subtle">
                          {householdData.transportProvided ? householdData.transportType : "Не предоставляется"}
                        </Badge>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Wifi size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Коммунальные услуги</Text>
                        <Badge colorScheme={householdData.utilitiesIncluded ? "green" : "red"} variant="subtle">
                          {householdData.utilitiesIncluded ? "Включены" : "Не включены"}
                        </Badge>
                      </VStack>
                    </HStack>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Таблица услуг */}
          <Card className="modern-card">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md">Бытовые услуги</Heading>
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
                        <Th>Тип услуги</Th>
                        <Th>Описание</Th>
                        <Th>Местоположение</Th>
                        <Th isNumeric>Стоимость</Th>
                        <Th>Статус</Th>
                        <Th>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {householdRecords.map((record) => (
                        <Tr key={record.id}>
                          <Td>{new Date(record.date).toLocaleDateString('ru-RU')}</Td>
                          <Td>
                            <Badge colorScheme={getTypeColor(record.type)} variant="subtle">
                              {getTypeLabel(record.type)}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="600">{record.description}</Text>
                              {record.details && (
                                <Text fontSize="sm" color="gray.600">{record.details}</Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>{record.location || '—'}</Td>
                          <Td isNumeric>
                            <Text fontWeight="600" color="blue.600">
                              {record.cost.toLocaleString()}₽
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
            <ModalHeader>Настройки бытовых условий</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Тип жилья</FormLabel>
                  <Select value={householdData.accommodationType} onChange={(e) => setHouseholdData(prev => ({ ...prev, accommodationType: e.target.value }))}>
                    <option value="Общежитие">Общежитие</option>
                    <option value="Квартира">Квартира</option>
                    <option value="Гостиница">Гостиница</option>
                    <option value="Вагончик">Вагончик</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Адрес проживания</FormLabel>
                  <Input 
                    value={householdData.accommodationAddress} 
                    onChange={(e) => setHouseholdData(prev => ({ ...prev, accommodationAddress: e.target.value }))} 
                    placeholder="ул. Строителей, 15"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Номер комнаты/квартиры</FormLabel>
                  <Input 
                    value={householdData.roomNumber} 
                    onChange={(e) => setHouseholdData(prev => ({ ...prev, roomNumber: e.target.value }))} 
                    placeholder="205"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Тип транспорта</FormLabel>
                  <Select value={householdData.transportType} onChange={(e) => setHouseholdData(prev => ({ ...prev, transportType: e.target.value }))}>
                    <option value="Автобус">Автобус</option>
                    <option value="Такси">Такси</option>
                    <option value="Служебный транспорт">Служебный транспорт</option>
                    <option value="Личный транспорт">Личный транспорт</option>
                  </Select>
                </FormControl>
                
                <VStack align="start" spacing={3}>
                  <Checkbox 
                    isChecked={householdData.mealsIncluded} 
                    onChange={(e) => setHouseholdData(prev => ({ ...prev, mealsIncluded: e.target.checked }))}
                  >
                    Питание включено
                  </Checkbox>
                  
                  <Checkbox 
                    isChecked={householdData.transportProvided} 
                    onChange={(e) => setHouseholdData(prev => ({ ...prev, transportProvided: e.target.checked }))}
                  >
                    Транспорт предоставляется
                  </Checkbox>
                  
                  <Checkbox 
                    isChecked={householdData.utilitiesIncluded} 
                    onChange={(e) => setHouseholdData(prev => ({ ...prev, utilitiesIncluded: e.target.checked }))}
                  >
                    Коммунальные услуги включены
                  </Checkbox>
                </VStack>
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

        {/* Модальное окно добавления услуги */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Добавить бытовую услугу</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Тип услуги</FormLabel>
                  <Select value={newRecord.type} onChange={(e) => setNewRecord(prev => ({ ...prev, type: e.target.value as HouseholdRecord['type'] }))}>
                    <option value="accommodation">Проживание</option>
                    <option value="meals">Питание</option>
                    <option value="transport">Транспорт</option>
                    <option value="utilities">Коммунальные услуги</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Описание</FormLabel>
                  <Input 
                    value={newRecord.description} 
                    onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))} 
                    placeholder="Описание услуги"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Местоположение</FormLabel>
                  <Input 
                    value={newRecord.location} 
                    onChange={(e) => setNewRecord(prev => ({ ...prev, location: e.target.value }))} 
                    placeholder="Адрес или место"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Стоимость (₽)</FormLabel>
                  <NumberInput value={newRecord.cost} onChange={(value) => setNewRecord(prev => ({ ...prev, cost: value }))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Дата начала</FormLabel>
                  <Input 
                    type="date" 
                    value={newRecord.date} 
                    onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))} 
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Дополнительные детали</FormLabel>
                  <Textarea 
                    value={newRecord.details} 
                    onChange={(e) => setNewRecord(prev => ({ ...prev, details: e.target.value }))} 
                    placeholder="Дополнительная информация"
                    rows={3}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Статус</FormLabel>
                  <Select value={newRecord.status} onChange={(e) => setNewRecord(prev => ({ ...prev, status: e.target.value as HouseholdRecord['status'] }))}>
                    <option value="active">Активно</option>
                    <option value="pending">В ожидании</option>
                    <option value="inactive">Неактивно</option>
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

export default EmployeeHousehold; 