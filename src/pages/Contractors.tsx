import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getContractors } from "@/api/client";
import { 
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Card, 
  CardHeader, 
  CardBody,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from "@chakra-ui/react";
import { Plus, Building } from "lucide-react";
import { downloadCSV } from "@/lib/export";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Contractors = () => {
  const contractors = [
    {name:'СтройМонтаж', score:4.6, jobs:32},
    {name:'ИнжТехСервис', score:4.2, jobs:18},
  ];
  const suppliers = [
    {name:'БетонПоставка', items:12, terms:'5-7 дней'},
    {name:'МеталлРесурс', items:8, terms:'3-5 дней'},
  ];

  return (
    <>
      <Helmet>
        <title>Подрядчики — ПромСтрой Контроль</title>
        <meta name="description" content="Управление подрядчиками: контакты, договоры, работы." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg" color="brand.500">Подрядчики</Heading>
            <Text color="text.secondary" mt={1}>Управление подрядчиками</Text>
          </Box>
          <HStack>
            <Button variant="gradient" leftIcon={<Plus />}>Добавить подрядчика</Button>
            <Button variant="gradient" onClick={() => downloadCSV('contractors.csv', contractors)}>Экспорт CSV</Button>
          </HStack>
        </HStack>

        <section className="grid gap-6 md:grid-cols-2" aria-label="Подрядчики">
          {contractors.map((c)=>(
            <Card key={c.name} className="shadow-construction">
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-muted-foreground">Качество</span>
                <Badge variant="secondary">{c.score}</Badge>
                <span className="text-muted-foreground">Проектов</span>
                <Badge variant="default">{c.jobs}</Badge>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2" aria-label="Поставщики">
          {suppliers.map((s)=>(
            <Card key={s.name} className="shadow-construction">
              <CardHeader>
                <CardTitle>{s.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-muted-foreground">Позиций</span>
                <Badge variant="secondary">{s.items}</Badge>
                <span className="text-muted-foreground">Сроки</span>
                <Badge variant="default">{s.terms}</Badge>
              </CardContent>
            </Card>
          ))}
        </section>
      </Box>
    </>
  );
};

export default Contractors;