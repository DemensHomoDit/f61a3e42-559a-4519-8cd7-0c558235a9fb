import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDailyStats } from '@/api/client';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Badge,
  IconButton,
  Divider,
  List,
  ListItem,
  ListIcon,
  SimpleGrid,
  CircularProgress,
  CircularProgressLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Coffee,
  Cigarette,
  Wrench,
  FileText,
  TrendingUp,
  User,
  MapPin,
  Calendar,
  Loader
} from 'lucide-react';

interface DailyStats {
  date: string;
  workHours: number;
  plannedHours: number;
  earnings: number;
  overtime: number;
  idleTime: number;
  smokeBreaks: number;
  efficiency: number;
  equipment: {
    name: string;
    status: string;
    hours: number;
  }[];
  materials: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  tasks: {
    id: number;
    title: string;
    status: string;
    timeSpent: number;
  }[];
  techCards: {
    id: number;
    name: string;
    completionRate: number;
  }[];
}

const DailySummary: React.FC = () => {
  const { userId, date } = useParams<{ userId: string; date: string }>();
  const navigate = useNavigate();

  // Получаем реальные данные через API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['dailyStats', userId, date],
    queryFn: () => getDailyStats(Number(userId), date || ''),
    enabled: !!userId && !!date,
  });

  if (isLoading) {
    return (
      <Box p={6} bg="gray.50" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Loader size={40} className="animate-spin" />
          <Text>Загрузка дневной статистики...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !apiData) {
    return (
      <Box p={6} bg="gray.50" minH="100vh">
        <VStack spacing={4}>
          <HStack spacing={4}>
            <IconButton
              aria-label="Назад"
              icon={<ArrowLeft size={20} />}
              onClick={() => navigate(-1)}
              variant="ghost"
            />
            <Heading size="lg" color="red.500">Ошибка загрузки данных</Heading>
          </HStack>
          <Text color="gray.600">
            Не удалось загрузить статистику за {date}. {error?.message}
          </Text>
        </VStack>
      </Box>
    );
  }

  // Преобразуем данные API в нужный формат
  const workStats = apiData.work_stats || {};
  const user = apiData.user || {};
  const tasks = apiData.tasks || [];
  const materials = apiData.materials || {};
  const finances = apiData.finances || {};
  const household = apiData.household || {};
  const personal = apiData.personal || {};
  const objects = apiData.objects || [];
  const tools = apiData.tools || [];
  const timeTracking = apiData.time_tracking || [];

  const dailyStats = {
    date: apiData.date || date || '',
    workHours: workStats.worked_hours || 0,
    plannedHours: workStats.planned_hours || 8,
    earnings: workStats.daily_earnings || 0,
    overtime: workStats.overtime || 0,
    idleTime: workStats.idle_time || 0,
    smokeBreaks: workStats.smoke_breaks || 0,
    efficiency: workStats.efficiency || 0,
    checkInTime: workStats.check_in_time,
    checkOutTime: workStats.check_out_time,
    tasks: tasks.map((task: any) => ({
      id: task.id,
      title: task.title || 'Без названия',
      status: task.status === 'completed' ? 'Завершено' : 
              task.status === 'in_progress' ? 'В процессе' : 
              task.status === 'pending' ? 'Ожидает' : 'Неизвестно',
      timeSpent: task.status === 'completed' ? 1.5 : 
                 task.status === 'in_progress' ? 0.5 : 0
    })),
    materials: (materials.consumption || []).map((item: any) => ({
      name: item.item_name || 'Неизвестный материал',
      quantity: item.quantity || 0,
      unit: item.unit || 'шт'
    })),
    tools: tools.map((tool: any) => ({
      name: tool.tool_name || 'Неизвестный инструмент',
      type: tool.tool_type || 'Инструмент',
      serialNumber: tool.serial_number,
      assignedDate: tool.assigned_date,
      condition: tool.condition_out || 'Хорошее'
    })),
    equipment: [], // Устаревшее поле
    techCards: [] // Пока нет данных в API
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'green';
    if (efficiency >= 75) return 'yellow';
    return 'red';
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Завершено': return 'green';
      case 'В процессе': return 'blue';
      case 'Приостановлено': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Заголовок */}
        <HStack spacing={4}>
          <IconButton
            aria-label="Назад"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate(-1)}
            variant="ghost"
          />
          <VStack align="start" spacing={1}>
            <Heading size="lg">Сводка за день</Heading>
            <Text color="gray.600" fontSize="lg">
              {formatDate(dailyStats.date)}
            </Text>
          </VStack>
        </HStack>

        {/* Основная статистика */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">
                  <HStack>
                    <Clock size={16} />
                    <Text>Отработано часов</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="2xl">
                  {dailyStats.workHours}ч
                </StatNumber>
                <StatHelpText>
                  из {dailyStats.plannedHours}ч планового времени
                  {dailyStats.checkInTime && (
                    <Text fontSize="xs" color="gray.500">
                      Пришел: {dailyStats.checkInTime}
                      {dailyStats.checkOutTime && ` | Ушел: ${dailyStats.checkOutTime}`}
                    </Text>
                  )}
                </StatHelpText>
                <Progress
                  value={(dailyStats.workHours / dailyStats.plannedHours) * 100}
                  colorScheme="blue"
                  size="sm"
                  mt={2}
                />
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">
                  <HStack>
                    <DollarSign size={16} />
                    <Text>Заработано</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="2xl" color="green.500">
                  {dailyStats.earnings.toLocaleString('ru-RU')}₽
                </StatNumber>
                <StatHelpText>
                  {dailyStats.overtime > 0 && `+${dailyStats.overtime}ч сверхурочно`}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">
                  <HStack>
                    <TrendingUp size={16} />
                    <Text>Эффективность</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="2xl">
                  <CircularProgress
                    value={dailyStats.efficiency}
                    color={getEfficiencyColor(dailyStats.efficiency)}
                    size="60px"
                  >
                    <CircularProgressLabel fontSize="sm">
                      {dailyStats.efficiency}%
                    </CircularProgressLabel>
                  </CircularProgress>
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Stat>
                  <StatLabel color="gray.600">
                    <HStack>
                      <Coffee size={16} />
                      <Text>Простой</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="lg">
                    {dailyStats.idleTime}ч
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="gray.600">
                    <HStack>
                      <Cigarette size={16} />
                      <Text>Перекуры</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="lg">
                    {dailyStats.smokeBreaks}
                  </StatNumber>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

                  {/* Детальная информация */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
          
          {/* Бытовые условия */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack>
                  <User size={20} />
                  <Text>Бытовые условия</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Box p={3} bg="gray.50" rounded="md">
                  <Text fontWeight="medium" fontSize="sm" mb={1}>Проживание</Text>
                  <Text fontSize="sm" color="gray.600">
                    {household.accommodation_type || 'Не указано'}
                    {household.accommodation_address && ` - ${household.accommodation_address}`}
                    {household.room_number && `, комната ${household.room_number}`}
                  </Text>
                </Box>
                
                <HStack spacing={4}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium">Питание</Text>
                    <Badge colorScheme={household.meals_included ? 'green' : 'gray'}>
                      {household.meals_included ? 'Включено' : 'Не включено'}
                    </Badge>
                  </VStack>
                  
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium">Транспорт</Text>
                    <Badge colorScheme={household.transport_provided ? 'green' : 'gray'}>
                      {household.transport_provided ? household.transport_type || 'Предоставляется' : 'Не предоставляется'}
                    </Badge>
                  </VStack>
                </HStack>
                
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">Коммунальные услуги</Text>
                  <Badge colorScheme={household.utilities_included ? 'green' : 'gray'}>
                    {household.utilities_included ? 'Включены' : 'Не включены'}
                  </Badge>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Личные данные и принадлежности */}
          <Card>
            <CardHeader>
              <Heading size="md">Личная информация</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">Должность:</Text>
                  <Text fontSize="sm" color="gray.600">{personal.position || 'Не указано'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">Отдел:</Text>
                  <Text fontSize="sm" color="gray.600">{personal.department || 'Не указано'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">Возраст:</Text>
                  <Text fontSize="sm" color="gray.600">{personal.age ? `${personal.age} лет` : 'Не указано'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">Размер одежды:</Text>
                  <Text fontSize="sm" color="gray.600">{personal.clothing_size || 'Не указано'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">Размер обуви:</Text>
                  <Text fontSize="sm" color="gray.600">{personal.shoe_size || 'Не указано'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">Статус:</Text>
                  <Badge colorScheme={personal.status === 'active' ? 'green' : 'gray'}>
                    {personal.status === 'active' ? 'Активен' : personal.status || 'Неизвестно'}
                  </Badge>
                </HStack>
                
                {personal.bad_habits && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Вредные привычки:</Text>
                    <Text fontSize="sm" color="gray.600">{personal.bad_habits}</Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Финансы за день */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack>
                  <DollarSign size={20} />
                  <Text>Финансовая информация</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontWeight="medium">Дневной заработок:</Text>
                  <Text color="green.500" fontWeight="bold">
                    {finances.daily_earnings ? `${finances.daily_earnings.toLocaleString('ru-RU')}₽` : '0₽'}
                  </Text>
                </HStack>
                
                {finances.salary && finances.salary.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Зарплата за месяц:</Text>
                    {finances.salary.map((sal: any, index: number) => (
                      <HStack key={index} justify="space-between" p={2} bg="gray.50" rounded="md">
                        <Text fontSize="sm">{sal.month}/{sal.year}</Text>
                        <VStack align="end" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {sal.amount ? `${sal.amount.toLocaleString('ru-RU')}₽` : '0₽'}
                          </Text>
                          <Badge colorScheme={sal.paid ? 'green' : 'orange'} size="sm">
                            {sal.paid ? 'Выплачено' : 'Не выплачено'}
                          </Badge>
                        </VStack>
                      </HStack>
                    ))}
                  </Box>
                )}
                
                {finances.expenses && finances.expenses.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Расходы:</Text>
                    {finances.expenses.map((expense: any, index: number) => (
                      <HStack key={index} justify="space-between" p={2} bg="red.50" rounded="md">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">{expense.category || 'Прочее'}</Text>
                          <Text fontSize="xs" color="gray.600">{expense.description}</Text>
                        </VStack>
                        <Text fontSize="sm" color="red.500">
                          -{expense.amount ? `${expense.amount.toLocaleString('ru-RU')}₽` : '0₽'}
                        </Text>
                      </HStack>
                    ))}
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Объекты работы */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack>
                  <MapPin size={20} />
                  <Text>Объекты работы</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                {objects.length > 0 ? objects.map((object: any) => (
                  <Box key={object.id} p={3} bg="gray.50" rounded="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium" fontSize="sm">{object.name}</Text>
                      <Badge colorScheme={object.status === 'active' ? 'green' : 'gray'}>
                        {object.status === 'active' ? 'Активный' : object.status}
                      </Badge>
                    </HStack>
                    {object.description && (
                      <Text fontSize="sm" color="gray.600" mb={2}>{object.description}</Text>
                    )}
                    {object.address && (
                      <Text fontSize="xs" color="gray.500">{object.address}</Text>
                    )}
                    {object.budget && (
                      <Text fontSize="xs" color="blue.600">
                        Бюджет: {object.budget.toLocaleString('ru-RU')}₽
                      </Text>
                    )}
                  </Box>
                )) : (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Нет назначенных объектов
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
          {/* Выполненные задачи */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack>
                  <FileText size={20} />
                  <Text>Выполненные задачи</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                {dailyStats.tasks.map((task) => (
                  <Box key={task.id} p={3} bg="gray.50" rounded="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium" fontSize="sm">
                        {task.title}
                      </Text>
                      <Badge colorScheme={getTaskStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Время: {task.timeSpent}ч
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Инструменты */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack>
                  <Wrench size={20} />
                  <Text>Инструменты на руках</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                {dailyStats.tools.length > 0 ? dailyStats.tools.map((tool, index) => (
                  <Box key={index} p={3} bg="gray.50" rounded="md">
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        {tool.name}
                      </Text>
                      <Badge colorScheme="blue">{tool.type}</Badge>
                    </HStack>
                    <VStack align="start" spacing={1}>
                      {tool.serialNumber && (
                        <Text fontSize="xs" color="gray.600">
                          S/N: {tool.serialNumber}
                        </Text>
                      )}
                      <Text fontSize="xs" color="gray.600">
                        Выдан: {new Date(tool.assignedDate).toLocaleDateString('ru-RU')}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Состояние: {tool.condition}
                      </Text>
                    </VStack>
                  </Box>
                )) : (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Нет инструментов на руках
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Расходные материалы */}
          <Card>
            <CardHeader>
              <Heading size="md">Выданные материалы</Heading>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Материал</Th>
                      <Th isNumeric>Количество</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dailyStats.materials.map((material, index) => (
                      <Tr key={index}>
                        <Td fontSize="sm">{material.name}</Td>
                        <Td isNumeric fontSize="sm">
                          {material.quantity} {material.unit}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>

          {/* Технологические карты */}
          <Card>
            <CardHeader>
              <Heading size="md">Технологические карты</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                {dailyStats.techCards.map((card) => (
                  <Box key={card.id} p={3} bg="gray.50" rounded="md">
                    <Text fontWeight="medium" fontSize="sm" mb={2}>
                      {card.name}
                    </Text>
                    <HStack>
                      <Progress
                        value={card.completionRate}
                        colorScheme={card.completionRate === 100 ? 'green' : 'blue'}
                        size="sm"
                        flex={1}
                      />
                      <Text fontSize="sm" color="gray.600" minW="40px">
                        {card.completionRate}%
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
};

export default DailySummary;
