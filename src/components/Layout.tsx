import { AppSidebar } from "@/components/AppSidebar";
import { Building2, Bell, Settings, User, Sparkles, Plus, Menu as MenuIcon, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Box, 
  HStack, 
  Icon, 
  Button, 
  Input, 
  InputGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  useDisclosure,
  Text,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getObjects, getUsers, getTasks, setAuthToken } from "@/api/client";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { isExpanded, toggleSidebar } = useSidebar();
  const { user, logout: authLogout } = useAuth();
  const { getRoleName } = usePermissions();
  
  const { data: objects = [] } = useQuery({ queryKey: ["objects"], queryFn: getObjects });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });

  const [q, setQ] = useState("");
  const matches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [] as { type: string; label: string; to: string }[];
    const res: { type: string; label: string; to: string }[] = [];
    (objects as any[]).forEach(o=>{ if((o.name||'').toLowerCase().includes(query)) res.push({type:'Объект', label:o.name, to:`/objects/${o.id}`}); });
    (users as any[]).forEach(u=>{ if((u.full_name||'').toLowerCase().includes(query)) res.push({type:'Сотрудник', label:u.full_name, to:`/people/${u.id}`}); });
    (tasks as any[]).forEach(t=>{ if((t.title||'').toLowerCase().includes(query)) res.push({type:'Задача', label:t.title, to:`/tasks/${t.id}`}); });
    return res.slice(0,8);
  }, [q, objects, users, tasks]);

  const handleLogout = () => {
    authLogout();
    navigate("/login");
  };

  return (
    <Box minH="100vh" display="flex" w="full">
      <AppSidebar />
      <Box flex={1} display="flex" flexDirection="column" ml={isExpanded ? "260px" : "80px"} transition="margin-left 0.3s ease">
        <Box as="header" h="64px" bg="white" boxShadow="header" borderBottomWidth="1px" px={6} display="flex" alignItems="center" justifyContent="space-between" position="sticky" top={0} zIndex={5}>
          <HStack spacing={4} align="center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              p={2}
              minW="auto"
              h="auto"
            >
              <Icon as={MenuIcon} boxSize={5} />
            </Button>
            <HStack spacing={2}>
              <Icon as={Building2} boxSize={6} color="brand.500" />
              <Box as="span" fontWeight={600} fontSize="lg" color="brand.500">ПромСтрой Контроль</Box>
            </HStack>
          </HStack>

          <HStack spacing={3} w="full" maxW="2xl" mx={4}>
            <Box position="relative" flex={1}>
              <InputGroup>
                <Input placeholder="Поиск: объекты, сотрудники, задачи…" value={q} onChange={(e)=>setQ(e.target.value)} />
              </InputGroup>
              {q && (
                <Box position="absolute" zIndex={50} mt={1} w="full" rounded="md" borderWidth="1px" bg="white" p={2} maxH="60" overflowY="auto" boxShadow="card">
                  {matches.length===0 && <Box fontSize="sm" color="text.secondary">Ничего не найдено</Box>}
                  {matches.map((m, idx)=> (
                    <Box key={idx} fontSize="sm" px={2} py={1} _hover={{ bg: "table.rowAlt" }} rounded="md">
                      <Link to={m.to} onClick={()=>setQ("")}> <Box as="span" color="text.secondary" mr={2}>{m.type}:</Box> {m.label}</Link>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            
            {/* Add Button */}
            <Menu>
              <MenuButton as={Button} variant="gradient" leftIcon={<Icon as={Plus} boxSize={4} />}>
                Добавить
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => navigate('/objects')}>Новый объект</MenuItem>
                <MenuItem onClick={() => navigate('/tasks')}>Новая задача</MenuItem>
                <MenuItem onClick={() => navigate('/people')}>Новый сотрудник</MenuItem>
                <MenuItem onClick={() => navigate('/materials')}>Новый материал</MenuItem>
                <MenuDivider />
                <MenuItem onClick={() => navigate('/finances')}>Новая закупка</MenuItem>
              </MenuList>
            </Menu>
            
            <Button variant="gradient" as={Link} to="/chat"><Icon as={Sparkles} boxSize={4} mr={2} />ИИ</Button>
            <Button variant="gradient" as={Link} to="/notifications"><Icon as={Bell} boxSize={4} /></Button>
            
            {/* Admin Profile Menu */}
            <Menu>
              <MenuButton as={Button} variant="ghost" p={2}>
                <Avatar size="sm" name={user?.full_name || 'Пользователь'} />
              </MenuButton>
              <MenuList>
                <Box px={3} py={2} borderBottomWidth="1px">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium" fontSize="sm">
                      {user?.full_name || 'Пользователь'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {user?.position || 'Должность не указана'}
                    </Text>
                    <Badge colorScheme="green" size="sm">
                      {user?.role ? getRoleName(user.role) : 'Роль не назначена'}
                    </Badge>
                  </VStack>
                </Box>
                <MenuDivider />
                <MenuItem as={Link} to="/settings">Настройки</MenuItem>
                <MenuItem as={Link} to="/profile">Профиль</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout} icon={<Icon as={LogOut} />}>
                  Выйти
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>

        <Box as="main" flex={1} p={6}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}