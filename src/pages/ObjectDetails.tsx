import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getObject, getTasks, getUsers } from "@/api/client";
import { 
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Card, 
  CardHeader, 
  CardBody,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid
} from "@chakra-ui/react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building, Calendar, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table as Tbl, TableBody as TBody, TableCell as TCell, TableHead as THead, TableHeader as THeader, TableRow as TRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getUsersAssignedToObject,
  getObjectStagesByObjectId,
  getObjectMaterialsByObjectId,
  getObjectFinance,
  getAssignments,
} from "@/api/mock";
import type { ObjectEntity, Task, User, ObjectStage, ObjectMaterial, Assignment } from "@/types";

const canonical = typeof window !== "undefined" ? window.location.href : "";

export default function ObjectDetails() {
  const params = useParams();
  const objectId = Number(params.id);

  const { data: objectData } = useQuery<ObjectEntity | undefined>({
    queryKey: ["object", objectId],
    queryFn: () => getObject(objectId),
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

  const initialAssigned = useMemo(() => getUsersAssignedToObject(objectId), [objectId]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>(initialAssigned);
  const [assignments, setAssignments] = useState<Assignment[]>(getAssignments().filter(a => a.object_id === objectId));

  const [stages, setStages] = useState<ObjectStage[]>(getObjectStagesByObjectId(objectId));
  const [materials, setMaterials] = useState<ObjectMaterial[]>(getObjectMaterialsByObjectId(objectId));
  const finance = useMemo(() => getObjectFinance(objectId), [objectId]);

  const obj = objectData;
  const objectTasks = tasks.filter((t) => t.object_id === objectId);

  // Dialogs
  const [openStage, setOpenStage] = useState(false);
  const [stageName, setStageName] = useState("");
  const addStage = () => {
    if (!stageName) return;
    const newStage: ObjectStage = {
      id: Math.max(0, ...stages.map((s) => s.id)) + 1,
      object_id: objectId,
      name: stageName,
      description: null,
      status: "planned",
      start_date: null,
      due_date: null,
      end_date: null,
      progress: 0,
    };
    setStages([newStage, ...stages]);
    setStageName("");
    setOpenStage(false);
  };

  const [openMat, setOpenMat] = useState(false);
  const [matName, setMatName] = useState("");
  const [matQty, setMatQty] = useState<string>("");
  const [matUnit, setMatUnit] = useState<string>("шт");
  const addMaterial = () => {
    if (!matName) return;
    const newMat: ObjectMaterial = {
      id: Math.max(0, ...materials.map((m) => m.id)) + 1,
      object_id: objectId,
      name: matName,
      qty: matQty ? Number(matQty) : 0,
      unit: matUnit,
      notes: null,
    };
    setMaterials([newMat, ...materials]);
    setMatName("");
    setMatQty("");
    setMatUnit("шт");
    setOpenMat(false);
  };

  // Assign users
  const [openAssign, setOpenAssign] = useState(false);
  const [userToAssign, setUserToAssign] = useState<number | undefined>(undefined);
  const availableUsers = users.filter(u => !assignedUsers.some(a => a.id === u.id));
  const assignUser = () => {
    if (!userToAssign) return;
    const user = users.find(u => u.id === userToAssign);
    if (!user) return;
    setAssignedUsers(prev => [...prev, user]);
    const newAss: Assignment = { id: Math.max(0, ...assignments.map(a => a.id)) + 1, object_id: objectId, user_id: user.id, date: new Date().toISOString().slice(0,10) };
    setAssignments(prev => [...prev, newAss]);
    setUserToAssign(undefined);
    setOpenAssign(false);
  };
  const unassignUser = (userId: number) => {
    setAssignedUsers(prev => prev.filter(u => u.id !== userId));
    setAssignments(prev => prev.filter(a => a.user_id !== userId));
  };

  return (
    <>
      <Helmet>
        <title>{obj ? `${obj.name} — Объект` : "Объект"} — ПромСтрой Контроль</title>
        <meta name="description" content="Детальная карточка объекта: этапы, команда, задачи и финансы." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <Button as={Link} to="/objects" variant="ghost" leftIcon={<ArrowLeft />}>
              Назад
            </Button>
            <Box>
              <Heading size="lg" color="brand.500">{obj?.name}</Heading>
              <Text color="text.secondary" mt={1}>Детали объекта</Text>
            </Box>
          </HStack>
          <Button variant="gradient">Редактировать</Button>
        </HStack>

        <VStack spacing={4}>
          <Card className="shadow-construction">
            <CardHeader>
              <Heading size="md">Основная информация</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Box>
                  <Text fontSize="sm" color="text.secondary">Описание</Text>
                  <Text>{obj?.description ?? "—"}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="text.secondary">Цель</Text>
                  <Text>{obj?.goal ?? "—"}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="text.secondary">План</Text>
                  <Text>{obj?.plan ?? "—"}</Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          <VStack align="stretch" spacing={4}>
            <Card className="shadow-construction">
              <CardHeader className="flex items-center justify-between">
                <Heading size="md">Команда</Heading>
                <Dialog open={openAssign} onOpenChange={setOpenAssign}>
                  <DialogTrigger asChild>
                    <Button size="sm">Назначить сотрудника</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Назначить сотрудника</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 py-2">
                      <Label>Сотрудник</Label>
                      <Select onValueChange={(v) => setUserToAssign(Number(v))} aria-label="Сотрудник" title="Выбор сотрудника">
                        <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                        <SelectContent>
                          {availableUsers.map(u => (
                            <SelectItem key={u.id} value={String(u.id)}>{u.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button onClick={assignUser}>Сохранить</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardBody>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Сотрудник</Th>
                      <Th>Роль</Th>
                      <Th className="text-right">Действия</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {assignedUsers.length === 0 && (
                      <Tr>
                        <Td className="text-muted-foreground" colSpan={3}>Пока никто не назначен на объект.</Td>
                      </Tr>
                    )}
                    {assignedUsers.map((u) => (
                      <Tr key={u.id}>
                        <Td className="font-medium">{u.full_name}</Td>
                        <Td>{u.role ?? (u.is_admin ? "admin" : "worker")}</Td>
                        <Td className="text-right">
                          <Button variant="secondary" size="sm" onClick={() => unassignUser(u.id)}>Убрать</Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>

            <Card className="shadow-construction">
              <CardHeader>
                <Heading size="md">Задачи по объекту</Heading>
              </CardHeader>
              <CardBody>
                {objectTasks.length === 0 ? (
                  <Text color="text.secondary">Пока нет задач, связанных с этим объектом.</Text>
                ) : (
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Название</Th>
                        <Th>Статус</Th>
                        <Th>Срок</Th>
                        <Th>Исполнитель</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {objectTasks.map((t) => {
                        const assignee = users.find((u) => u.id === t.assignee_id);
                        return (
                          <Tr key={t.id}>
                            <Td className="font-medium">{t.title}</Td>
                            <Td>{t.status ?? "—"}</Td>
                            <Td>{t.deadline ?? "—"}</Td>
                            <Td>{assignee?.full_name ?? "—"}</Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>

            <Card className="shadow-construction">
              <CardHeader className="flex items-center justify-between">
                <Heading size="md">Этапы работ</Heading>
                <Dialog open={openStage} onOpenChange={setOpenStage}>
                  <DialogTrigger asChild>
                    <Button size="sm">Добавить этап</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый этап</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 py-2">
                      <Label>Название этапа</Label>
                      <Input value={stageName} onChange={(e) => setStageName(e.target.value)} />
                    </div>
                    <DialogFooter>
                      <Button onClick={addStage}>Сохранить</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardBody>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Этап</Th>
                      <Th>Статус</Th>
                      <Th>Прогресс</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {stages.length === 0 && (
                      <Tr>
                        <Td className="text-muted-foreground" colSpan={3}>Этапы не заданы.</Td>
                      </Tr>
                    )}
                    {stages.map((s) => (
                      <Tr key={s.id}>
                        <Td className="font-medium">{s.name}</Td>
                        <Td>{s.status ?? "planned"}</Td>
                        <Td>{s.progress ?? 0}%</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>

            <Card className="shadow-construction">
              <CardHeader className="flex items-center justify-between">
                <Heading size="md">Материалы</Heading>
                <Dialog open={openMat} onOpenChange={setOpenMat}>
                  <DialogTrigger asChild>
                    <Button size="sm">Добавить материал</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый материал</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                      <div className="grid gap-2">
                        <Label>Наименование</Label>
                        <Input value={matName} onChange={(e) => setMatName(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Кол-во</Label>
                          <Input value={matQty} onChange={(e) => setMatQty(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Ед.</Label>
                          <Input value={matUnit} onChange={(e) => setMatUnit(e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addMaterial}>Сохранить</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardBody>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Наименование</Th>
                      <Th>Кол-во</Th>
                      <Th>Ед.</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {materials.length === 0 && (
                      <Tr>
                        <Td className="text-muted-foreground" colSpan={3}>Нет данных по материалам.</Td>
                      </Tr>
                    )}
                    {materials.map((m) => (
                      <Tr key={m.id}>
                        <Td className="font-medium">{m.name}</Td>
                        <Td>{m.qty ?? 0}</Td>
                        <Td>{m.unit ?? "шт"}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>

            <Card className="shadow-construction">
              <CardHeader>
                <Heading size="md">Финансы объекта</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  <Box>
                    <Stat>
                      <StatLabel>Закупки</StatLabel>
                      <StatNumber>₽{finance.totals.purchases.toLocaleString("ru-RU")}</StatNumber>
                      <StatHelpText>Общая сумма закупок</StatHelpText>
                    </Stat>
                  </Box>
                  <Box>
                    <Stat>
                      <StatLabel>Начисления</StatLabel>
                      <StatNumber>₽{finance.totals.salaries.toLocaleString("ru-RU")}</StatNumber>
                      <StatHelpText>Общая сумма начислений</StatHelpText>
                    </Stat>
                  </Box>
                  <Box>
                    <Stat>
                      <StatLabel>Удержания/авансы</StatLabel>
                      <StatNumber>₽{finance.totals.absences.toLocaleString("ru-RU")}</StatNumber>
                      <StatHelpText>Общая сумма удержаний и авансов</StatHelpText>
                    </Stat>
                  </Box>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mt={6}>
                  <Box>
                    <Heading size="md" mb={2}>Закупки</Heading>
                    <Tbl>
                      <Thead>
                        <Tr><Th>Дата</Th><Th>Сумма</Th></Tr>
                      </Thead>
                      <Tbody>
                        {finance.purchases.length === 0 ? (
                          <Tr><Td className="text-muted-foreground" colSpan={2}>Нет данных</Td></Tr>
                        ) : finance.purchases.map((p) => (
                          <Tr key={p.id}><Td>{p.date ?? '—'}</Td><Td>₽{(typeof p.amount === 'number' ? p.amount : Number(p.amount)).toLocaleString('ru-RU')}</Td></Tr>
                        ))}
                      </Tbody>
                    </Tbl>
                  </Box>
                  <Box>
                    <Heading size="md" mb={2}>Начисления</Heading>
                    <Tbl>
                      <Thead>
                        <Tr><Th>Дата</Th><Th>Сумма</Th></Tr>
                      </Thead>
                      <Tbody>
                        {finance.salaries.length === 0 ? (
                          <Tr><Td className="text-muted-foreground" colSpan={2}>Нет данных</Td></Tr>
                        ) : finance.salaries.map((s) => (
                          <Tr key={s.id}><Td>{s.date ?? '—'}</Td><Td>₽{Number(s.amount).toLocaleString('ru-RU')}</Td></Tr>
                        ))}
                      </Tbody>
                    </Tbl>
                  </Box>
                  <Box>
                    <Heading size="md" mb={2}>Удерж/Авансы</Heading>
                    <Tbl>
                      <Thead>
                        <Tr><Th>Дата</Th><Th>Тип</Th><Th>Сумма</Th></Tr>
                      </Thead>
                      <Tbody>
                        {finance.absences.length === 0 ? (
                          <Tr><Td className="text-muted-foreground" colSpan={3}>Нет данных</Td></Tr>
                        ) : finance.absences.map((a) => (
                          <Tr key={a.id}><Td>{a.date ?? '—'}</Td><Td>{a.type ?? '—'}</Td><Td>₽{Number(a.amount).toLocaleString('ru-RU')}</Td></Tr>
                        ))}
                      </Tbody>
                    </Tbl>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          </VStack>
        </VStack>
      </Box>
    </>
  );
} 