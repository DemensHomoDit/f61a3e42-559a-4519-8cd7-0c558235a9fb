import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTasks, getUsers, getChecklist, getObjects } from "@/api/mock";
import type { Task, User, ChecklistItem, ObjectEntity } from "@/types";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
  Avatar,
  Divider
} from "@chakra-ui/react";
import { ArrowLeft, Calendar, User as UserIcon, Building } from "lucide-react";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

export default function TaskDetails() {
  const params = useParams();
  const taskId = Number(params.id);

  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["tasks"], queryFn: () => getTasks() });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: () => getUsers() });
  const { data: objects = [] } = useQuery<ObjectEntity[]>({ queryKey: ["objects"], queryFn: () => getObjects() });

  const task = tasks.find(t => t.id === taskId);
  const assignee = users.find(u => u.id === task?.assignee_id);
  const object = objects.find(o => o.id === task?.object_id);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(getChecklist(taskId));

  const toggle = (id: string) => {
    setChecklist((arr) => arr.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  return (
    <>
      <Helmet>
        <title>{task?.title} — ПромСтрой Контроль</title>
        <meta name="description" content={`Детали задачи: ${task?.title}`} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <Button as={Link} to="/tasks" variant="ghost" leftIcon={<ArrowLeft />}>
              Назад
            </Button>
            <Box>
              <Heading size="lg" color="brand.500">{task?.title}</Heading>
              <Text color="text.secondary" mt={1}>Детали задачи</Text>
            </Box>
          </HStack>
          <Button variant="gradient">Редактировать</Button>
        </HStack>

        <VStack spacing={4}>
          <Card className="shadow-construction">
            <CardHeader>
              <Heading size="md">Параметры</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={2}>
                <HStack justify="space-between" w="full">
                  <Badge colorScheme="blue">Статус</Badge>
                  <Text>{task?.status ?? '—'}</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Badge colorScheme="purple">Дедлайн</Badge>
                  <Text>{task?.deadline ?? '—'}</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Badge colorScheme="green">Тип</Badge>
                  <Text>{task?.task_type ?? '—'}</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Badge colorScheme="red">Оплата</Badge>
                  <Text>{task?.pay_type ?? '—'}</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card className="shadow-construction">
            <CardHeader>
              <Heading size="md">Чек-лист</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={2}>
                {checklist.map((c) => (
                  <HStack key={c.id} justify="space-between" w="full">
                    <Checkbox checked={c.done} onChange={() => toggle(c.id)} />
                    <Text className={c.done ? 'line-through text-muted-foreground' : ''}>{c.title}</Text>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </>
  );
} 