import { Box, HStack, VStack, Text, Button } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface CriticalTasksWidgetProps {
  criticalTasks: any[];
  allTasks: any[];
  users: any[];
  loading: boolean;
  onToggleWidget: () => void;
  formatDateOnly: (date?: string) => string;
  STATUS_RU: Record<string, string>;
}

export function CriticalTasksWidget({ 
  criticalTasks, 
  allTasks, 
  users, 
  loading, 
  onToggleWidget, 
  formatDateOnly, 
  STATUS_RU 
}: CriticalTasksWidgetProps) {
  return (
    <Box className="modern-card">
      <HStack justify="space-between" align="center" mb={4}>
        <Text className="text-lg font-semibold text-gray-800">
          Критические задачи
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
          <Box className="h-16 bg-gray-200 rounded-xl animate-pulse" />
          <Box className="h-16 bg-gray-200 rounded-xl animate-pulse" />
          <Box className="h-16 bg-gray-200 rounded-xl animate-pulse" />
        </VStack>
      ) : (
        <VStack align="stretch" spacing={3}>
          {criticalTasks.slice(0, 3).map((t: any) => {
            const statusText = (STATUS_RU as any)[t.status ?? 'new'] ?? '—';
            const assignee = (users as any[]).find((u:any) => u.id === t.assignee_id);
            return (
              <HStack 
                as={Link} 
                to={`/tasks/${t.id}`} 
                key={t.id} 
                justify="space-between" 
                p={4} 
                className="bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <VStack align="start" spacing={1}>
                  <Text className="font-semibold text-gray-800">{t.title}</Text>
                  <Text className="text-sm text-gray-600">Исполнитель: {assignee?.full_name ?? '—'}</Text>
                  <Text className="text-sm text-gray-600">{formatDateOnly(t.deadline)}</Text>
                </VStack>
                <Box className="modern-badge-warning">
                  {statusText}
                </Box>
              </HStack>
            );
          })}
          {criticalTasks.length === 0 && (
            <Text className="text-gray-600 text-center py-4">
              Критических задач нет
            </Text>
          )}
          {allTasks.length > 3 && (
            <Button 
              className="modern-button-secondary w-full"
              as={Link} 
              to="/tasks"
            >
              Показать все ({allTasks.length})
            </Button>
          )}
        </VStack>
      )}
    </Box>
  );
} 