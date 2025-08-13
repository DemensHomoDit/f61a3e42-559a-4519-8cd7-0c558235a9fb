import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getBrigades, getBrigadeMembers, getUsers } from "@/api/mock";
import type { Brigade, BrigadeMember, User } from "@/types";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Button as ChakraButton,
  Avatar,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from "@chakra-ui/react";
import { Plus, Users } from "lucide-react";
import { downloadCSV } from "@/lib/export";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

export default function Brigades() {
  const { data: brigades = [] } = useQuery<Brigade[]>({ queryKey: ["brigades"], queryFn: () => getBrigades() });
  const { data: members = [] } = useQuery<BrigadeMember[]>({ queryKey: ["brigade_members"], queryFn: () => getBrigadeMembers() });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: () => getUsers() });

  const [localMembers, setLocalMembers] = useState<BrigadeMember[]>(members);

  const userMap = useMemo(() => new Map(users.map(u => [u.id, u.full_name] as const)), [users]);

  const [open, setOpen] = useState(false);
  const [chosenBrigade, setChosenBrigade] = useState<number | undefined>(brigades[0]?.id);
  const [chosenUser, setChosenUser] = useState<number | undefined>(undefined);

  const addMember = () => {
    if (!chosenBrigade || !chosenUser) return;
    setLocalMembers((prev) => [...prev, { brigade_id: chosenBrigade, user_id: chosenUser }]);
    setOpen(false);
  };

  const removeMember = (b: number, u: number) => {
    setLocalMembers((prev) => prev.filter(m => !(m.brigade_id === b && m.user_id === u)));
  };

  return (
    <>
      <Helmet>
        <title>Бригады — ПромСтрой Контроль</title>
        <meta name="description" content="Управление бригадами: состав, задачи, эффективность." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg" color="brand.500">Бригады</Heading>
            <Text color="text.secondary" mt={1}>Управление бригадами</Text>
          </Box>
          <HStack>
            <ChakraButton variant="gradient" leftIcon={<Plus />}>Создать бригаду</ChakraButton>
            <ChakraButton variant="gradient" onClick={() => downloadCSV('brigades.csv', brigades)}>Экспорт CSV</ChakraButton>
          </HStack>
        </HStack>

        <section className="grid gap-6 md:grid-cols-2">
          {brigades.map((b) => {
            const bm = localMembers.filter(m => m.brigade_id === b.id);
            return (
              <Card key={b.id} className="shadow-construction">
                <CardHeader>
                  <CardTitle>{b.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bm.length === 0 && <div className="text-muted-foreground text-sm">Нет участников</div>}
                    {bm.map(m => (
                      <div key={`${m.brigade_id}-${m.user_id}`} className="flex items-center justify-between">
                        <div>{userMap.get(m.user_id) ?? `ID ${m.user_id}`}</div>
                        <Button size="sm" variant="secondary" onClick={() => removeMember(m.brigade_id, m.user_id)}>Убрать</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </Box>
    </>
  );
} 