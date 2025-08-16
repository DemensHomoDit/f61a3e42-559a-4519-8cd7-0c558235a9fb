import { Box, HStack, VStack, Text, Input, Button } from "@chakra-ui/react";
import { Bell, Settings as SettingsIcon } from "lucide-react";

interface DashboardHeaderProps {
  user: any;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export function DashboardHeader({
  user,
  searchQuery,
  onSearchChange,
  unreadCount,
  onOpenNotifications,
  onOpenSettings
}: DashboardHeaderProps) {
  return (
    <Box className="modern-header mb-8">
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Text className="text-2xl font-bold text-gray-800">
            Дашборд
          </Text>
          <Text className="text-gray-600">
            {user?.position || 'Администратор'}
          </Text>
        </VStack>
        
        {/* Поиск, уведомления и настройки */}
        <HStack spacing={4}>
          <Input 
            className="modern-search w-80"
            placeholder="Поиск..."
            value={searchQuery} 
            onChange={(e) => onSearchChange(e.target.value)}
          />
          
          {/* Колокольчик уведомлений */}
          <Button
            className="modern-button-secondary relative"
            size="sm"
            onClick={onOpenNotifications}
            position="relative"
          >
            <Bell size={16} />
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
          </Button>
          
          <Button 
            className="modern-button-secondary"
            size="sm"
            onClick={onOpenSettings}
          >
            <SettingsIcon size={16} />
            Настроить
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
} 