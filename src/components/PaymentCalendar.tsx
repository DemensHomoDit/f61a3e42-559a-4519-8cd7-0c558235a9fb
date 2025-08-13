import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  Icon
} from '@chakra-ui/react';
import { Calendar, Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { CanCreate, CanRead, CanUpdate, CanDelete } from './PermissionGuard';

interface PaymentEvent {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  date: string;
  object_id?: number;
  description?: string;
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface PaymentCalendarProps {
  objectId?: number;
  onEventCreate?: (event: PaymentEvent) => void;
  onEventUpdate?: (event: PaymentEvent) => void;
  onEventDelete?: (eventId: string) => void;
}

export const PaymentCalendar: React.FC<PaymentCalendarProps> = ({
  objectId,
  onEventCreate,
  onEventUpdate,
  onEventDelete
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { canCreate, canRead } = usePermissions();
  const toast = useToast();
  
  const [events, setEvents] = useState<PaymentEvent[]>([
    {
      id: '1',
      type: 'income',
      title: 'Аванс по объекту А',
      amount: 500000,
      date: '2024-02-15',
      object_id: 1,
      description: 'Авансовый платеж по договору',
      status: 'confirmed',
      category: 'advance',
      priority: 'high'
    },
    {
      id: '2',
      type: 'expense',
      title: 'Закупка материалов',
      amount: 150000,
      date: '2024-02-20',
      object_id: 1,
      description: 'Арматура, бетон, кирпич',
      status: 'planned',
      category: 'materials',
      priority: 'medium'
    }
  ]);

  const [formData, setFormData] = useState<Partial<PaymentEvent>>({
    type: 'expense',
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'planned',
    priority: 'medium'
  });

  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      monthName: now.toLocaleString('ru-RU', { month: 'long' })
    };
  }, []);

  const monthEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentMonth.month && 
             eventDate.getFullYear() === currentMonth.year;
    });
  }, [events, currentMonth]);

  const totalIncome = useMemo(() => {
    return monthEvents
      .filter(e => e.type === 'income' && e.status !== 'cancelled')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [monthEvents]);

  const totalExpenses = useMemo(() => {
    return monthEvents
      .filter(e => e.type === 'expense' && e.status !== 'cancelled')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [monthEvents]);

  const balance = totalIncome - totalExpenses;

  const handleSubmit = () => {
    if (!formData.title || !formData.amount || !formData.date) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (editingEventId) {
      // Обновление существующего события
      const updatedEvent = { ...formData, id: editingEventId } as PaymentEvent;
      setEvents(prev => prev.map(e => e.id === editingEventId ? updatedEvent : e));
      onEventUpdate?.(updatedEvent);
      setEditingEventId(null);
    } else {
      // Создание нового события
      const newEvent: PaymentEvent = {
        ...formData,
        id: Date.now().toString(),
        object_id: objectId
      } as PaymentEvent;
      setEvents(prev => [...prev, newEvent]);
      onEventCreate?.(newEvent);
    }

    setFormData({
      type: 'expense',
      title: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'planned',
      priority: 'medium'
    });
    onClose();
  };

  const handleEdit = (event: PaymentEvent) => {
    setFormData(event);
    setEditingEventId(event.id);
    onOpen();
  };

  const handleDelete = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    onEventDelete?.(eventId);
  };

  const getStatusColor = (status: PaymentEvent['status']) => {
    switch (status) {
      case 'planned': return 'blue';
      case 'confirmed': return 'yellow';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: PaymentEvent['priority']) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="md" display="flex" alignItems="center" gap={2}>
            <Icon as={Calendar} />
            Платежный календарь
          </Heading>
          <Text color="gray.600">
            {currentMonth.monthName} {currentMonth.year}
          </Text>
        </VStack>
        
        <CanCreate resource="finances">
          <Button
            leftIcon={<Plus />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Добавить событие
          </Button>
        </CanCreate>
      </HStack>

      {/* Финансовая сводка */}
      <SimpleGrid columns={3} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <VStack align="center" spacing={2}>
              <Icon as={TrendingUp} color="green.500" boxSize={6} />
              <Text fontSize="sm" color="gray.600">Доходы</Text>
              <Text fontSize="xl" fontWeight="bold" color="green.600">
                ₽{totalIncome.toLocaleString('ru-RU')}
              </Text>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <VStack align="center" spacing={2}>
              <Icon as={TrendingDown} color="red.500" boxSize={6} />
              <Text fontSize="sm" color="gray.600">Расходы</Text>
              <Text fontSize="xl" fontWeight="bold" color="red.600">
                ₽{totalExpenses.toLocaleString('ru-RU')}
              </Text>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <VStack align="center" spacing={2}>
              <Icon as={DollarSign} color={balance >= 0 ? "green.500" : "red.500"} boxSize={6} />
              <Text fontSize="sm" color="gray.600">Баланс</Text>
              <Text fontSize="xl" fontWeight="bold" color={balance >= 0 ? "green.600" : "red.600"}>
                ₽{balance.toLocaleString('ru-RU')}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Список событий */}
      <CanRead resource="finances">
        <VStack spacing={3} align="stretch">
          {monthEvents.length === 0 ? (
            <Box textAlign="center" py={8} color="gray.500">
              <Text>Нет запланированных событий на этот месяц</Text>
            </Box>
          ) : (
            monthEvents.map(event => (
              <Card key={event.id} variant="outline">
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack spacing={3}>
                        <Badge
                          colorScheme={event.type === 'income' ? 'green' : 'red'}
                          variant="subtle"
                        >
                          {event.type === 'income' ? 'Доход' : 'Расход'}
                        </Badge>
                        <Badge colorScheme={getStatusColor(event.status)}>
                          {event.status === 'planned' ? 'Запланировано' :
                           event.status === 'confirmed' ? 'Подтверждено' :
                           event.status === 'completed' ? 'Выполнено' : 'Отменено'}
                        </Badge>
                        <Badge colorScheme={getPriorityColor(event.priority)}>
                          {event.priority === 'urgent' ? 'Срочно' :
                           event.priority === 'high' ? 'Высокий' :
                           event.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </Badge>
                      </HStack>
                      
                      <Text fontWeight="medium">{event.title}</Text>
                      
                      {event.description && (
                        <Text fontSize="sm" color="gray.600">
                          {event.description}
                        </Text>
                      )}
                      
                      <Text fontSize="sm" color="gray.500">
                        Дата: {new Date(event.date).toLocaleDateString('ru-RU')}
                      </Text>
                    </VStack>
                    
                    <VStack align="end" spacing={2}>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={event.type === 'income' ? 'green.600' : 'red.600'}
                      >
                        ₽{event.amount.toLocaleString('ru-RU')}
                      </Text>
                      
                      <HStack spacing={2}>
                        <CanUpdate resource="finances">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(event)}
                          >
                            Изменить
                          </Button>
                        </CanUpdate>
                        
                        <CanDelete resource="finances">
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(event.id)}
                          >
                            Удалить
                          </Button>
                        </CanDelete>
                      </HStack>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))
          )}
        </VStack>
      </CanRead>

      {/* Модальное окно создания/редактирования */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingEventId ? 'Редактировать событие' : 'Добавить событие'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Тип события</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                  title="Тип события"
                  aria-label="Выберите тип события"
                >
                  <option value="income">Доход</option>
                  <option value="expense">Расход</option>
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Название</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Описание события"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Сумма (₽)</FormLabel>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Дата</FormLabel>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Описание</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Дополнительная информация"
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Статус</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PaymentEvent['status'] }))}
                  title="Статус события"
                  aria-label="Выберите статус события"
                >
                  <option value="planned">Запланировано</option>
                  <option value="confirmed">Подтверждено</option>
                  <option value="completed">Выполнено</option>
                  <option value="cancelled">Отменено</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Приоритет</FormLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as PaymentEvent['priority'] }))}
                  title="Приоритет события"
                  aria-label="Выберите приоритет события"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочно</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {editingEventId ? 'Сохранить' : 'Создать'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 