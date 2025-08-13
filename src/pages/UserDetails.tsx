import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUsers, getUserTimesheets, getUserFinance, getTasks, getObjects } from "@/api/mock";
import type { User, Timesheet, Task, ObjectEntity } from "@/types";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Avatar,
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
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

export default function UserDetails() {
  const params = useParams();
  const userId = Number(params.id);

  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: () => getUsers() });
  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["tasks"], queryFn: () => getTasks() });
  const { data: objects = [] } = useQuery<ObjectEntity[]>({ queryKey: ["objects"], queryFn: () => getObjects() });

  const user = users.find(u => u.id === userId);
  const timesheets: Timesheet[] = getUserTimesheets(userId);
  const finance = getUserFinance(userId);

  const idToObject = new Map(objects.map(o => [o.id, o.name] as const));
  const idToTask = new Map(tasks.map(t => [t.id, t.title] as const));

  return (
    <>
      <Helmet>
        <title>{user ? `${user.full_name} — Сотрудник` : 'Сотрудник'} — ПромСтрой Контроль</title>
        <meta name="description" content="Профиль сотрудника: табель, задачи и финансы." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <Button as={Link} to="/people" variant="ghost" leftIcon={<ArrowLeft />}>
              Назад
            </Button>
            <Box>
              <Heading size="lg" color="brand.500">{user?.full_name}</Heading>
              <Text color="text.secondary" mt={1}>Профиль сотрудника</Text>
            </Box>
          </HStack>
          <Button variant="gradient">Редактировать</Button>
        </HStack>

        <VStack align="stretch" spacing={4}>
          <Card className="shadow-construction">
            <CardHeader>
              <Heading size="md">Общая информация</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Stat>
                  <StatLabel>Всего записей табеля</StatLabel>
                  <StatNumber>{timesheets.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Начисления</StatLabel>
                  <StatNumber>₽{finance.totals.salaries.toLocaleString('ru-RU')}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Удерж/Авансы</StatLabel>
                  <StatNumber>₽{finance.totals.absences.toLocaleString('ru-RU')}</StatNumber>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>

          <Card className="shadow-construction">
            <CardHeader>
              <Heading size="md">Табель</Heading>
            </CardHeader>
            <CardBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Дата/время начала</Th>
                    <Th>Конец</Th>
                    <Th>Длительность, мин</Th>
                    <Th>Объект</Th>
                    <Th>Задача</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {timesheets.length === 0 && (
                    <Tr>
                      <Td colSpan={5} textAlign="center" color="text.secondary">Нет записей табеля.</Td>
                    </Tr>
                  )}
                  {timesheets.map((t) => (
                    <Tr key={t.id}>
                      <Td>{t.start_time ?? '—'}</Td>
                      <Td>{t.end_time ?? '—'}</Td>
                      <Td>{t.duration_minutes ?? '—'}</Td>
                      <Td>{idToObject.get(t.object_id ?? 0) ?? '—'}</Td>
                      <Td>{idToTask.get(t.task_id ?? 0) ?? '—'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          <Card className="shadow-construction">
            <CardHeader>
              <Heading size="md">Финансы сотрудника</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <VStack align="stretch">
                  <Heading size="md">Начисления</Heading>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Дата</Th>
                        <Th>Сумма</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {finance.salaries.length === 0 && (
                        <Tr>
                          <Td colSpan={2} textAlign="center" color="text.secondary">Нет данных</Td>
                        </Tr>
                      )}
                      {finance.salaries.map((s) => (
                        <Tr key={s.id}>
                          <Td>{s.date ?? '—'}</Td>
                          <Td>₽{Number(s.amount).toLocaleString('ru-RU')}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </VStack>
                <VStack align="stretch">
                  <Heading size="md">Удержания/Авансы</Heading>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Дата</Th>
                        <Th>Тип</Th>
                        <Th>Сумма</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {finance.absences.length === 0 && (
                        <Tr>
                          <Td colSpan={3} textAlign="center" color="text.secondary">Нет данных</Td>
                        </Tr>
                      )}
                      {finance.absences.map((a) => (
                        <Tr key={a.id}>
                          <Td>{a.date ?? '—'}</Td>
                          <Td>{a.type ?? '—'}</Td>
                          <Td>₽{Number(a.amount).toLocaleString('ru-RU')}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </>
  );
} 