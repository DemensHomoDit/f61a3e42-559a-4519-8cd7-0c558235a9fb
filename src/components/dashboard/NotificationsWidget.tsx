import { Box, HStack, VStack, Text, Button } from "@chakra-ui/react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

interface NotificationsWidgetProps {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  onOpenNotifications: () => void;
  onMarkAsRead: (id: string) => void;
  formatDateOnly: (date?: string) => string;
  TYPE_RU: Record<string, string>;
  readNotifications: Set<string>; // Добавляем информацию о прочитанных уведомлениях
}

export function NotificationsWidget({ 
  notifications, 
  unreadCount, 
  loading, 
  onOpenNotifications, 
  onMarkAsRead, 
  formatDateOnly, 
  TYPE_RU, 
  readNotifications 
}: NotificationsWidgetProps) {
  return (
    <Box className="modern-card">
      <HStack justify="space-between" align="center" mb={4}>
        <HStack spacing={3}>
          <Box className="relative">
            <Bell size={20} color="#6b7280" />
            {unreadCount > 0 && (
              <Box
                position="absolute"
                top="-2"
                right="-2"
                className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Box>
            )}
          </Box>
          <Text className="text-lg font-semibold text-gray-800">
            Уведомления
          </Text>
        </HStack>
        <Button
          className="modern-button-secondary"
          size="sm"
          onClick={onOpenNotifications}
        >
          Все уведомления
        </Button>
      </HStack>
      
      {loading ? (
        <VStack align="stretch" spacing={2}>
          {[1,2,3,4,5].map(i => (
            <Box key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </VStack>
      ) : (
        <VStack align="stretch" spacing={2}>
          {notifications.slice(0,5).map((n) => {
            const to = n.id.startsWith('t-') || n.id.startsWith('td-') ? `/tasks/${n.id.split('-')[1]}` : n.id.startsWith('p-') ? '/finances' : '/notifications';
            return (
              <HStack 
                as={Link} 
                to={to} 
                key={n.id} 
                justify="space-between" 
                p={3} 
                className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => onMarkAsRead(n.id)}
              >
                <VStack align="start" spacing={1} flex="1">
                  <Text className="text-gray-800 text-sm">{n.title ?? 'Событие'}</Text>
                  {n.date && (
                    <Text className="text-gray-500 text-xs">
                      {formatDateOnly(n.date)}
                    </Text>
                  )}
                </VStack>
                <Box className={`modern-badge ${n.type === 'warning' ? 'modern-badge-warning' : n.type === 'error' ? 'modern-badge-warning' : n.type === 'success' ? 'modern-badge-success' : ''}`}>
                  {TYPE_RU[n.type] ?? 'Инфо'}
                </Box>
                {!readNotifications.has(n.id) && (
                  <Box className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </HStack>
            );
          })}
          {notifications.length === 0 && (
            <Box className="text-center py-8">
              <Bell size={32} color="#9ca3af" className="mx-auto mb-2" />
              <Text className="text-gray-500">Нет уведомлений</Text>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
} 