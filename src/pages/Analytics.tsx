import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@/api/client";
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from "@chakra-ui/react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RTooltip, 
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, DollarSign, Building, Clock } from "lucide-react";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

// Mock data for analytics
const monthlyData = [
  { month: 'Янв', income: 1200000, expenses: 800000, profit: 400000 },
  { month: 'Фев', income: 1400000, expenses: 900000, profit: 500000 },
  { month: 'Мар', income: 1100000, expenses: 850000, profit: 250000 },
  { month: 'Апр', income: 1600000, expenses: 1000000, profit: 600000 },
  { month: 'Май', income: 1800000, expenses: 1100000, profit: 700000 },
  { month: 'Июн', income: 2000000, expenses: 1200000, profit: 800000 },
];

const productivityData = [
  { name: 'Прораб 1', efficiency: 85, tasks: 12, hours: 160 },
  { name: 'Прораб 2', efficiency: 92, tasks: 15, hours: 168 },
  { name: 'Прораб 3', efficiency: 78, tasks: 10, hours: 152 },
  { name: 'Прораб 4', efficiency: 88, tasks: 14, hours: 164 },
];

const taskStatusData = [
  { name: 'Завершено', value: 65, color: '#2d6c3f' },
  { name: 'В работе', value: 25, color: '#3a8547' },
  { name: 'Просрочено', value: 10, color: '#e53e3e' },
];

const COLORS = ['#2d6c3f', '#3a8547', '#e53e3e', '#3182ce', '#805ad5'];

const Analytics = () => {
  return (
    <>
      <Helmet>
        <title>Аналитика — ПромСтрой Контроль</title>
        <meta name="description" content="Аналитика и отчеты: производительность, эффективность, тренды." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="1200px" mx="auto">
          <Box>
            <Heading size="lg" color="brand.500">Аналитика</Heading>
          <Text color="text.secondary" mt={1}>Анализ производительности и эффективности</Text>
          </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardHeader p={4}>
              <HStack justify="space-between">
                <Heading size="sm" color="brand.500">Доходы</Heading>
                <Icon as={TrendingUp} boxSize={4} color="brand.500" />
              </HStack>
            </CardHeader>
            <CardBody pt={0} px={4} pb={4}>
              <Stat>
                <StatNumber color="text.primary" fontSize="2xl">₽9.1M</StatNumber>
                <StatLabel color="text.secondary" fontSize="sm">за 6 месяцев</StatLabel>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardHeader p={4}>
              <HStack justify="space-between">
                <Heading size="sm" color="brand.500">Прибыль</Heading>
                <Icon as={DollarSign} boxSize={4} color="brand.500" />
              </HStack>
            </CardHeader>
            <CardBody pt={0} px={4} pb={4}>
              <Stat>
                <StatNumber color="text.primary" fontSize="2xl">₽3.25M</StatNumber>
                <StatLabel color="text.secondary" fontSize="sm">чистая прибыль</StatLabel>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardHeader p={4}>
              <HStack justify="space-between">
                <Heading size="sm" color="brand.500">Объекты</Heading>
                <Icon as={Building} boxSize={4} color="brand.500" />
              </HStack>
            </CardHeader>
            <CardBody pt={0} px={4} pb={4}>
              <Stat>
                <StatNumber color="text.primary" fontSize="2xl">12</StatNumber>
                <StatLabel color="text.secondary" fontSize="sm">активных проектов</StatLabel>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardHeader p={4}>
              <HStack justify="space-between">
                <Heading size="sm" color="brand.500">Эффективность</Heading>
                <Icon as={Clock} boxSize={4} color="brand.500" />
              </HStack>
            </CardHeader>
            <CardBody pt={0} px={4} pb={4}>
              <Stat>
                <StatNumber color="text.primary" fontSize="2xl">87%</StatNumber>
                <StatLabel color="text.secondary" fontSize="sm">средняя</StatLabel>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="green">
          <TabList>
            <Tab>Финансы</Tab>
            <Tab>Производительность</Tab>
            <Tab>Задачи</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <Card>
                <CardHeader p={4}>
                  <Heading size="sm">Финансовая динамика</Heading>
                </CardHeader>
                <CardBody pt={0} px={4} pb={4}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RTooltip 
                        formatter={(value: number) => [`₽${value.toLocaleString('ru-RU')}`, '']}
                        labelStyle={{ color: '#2d6c3f' }}
                      />
                      <Bar dataKey="income" fill="#2d6c3f" name="Доходы" />
                      <Bar dataKey="expenses" fill="#e53e3e" name="Расходы" />
                      <Bar dataKey="profit" fill="#3a8547" name="Прибыль" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel px={0}>
              <Card>
                <CardHeader p={4}>
                  <Heading size="sm">Эффективность прорабов</Heading>
                </CardHeader>
                <CardBody pt={0} px={4} pb={4}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RTooltip />
                      <Bar dataKey="efficiency" fill="#2d6c3f" name="Эффективность %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel px={0}>
              <Card>
                <CardHeader p={4}>
                  <Heading size="sm">Статус задач</Heading>
                </CardHeader>
                <CardBody pt={0} px={4} pb={4}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
};

export default Analytics;