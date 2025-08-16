import { Box, HStack, VStack, Text, Button } from "@chakra-ui/react";
import { AlertTriangle, Users, Clock, Building, CheckSquare } from "lucide-react";

interface WarningsWidgetProps {
  overdueCount: number;
  absentEmployees: any[];
  idleEmployees: any[];
  inactiveObjects: any[];
  loading: boolean;
  onToggleWidget: () => void;
}

export function WarningsWidget({ 
  overdueCount, 
  absentEmployees, 
  idleEmployees, 
  inactiveObjects, 
  loading, 
  onToggleWidget 
}: WarningsWidgetProps) {
  return (
    <Box className="modern-card">
      <HStack justify="space-between" align="center" mb={4}>
        <Text className="text-lg font-semibold text-gray-800">
          Предупреждения
        </Text>
        <Button 
          className="modern-button-secondary"
          size="sm" 
          onClick={onToggleWidget}
        >
          <AlertTriangle size={16} />
        </Button>
      </HStack>
      
      {loading ? (
        <VStack align="stretch" spacing={3}>
          <Box className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          <Box className="h-12 bg-gray-200 rounded-xl animate-pulse" />
        </VStack>
      ) : (
        <VStack align="stretch" spacing={3}>
          {overdueCount > 0 && (
            <HStack p={4} className="bg-red-50 rounded-xl border border-red-200">
              <AlertTriangle size={20} color="#FF9AA2" />
              <Text className="text-sm text-red-700">
                Просрочено задач: {overdueCount}
              </Text>
            </HStack>
          )}
          
          {absentEmployees.length > 0 && (
            <HStack p={4} className="bg-orange-50 rounded-xl border border-orange-200">
              <Users size={20} color="#FFB3BA" />
              <Text className="text-sm text-orange-700">
                Не вышли на работу: {absentEmployees.length} чел.
              </Text>
            </HStack>
          )}
          
          {idleEmployees.length > 0 && (
            <HStack p={4} className="bg-yellow-50 rounded-xl border border-yellow-200">
              <Clock size={20} color="#FFD93D" />
              <Text className="text-sm text-yellow-700">
                Сотрудников в простое: {idleEmployees.length} чел.
              </Text>
            </HStack>
          )}
          
          {inactiveObjects.length > 0 && (
            <HStack p={4} className="bg-blue-50 rounded-xl border border-blue-200">
              <Building size={20} color="#A5B4FC" />
              <Text className="text-sm text-blue-700">
                Объектов без активных задач: {inactiveObjects.length}
              </Text>
            </HStack>
          )}
          
          {overdueCount === 0 && absentEmployees.length === 0 && idleEmployees.length === 0 && inactiveObjects.length === 0 && (
            <HStack p={4} className="bg-green-50 rounded-xl border border-green-200">
              <CheckSquare size={20} color="#86EFAC" />
              <Text className="text-sm text-green-700">
                Все в порядке! Нет критических предупреждений
              </Text>
            </HStack>
          )}
        </VStack>
      )}
    </Box>
  );
} 