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
  Progress
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Package, 
  Shirt,
  HardHat,
  Wrench,
  Tool,
  Shield,
  Footprints,
  Glasses,
  Plus,
  Minus,
  FileText,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag
} from "lucide-react";

interface EquipmentRecord {
  id: number;
  type: 'clothing' | 'tools' | 'safety' | 'other';
  name: string;
  description: string;
  quantity: number;
  issuedDate: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'damaged' | 'lost';
  condition: 'new' | 'good' | 'fair' | 'poor';
  cost: number;
  serialNumber?: string;
}

const EmployeeEquipment = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });
  const user = users.find(u => u.id === Number(userId));
  
  const [equipmentData, setEquipmentData] = useState({
    clothingSize: '',
    shoeSize: '',
    helmetSize: '',
    gloveSize: '',
    safetyGlasses: false,
    earProtection: false,
    respirator: false
  });

  // Моковые данные принадлежностей
  const [equipmentRecords, setEquipmentRecords] = useState<EquipmentRecord[]>([
    {
      id: 1,
      type: 'clothing',
      name: 'Рабочая куртка',
      description: 'Утепленная куртка для работы на улице',
      quantity: 1,
      issuedDate: '2024-01-15',
      status: 'issued',
      condition: 'good',
      cost: 3500,
      serialNumber: 'JKT-001'
    },
    {
      id: 2,
      type: 'clothing',
      name: 'Рабочие брюки',
      description: 'Прочные брюки с наколенниками',
      quantity: 2,
      issuedDate: '2024-01-15',
      status: 'issued',
      condition: 'good',
      cost: 2500,
      serialNumber: 'PTS-001'
    },
    {
      id: 3,
      type: 'safety',
      name: 'Защитная каска',
      description: 'Пластиковая каска с регулируемым ремешком',
      quantity: 1,
      issuedDate: '2024-01-15',
      status: 'issued',
      condition: 'new',
      cost: 800,
      serialNumber: 'HLM-001'
    },
    {
      id: 4,
      type: 'safety',
      name: 'Защитные очки',
      description: 'Прозрачные очки с боковой защитой',
      quantity: 1,
      issuedDate: '2024-01-15',
      status: 'issued',
      condition: 'good',
      cost: 400,
      serialNumber: 'GLSS-001'
    },
    {
      id: 5,
      type: 'tools',
      name: 'Молоток',
      description: 'Слесарный молоток 1.5 кг',
      quantity: 1,
      issuedDate: '2024-02-01',
      status: 'issued',
      condition: 'fair',
      cost: 1200,
      serialNumber: 'HAM-001'
    },
    {
      id: 6,
      type: 'safety',
      name: 'Рабочие ботинки',
      description: 'Стальные носки, противоскользящая подошва',
      quantity: 1,
      issuedDate: '2024-01-15',
      status: 'issued',
      condition: 'good',
      cost: 4500,
      serialNumber: 'BT-001'
    }
  ]);

  const [newRecord, setNewRecord] = useState({
    type: 'clothing' as EquipmentRecord['type'],
    name: '',
    description: '',
    quantity: '',
    issuedDate: '',
    status: 'issued' as EquipmentRecord['status'],
    condition: 'new' as EquipmentRecord['condition'],
    cost: '',
    serialNumber: ''
  });

  useEffect(() => {
    if (user) {
      setEquipmentData({
        clothingSize: user.clothing_size || '',
        shoeSize: user.shoe_size || '',
        helmetSize: 'L',
        gloveSize: 'L',
        safetyGlasses: true,
        earProtection: true,
        respirator: false
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
          clothing_size: equipmentData.clothingSize,
          shoe_size: equipmentData.shoeSize
        } 
      });
    }
  };

  const handleAddRecord = () => {
    if (!newRecord.name || !newRecord.quantity || !newRecord.issuedDate) {
      toast({ title: 'Заполните все обязательные поля', status: 'error' });
      return;
    }

    const record: EquipmentRecord = {
      id: Date.now(),
      type: newRecord.type,
      name: newRecord.name,
      description: newRecord.description,
      quantity: parseInt(newRecord.quantity),
      issuedDate: newRecord.issuedDate,
      status: newRecord.status,
      condition: newRecord.condition,
      cost: parseFloat(newRecord.cost) || 0,
      serialNumber: newRecord.serialNumber || undefined
    };

    setEquipmentRecords(prev => [record, ...prev]);
    setNewRecord({
      type: 'clothing',
      name: '',
      description: '',
      quantity: '',
      issuedDate: '',
      status: 'issued',
      condition: 'new',
      cost: '',
      serialNumber: ''
    });
    onAddClose();
    toast({ title: 'Оборудование добавлено', status: 'success' });
  };

  const getTypeLabel = (type: EquipmentRecord['type']) => {
    switch (type) {
      case 'clothing': return 'Одежда';
      case 'tools': return 'Инструменты';
      case 'safety': return 'СИЗ';
      case 'other': return 'Прочее';
      default: return type;
    }
  };

  const getTypeColor = (type: EquipmentRecord['type']) => {
    switch (type) {
      case 'clothing': return 'blue';
      case 'tools': return 'orange';
      case 'safety': return 'green';
      case 'other': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: EquipmentRecord['status']) => {
    switch (status) {
      case 'issued': return 'green';
      case 'returned': return 'blue';
      case 'damaged': return 'red';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: EquipmentRecord['status']) => {
    switch (status) {
      case 'issued': return 'Выдано';
      case 'returned': return 'Возвращено';
      case 'damaged': return 'Повреждено';
      case 'lost': return 'Утеряно';
      default: return status;
    }
  };

  const getConditionColor = (condition: EquipmentRecord['condition']) => {
    switch (condition) {
      case 'new': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'yellow';
      case 'poor': return 'red';
      default: return 'gray';
    }
  };

  const getConditionLabel = (condition: EquipmentRecord['condition']) => {
    switch (condition) {
      case 'new': return 'Новое';
      case 'good': return 'Хорошее';
      case 'fair': return 'Удовлетворительное';
      case 'poor': return 'Плохое';
      default: return condition;
    }
  };

  const totalIssued = equipmentRecords.filter(r => r.status === 'issued').length;
  const totalReturned = equipmentRecords.filter(r => r.status === 'returned').length;
  const totalDamaged = equipmentRecords.filter(r => r.status === 'damaged').length;
  const totalValue = equipmentRecords
    .filter(r => r.status === 'issued')
    .reduce((sum, r) => sum + (r.cost * r.quantity), 0);

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
        <title>Принадлежности | UgraBuilders</title>
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
                  Принадлежности
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
                Выдать оборудование
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
                  <Package size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {totalIssued}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Выдано
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <CheckCircle size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {totalReturned}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Возвращено
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <AlertTriangle size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {totalDamaged}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Повреждено
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <Tag size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {totalValue.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Стоимость
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </SimpleGrid>

          {/* Размеры и настройки */}
          <Card className="modern-card">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Размеры и настройки</Heading>
                
                <SimpleGrid columns={3} spacing={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Shirt size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Размер одежды</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {equipmentData.clothingSize || 'Не указан'}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Footprints size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Размер обуви</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {equipmentData.shoeSize || 'Не указан'}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                  
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <HardHat size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Размер каски</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {equipmentData.helmetSize}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Shield size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Размер перчаток</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {equipmentData.gloveSize}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                  
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Glasses size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Защитные очки</Text>
                        <Badge colorScheme={equipmentData.safetyGlasses ? "green" : "red"} variant="subtle">
                          {equipmentData.safetyGlasses ? "Требуются" : "Не требуются"}
                        </Badge>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Shield size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Защита слуха</Text>
                        <Badge colorScheme={equipmentData.earProtection ? "green" : "red"} variant="subtle">
                          {equipmentData.earProtection ? "Требуется" : "Не требуется"}
                        </Badge>
                      </VStack>
                    </HStack>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Таблица оборудования */}
          <Card className="modern-card">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md">Выданное оборудование</Heading>
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
                        <Th>Дата выдачи</Th>
                        <Th>Тип</Th>
                        <Th>Наименование</Th>
                        <Th>Количество</Th>
                        <Th>Состояние</Th>
                        <Th>Статус</Th>
                        <Th isNumeric>Стоимость</Th>
                        <Th>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {equipmentRecords.map((record) => (
                        <Tr key={record.id}>
                          <Td>{new Date(record.issuedDate).toLocaleDateString('ru-RU')}</Td>
                          <Td>
                            <Badge colorScheme={getTypeColor(record.type)} variant="subtle">
                              {getTypeLabel(record.type)}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="600">{record.name}</Text>
                              <Text fontSize="sm" color="gray.600">{record.description}</Text>
                              {record.serialNumber && (
                                <Text fontSize="xs" color="gray.500">№{record.serialNumber}</Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>{record.quantity}</Td>
                          <Td>
                            <Badge colorScheme={getConditionColor(record.condition)} variant="subtle">
                              {getConditionLabel(record.condition)}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(record.status)} variant="subtle">
                              {getStatusLabel(record.status)}
                            </Badge>
                          </Td>
                          <Td isNumeric>
                            <Text fontWeight="600" color="blue.600">
                              {(record.cost * record.quantity).toLocaleString()}₽
                            </Text>
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
            <ModalHeader>Настройки размеров</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel htmlFor="clothingSize">Размер одежды</FormLabel>
                  <Select id="clothingSize" title="Размер одежды" value={equipmentData.clothingSize} onChange={(e) => setEquipmentData(prev => ({ ...prev, clothingSize: e.target.value }))}>
                    <option value="">Выберите размер</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Размер обуви</FormLabel>
                  <Input 
                    value={equipmentData.shoeSize} 
                    onChange={(e) => setEquipmentData(prev => ({ ...prev, shoeSize: e.target.value }))} 
                    placeholder="42"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="helmetSize">Размер каски</FormLabel>
                  <Select id="helmetSize" title="Размер каски" value={equipmentData.helmetSize} onChange={(e) => setEquipmentData(prev => ({ ...prev, helmetSize: e.target.value }))}>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="gloveSize">Размер перчаток</FormLabel>
                  <Select id="gloveSize" title="Размер перчаток" value={equipmentData.gloveSize} onChange={(e) => setEquipmentData(prev => ({ ...prev, gloveSize: e.target.value }))}>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </Select>
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

        {/* Модальное окно выдачи оборудования */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Выдать оборудование</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel htmlFor="equipType">Тип оборудования</FormLabel>
                  <Select id="equipType" title="Тип оборудования" value={newRecord.type} onChange={(e) => setNewRecord(prev => ({ ...prev, type: e.target.value as EquipmentRecord['type'] }))}>
                    <option value="clothing">Одежда</option>
                    <option value="tools">Инструменты</option>
                    <option value="safety">СИЗ</option>
                    <option value="other">Прочее</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Наименование</FormLabel>
                  <Input 
                    value={newRecord.name} 
                    onChange={(e) => setNewRecord(prev => ({ ...prev, name: e.target.value }))} 
                    placeholder="Название оборудования"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <Textarea 
                    value={newRecord.description} 
                    onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))} 
                    placeholder="Описание оборудования"
                    rows={2}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Количество</FormLabel>
                  <NumberInput value={newRecord.quantity} onChange={(value) => setNewRecord(prev => ({ ...prev, quantity: value }))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Дата выдачи</FormLabel>
                  <Input 
                    type="date" 
                    value={newRecord.issuedDate} 
                    onChange={(e) => setNewRecord(prev => ({ ...prev, issuedDate: e.target.value }))} 
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Серийный номер</FormLabel>
                  <Input 
                    value={newRecord.serialNumber} 
                    onChange={(e) => setNewRecord(prev => ({ ...prev, serialNumber: e.target.value }))} 
                    placeholder="Серийный номер (если есть)"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="equipCondition">Состояние</FormLabel>
                  <Select id="equipCondition" title="Состояние оборудования" value={newRecord.condition} onChange={(e) => setNewRecord(prev => ({ ...prev, condition: e.target.value as EquipmentRecord['condition'] }))}>
                    <option value="new">Новое</option>
                    <option value="good">Хорошее</option>
                    <option value="fair">Удовлетворительное</option>
                    <option value="poor">Плохое</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Стоимость (₽)</FormLabel>
                  <NumberInput value={newRecord.cost} onChange={(value) => setNewRecord(prev => ({ ...prev, cost: value }))}>
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
                <Button variant="ghost" onClick={onAddClose}>Отмена</Button>
                <Button 
                  className="modern-button"
                  onClick={handleAddRecord}
                >
                  Выдать
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default EmployeeEquipment; 