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
      bg="white"
      borderRightWidth="1px"
      borderColor="gray.200"
      transition="width 0.3s ease"
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      zIndex={10}
      display="flex"
      flexDirection="column"
      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    >
      {/* Logo */}
      <Box p={4} borderBottomWidth="1px" borderColor="gray.200" bg="gray.50">
        <HStack justify="space-between" align="center">
          {isExpanded && (
            <HStack spacing={2}>
              <img 
                src="/logo.svg" 
                alt="UgraBuilders"
                style={{ width: '24px', height: '24px' }}
              />
              <Text fontWeight={600} fontSize="lg" color="green.600">UgraBuilders</Text>
            </HStack>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            p={isExpanded ? 2 : 1}
            minW="auto"
            h="auto"
            color="gray.600"
            _hover={{
              bg: "gray.100",
              color: "gray.800"
            }}
          >
            <Icon as={isExpanded ? ChevronLeft : ChevronRight} boxSize={isExpanded ? 4 : 3} />
          </Button>
        </HStack>
      </Box>

      {/* Navigation */}
      <VStack flex={1} spacing={1} p={2} align="stretch">
        <Text fontSize="xs" fontWeight={600} color="gray.500" px={3} py={2}>
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
            bg={isActive(item.url) ? "green.500" : "transparent"}
            color={isActive(item.url) ? "white" : "gray.700"}
            _hover={{
              bg: isActive(item.url) ? "green.600" : "gray.100",
              color: isActive(item.url) ? "white" : "gray.800",
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
      <Box p={3} borderTopWidth="1px" borderColor="gray.200" bg="gray.50">
        <HStack spacing={3} align="center">
          <Avatar size="sm" name="Администратор" bg="green.500" color="white" />
          {isExpanded && (
            <VStack spacing={0} align="flex-start" flex={1}>
              <Text fontSize="sm" fontWeight={600} color="gray.800">Администратор</Text>
              <Text fontSize="xs" color="gray.600">Владелец</Text>
            </VStack>
          )}
        </HStack>
      </Box>
    </Box>
  );
}