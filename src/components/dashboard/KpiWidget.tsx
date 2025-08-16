import { Box, SimpleGrid, HStack, VStack, Text } from "@chakra-ui/react";
import { Building, Users, CheckSquare, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

interface KpiWidgetProps {
  objectsCount: number;
  usersCount: number;
  tasksCount: number;
  payables: number;
}

export function KpiWidget({ objectsCount, usersCount, tasksCount, payables }: KpiWidgetProps) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
      <Box className="modern-stats-card" as={Link} to="/objects">
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2}>
            <Text className="text-3xl font-bold text-gray-800">
              {objectsCount}
            </Text>
            <Text className="text-gray-600 text-sm">
              Объектов (всего)
            </Text>
          </VStack>
          <Box className="modern-stats-icon">
            <Building size={24} color="white" />
          </Box>
        </HStack>
      </Box>
      
      <Box className="modern-stats-card" as={Link} to="/people">
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2}>
            <Text className="text-3xl font-bold text-gray-800">
              {usersCount}
            </Text>
            <Text className="text-gray-600 text-sm">
              Сотрудников
            </Text>
          </VStack>
          <Box className="modern-stats-icon">
            <Users size={24} color="white" />
          </Box>
        </HStack>
      </Box>
      
      <Box className="modern-stats-card" as={Link} to="/tasks">
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2}>
            <Text className="text-3xl font-bold text-gray-800">
              {tasksCount}
            </Text>
            <Text className="text-gray-600 text-sm">
              Задач
            </Text>
          </VStack>
          <Box className="modern-stats-icon">
            <CheckSquare size={24} color="white" />
          </Box>
        </HStack>
      </Box>
      
      <Box className="modern-stats-card" as={Link} to="/finances">
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2}>
            <Text className="text-3xl font-bold text-gray-800">
              ₽{payables.toLocaleString('ru-RU')}
            </Text>
            <Text className="text-gray-600 text-sm">
              Выплаты к оплате
            </Text>
          </VStack>
          <Box className="modern-stats-icon">
            <DollarSign size={24} color="white" />
          </Box>
        </HStack>
      </Box>
    </SimpleGrid>
  );
} 