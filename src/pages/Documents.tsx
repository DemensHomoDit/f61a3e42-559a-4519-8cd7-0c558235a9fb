import { Helmet } from "react-helmet-async";
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Card, 
  CardHeader, 
  CardBody,
  Button,
  HStack,
  Badge
} from "@chakra-ui/react";
import { FileText, Download, Plus } from "lucide-react";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Documents = () => {
  const documents = [
    { id: 1, name: "Договор подряда №001", type: "Договор", date: "2024-01-15", status: "Активный" },
    { id: 2, name: "Смета объекта А", type: "Смета", date: "2024-01-10", status: "Утверждена" },
    { id: 3, name: "Акт выполненных работ", type: "Акт", date: "2024-01-05", status: "Подписан" },
  ];

  return (
    <>
      <Helmet>
        <title>Документы — ПромСтрой Контроль</title>
        <meta name="description" content="Управление документами: договоры, акты, сметы." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg" color="brand.500">Документы</Heading>
            <Text color="text.secondary" mt={1}>Управление документами</Text>
          </Box>
          <Button variant="gradient" leftIcon={<Plus />}>Добавить документ</Button>
        </HStack>

        <VStack align="stretch" spacing={6}>
          {documents.map((doc) => (
            <Card key={doc.id} variant="outline" boxShadow="md">
              <CardHeader>
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{doc.name}</Heading>
                    <Badge variant="subtle" colorScheme="blue">
                      {doc.type}
                    </Badge>
                  </VStack>
                  <HStack spacing={2}>
                    <Badge variant="subtle" colorScheme="green">
                      {doc.status}
                    </Badge>
                    <Text fontSize="sm" color="text.secondary">
                      {doc.date}
                    </Text>
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody>
                <HStack justify="space-between" align="center">
                  <Button leftIcon={<FileText />} variant="ghost" colorScheme="blue">
                    Просмотр
                  </Button>
                  <Button leftIcon={<Download />} variant="ghost" colorScheme="purple">
                    Скачать
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Box>
    </>
  );
};

export default Documents; 