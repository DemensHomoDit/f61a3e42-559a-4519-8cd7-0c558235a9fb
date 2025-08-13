import { 
  BarChart3, 
  Building, 
  CheckSquare, 
  DollarSign, 
  Users, 
  Package, 
  Truck, 
  Brain,
  Home,
  MessageSquareText,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Button,
  Avatar,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import { useSidebar } from "@/contexts/SidebarContext";

const items = [
  { title: "Дашборд", url: "/", icon: Home },
  { title: "Объекты", url: "/objects", icon: Building },
  { title: "Задачи", url: "/tasks", icon: CheckSquare },
  { title: "Сотрудники", url: "/people", icon: Users },
  { title: "Финансы", url: "/finances", icon: DollarSign },
  { title: "Материалы", url: "/materials", icon: Package },
  { title: "Справочники", url: "/catalog", icon: Truck },
  { title: "Аналитика", url: "/analytics", icon: Brain },
  { title: "Настройки", url: "/settings", icon: Settings },
  { title: "Документы", url: "/documents", icon: FileText },
];

export function AppSidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Box
      as="aside"
      w={isExpanded ? "260px" : "80px"}
      bg="bg.sidebar"
      borderRightWidth="1px"
      borderColor="border.light"
      transition="width 0.3s ease"
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      zIndex={10}
      display="flex"
      flexDirection="column"
      boxShadow="shadow.sm"
    >
      {/* Logo */}
      <Box p={4} borderBottomWidth="1px" borderColor="border.light" bg="bg.secondary">
        <HStack justify="space-between" align="center">
          {isExpanded && (
            <HStack spacing={2}>
              <Icon as={Building} boxSize={6} color="brand.500" />
              <Text fontWeight={600} fontSize="lg" color="brand.500">UgraBuilders</Text>
            </HStack>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            p={2}
            minW="auto"
            h="auto"
            color="text.secondary"
            _hover={{
              bg: "bg.tertiary",
              color: "text.primary"
            }}
          >
            <Icon as={isExpanded ? ChevronLeft : ChevronRight} boxSize={4} />
          </Button>
        </HStack>
      </Box>

      {/* Navigation */}
      <VStack flex={1} spacing={1} p={2} align="stretch">
        <Text fontSize="xs" fontWeight={600} color="text.secondary" px={3} py={2}>
          {isExpanded ? "Управление" : ""}
        </Text>
        
        {items.map((item) => (
          <Button
            key={item.title}
            as={NavLink}
            to={item.url}
            variant="ghost"
            justifyContent={isExpanded ? "flex-start" : "center"}
            h="auto"
            py={3}
            px={3}
            bg={isActive(item.url) ? "brand.500" : "transparent"}
            color={isActive(item.url) ? "white" : "text.primary"}
            _hover={{
              bg: isActive(item.url) ? "brand.600" : "bg.tertiary",
              color: isActive(item.url) ? "white" : "text.primary",
              transform: "translateX(2px)",
            }}
            transition="all 0.2s ease"
            borderRadius="md"
            fontWeight={isActive(item.url) ? "600" : "500"}
          >
            <HStack spacing={3} w="full">
              <Icon as={item.icon} boxSize={5} />
              {isExpanded && <Text fontSize="sm">{item.title}</Text>}
            </HStack>
          </Button>
        ))}
      </VStack>

      {/* Admin Profile */}
      <Box p={3} borderTopWidth="1px" borderColor="border.light" bg="bg.secondary">
        <HStack spacing={3} align="center">
          <Avatar size="sm" name="Администратор" bg="brand.500" color="white" />
          {isExpanded && (
            <VStack spacing={0} align="flex-start" flex={1}>
              <Text fontSize="sm" fontWeight={600} color="text.primary">Администратор</Text>
              <Text fontSize="xs" color="text.secondary">Владелец</Text>
            </VStack>
          )}
        </HStack>
      </Box>
    </Box>
  );
}