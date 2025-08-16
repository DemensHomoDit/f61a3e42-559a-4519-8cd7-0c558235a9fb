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
  Avatar
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  UserCheck, 
  FileText,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
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
  Upload
} from "lucide-react";

interface PersonalDocument {
  id: number;
  type: 'passport' | 'snils' | 'inn' | 'medical' | 'contract' | 'other';
  name: string;
  number: string;
  issueDate: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'pending' | 'missing';
  fileUrl?: string;
  description?: string;
}

const EmployeePersonal = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });
  const user = users.find(u => u.id === Number(userId));
  
  const [personalData, setPersonalData] = useState({
    fullName: '',
    birthDate: '',
    birthPlace: '',
    citizenship: '',
    passportSeries: '',
    passportNumber: '',
    passportIssueDate: '',
    passportIssuedBy: '',
    snils: '',
    inn: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  // Моковые данные документов
  const [documents, setDocuments] = useState<PersonalDocument[]>([
    {
      id: 1,
      type: 'passport',
      name: 'Паспорт РФ',
      number: '1234 567890',
      issueDate: '2020-01-15',
      expiryDate: '2030-01-15',
      status: 'valid',
      description: 'Основной документ, удостоверяющий личность'
    },
    {
      id: 2,
      type: 'snils',
      name: 'СНИЛС',
      number: '123-456-789 01',
      issueDate: '2015-03-20',
      status: 'valid',
      description: 'Страховой номер индивидуального лицевого счета'
    },
    {
      id: 3,
      type: 'inn',
      name: 'ИНН',
      number: '123456789012',
      issueDate: '2015-03-20',
      status: 'valid',
      description: 'Идентификационный номер налогоплательщика'
    },
    {
      id: 4,
      type: 'medical',
      name: 'Медицинская книжка',
      number: 'МК-123456',
      issueDate: '2024-01-10',
      expiryDate: '2025-01-10',
      status: 'valid',
      description: 'Медицинская книжка с допуском к работе'
    },
    {
      id: 5,
      type: 'contract',
      name: 'Трудовой договор',
      number: 'ТД-2024-001',
      issueDate: '2024-01-15',
      status: 'valid',
      description: 'Трудовой договор с компанией'
    }
  ]);

  const [newDocument, setNewDocument] = useState({
    type: 'passport' as PersonalDocument['type'],
    name: '',
    number: '',
    issueDate: '',
    expiryDate: '',
    status: 'valid' as PersonalDocument['status'],
    description: ''
  });

  useEffect(() => {
    if (user) {
      setPersonalData({
        fullName: user.full_name || '',
        birthDate: '1990-01-01', // Моковые данные
        birthPlace: 'г. Москва',
        citizenship: 'Российская Федерация',
        passportSeries: '1234',
        passportNumber: '567890',
        passportIssueDate: '2020-01-15',
        passportIssuedBy: 'УФМС России по г. Москве',
        snils: '123-456-789 01',
        inn: '123456789012',
        address: 'г. Москва, ул. Примерная, д. 1, кв. 1',
        emergencyContact: 'Иванова Мария Петровна',
        emergencyPhone: '+7 (999) 123-45-67'
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
          full_name: personalData.fullName,
          birth_date: personalData.birthDate,
          birth_place: personalData.birthPlace,
          citizenship: personalData.citizenship,
          passport_series: personalData.passportSeries,
          passport_number: personalData.passportNumber,
          passport_issue_date: personalData.passportIssueDate,
          passport_issued_by: personalData.passportIssuedBy,
          snils: personalData.snils,
          inn: personalData.inn,
          address: personalData.address,
          emergency_contact: personalData.emergencyContact,
          emergency_phone: personalData.emergencyPhone
        } 
      });
    }
  };

  const handleAddDocument = () => {
    if (!newDocument.name || !newDocument.number || !newDocument.issueDate) {
      toast({ title: 'Заполните все обязательные поля', status: 'error' });
      return;
    }

    const document: PersonalDocument = {
      id: Date.now(),
      type: newDocument.type,
      name: newDocument.name,
      number: newDocument.number,
      issueDate: newDocument.issueDate,
      expiryDate: newDocument.expiryDate || undefined,
      status: newDocument.status,
      description: newDocument.description || undefined
    };

    setDocuments(prev => [document, ...prev]);
    setNewDocument({
      type: 'passport',
      name: '',
      number: '',
      issueDate: '',
      expiryDate: '',
      status: 'valid',
      description: ''
    });
    onAddClose();
    toast({ title: 'Документ добавлен', status: 'success' });
  };

  const getTypeLabel = (type: PersonalDocument['type']) => {
    switch (type) {
      case 'passport': return 'Паспорт';
      case 'snils': return 'СНИЛС';
      case 'inn': return 'ИНН';
      case 'medical': return 'Мед. книжка';
      case 'contract': return 'Договор';
      case 'other': return 'Прочее';
      default: return type;
    }
  };

  const getTypeColor = (type: PersonalDocument['type']) => {
    switch (type) {
      case 'passport': return 'blue';
      case 'snils': return 'green';
      case 'inn': return 'purple';
      case 'medical': return 'orange';
      case 'contract': return 'teal';
      case 'other': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: PersonalDocument['status']) => {
    switch (status) {
      case 'valid': return 'green';
      case 'expired': return 'red';
      case 'pending': return 'yellow';
      case 'missing': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: PersonalDocument['status']) => {
    switch (status) {
      case 'valid': return 'Действителен';
      case 'expired': return 'Истек';
      case 'pending': return 'В обработке';
      case 'missing': return 'Отсутствует';
      default: return status;
    }
  };

  const validDocuments = documents.filter(d => d.status === 'valid').length;
  const expiredDocuments = documents.filter(d => d.status === 'expired').length;
  const pendingDocuments = documents.filter(d => d.status === 'pending').length;
  const missingDocuments = documents.filter(d => d.status === 'missing').length;

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
        <title>Личная информация | UgraBuilders</title>
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
                  Личная информация
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
                Добавить документ
              </Button>
              <Button
                leftIcon={<Edit size={16} />}
                className="modern-button-secondary"
                size="sm"
                onClick={onOpen}
              >
                Редактировать
              </Button>
            </HStack>
          </HStack>
        </Box>

        <VStack spacing={6} align="stretch">
          {/* Статистика документов */}
          <SimpleGrid columns={4} spacing={6}>
            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <CheckCircle size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {validDocuments}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Действительны
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
                    {expiredDocuments}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Истекли
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
                    {pendingDocuments}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    В обработке
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
                    {missingDocuments}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Отсутствуют
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </SimpleGrid>

          {/* Основная информация */}
          <Card className="modern-card">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Основная информация</Heading>
                
                <SimpleGrid columns={2} spacing={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <UserCheck size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">ФИО</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {personalData.fullName}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Calendar size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Дата рождения</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {personalData.birthDate ? new Date(personalData.birthDate).toLocaleDateString('ru-RU') : 'Не указана'}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <MapPin size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Место рождения</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {personalData.birthPlace}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Tag size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Гражданство</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {personalData.citizenship}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                  
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <CreditCard size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Паспорт</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {personalData.passportSeries} {personalData.passportNumber}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <FileText size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">СНИЛС</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {personalData.snils}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <FileText size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">ИНН</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {personalData.inn}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <MapPin size={20} color="#6b7280" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">Адрес</Text>
                        <Text fontSize="md" fontWeight="600" color="gray.800">
                          {personalData.address}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Таблица документов */}
          <Card className="modern-card">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md">Документы</Heading>
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
                        <Th>Тип документа</Th>
                        <Th>Наименование</Th>
                        <Th>Номер</Th>
                        <Th>Дата выдачи</Th>
                        <Th>Дата окончания</Th>
                        <Th>Статус</Th>
                        <Th>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {documents.map((doc) => (
                        <Tr key={doc.id}>
                          <Td>
                            <Badge colorScheme={getTypeColor(doc.type)} variant="subtle">
                              {getTypeLabel(doc.type)}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="600">{doc.name}</Text>
                              {doc.description && (
                                <Text fontSize="sm" color="gray.600">{doc.description}</Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>{doc.number}</Td>
                          <Td>{new Date(doc.issueDate).toLocaleDateString('ru-RU')}</Td>
                          <Td>
                            {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('ru-RU') : '—'}
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(doc.status)} variant="subtle">
                              {getStatusLabel(doc.status)}
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

        {/* Модальное окно редактирования */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Редактировать личную информацию</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="stretch">
                <VStack align="start" spacing={2}>
                  <Heading size="sm">Основные данные</Heading>
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl isRequired>
                      <FormLabel>ФИО</FormLabel>
                      <Input 
                        value={personalData.fullName} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, fullName: e.target.value }))} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Дата рождения</FormLabel>
                      <Input 
                        type="date" 
                        value={personalData.birthDate} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, birthDate: e.target.value }))} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Место рождения</FormLabel>
                      <Input 
                        value={personalData.birthPlace} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, birthPlace: e.target.value }))} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Гражданство</FormLabel>
                      <Input 
                        value={personalData.citizenship} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, citizenship: e.target.value }))} 
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Heading size="sm">Паспортные данные</Heading>
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Серия паспорта</FormLabel>
                      <Input 
                        value={personalData.passportSeries} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, passportSeries: e.target.value }))} 
                        placeholder="1234"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Номер паспорта</FormLabel>
                      <Input 
                        value={personalData.passportNumber} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, passportNumber: e.target.value }))} 
                        placeholder="567890"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Дата выдачи</FormLabel>
                      <Input 
                        type="date" 
                        value={personalData.passportIssueDate} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, passportIssueDate: e.target.value }))} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Кем выдан</FormLabel>
                      <Input 
                        value={personalData.passportIssuedBy} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, passportIssuedBy: e.target.value }))} 
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Heading size="sm">Другие документы</Heading>
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>СНИЛС</FormLabel>
                      <Input 
                        value={personalData.snils} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, snils: e.target.value }))} 
                        placeholder="123-456-789 01"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>ИНН</FormLabel>
                      <Input 
                        value={personalData.inn} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, inn: e.target.value }))} 
                        placeholder="123456789012"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Heading size="sm">Контактная информация</Heading>
                  <SimpleGrid columns={1} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Адрес</FormLabel>
                      <Textarea 
                        value={personalData.address} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, address: e.target.value }))} 
                        placeholder="Полный адрес проживания"
                        rows={2}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Контакт для экстренной связи</FormLabel>
                      <Input 
                        value={personalData.emergencyContact} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, emergencyContact: e.target.value }))} 
                        placeholder="ФИО контактного лица"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Телефон экстренной связи</FormLabel>
                      <Input 
                        value={personalData.emergencyPhone} 
                        onChange={(e) => setPersonalData(prev => ({ ...prev, emergencyPhone: e.target.value }))} 
                        placeholder="+7 (999) 123-45-67"
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

        {/* Модальное окно добавления документа */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Добавить документ</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Тип документа</FormLabel>
                  <Select value={newDocument.type} onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as PersonalDocument['type'] }))}>
                    <option value="passport">Паспорт</option>
                    <option value="snils">СНИЛС</option>
                    <option value="inn">ИНН</option>
                    <option value="medical">Медицинская книжка</option>
                    <option value="contract">Трудовой договор</option>
                    <option value="other">Прочее</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Наименование</FormLabel>
                  <Input 
                    value={newDocument.name} 
                    onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))} 
                    placeholder="Название документа"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Номер</FormLabel>
                  <Input 
                    value={newDocument.number} 
                    onChange={(e) => setNewDocument(prev => ({ ...prev, number: e.target.value }))} 
                    placeholder="Номер документа"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Дата выдачи</FormLabel>
                  <Input 
                    type="date" 
                    value={newDocument.issueDate} 
                    onChange={(e) => setNewDocument(prev => ({ ...prev, issueDate: e.target.value }))} 
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Дата окончания действия</FormLabel>
                  <Input 
                    type="date" 
                    value={newDocument.expiryDate} 
                    onChange={(e) => setNewDocument(prev => ({ ...prev, expiryDate: e.target.value }))} 
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <Textarea 
                    value={newDocument.description} 
                    onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))} 
                    placeholder="Дополнительная информация о документе"
                    rows={2}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Статус</FormLabel>
                  <Select value={newDocument.status} onChange={(e) => setNewDocument(prev => ({ ...prev, status: e.target.value as PersonalDocument['status'] }))}>
                    <option value="valid">Действителен</option>
                    <option value="expired">Истек</option>
                    <option value="pending">В обработке</option>
                    <option value="missing">Отсутствует</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onAddClose}>Отмена</Button>
                <Button 
                  className="modern-button"
                  onClick={handleAddDocument}
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

export default EmployeePersonal; 