import { Helmet } from "react-helmet-async";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, updateUser, deleteUser, getUsers } from "@/api/client";
import type { User } from "@/types";
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
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
  Select,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  IconButton,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Download, Edit, Trash2, Users, TrendingUp, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { downloadCSV } from "@/lib/export";
import EmployeeStats from "@/modules/people/EmployeeStats";
import EmployeesGrid from "@/modules/people/EmployeesGrid";
import EmployeeFormModal from "@/modules/people/EmployeeFormModal";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const People = () => {
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });

  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'worker',
    position: ''
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Сотрудник добавлен', status: 'success' });
      onClose();
      setFormData({ full_name: '', role: 'worker', position: '' });
      // Перенаправляем на профиль нового сотрудника
      navigate(`/people/${newUser.id}/profile`);
    },
    onError: () => {
      toast({ title: 'Ошибка добавления сотрудника', status: 'error' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Сотрудник обновлен', status: 'success' });
      onEditClose();
      setEditingUser(null);
    },
    onError: () => {
      toast({ title: 'Ошибка обновления сотрудника', status: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Сотрудник удален', status: 'success' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления сотрудника', status: 'error' });
    }
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.position?.toLowerCase().includes(search.toLowerCase()) ||
      user.department?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleCreate = () => {
    console.log('People: handleCreate вызван с данными:', formData);
    createMutation.mutate(formData);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || '',
      role: user.role || 'worker',
      position: user.position || ''
    });
    onEditOpen();
  };

  const handleUpdate = () => {
    if (editingUser) {
      console.log('People: handleUpdate вызван с ID:', editingUser.id, 'и данными:', formData);
      updateMutation.mutate({ id: editingUser.id, data: formData });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      deleteMutation.mutate(id);
    }
  };

  const exportData = () => {
    downloadCSV(users, 'employees');
  };

  return (
    <>
      <Helmet>
        <title>Сотрудники | UgraBuilders</title>
        <link rel="canonical" href={canonical} />
      </Helmet>

      <Box className="bg-gray-50 min-h-screen p-6">
        {/* Современный хедер */}
        <Box className="modern-header mb-8">
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text className="text-2xl font-bold text-gray-800">
                Сотрудники
              </Text>
              <Text className="text-gray-600">
                Управление персоналом и кадровый учет
              </Text>
            </VStack>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<Download size={16} />}
                className="modern-button-secondary"
                size="sm"
                onClick={exportData}
              >
                Экспорт
              </Button>
              <Button
                leftIcon={<Plus size={16} />}
                className="modern-button"
                size="sm"
                onClick={onOpen}
              >
                Добавить сотрудника
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Статистика */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Box className="modern-stats-card">
            <HStack spacing={4}>
              <Box className="modern-stats-icon">
                <Users size={24} color="white" />
              </Box>
              <VStack align="start" spacing={1}>
                <Text fontSize="3xl" fontWeight="700" color="gray.800">
                  {users.length}
                </Text>
                <Text fontSize="sm" color="gray.600" fontWeight="500">
                  Всего сотрудников
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
                  {users.filter(u => u.role === 'worker').length}
                </Text>
                <Text fontSize="sm" color="gray.600" fontWeight="500">
                  Активных рабочих
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
                  {users.filter(u => u.role === 'foreman').length}
                </Text>
                <Text fontSize="sm" color="gray.600" fontWeight="500">
                  Прорабов
                </Text>
              </VStack>
            </HStack>
          </Box>
        </SimpleGrid>

        {/* Поиск и фильтры */}
        <Box className="modern-card mb-8">
          <HStack spacing={4} p={6}>
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <Search size={16} color="gray.400" />
              </InputLeftElement>
              <Input
                className="modern-search"
                placeholder="Поиск по имени, должности или отделу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fontSize="sm"
              />
            </InputGroup>
            
            <Text fontSize="sm" color="gray.600">
              Найдено: {filteredUsers.length} из {users.length}
            </Text>
          </HStack>
        </Box>

        {/* Сетка сотрудников */}
        <EmployeesGrid 
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Модальные окна */}
        <EmployeeFormModal
          isOpen={isOpen}
          onClose={onClose}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={createMutation.isPending}
        />

        <EmployeeFormModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          formData={formData}
          setFormData={setFormData}
          isEditing={true}
          onSubmit={handleUpdate}
          loading={updateMutation.isPending}
        />
      </Box>
    </>
  );
};

export default People;