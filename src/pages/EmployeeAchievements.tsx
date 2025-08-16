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
  Progress,
  Avatar,
  Flex,
  Spacer
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Award, 
  Trophy,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  Minus,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag,
  Eye,
  Copy,
  Trash2,
  Upload,
  Target,
  Zap,
  Gift
} from "lucide-react";

interface Achievement {
  id: number;
  type: 'bonus' | 'premium' | 'award' | 'recognition' | 'certificate';
  title: string;
  description: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  category: 'performance' | 'safety' | 'innovation' | 'loyalty' | 'special';
  reason: string;
  approvedBy?: string;
  approvedDate?: string;
}

const EmployeeAchievements = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });
  const user = users.find(u => u.id === Number(userId));
  
  const [achievementData, setAchievementData] = useState({
    totalBonuses: 0,
    totalPremiums: 0,
    totalAwards: 0,
    performanceRating: 0,
    safetyRating: 0,
    innovationRating: 0
  });

  // Моковые данные достижений
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      type: 'bonus',
      title: 'Бонус за качественную работу',
      description: 'Выплачен бонус за высокое качество выполненных работ в марте 2024',
      amount: 15000,
      date: '2024-03-25',
      status: 'paid',
      category: 'performance',
      reason: 'Выполнение плана на 120%, высокое качество работ',
      approvedBy: 'Иванов И.И.',
      approvedDate: '2024-03-20'
    },
    {
      id: 2,
      type: 'premium',
      title: 'Премия за безопасность',
      description: 'Премия за соблюдение всех норм безопасности в течение квартала',
      amount: 8000,
      date: '2024-03-30',
      status: 'approved',
      category: 'safety',
      reason: 'Отсутствие нарушений техники безопасности',
      approvedBy: 'Петров П.П.',
      approvedDate: '2024-03-28'
    },
    {
      id: 3,
      type: 'award',
      title: 'Лучший сотрудник месяца',
      description: 'Награда за выдающиеся достижения в работе',
      amount: 5000,
      date: '2024-03-01',
      status: 'paid',
      category: 'performance',
      reason: 'Высокие показатели эффективности',
      approvedBy: 'Сидоров С.С.',
      approvedDate: '2024-02-28'
    },
    {
      id: 4,
      type: 'recognition',
      title: 'Благодарность за инновации',
      description: 'Признание за предложение по улучшению рабочих процессов',
      amount: 3000,
      date: '2024-03-15',
      status: 'pending',
      category: 'innovation',
      reason: 'Внедрение новой методики работы'
    },
    {
      id: 5,
      type: 'certificate',
      title: 'Сертификат специалиста',
      description: 'Получение сертификата по новым технологиям',
      amount: 0,
      date: '2024-03-10',
      status: 'approved',
      category: 'special',
      reason: 'Успешное прохождение обучения'
    }
  ]);

  const [newAchievement, setNewAchievement] = useState({
    type: 'bonus' as Achievement['type'],
    title: '',
    description: '',
    amount: '',
    date: '',
    status: 'pending' as Achievement['status'],
    category: 'performance' as Achievement['category'],
    reason: ''
  });

  useEffect(() => {
    if (user) {
      const totalBonuses = achievements
        .filter(a => a.type === 'bonus' && a.status === 'paid')
        .reduce((sum, a) => sum + a.amount, 0);
      
      const totalPremiums = achievements
        .filter(a => a.type === 'premium' && a.status === 'paid')
        .reduce((sum, a) => sum + a.amount, 0);
      
      const totalAwards = achievements
        .filter(a => a.type === 'award' && a.status === 'paid')
        .reduce((sum, a) => sum + a.amount, 0);

      setAchievementData({
        totalBonuses,
        totalPremiums,
        totalAwards,
        performanceRating: 85,
        safetyRating: 95,
        innovationRating: 70
      });
    }
  }, [user, achievements]);

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

  const handleAddAchievement = () => {
    if (!newAchievement.title || !newAchievement.amount || !newAchievement.date || !newAchievement.reason) {
      toast({ title: 'Заполните все обязательные поля', status: 'error' });
      return;
    }

    const achievement: Achievement = {
      id: Date.now(),
      type: newAchievement.type,
      title: newAchievement.title,
      description: newAchievement.description,
      amount: parseFloat(newAchievement.amount),
      date: newAchievement.date,
      status: newAchievement.status,
      category: newAchievement.category,
      reason: newAchievement.reason
    };

    setAchievements(prev => [achievement, ...prev]);
    setNewAchievement({
      type: 'bonus',
      title: '',
      description: '',
      amount: '',
      date: '',
      status: 'pending',
      category: 'performance',
      reason: ''
    });
    onAddClose();
    toast({ title: 'Достижение добавлено', status: 'success' });
  };

  const getTypeLabel = (type: Achievement['type']) => {
    switch (type) {
      case 'bonus': return 'Бонус';
      case 'premium': return 'Премия';
      case 'award': return 'Награда';
      case 'recognition': return 'Признание';
      case 'certificate': return 'Сертификат';
      default: return type;
    }
  };

  const getTypeColor = (type: Achievement['type']) => {
    switch (type) {
      case 'bonus': return 'green';
      case 'premium': return 'blue';
      case 'award': return 'purple';
      case 'recognition': return 'orange';
      case 'certificate': return 'teal';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: Achievement['status']) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'blue';
      case 'paid': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: Achievement['status']) => {
    switch (status) {
      case 'pending': return 'В ожидании';
      case 'approved': return 'Одобрено';
      case 'paid': return 'Выплачено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getCategoryLabel = (category: Achievement['category']) => {
    switch (category) {
      case 'performance': return 'Производительность';
      case 'safety': return 'Безопасность';
      case 'innovation': return 'Инновации';
      case 'loyalty': return 'Преданность';
      case 'special': return 'Особые заслуги';
      default: return category;
    }
  };

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'performance': return 'green';
      case 'safety': return 'blue';
      case 'innovation': return 'purple';
      case 'loyalty': return 'orange';
      case 'special': return 'teal';
      default: return 'gray';
    }
  };

  const totalEarned = achievements
    .filter(a => a.status === 'paid')
    .reduce((sum, a) => sum + a.amount, 0);

  const pendingAmount = achievements
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  const approvedAmount = achievements
    .filter(a => a.status === 'approved')
    .reduce((sum, a) => sum + a.amount, 0);

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
        <title>Достижения | UgraBuilders</title>
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
                  Достижения
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
                Добавить достижение
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
                    {totalEarned.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Заработано
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
                    {pendingAmount.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    В ожидании
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
                    {approvedAmount.toLocaleString()}₽
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Одобрено
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <Award size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {achievements.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Всего достижений
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </SimpleGrid>

          {/* Рейтинги */}
          <Card className="modern-card">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Рейтинги и показатели</Heading>
                
                <SimpleGrid columns={3} spacing={6}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="600" color="gray.700">Производительность</Text>
                      <Text fontSize="sm" fontWeight="700" color="gray.800">{achievementData.performanceRating}%</Text>
                    </HStack>
                    <Progress value={achievementData.performanceRating} colorScheme="green" size="lg" borderRadius="full" />
                  </VStack>
                  
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="600" color="gray.700">Безопасность</Text>
                      <Text fontSize="sm" fontWeight="700" color="gray.800">{achievementData.safetyRating}%</Text>
                    </HStack>
                    <Progress value={achievementData.safetyRating} colorScheme="blue" size="lg" borderRadius="full" />
                  </VStack>
                  
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="600" color="gray.700">Инновации</Text>
                      <Text fontSize="sm" fontWeight="700" color="gray.800">{achievementData.innovationRating}%</Text>
                    </HStack>
                    <Progress value={achievementData.innovationRating} colorScheme="purple" size="lg" borderRadius="full" />
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Таблица достижений */}
          <Card className="modern-card">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md">История достижений</Heading>
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
                        <Th>Название</Th>
                        <Th>Категория</Th>
                        <Th>Причина</Th>
                        <Th isNumeric>Сумма</Th>
                        <Th>Статус</Th>
                        <Th>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {achievements.map((achievement) => (
                        <Tr key={achievement.id}>
                          <Td>{new Date(achievement.date).toLocaleDateString('ru-RU')}</Td>
                          <Td>
                            <Badge colorScheme={getTypeColor(achievement.type)} variant="subtle">
                              {getTypeLabel(achievement.type)}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="600">{achievement.title}</Text>
                              <Text fontSize="sm" color="gray.600">{achievement.description}</Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={getCategoryColor(achievement.category)} variant="subtle">
                              {getCategoryLabel(achievement.category)}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.700">{achievement.reason}</Text>
                          </Td>
                          <Td isNumeric>
                            <Text fontWeight="600" color="green.600">
                              {achievement.amount > 0 ? `${achievement.amount.toLocaleString()}₽` : '—'}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(achievement.status)} variant="subtle">
                              {getStatusLabel(achievement.status)}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Просмотр"
                                icon={<Eye size={14} />}
                                size="sm"
                                variant="ghost"
                              />
                              <IconButton
                                aria-label="Редактировать"
                                icon={<Edit size={14} />}
                                size="sm"
                                variant="ghost"
                              />
                              <IconButton
                                aria-label="Копировать"
                                icon={<Copy size={14} />}
                                size="sm"
                                variant="ghost"
                              />
                              <IconButton
                                aria-label="Удалить"
                                icon={<Trash2 size={14} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
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

        {/* Модальное окно добавления достижения */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Добавить достижение</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Тип достижения</FormLabel>
                  <Select value={newAchievement.type} onChange={(e) => setNewAchievement(prev => ({ ...prev, type: e.target.value as Achievement['type'] }))}>
                    <option value="bonus">Бонус</option>
                    <option value="premium">Премия</option>
                    <option value="award">Награда</option>
                    <option value="recognition">Признание</option>
                    <option value="certificate">Сертификат</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Название</FormLabel>
                  <Input 
                    value={newAchievement.title} 
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="Название достижения"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <Textarea 
                    value={newAchievement.description} 
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))} 
                    placeholder="Подробное описание достижения"
                    rows={2}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Сумма (₽)</FormLabel>
                  <NumberInput value={newAchievement.amount} onChange={(value) => setNewAchievement(prev => ({ ...prev, amount: value }))}>
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
                    value={newAchievement.date} 
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, date: e.target.value }))} 
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Категория</FormLabel>
                  <Select value={newAchievement.category} onChange={(e) => setNewAchievement(prev => ({ ...prev, category: e.target.value as Achievement['category'] }))}>
                    <option value="performance">Производительность</option>
                    <option value="safety">Безопасность</option>
                    <option value="innovation">Инновации</option>
                    <option value="loyalty">Преданность</option>
                    <option value="special">Особые заслуги</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Причина</FormLabel>
                  <Textarea 
                    value={newAchievement.reason} 
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, reason: e.target.value }))} 
                    placeholder="Причина награждения"
                    rows={2}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Статус</FormLabel>
                  <Select value={newAchievement.status} onChange={(e) => setNewAchievement(prev => ({ ...prev, status: e.target.value as Achievement['status'] }))}>
                    <option value="pending">В ожидании</option>
                    <option value="approved">Одобрено</option>
                    <option value="paid">Выплачено</option>
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
                  onClick={handleAddAchievement}
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

export default EmployeeAchievements; 