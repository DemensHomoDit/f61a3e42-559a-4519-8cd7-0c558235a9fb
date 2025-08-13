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
import { Link } from "react-router-dom";
import { downloadCSV } from "@/lib/export";
import EmployeeStats from "@/modules/people/EmployeeStats";
import EmployeesGrid from "@/modules/people/EmployeesGrid";
import EmployeeFormModal from "@/modules/people/EmployeeFormModal";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const People = () => {
  const qc = useQueryClient();
  const toast = useToast();
  
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });

  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    role: 'employee',
    phone: '',
    email: '',
    position: '',
    department: '',
    hire_date: '',
    salary: ''
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Сотрудник добавлен', status: 'success' });
      onClose();
      setFormData({ username: '', full_name: '', role: 'employee', phone: '', email: '', position: '', department: '', hire_date: '', salary: '' });
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
    createMutation.mutate(formData);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      full_name: user.full_name || '',
      role: user.role || 'employee',
      phone: user.phone || '',
      email: user.email || '',
      position: user.position || '',
      department: user.department || '',
      hire_date: user.hire_date || '',
      salary: user.salary?.toString() || ''
    });
    onEditOpen();
  };

  const handleUpdate = () => {
    if (editingUser) {
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

      <Box p={6} bg="bg.primary" minH="100vh">
        {/* Заголовок и статистика */}
        <VStack spacing={6} align="stretch" mb={8}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={2}>
              <Heading as="h1" size="h1" color="text.primary">
                Сотрудники
              </Heading>
              <Text color="text.secondary" fontSize="sm">
                Управление персоналом и кадровый учет
              </Text>
            </VStack>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<Download size={16} />}
                variant="secondary"
                size="sm"
                onClick={exportData}
              >
                Экспорт
              </Button>
              <Button
                leftIcon={<Plus size={16} />}
                variant="primary"
                size="sm"
                onClick={onOpen}
              >
                Добавить сотрудника
              </Button>
            </HStack>
          </HStack>

          {/* Статистика */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card variant="elevated">
              <CardBody>
                <HStack spacing={4}>
                  <Box p={3} bg="brand.50" borderRadius="lg">
                    <Users size={20} color="var(--chakra-colors-brand-500)" />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Stat>
                      <StatNumber fontSize="2xl" fontWeight="700" color="text.primary">
                        {users.length}
                      </StatNumber>
                      <StatLabel fontSize="sm" color="text.secondary" fontWeight="500">
                        Всего сотрудников
                      </StatLabel>
                    </Stat>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card variant="elevated">
              <CardBody>
                <HStack spacing={4}>
                  <Box p={3} bg="accent.success" bgOpacity="0.1" borderRadius="lg">
                    <TrendingUp size={20} color="var(--chakra-colors-accent-success)" />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Stat>
                      <StatNumber fontSize="2xl" fontWeight="700" color="text.primary">
                        {users.filter(u => u.role === 'worker').length}
                      </StatNumber>
                      <StatLabel fontSize="sm" color="text.secondary" fontWeight="500">
                        Активных рабочих
                      </StatLabel>
                    </Stat>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card variant="elevated">
              <CardBody>
                <HStack spacing={4}>
                  <Box p={3} bg="accent.info" bgOpacity="0.1" borderRadius="lg">
                    <Award size={20} color="var(--chakra-colors-accent-info)" />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Stat>
                      <StatNumber fontSize="2xl" fontWeight="700" color="text.primary">
                        {users.filter(u => u.role === 'foreman').length}
                      </StatNumber>
                      <StatLabel fontSize="sm" color="text.secondary" fontWeight="500">
                        Прорабов
                      </StatLabel>
                    </Stat>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>

        {/* Поиск и фильтры */}
        <Card variant="elevated" mb={6}>
          <CardBody>
            <HStack spacing={4}>
              <InputGroup maxW="400px">
                <InputLeftElement pointerEvents="none">
                  <Search size={16} color="var(--chakra-colors-text-secondary)" />
                </InputLeftElement>
                <Input
                  placeholder="Поиск по имени, должности или отделу..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fontSize="sm"
                />
              </InputGroup>
              
              <Text fontSize="sm" color="text.secondary">
                Найдено: {filteredUsers.length} из {users.length}
              </Text>
            </HStack>
          </CardBody>
        </Card>

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