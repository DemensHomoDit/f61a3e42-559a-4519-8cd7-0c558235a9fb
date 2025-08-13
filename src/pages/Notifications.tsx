import { Helmet } from "react-helmet-async";
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Card, 
  CardHeader, 
  CardBody,
  Badge,
  HStack
} from "@chakra-ui/react";
import { Bell, AlertCircle, CheckCircle, Info } from "lucide-react";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Notifications = () => {
  const notifications = [
    { id: 1, title: "Новая задача", message: "Создана новая задача 'Ремонт кровли'", type: "info", time: "2 минуты назад" },
    { id: 2, title: "Просроченная задача", message: "Задача 'Укладка плитки' просрочена", type: "warning", time: "1 час назад" },
    { id: 3, title: "Задача завершена", message: "Задача 'Монтаж окон' выполнена", type: "success", time: "3 часа назад" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "warning": return AlertCircle;
      case "success": return CheckCircle;
      default: return Info;
    }
  };

  const getColorScheme = (type: string) => {
    switch (type) {
      case "warning": return "orange";
      case "success": return "green";
      default: return "blue";
    }
  };

  return (
    <>
      <Helmet>
        <title>Уведомления — ПромСтрой Контроль</title>
        <meta name="description" content="Системные уведомления и события." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="800px" mx="auto">
        <Box>
          <Heading size="lg" color="brand.500">Уведомления</Heading>
          <Text color="text.secondary" mt={1}>Системные уведомления</Text>
        </Box>

        <VStack spacing={3}>
          {notifications.map((notification) => (
            <Card key={notification.id} variant="outline" borderColor="gray.200" borderRadius="md">
              <CardHeader>
                <HStack justifyContent="space-between" alignItems="center">
                  <Badge colorScheme={getColorScheme(notification.type)}>{notification.type}</Badge>
                  <Text fontSize="sm" color="gray.500">{notification.time}</Text>
                </HStack>
                <Heading size="md" mt={2}>{notification.title}</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm" color="gray.700">{notification.message}</Text>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Box>
    </>
  );
};

export default Notifications; 