import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
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
  Textarea,
  useToast,
  IconButton
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getObjects as getObjectsMock } from "@/api/mock";
import { getObjects as getObjectsApi } from "@/api/client";
import type { ObjectEntity } from "@/types";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { downloadCSV } from "@/lib/export";
import { Plus, Edit, Trash2 } from "lucide-react";

// Получаем токен авторизации из localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Базовый URL API
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const API_PREFIX = "/api";

// Функция для формирования URL API
const apiUrl = (path: string): string => {
  return `${BASE_URL}${path.startsWith("/api") ? path : `${API_PREFIX}${path}`}`;
};

// Создаем собственные функции для работы с объектами
const createObject = async (payload: Partial<ObjectEntity>): Promise<ObjectEntity> => {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  const res = await fetch(apiUrl("/api/objects"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API failed: ${res.status} - ${errorText}`);
  }
  
  return res.json();
};

const updateObject = async (id: number, payload: Partial<ObjectEntity>): Promise<ObjectEntity> => {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  const res = await fetch(apiUrl(`/api/objects/${id}`), {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API failed: ${res.status} - ${errorText}`);
  }
  
  return res.json();
};

const deleteObject = async (id: number): Promise<{ success: boolean }> => {
  const headers = new Headers();
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  const res = await fetch(apiUrl(`/api/objects/${id}`), {
    method: "DELETE",
    headers,
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API failed: ${res.status} - ${errorText}`);
  }
  
  return res.json();
};

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Objects = () => {
  const qc = useQueryClient();
  const toast = useToast();
  
  const { data: objects = [] } = useQuery<ObjectEntity[]>({
    queryKey: ["objects"],
    queryFn: async () => {
      try { return await getObjectsApi() as any; } catch { return getObjectsMock(); }
    },
  });
  
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editingObject, setEditingObject] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    start_date: '',
    end_date: '',
    budget: '',
    status: 'active'
  });

  const createMutation = useMutation({
    mutationFn: createObject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['objects'] });
      toast({ title: 'Объект создан', status: 'success' });
      onClose();
      setFormData({ name: '', description: '', address: '', start_date: '', end_date: '', budget: '', status: 'active' });
    },
    onError: () => {
      toast({ title: 'Ошибка создания объекта', status: 'error' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateObject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['objects'] });
      toast({ title: 'Объект обновлен', status: 'success' });
      onEditClose();
      setEditingObject(null);
    },
    onError: () => {
      toast({ title: 'Ошибка обновления объекта', status: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteObject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['objects'] });
      toast({ title: 'Объект удален', status: 'success' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления объекта', status: 'error' });
    }
  });

  const handleCreate = () => {
    const payload = {
      ...formData,
      budget: formData.budget ? Number(formData.budget) : null
    };
    createMutation.mutate(payload);
  };

  const handleEdit = (object: any) => {
    setEditingObject(object);
    setFormData({
      name: object.name || '',
      description: object.description || '',
      address: object.address || '',
      start_date: object.start_date || '',
      end_date: object.end_date || '',
      budget: object.budget?.toString() || '',
      status: object.status || 'active'
    });
    onEditOpen();
  };

  const handleUpdate = () => {
    if (!editingObject) return;
    const payload = {
      ...formData,
      budget: formData.budget ? Number(formData.budget) : null
    };
    updateMutation.mutate({ id: editingObject.id, data: payload });
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот объект?')) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return objects;
    const q = search.toLowerCase();
    return objects.filter((o) => (o.name?.toLowerCase().includes(q) || o.address?.toLowerCase().includes(q)));
  }, [objects, search]);

  return (
    <>
      <Helmet>
        <title>Объекты — ПромСтрой Контроль</title>
        <meta name="description" content="Управление объектами: статусы, команды, прогресс." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
        <HStack justify="space-between" align="center">
        <Box>
          <Heading size="lg" color="brand.500">Объекты</Heading>
            <Text color="text.secondary" mt={1}>Управление объектами</Text>
        </Box>
          <HStack>
            <Button leftIcon={<Plus size={16} />} colorScheme="green" onClick={onOpen}>
              Создать объект
            </Button>
            <Button variant="outline" onClick={() => downloadCSV('objects.csv', filtered)}>
              Экспорт CSV
            </Button>
          </HStack>
        </HStack>

        {/* Поиск */}
        <Input 
          placeholder="Поиск по названию или адресу..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="400px"
        />

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} aria-label="Ключевые показатели">
        <Card>
          <CardHeader p={4}><Heading size="sm">Статусы объектов</Heading></CardHeader>
          <CardBody pt={0} px={4} pb={4}>
            <SimpleGrid columns={3} spacing={4}>
              <Box>
                <Text fontSize="2xl" fontWeight="semibold" color="brand.500">{filtered.length}</Text>
                <Text fontSize="sm" color="text.secondary">Всего</Text>
              </Box>
              <Box>
                  <Text fontSize="2xl" fontWeight="semibold" color="text.primary">
                    {filtered.filter(o => o.status === 'paused').length}
                  </Text>
                <Text fontSize="sm" color="text.secondary">Приостановлены</Text>
              </Box>
              <Box>
                  <Text fontSize="2xl" fontWeight="semibold" color="text.primary">
                    {filtered.filter(o => o.status === 'completed').length}
                  </Text>
                <Text fontSize="sm" color="text.secondary">Завершены</Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card as={Box} gridColumn={{ lg: "span 2" }}>
          <CardHeader p={4}><Heading size="sm">Прогресс по этапам</Heading></CardHeader>
          <CardBody pt={0} px={4} pb={4}>
            <VStack align="stretch" spacing={4}>
              {[{name:'Фундамент',v:72},{name:'Каркас',v:40},{name:'Инженерка',v:55},{name:'Отделка',v:28}].map((s)=>(
                <Box key={s.name}>
                  <HStack justify="space-between" mb={1} fontSize="sm">
                    <Text>{s.name}</Text>
                    <Text color="text.secondary">{s.v}%</Text>
                  </HStack>
                  <Progress value={s.v} height="8px" borderRadius="md" />
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Box aria-label="Список объектов">
        <Card>
            <CardHeader p={4}><Heading size="sm">Объекты ({filtered.length})</Heading></CardHeader>
          <CardBody pt={0} px={4} pb={4}>
              <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Название</Th>
                  <Th>Адрес</Th>
                    <Th>Бюджет</Th>
                  <Th>Статус</Th>
                    <Th>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((o)=> (
                  <Tr key={o.id}>
                    <Td fontWeight={600} color="brand.500">
                      <Link to={`/objects/${o.id}`}>{o.name}</Link>
                    </Td>
                    <Td>{o.address ?? '—'}</Td>
                      <Td>{o.budget ? `₽${Number(o.budget).toLocaleString('ru-RU')}` : '—'}</Td>
                    <Td>
                        <Badge 
                          colorScheme={
                            o.status === 'active' ? 'green' : 
                            o.status === 'paused' ? 'yellow' : 
                            o.status === 'completed' ? 'blue' : 'gray'
                          }
                        >
                          {o.status === 'active' ? 'Активный' : 
                           o.status === 'paused' ? 'Приостановлен' : 
                           o.status === 'completed' ? 'Завершен' : o.status}
                        </Badge>
                    </Td>
                      <Td>
                        <HStack gap={2}>
                          <Button as={Link} to={`/objects/${o.id}`} size="sm" colorScheme="blue">
                            Открыть
                          </Button>
                          <IconButton
                            size="sm"
                            icon={<Edit size={16} />}
                            aria-label="Редактировать"
                            onClick={() => handleEdit(o)}
                          />
                          <IconButton
                            size="sm"
                            colorScheme="red"
                            icon={<Trash2 size={16} />}
                            aria-label="Удалить"
                            onClick={() => handleDelete(o.id)}
                          />
                        </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </Box>

        {/* Модалка создания объекта */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Создать новый объект</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack gap={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Название</FormLabel>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Название объекта"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание объекта"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Адрес</FormLabel>
                  <Input 
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Адрес объекта"
                  />
                </FormControl>
                
                <HStack gap={4}>
                  <FormControl>
                    <FormLabel>Дата начала</FormLabel>
                    <Input 
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Дата окончания</FormLabel>
                    <Input 
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </FormControl>
                </HStack>
                
                <FormControl>
                  <FormLabel>Бюджет</FormLabel>
                  <Input 
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="Бюджет в рублях"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="object-status-create">Статус</FormLabel>
                  <Select 
                    id="object-status-create"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    title="Выберите статус объекта"
                    aria-label="Статус объекта"
                  >
                    <option value="active">Активный</option>
                    <option value="paused">Приостановлен</option>
                    <option value="completed">Завершен</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack gap={3}>
                <Button variant="ghost" onClick={onClose}>Отмена</Button>
                <Button 
                  colorScheme="green" 
                  onClick={handleCreate}
                  isLoading={createMutation.isPending}
                  isDisabled={!formData.name}
                >
                  Создать
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Модалка редактирования объекта */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Редактировать объект</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack gap={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Название</FormLabel>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Название объекта"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание объекта"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Адрес</FormLabel>
                  <Input 
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Адрес объекта"
                  />
                </FormControl>
                
                <HStack gap={4}>
                  <FormControl>
                    <FormLabel>Дата начала</FormLabel>
                    <Input 
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Дата окончания</FormLabel>
                    <Input 
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </FormControl>
                </HStack>
                
                <FormControl>
                  <FormLabel>Бюджет</FormLabel>
                  <Input 
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="Бюджет в рублях"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="object-status-edit">Статус</FormLabel>
                  <Select 
                    id="object-status-edit"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    title="Выберите статус объекта"
                    aria-label="Статус объекта"
                  >
                    <option value="active">Активный</option>
                    <option value="paused">Приостановлен</option>
                    <option value="completed">Завершен</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack gap={3}>
                <Button variant="ghost" onClick={onEditClose}>Отмена</Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleUpdate}
                  isLoading={updateMutation.isPending}
                  isDisabled={!formData.name}
                >
                  Сохранить
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </Box>
    </>
  );
};

export default Objects;