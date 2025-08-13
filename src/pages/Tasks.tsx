import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getTasks, getObjects, getUsers, createTask, updateTask } from "@/api/client";
import type { Task, ObjectEntity, User } from "@/types";
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Select as CSelect,
  Textarea as CTextarea,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { downloadCSV } from "@/lib/export";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Tasks = () => {
  const { data: tasksData = [] } = useQuery<Task[]>({ queryKey: ["tasks"], queryFn: getTasks });
  const { data: objects = [] } = useQuery<ObjectEntity[]>({ queryKey: ["objects"], queryFn: getObjects });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasksData);

  // Keep local copy in sync when data changes
  const effectiveTasks = useMemo(() => localTasks ?? tasksData, [localTasks, tasksData]);

  const filtered = useMemo(() => {
    return effectiveTasks.filter((t) => {
      const matchesSearch = !search || (t.title?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus = !status || t.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [effectiveTasks, search, status]);

  // Create task modal state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Task>>({ priority: "medium", status: "new", task_type: "work" });

  const onSubmit = () => {
    if (!form.title) return;
    const newTask: Task = {
      id: Math.max(0, ...effectiveTasks.map((t) => t.id)) + 1,
      title: form.title!,
      description: form.description ?? null,
      assignee_id: form.assignee_id ?? null,
      priority: form.priority ?? "medium",
      deadline: form.deadline ?? null,
      status: form.status ?? "new",
      message_id: null,
      object_id: form.object_id ?? null,
      work_date: null,
      completed_at: null,
      cancelled_at: null,
      created_by: 1,
      task_type: form.task_type ?? "work",
      created_at: new Date().toISOString(),
      pay_amount: null,
      expected_minutes: null,
      actual_minutes: null,
      tech_card_id: null,
      pay_type: form.pay_type ?? "none",
      pay_rate: null,
      currency: "RUB",
      unit: form.unit ?? null,
      planned_volume: form.planned_volume ?? null,
      auto_pay: 0,
    };
    setLocalTasks([newTask, ...effectiveTasks]);
    setOpen(false);
    setForm({ priority: "medium", status: "new", task_type: "work" });
  };

  const statusBadgeColor = (s: string) => {
    if (s === 'overdue' || s === 'Просрочено') return 'red';
    if (s === 'done' || s === 'Завершена') return 'green';
    if (s === 'in_progress' || s === 'В работе') return 'blue';
    return 'gray';
  };

  return (
    <>
      <Helmet>
        <title>Задачи — ПромСтрой Контроль</title>
        <meta name="description" content="Планирование и контроль задач: статусы, сроки, ответственные." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg" color="brand.500">Задачи</Heading>
            <Text color="text.secondary" mt={1}>Гибкое управление работами</Text>
          </Box>
          <HStack>
            <Button variant="gradient" onClick={() => setOpen(true)}>Создать задачу</Button>
            <Button variant="gradient" onClick={() => downloadCSV('tasks.csv', filtered)}>Экспорт CSV</Button>
          </HStack>
        </HStack>

        <HStack gap={3} align="center">
          <Input placeholder="Поиск по названию" value={search} onChange={(e) => setSearch(e.target.value)} maxW="sm" />
          <FormControl maxW="48">
            <FormLabel id="statusFilterLabel" htmlFor="statusFilter">Статус</FormLabel>
            <CSelect id="statusFilter" aria-label="Фильтр по статусу" aria-labelledby="statusFilterLabel" title="Фильтр по статусу" placeholder="Все статусы" onChange={(e)=> setStatus(e.target.value === 'all' ? undefined : e.target.value)}>
            <option value="all">Все</option>
            <option value="new">Новые</option>
            <option value="in_progress">В работе</option>
            <option value="overdue">Просроченные</option>
            <option value="done">Завершенные</option>
          </CSelect>
          </FormControl>
        </HStack>

        <Tabs variant="enclosed" colorScheme="green">
          <TabList>
            <Tab>Все</Tab>
            <Tab>Запланировано</Tab>
            <Tab>Просрочено</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <Card>
                <CardHeader p={4}><Heading size="sm">Список задач</Heading></CardHeader>
                <CardBody pt={0} px={4} pb={4}>
                  <Table variant="stripedGreen">
                    <Thead>
                      <Tr>
                        <Th>Задача</Th>
                        <Th></Th>
                        <Th>Объект</Th>
                        <Th>Исполнитель</Th>
                        <Th>Срок</Th>
                        <Th isNumeric>Статус</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filtered.map((r)=> {
                        const obj = objects.find((o) => o.id === r.object_id);
                        const assignee = users.find((u) => u.id === r.assignee_id);
                        return (
                          <Tr key={r.id}>
                            <Td fontWeight={600}>{r.title}</Td>
                            <Td color="brand.500"><Link to={`/tasks/${r.id}`}>Открыть</Link></Td>
                            <Td>{obj?.name ?? '—'}</Td>
                            <Td>{assignee?.full_name ?? '—'}</Td>
                            <Td>{r.deadline ?? '—'}</Td>
                            <Td isNumeric>
                              <Badge colorScheme={statusBadgeColor(r.status ?? 'new') as any}>{r.status ?? 'new'}</Badge>
                              <Button variant="gradient" size="sm" ml={2} onClick={async()=>{
                                try{ const upd=await updateTask(r.id, { status: 'done', completed_at: new Date().toISOString() }); setLocalTasks(effectiveTasks.map(t=> t.id===r.id ? upd : t)); }catch{}
                              }}>Готово</Button>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>
            <TabPanel><Text color="text.secondary">Покажем ближайшие задачи…</Text></TabPanel>
            <TabPanel><Text color="text.secondary">Нужно обратить внимание на просроченные задачи.</Text></TabPanel>
          </TabPanels>
        </Tabs>

        <Modal isOpen={open} onClose={()=>setOpen(false)} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Новая задача</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel>Название</FormLabel>
                  <Input value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <CTextarea value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </FormControl>
                <HStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel id="taskObjectLabel" htmlFor="taskObject">Объект</FormLabel>
                    <CSelect id="taskObject" aria-label="Выберите объект" aria-labelledby="taskObjectLabel" title="Выберите объект" placeholder="Выберите объект" onChange={(e)=> setForm((f)=> ({...f, object_id: Number(e.target.value)}))}>
                      {objects.map((o)=> (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </CSelect>
                  </FormControl>
                  <FormControl>
                    <FormLabel id="taskAssigneeLabel" htmlFor="taskAssignee">Исполнитель</FormLabel>
                    <CSelect id="taskAssignee" aria-label="Выберите исполнителя" aria-labelledby="taskAssigneeLabel" title="Выберите исполнителя" placeholder="Выберите исполнителя" onChange={(e)=> setForm((f)=> ({...f, assignee_id: Number(e.target.value)}))}>
                      {users.map((u)=> (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </CSelect>
                  </FormControl>
                </HStack>
                <HStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel id="taskPriorityLabel" htmlFor="taskPriority">Приоритет</FormLabel>
                    <CSelect id="taskPriority" aria-label="Выберите приоритет" aria-labelledby="taskPriorityLabel" title="Выберите приоритет" placeholder="Выберите" onChange={(e)=> setForm((f)=> ({...f, priority: e.target.value}))}>
                      <option value="low">Низкий</option>
                      <option value="medium">Средний</option>
                      <option value="high">Высокий</option>
                    </CSelect>
                  </FormControl>
                  <FormControl>
                    <FormLabel id="taskStatusLabel" htmlFor="taskStatus">Статус</FormLabel>
                    <CSelect id="taskStatus" aria-label="Выберите статус" aria-labelledby="taskStatusLabel" title="Выберите статус" placeholder="new" onChange={(e)=> setForm((f)=> ({...f, status: e.target.value}))}>
                      <option value="new">Новая</option>
                      <option value="in_progress">В работе</option>
                      <option value="overdue">Просрочена</option>
                      <option value="done">Завершена</option>
                    </CSelect>
                  </FormControl>
                  <FormControl>
                    <FormLabel id="taskTypeLabel" htmlFor="taskType">Тип</FormLabel>
                    <CSelect id="taskType" aria-label="Выберите тип задачи" aria-labelledby="taskTypeLabel" title="Выберите тип задачи" placeholder="work" onChange={(e)=> setForm((f)=> ({...f, task_type: e.target.value}))}>
                      <option value="work">Работы</option>
                      <option value="purchase">Закупки</option>
                      <option value="admin">Административная</option>
                    </CSelect>
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="gradient" mr={3} onClick={onSubmit}>Создать</Button>
              <Button onClick={()=>setOpen(false)}>Отмена</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default Tasks;