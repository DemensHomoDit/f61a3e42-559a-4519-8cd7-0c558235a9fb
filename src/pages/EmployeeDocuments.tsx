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
  FileText, 
  File,
  FileCheck,
  Calendar,
  Download,
  Plus,
  Minus,
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
  Gift,
  FileX,
  FileUp,
  FileDown
} from "lucide-react";

interface Document {
  id: number;
  type: 'contract' | 'report' | 'certificate' | 'instruction' | 'other';
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'active' | 'expired' | 'pending' | 'archived';
  category: 'employment' | 'safety' | 'training' | 'performance' | 'other';
  version: string;
  uploadedBy: string;
  expiryDate?: string;
}

const EmployeeDocuments = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });
  const user = users.find(u => u.id === Number(userId));
  
  const [documentData, setDocumentData] = useState({
    totalDocuments: 0,
    activeDocuments: 0,
    expiredDocuments: 0,
    pendingDocuments: 0,
    totalSize: 0
  });

  // Моковые данные документов
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      type: 'contract',
      title: 'Трудовой договор',
      description: 'Основной трудовой договор с компанией',
      fileName: 'contract_2024.pdf',
      fileSize: 245760,
      uploadDate: '2024-01-15',
      status: 'active',
      category: 'employment',
      version: '1.0',
      uploadedBy: 'HR отдел',
      expiryDate: '2025-01-15'
    },
    {
      id: 2,
      type: 'certificate',
      title: 'Сертификат по технике безопасности',
      description: 'Сертификат о прохождении обучения по ТБ',
      fileName: 'safety_cert_2024.pdf',
      fileSize: 156240,
      uploadDate: '2024-02-01',
      status: 'active',
      category: 'safety',
      version: '2.1',
      uploadedBy: 'Отдел безопасности',
      expiryDate: '2025-02-01'
    },
    {
      id: 3,
      type: 'report',
      title: 'Отчет о работе за март 2024',
      description: 'Ежемесячный отчет о выполненных работах',
      fileName: 'report_march_2024.xlsx',
      fileSize: 89234,
      uploadDate: '2024-03-31',
      status: 'active',
      category: 'performance',
      version: '1.0',
      uploadedBy: 'Менеджер проекта'
    },
    {
      id: 4,
      type: 'instruction',
      title: 'Инструкция по работе с оборудованием',
      description: 'Техническая инструкция по эксплуатации',
      fileName: 'equipment_manual.pdf',
      fileSize: 345678,
      uploadDate: '2024-01-20',
      status: 'active',
      category: 'training',
      version: '3.2',
      uploadedBy: 'Технический отдел'
    },
    {
      id: 5,
      type: 'certificate',
      title: 'Медицинская справка',
      description: 'Справка о состоянии здоровья',
      fileName: 'medical_cert_2024.pdf',
      fileSize: 123456,
      uploadDate: '2024-01-10',
      status: 'expired',
      category: 'employment',
      version: '1.0',
      uploadedBy: 'Медицинский центр',
      expiryDate: '2024-12-31'
    }
  ]);

  const [newDocument, setNewDocument] = useState({
    type: 'contract' as Document['type'],
    title: '',
    description: '',
    fileName: '',
    fileSize: '',
    status: 'active' as Document['status'],
    category: 'employment' as Document['category'],
    version: '1.0',
    uploadedBy: '',
    expiryDate: ''
  });

  useEffect(() => {
    if (user) {
      const totalDocuments = documents.length;
      const activeDocuments = documents.filter(d => d.status === 'active').length;
      const expiredDocuments = documents.filter(d => d.status === 'expired').length;
      const pendingDocuments = documents.filter(d => d.status === 'pending').length;
      const totalSize = documents.reduce((sum, d) => sum + d.fileSize, 0);

      setDocumentData({
        totalDocuments,
        activeDocuments,
        expiredDocuments,
        pendingDocuments,
        totalSize
      });
    }
  }, [user, documents]);

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

  const handleAddDocument = () => {
    if (!newDocument.title || !newDocument.fileName || !newDocument.uploadedBy) {
      toast({ title: 'Заполните все обязательные поля', status: 'error' });
      return;
    }

    const document: Document = {
      id: Date.now(),
      type: newDocument.type,
      title: newDocument.title,
      description: newDocument.description,
      fileName: newDocument.fileName,
      fileSize: parseFloat(newDocument.fileSize) || 0,
      uploadDate: new Date().toISOString().split('T')[0],
      status: newDocument.status,
      category: newDocument.category,
      version: newDocument.version,
      uploadedBy: newDocument.uploadedBy,
      expiryDate: newDocument.expiryDate || undefined
    };

    setDocuments(prev => [document, ...prev]);
    setNewDocument({
      type: 'contract',
      title: '',
      description: '',
      fileName: '',
      fileSize: '',
      status: 'active',
      category: 'employment',
      version: '1.0',
      uploadedBy: '',
      expiryDate: ''
    });
    onAddClose();
    toast({ title: 'Документ добавлен', status: 'success' });
  };

  const getTypeLabel = (type: Document['type']) => {
    switch (type) {
      case 'contract': return 'Контракт';
      case 'report': return 'Отчет';
      case 'certificate': return 'Сертификат';
      case 'instruction': return 'Инструкция';
      case 'other': return 'Прочее';
      default: return type;
    }
  };

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'contract': return 'blue';
      case 'report': return 'green';
      case 'certificate': return 'purple';
      case 'instruction': return 'orange';
      case 'other': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'active': return 'green';
      case 'expired': return 'red';
      case 'pending': return 'yellow';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: Document['status']) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'expired': return 'Истек';
      case 'pending': return 'В обработке';
      case 'archived': return 'Архив';
      default: return status;
    }
  };

  const getCategoryLabel = (category: Document['category']) => {
    switch (category) {
      case 'employment': return 'Трудоустройство';
      case 'safety': return 'Безопасность';
      case 'training': return 'Обучение';
      case 'performance': return 'Производительность';
      case 'other': return 'Прочее';
      default: return category;
    }
  };

  const getCategoryColor = (category: Document['category']) => {
    switch (category) {
      case 'employment': return 'blue';
      case 'safety': return 'green';
      case 'training': return 'purple';
      case 'performance': return 'orange';
      case 'other': return 'gray';
      default: return 'gray';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
        <title>Документы | UgraBuilders</title>
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
                  Документы
                </Text>
                <Text className="text-gray-600">
                  {user.full_name}
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<Upload size={16} />}
                className="modern-button"
                size="sm"
                onClick={onAddOpen}
              >
                Загрузить документ
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
          <SimpleGrid columns={5} spacing={6}>
            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <FileText size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {documentData.totalDocuments}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Всего документов
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <FileCheck size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {documentData.activeDocuments}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Активных
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box className="modern-stats-card">
              <HStack spacing={4}>
                <Box className="modern-stats-icon">
                  <FileX size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {documentData.expiredDocuments}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Истекших
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
                    {documentData.pendingDocuments}
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
                  <FileDown size={24} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="700" color="gray.800">
                    {formatFileSize(documentData.totalSize)}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Общий размер
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </SimpleGrid>

          {/* Таблица документов */}
          <Card className="modern-card">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md">Документы сотрудника</Heading>
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
                        <Th>Дата загрузки</Th>
                        <Th>Тип</Th>
                        <Th>Название</Th>
                        <Th>Категория</Th>
                        <Th>Файл</Th>
                        <Th>Размер</Th>
                        <Th>Статус</Th>
                        <Th>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {documents.map((doc) => (
                        <Tr key={doc.id}>
                          <Td>{new Date(doc.uploadDate).toLocaleDateString('ru-RU')}</Td>
                          <Td>
                            <Badge colorScheme={getTypeColor(doc.type)} variant="subtle">
                              {getTypeLabel(doc.type)}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="600">{doc.title}</Text>
                              <Text fontSize="sm" color="gray.600">{doc.description}</Text>
                              <Text fontSize="xs" color="gray.500">v{doc.version}</Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={getCategoryColor(doc.category)} variant="subtle">
                              {getCategoryLabel(doc.category)}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <File size={16} color="#6b7280" />
                              <Text fontSize="sm" color="gray.700">{doc.fileName}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">
                              {formatFileSize(doc.fileSize)}
                            </Text>
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
                                aria-label="Скачать"
                                icon={<Download size={14} />}
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

        {/* Модальное окно загрузки документа */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Загрузить документ</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Тип документа</FormLabel>
                  <Select value={newDocument.type} onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as Document['type'] }))}>
                    <option value="contract">Контракт</option>
                    <option value="report">Отчет</option>
                    <option value="certificate">Сертификат</option>
                    <option value="instruction">Инструкция</option>
                    <option value="other">Прочее</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Название документа</FormLabel>
                  <Input 
                    value={newDocument.title} 
                    onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="Название документа"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <Textarea 
                    value={newDocument.description} 
                    onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))} 
                    placeholder="Описание документа"
                    rows={2}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Имя файла</FormLabel>
                  <Input 
                    value={newDocument.fileName} 
                    onChange={(e) => setNewDocument(prev => ({ ...prev, fileName: e.target.value }))} 
                    placeholder="document.pdf"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Размер файла (байт)</FormLabel>
                  <NumberInput value={newDocument.fileSize} onChange={(value) => setNewDocument(prev => ({ ...prev, fileSize: value }))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Категория</FormLabel>
                  <Select value={newDocument.category} onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value as Document['category'] }))}>
                    <option value="employment">Трудоустройство</option>
                    <option value="safety">Безопасность</option>
                    <option value="training">Обучение</option>
                    <option value="performance">Производительность</option>
                    <option value="other">Прочее</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Версия</FormLabel>
                  <Input 
                    value={newDocument.version} 
                    onChange={(e) => setNewDocument(prev => ({ ...prev, version: e.target.value }))} 
                    placeholder="1.0"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Загрузил</FormLabel>
                  <Input 
                    value={newDocument.uploadedBy} 
                    onChange={(e) => setNewDocument(prev => ({ ...prev, uploadedBy: e.target.value }))} 
                    placeholder="Имя загрузившего"
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
                  <FormLabel>Статус</FormLabel>
                  <Select value={newDocument.status} onChange={(e) => setNewDocument(prev => ({ ...prev, status: e.target.value as Document['status'] }))}>
                    <option value="active">Активен</option>
                    <option value="pending">В обработке</option>
                    <option value="archived">Архив</option>
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
                  Загрузить
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default EmployeeDocuments; 