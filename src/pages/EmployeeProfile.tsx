import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUser, deleteUser } from "@/api/client";
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
  Select,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  Badge,
  Avatar,
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
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Flex,
  Spacer,
  Image
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  UserIcon, 
  Mail, 
  Phone, 
  MessageCircle, 
  Shirt, 
  FootprintsIcon, 
  Calendar,
  AlertTriangle,
  Key,
  Settings,
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  Award,
  MapPin,
  Briefcase,
  Users,
  Trash2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Home,
  UserCheck,
  FileText
} from "lucide-react";

const EmployeeProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isPhotoOpen, onOpen: onPhotoOpen, onClose: onPhotoClose } = useDisclosure();
  const { isOpen: isCredsOpen, onOpen: onCredsOpen, onClose: onCredsClose } = useDisclosure();
  const [creds, setCreds] = useState({ username: '', password: '' });
  
  // Состояние для фильтра месяцев
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });
  const user = users.find(u => u.id === Number(id));
  
  const [profileData, setProfileData] = useState({
    phone: '',
    email: '',
    username: '',
    clothing_size: '',
    shoe_size: '',
    age: '',
    bad_habits: '',
    department: '',
    hire_date: '',
    salary: '',
    position: ''
  });

  const [isActive, setIsActive] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Функция для получения названия месяца
  const getMonthName = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  // Функция для изменения месяца
  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month;
    
    if (direction === 'prev') {
      if (month === 1) {
        newMonth = 12;
        newYear = year - 1;
      } else {
        newMonth = month - 1;
      }
    } else {
      if (month === 12) {
        newMonth = 1;
        newYear = year + 1;
      } else {
        newMonth = month + 1;
      }
    }
    
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // Функция для генерации календаря
  const generateCalendar = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    
    // Создаем даты в локальном времени
    const firstDay = new Date(year, month - 1, 1, 12, 0, 0); // 12:00 для избежания проблем с DST
    const lastDay = new Date(year, month, 0, 12, 0, 0);
    
    // Начинаем с понедельника недели, в которой находится первое число месяца
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = воскресенье, 1 = понедельник
    startDate.setDate(startDate.getDate() - mondayOffset);
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Генерируем 6 недель (42 дня) для полного отображения календаря
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log('generateCalendar:', {
      yearMonth,
      firstDay: firstDay.toLocaleDateString('ru-RU'),
      lastDay: lastDay.toLocaleDateString('ru-RU'),
      startDate: startDate.toLocaleDateString('ru-RU'),
      daysCount: days.length,
      firstDayGenerated: days[0]?.toLocaleDateString('ru-RU'),
      lastDayGenerated: days[days.length - 1]?.toLocaleDateString('ru-RU'),
      // Показываем несколько первых дат для проверки
      sampleDates: days.slice(0, 10).map(d => d.toLocaleDateString('ru-RU'))
    });
    
    return days;
  };

  // Функция для определения типа дня
  const getDayType = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // Пример данных - в реальном приложении это будет из БД
    const workDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19, 20, 21, 22, 25, 26, 27, 28, 29];
    const isWorkDay = workDays.includes(day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Воскресенье или суббота
    const isToday = date.toDateString() === new Date().toDateString();
    
    return { isWorkDay, isWeekend, isToday };
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        phone: user.phone || '',
        email: user.email || '',
        username: user.username || '',
        clothing_size: user.clothing_size || '',
        shoe_size: user.shoe_size || '',
        age: user.age?.toString() || '',
        bad_habits: user.bad_habits || '',
        department: user.department || '',
        hire_date: user.hire_date || '',
        salary: user.salary?.toString() || '',
        position: user.position || ''
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Профиль обновлен', status: 'success' });
      onClose();
    },
    onError: () => {
      toast({ title: 'Ошибка обновления профиля', status: 'error' });
    }
  });

  const handleSave = () => {
    if (user) {
      // Отправляем только непустые поля или те, которые были изменены
      const cleanData = Object.fromEntries(
        Object.entries(profileData).filter(([key, value]) => {
          // Разрешаем пустые строки для очистки полей
          return value !== null && value !== undefined;
        })
      );
      
      console.log('EmployeeProfile: handleSave вызван с данными:', cleanData);
      updateMutation.mutate({ id: user.id, data: cleanData });
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const archiveMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsActive(false);
      onSettingsClose();
      toast({ title: 'Сотрудник перенесен в архив', status: 'success' });
    },
    onError: () => {
      toast({ title: 'Не удалось перенести в архив', status: 'error' });
    }
  });

  const handleDeactivate = () => {
    if (user) {
      archiveMutation.mutate(user.id);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile || !user) return;

    try {
      // Используем API функцию для загрузки фото
      const { uploadUserPhoto } = await import('@/api/client');
      const result = await uploadUserPhoto(user.id, photoFile);
      
      // Обновляем данные пользователя с новым URL фото
      updateMutation.mutate({ 
        id: user.id, 
        data: { photo_url: result.photoUrl } 
      });
      
      setPhotoFile(null);
      setPhotoPreview(null);
      onPhotoClose();
      toast({ title: 'Фото обновлено', status: 'success' });
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      toast({ 
        title: 'Ошибка загрузки фото', 
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        status: 'error' 
      });
    }
  };

  if (!user) {
    return (
      <Box className="bg-gray-50 min-h-screen p-6">
        <Text>Сотрудник не найден</Text>
      </Box>
    );
  }

  const calendarDays = generateCalendar(selectedMonth);

  return (
    <>
      <Helmet>
        <title>Профиль сотрудника | UgraBuilders</title>
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
                onClick={() => navigate('/people')}
              />
              <VStack align="start" spacing={1}>
                <Text className="text-2xl font-bold text-gray-800">
                  Профиль сотрудника
                </Text>
                <Text className="text-gray-600">
                  {user.full_name}
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={3}>
              <IconButton
                aria-label="Настройки"
                icon={<Settings size={16} />}
                variant="ghost"
                onClick={onSettingsOpen}
                className="text-gray-600 hover:text-gray-800"
              />
              <Button
                className="modern-button-secondary"
                size="sm"
                onClick={onCredsOpen}
              >
                Создать доступ
              </Button>
              <Button
                leftIcon={<Edit size={16} />}
                className="modern-button"
                size="sm"
                onClick={onOpen}
              >
                Редактировать
              </Button>
            </HStack>
          </HStack>
        </Box>

        <Grid templateColumns="400px 1fr" gap={8}>
          {/* Левая панель - основная информация */}
          <VStack spacing={6} align="stretch">
            {/* Карточка сотрудника */}
            <Card className="modern-card">
              <CardBody>
                <VStack spacing={6} align="center">
                  {/* Фото с возможностью изменения */}
                  <Box 
                    className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg"
                    position="relative"
                    cursor="pointer"
                    onClick={onPhotoOpen}
                    _hover={{
                      transform: "scale(1.05)",
                      transition: "all 0.2s",
                      boxShadow: "lg"
                    }}
                  >
                    <Image
                      src={user.photo_url || `https://i.pravatar.cc/300?img=${user.id}`}
                      alt={user.full_name}
                      w="full"
                      h="full"
                      objectFit="cover"
                    />
                    
                    {/* Overlay для изменения фото */}
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      bg="blackAlpha.400"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      opacity="0"
                      _hover={{ opacity: "1" }}
                      transition="opacity 0.2s"
                    >
                      <Edit size={20} color="white" />
                    </Box>
                  </Box>
                  
                  {/* Имя и статус */}
                  <VStack spacing={2} textAlign="center">
                    <Text fontSize="xl" fontWeight="700" color="gray.800">
                      {user.full_name}
                    </Text>
                    <Badge 
                      colorScheme={isActive ? "green" : "red"}
                      variant="solid"
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <Text fontSize="sm" color="gray.600" fontWeight="500">
                      {user.position || 'Должность не указана'}
                    </Text>
                  </VStack>
                  
                  <Divider />
                  
                  {/* Контактная информация */}
                  <VStack spacing={4} align="stretch" w="full">
                    <HStack spacing={3}>
                      <Phone size={16} color="#6b7280" />
                      <Text fontSize="sm" color="gray.700">
                        {profileData.phone || 'Не указан'}
                      </Text>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Mail size={16} color="#6b7280" />
                      <Text fontSize="sm" color="gray.700">
                        {profileData.email || 'Не указан'}
                      </Text>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <MessageCircle size={16} color="#6b7280" />
                      <Text fontSize="sm" color="gray.700">
                        @{profileData.username || 'Не указан'}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Правая панель - аналитика */}
          <VStack spacing={6} align="stretch">
            {/* Статистика */}
            <SimpleGrid columns={3} spacing={6}>
              <Box className="modern-stats-card">
                <HStack spacing={4}>
                  <Box className="modern-stats-icon">
                    <TrendingUp size={24} color="white" />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="3xl" fontWeight="700" color="gray.800">
                      85%
                    </Text>
                    <Text fontSize="sm" color="gray.600" fontWeight="500">
                      Эффективность
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box className="modern-stats-card">
                <HStack spacing={4}>
                  <Box className="modern-stats-icon">
                    <Clock size={24} color="white" />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="3xl" fontWeight="700" color="gray.800">
                      168ч
                    </Text>
                    <Text fontSize="sm" color="gray.600" fontWeight="500">
                      Отработано часов
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box className="modern-stats-card">
                <HStack spacing={4}>
                  <Box className="modern-stats-icon">
                    <DollarSign size={24} color="white" />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="3xl" fontWeight="700" color="gray.800">
                      45,000₽
                    </Text>
                    <Text fontSize="sm" color="gray.600" fontWeight="500">
                      Зарплата
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </SimpleGrid>

            {/* Дни работы - с фильтром по месяцам */}
            <Card className="modern-card">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Заголовок с навигацией по месяцам */}
                  <HStack justify="space-between" align="center">
                    <Heading size="md">Дни работы</Heading>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Предыдущий месяц"
                        icon={<ChevronLeft size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => changeMonth('prev')}
                      />
                      <Text fontSize="sm" color="gray.700" fontWeight="600" minW="120px" textAlign="center">
                        {getMonthName(selectedMonth)}
                      </Text>
                      <IconButton
                        aria-label="Следующий месяц"
                        icon={<ChevronRight size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => changeMonth('next')}
                      />
                    </HStack>
                  </HStack>
                  
                  {/* Дни недели */}
                  <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                      <Box
                        key={day}
                        textAlign="center"
                        fontSize="xs"
                        fontWeight="600"
                        color="gray.500"
                        py={1}
                        h="6"
                      >
                        {day}
                      </Box>
                    ))}
                  </Grid>
                  
                  {/* Календарь */}
                  <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                    {calendarDays.map((date, index) => {
                      const { isWorkDay, isWeekend, isToday } = getDayType(date);
                      const isCurrentMonth = date.getMonth() === parseInt(selectedMonth.split('-')[1]) - 1;
                      
                      return (
                        <Box
                          key={index}
                          h="8"
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="sm"
                          fontWeight="700"
                          cursor={isCurrentMonth ? "pointer" : "default"}
                          position="relative"
                          bg={
                            !isCurrentMonth ? "transparent" :
                            isToday ? "blue.500" :
                            isWorkDay ? "green.100" :
                            isWeekend ? "gray.50" : "gray.50"
                          }
                          color={
                            !isCurrentMonth ? "gray.300" :
                            isToday ? "white" :
                            isWorkDay ? "green.800" :
                            isWeekend ? "gray.500" : "gray.500"
                          }
                          _hover={isCurrentMonth ? {
                            bg: isToday ? "blue.600" : "gray.200",
                            transform: "scale(1.05)",
                            transition: "all 0.2s",
                            boxShadow: "sm"
                          } : {}}
                          onClick={() => {
                            if (isCurrentMonth) {
                              // Используем локальное время вместо UTC
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const dateStr = `${year}-${month}-${day}`;
                              
                              console.log('Клик по дате:', {
                                originalDate: date,
                                dateString: dateStr,
                                day: date.getDate(),
                                month: date.getMonth() + 1,
                                year: date.getFullYear(),
                                localTime: date.toLocaleString('ru-RU'),
                                utcTime: date.toISOString()
                              });
                              
                              navigate(`/people/${id}/daily/${dateStr}`);
                            }
                          }}
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="700"
                            lineHeight="1"
                          >
                            {date.getDate()}
                          </Text>
                        </Box>
                      );
                    })}
                  </Grid>
                  
                  {/* Легенда */}
                  <HStack spacing={4} justify="center" pt={2}>
                    <HStack spacing={2}>
                      <Box w="3" h="3" bg="green.100" borderRadius="sm" />
                      <Text fontSize="xs" color="gray.600">Рабочий день</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box w="3" h="3" bg="gray.50" borderRadius="sm" />
                      <Text fontSize="xs" color="gray.600">Выходной</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box w="3" h="3" bg="blue.500" borderRadius="sm" />
                      <Text fontSize="xs" color="gray.600">Сегодня</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Модули - обновленные согласно требованиям */}
            <Card className="modern-card">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Модули</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Box
                      className="modern-stats-card cursor-pointer"
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/finances?userId=${user.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/finances?userId=${user.id}`); }}
                    >
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <DollarSign size={24} color="white" />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="md" fontWeight="700" color="gray.800">Финансовый</Text>
                          <Text fontSize="sm" color="gray.600" fontWeight="500">Зарплата, авансы, бонусы</Text>
                        </VStack>
                      </HStack>
                    </Box>

                    <Box
                      className="modern-stats-card cursor-pointer"
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/household?userId=${user.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/household?userId=${user.id}`); }}
                    >
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <Home size={24} color="white" />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="md" fontWeight="700" color="gray.800">Бытовой</Text>
                          <Text fontSize="sm" color="gray.600" fontWeight="500">Проживание, питание</Text>
                        </VStack>
                      </HStack>
                    </Box>

                    <Box
                      className="modern-stats-card cursor-pointer"
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/equipment?userId=${user.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/equipment?userId=${user.id}`); }}
                    >
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <Package size={24} color="white" />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="md" fontWeight="700" color="gray.800">Принадлежности</Text>
                          <Text fontSize="sm" color="gray.600" fontWeight="500">Одежда, инструменты</Text>
                        </VStack>
                      </HStack>
                    </Box>

                    <Box
                      className="modern-stats-card cursor-pointer"
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/personal?userId=${user.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/personal?userId=${user.id}`); }}
                    >
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <UserCheck size={24} color="white" />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="md" fontWeight="700" color="gray.800">Личная информация</Text>
                          <Text fontSize="sm" color="gray.600" fontWeight="500">Документы, данные</Text>
                        </VStack>
                      </HStack>
                    </Box>

                    <Box
                      className="modern-stats-card cursor-pointer"
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/achievements?userId=${user.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/achievements?userId=${user.id}`); }}
                    >
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <Award size={24} color="white" />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="md" fontWeight="700" color="gray.800">Достижения</Text>
                          <Text fontSize="sm" color="gray.600" fontWeight="500">Бонусы, премии, награды</Text>
                        </VStack>
                      </HStack>
                    </Box>

                    <Box
                      className="modern-stats-card cursor-pointer"
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/documents?userId=${user.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/documents?userId=${user.id}`); }}
                    >
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <FileText size={24} color="white" />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="md" fontWeight="700" color="gray.800">Документы</Text>
                          <Text fontSize="sm" color="gray.600" fontWeight="500">Контракты, отчеты</Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Детальная информация */}
            <Card className="modern-card">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Детальная информация</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box className="modern-stats-card">
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <Calendar size={20} color="white" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.600" fontWeight="600">Возраст</Text>
                          <Text fontSize="md" fontWeight="700" color="gray.800">{profileData.age || '—'}</Text>
                        </VStack>
                      </HStack>
                    </Box>

                    <Box className="modern-stats-card">
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <Shirt size={20} color="white" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.600" fontWeight="600">Размер одежды</Text>
                          <Text fontSize="md" fontWeight="700" color="gray.800">{profileData.clothing_size || '—'}</Text>
                        </VStack>
                      </HStack>
                    </Box>

                    <Box className="modern-stats-card">
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <FootprintsIcon size={20} color="white" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.600" fontWeight="600">Размер обуви</Text>
                          <Text fontSize="md" fontWeight="700" color="gray.800">{profileData.shoe_size || '—'}</Text>
                        </VStack>
                      </HStack>
                    </Box>

                    <Box className="modern-stats-card">
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <Briefcase size={20} color="white" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.600" fontWeight="600">Отдел</Text>
                          <Text fontSize="md" fontWeight="700" color="gray.800">{profileData.department || '—'}</Text>
                        </VStack>
                      </HStack>
                    </Box>

                    <Box className="modern-stats-card">
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <Key size={20} color="white" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.600" fontWeight="600">Логин</Text>
                          <Text fontSize="md" fontWeight="700" color="gray.800">{profileData.username || '—'}</Text>
                        </VStack>
                      </HStack>
                    </Box>

                    <Box className="modern-stats-card">
                      <HStack spacing={4}>
                        <Box className="modern-stats-icon">
                          <AlertTriangle size={20} color="white" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.600" fontWeight="600">Вредные привычки</Text>
                          <Text fontSize="md" fontWeight="700" color="gray.800">{profileData.bad_habits || '—'}</Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>

        {/* Модальное окно редактирования */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Редактировать профиль</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="stretch">
                <VStack align="start" spacing={2}>
                  <Heading size="sm">Контакты</Heading>
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Телефон</FormLabel>
                      <Input 
                        value={profileData.phone} 
                        onChange={handleChange('phone')} 
                        placeholder="+7 (xxx) xxx-xx-xx" 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input 
                        type="email" 
                        value={profileData.email} 
                        onChange={handleChange('email')} 
                        placeholder="email@example.com" 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Telegram username</FormLabel>
                      <Input 
                        value={profileData.username} 
                        onChange={handleChange('username')} 
                        placeholder="username" 
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Heading size="sm">Профиль</Heading>
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Возраст</FormLabel>
                      <Input 
                        type="number" 
                        value={profileData.age} 
                        onChange={handleChange('age')} 
                        placeholder="25" 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel id="clothing_size_label" htmlFor="clothing_size">Размер одежды</FormLabel>
                      <Select id="clothing_size" aria-labelledby="clothing_size_label" aria-label="Размер одежды" value={profileData.clothing_size} onChange={handleChange('clothing_size')}>
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
                        value={profileData.shoe_size} 
                        onChange={handleChange('shoe_size')} 
                        placeholder="42" 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Вредные привычки</FormLabel>
                      <Input 
                        value={profileData.bad_habits} 
                        onChange={handleChange('bad_habits')} 
                        placeholder="Курение, алкоголь..." 
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Heading size="sm">Работа</Heading>
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Отдел</FormLabel>
                      <Input 
                        value={profileData.department} 
                        onChange={handleChange('department')} 
                        placeholder="Отдел" 
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Должность</FormLabel>
                      <Input 
                        value={profileData.position}
                        onChange={handleChange('position')}
                        placeholder="Монтажник, электрик, сварщик..." 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Дата приема</FormLabel>
                      <Input 
                        type="date" 
                        value={profileData.hire_date} 
                        onChange={handleChange('hire_date')} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Зарплата</FormLabel>
                      <Input 
                        type="number" 
                        value={profileData.salary} 
                        onChange={handleChange('salary')} 
                        placeholder="50000" 
                      />
                    </FormControl>
                  </SimpleGrid>
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

        {/* Модальное окно настроек */}
        <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Настройки сотрудника</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  Управление статусом сотрудника
                </Text>
                
                <Box p={4} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200">
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={3}>
                      <Archive size={16} color="#e53e3e" />
                      <Text fontSize="sm" fontWeight="600" color="red.700">
                        Деактивировать сотрудника
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="red.600">
                      Сотрудник будет убран из активного списка, но данные сохранятся в базе
                    </Text>
                    <Button
                      leftIcon={<Trash2 size={14} />}
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      onClick={handleDeactivate}
                    >
                      Деактивировать
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onSettingsClose}>
                Закрыть
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Модальное окно загрузки фото */}
        <Modal isOpen={isPhotoOpen} onClose={onPhotoClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Изменить фото сотрудника</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="stretch">
                {/* Текущее фото */}
                <VStack spacing={3}>
                  <Text fontSize="sm" color="gray.600">Текущее фото:</Text>
                  <Box w="32" h="32" borderRadius="xl" overflow="hidden" border="2px solid" borderColor="gray.200">
                    <Image
                      src={user?.photo_url || `https://i.pravatar.cc/300?img=${user?.id}`}
                      alt={user?.full_name}
                      w="full"
                      h="full"
                      objectFit="cover"
                    />
                  </Box>
                </VStack>

                {/* Загрузка нового фото */}
                <VStack spacing={3}>
                  <Text fontSize="sm" color="gray.600">Выберите новое фото:</Text>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    p={1}
                  />
                </VStack>

                {/* Превью нового фото */}
                {photoPreview && (
                  <VStack spacing={3}>
                    <Text fontSize="sm" color="gray.600">Превью:</Text>
                    <Box w="32" h="32" borderRadius="xl" overflow="hidden" border="2px solid" borderColor="blue.200">
                      <Image
                        src={photoPreview}
                        alt="Превью"
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    </Box>
                  </VStack>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onPhotoClose}>
                  Отмена
                </Button>
                <Button
                  className="modern-button"
                  onClick={handlePhotoUpload}
                  isDisabled={!photoFile}
                  isLoading={updateMutation.isPending}
                >
                  Загрузить фото
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Модалка: создать доступ */}
        <Modal isOpen={isCredsOpen} onClose={onCredsClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Создать доступ для сотрудника</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Логин</FormLabel>
                  <Input value={creds.username} onChange={(e)=>setCreds(prev=>({...prev, username: e.target.value}))} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Первичный пароль</FormLabel>
                  <Input type="password" value={creds.password} onChange={(e)=>setCreds(prev=>({...prev, password: e.target.value}))} />
                </FormControl>
                <Text fontSize="sm" color="gray.600">Сотрудник при первом входе будет обязан сменить пароль. Текущий пароль сохраняется до смены.</Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onCredsClose}>Отмена</Button>
                <Button className="modern-button" onClick={async ()=>{
                  if (!user) return;
                  try {
                    const { createAuthUser } = await import('@/api/client');
                    await createAuthUser({ user_id: user.id, username: creds.username, password: creds.password, role: user.role || 'employee' });
                    toast({ title: 'Доступ создан', status: 'success' });
                    onCredsClose();
                  } catch (e) {
                    toast({ title: 'Ошибка создания доступа', status: 'error' });
                  }
                }}>Создать</Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default EmployeeProfile; 