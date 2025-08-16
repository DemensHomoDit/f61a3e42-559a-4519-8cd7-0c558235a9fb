import { Box, HStack, VStack, Text, Button } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface ObjectsWidgetProps {
  objects: any[];
  loading: boolean;
  onToggleWidget: () => void;
}

export function ObjectsWidget({ objects, loading, onToggleWidget }: ObjectsWidgetProps) {
  return (
    <Box className="modern-card">
      <HStack justify="space-between" align="center" mb={4}>
        <Text className="text-lg font-semibold text-gray-800">
          Объекты в работе
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
          <Box className="h-12 bg-gray-200 rounded-xl animate-pulse" />
        </VStack>
      ) : (
        <VStack align="stretch" spacing={3}>
          {objects.slice(0, 3).map((o: any) => (
            <HStack 
              as={Link} 
              to={`/objects/${o.id}`} 
              key={o.id} 
              justify="space-between" 
              p={4} 
              className="bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <VStack align="start" spacing={1}>
                <Text className="font-semibold text-gray-800">{o.name}</Text>
                <Text className="text-sm text-gray-600">{o.address || 'Адрес не указан'}</Text>
              </VStack>
              <Box className="modern-badge-success">
                В работе
              </Box>
            </HStack>
          ))}
          {objects.length > 3 && (
            <Button 
              className="modern-button-secondary w-full"
              as={Link} 
              to="/objects"
            >
              Показать все ({objects.length})
            </Button>
          )}
        </VStack>
      )}
    </Box>
  );
} 