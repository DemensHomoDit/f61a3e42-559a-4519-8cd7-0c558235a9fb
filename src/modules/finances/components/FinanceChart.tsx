import { Box, Heading, Text, HStack, Select, Badge, FormControl, FormLabel } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface FinanceChartProps {
  invoices: any[];
  purchases: any[];
  salaries: any[];
  absences: any[];
  period: 'week' | 'month' | 'quarter' | 'year';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const FinanceChart = ({ invoices = [], purchases = [], salaries = [], absences = [], period }: FinanceChartProps) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Группируем данные по датам
    const dataMap = new Map<string, { date: string; income: number; expenses: number; net: number }>();
    
    // Доходы (счета)
    if (Array.isArray(invoices)) {
      invoices.forEach(inv => {
        const date = inv?.date?.slice(0, 10) || inv?.created_at?.slice(0, 10);
        if (date && new Date(date) >= startDate) {
          const existing = dataMap.get(date) || { date, income: 0, expenses: 0, net: 0 };
          existing.income += Number(inv?.amount || 0);
          existing.net += Number(inv?.amount || 0);
          dataMap.set(date, existing);
        }
      });
    }

    // Расходы (закупки + зарплаты + удержания)
    const allExpenses = [
      ...(Array.isArray(purchases) ? purchases : []), 
      ...(Array.isArray(salaries) ? salaries : []), 
      ...(Array.isArray(absences) ? absences : [])
    ];
    
    allExpenses.forEach(item => {
      const date = item?.date?.slice(0, 10) || item?.created_at?.slice(0, 10);
      if (date && new Date(date) >= startDate) {
        const existing = dataMap.get(date) || { date, income: 0, expenses: 0, net: 0 };
        existing.expenses += Number(item?.amount || 0);
        existing.net -= Number(item?.amount || 0);
        dataMap.set(date, existing);
      }
    });

    return Array.from(dataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('ru-RU', { 
          month: 'short', 
          day: 'numeric' 
        })
      }));
  }, [invoices, purchases, salaries, absences, period]);

  const summaryData = useMemo(() => {
    const totalIncome = Array.isArray(invoices) 
      ? invoices.reduce((sum, inv) => sum + Number(inv?.amount || 0), 0)
      : 0;
      
    const allExpenses = [
      ...(Array.isArray(purchases) ? purchases : []), 
      ...(Array.isArray(salaries) ? salaries : []), 
      ...(Array.isArray(absences) ? absences : [])
    ];
    
    const totalExpenses = allExpenses.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
    const totalNet = totalIncome - totalExpenses;

    return [
      { name: 'Доходы', value: totalIncome, color: '#00C49F' },
      { name: 'Расходы', value: totalExpenses, color: '#FF8042' },
      { name: 'Прибыль', value: totalNet, color: totalNet >= 0 ? '#0088FE' : '#FF0000' }
    ];
  }, [invoices, purchases, salaries, absences]);

  const categoryData = useMemo(() => {
    const categories = new Map<string, number>();
    
    if (Array.isArray(purchases)) {
      purchases.forEach(item => {
        const category = item?.type || item?.category || 'Закупки';
        categories.set(category, (categories.get(category) || 0) + Number(item?.amount || 0));
      });
    }

    if (Array.isArray(salaries)) {
      salaries.forEach(item => {
        const category = 'Зарплаты';
        categories.set(category, (categories.get(category) || 0) + Number(item?.amount || 0));
      });
    }

    if (Array.isArray(absences)) {
      absences.forEach(item => {
        const category = 'Удержания';
        categories.set(category, (categories.get(category) || 0) + Number(item?.amount || 0));
      });
    }

    return Array.from(categories.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [purchases, salaries, absences]);

  if (chartData.length === 0) {
    return (
      <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
        <Text color="text.secondary" textAlign="center">Нет данных для отображения</Text>
      </Box>
    );
  }

  return (
    <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="md" color="gray.800">Финансовая аналитика</Heading>
          <Text color="text.secondary" fontSize="sm">Период: {period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : period === 'quarter' ? 'Квартал' : 'Год'}</Text>
        </Box>
        <HStack gap={3}>
          <FormControl minW="32">
            <FormLabel htmlFor="chartType" mb={1}>Тип графика</FormLabel>
            <Select 
              id="chartType"
              value={chartType} 
              onChange={(e) => setChartType(e.target.value as any)}
              size="sm"
              w="32"
              aria-label="Тип графика"
              title="Выбор типа графика"
            >
              <option value="line">Линейный</option>
              <option value="bar">Столбчатый</option>
              <option value="pie">Круговая</option>
            </Select>
          </FormControl>
        </HStack>
      </HStack>

      {/* Основной график */}
      <Box mb={6}>
        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>Динамика доходов и расходов</Text>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `₽${Number(value).toLocaleString('ru-RU')}`, 
                    name === 'income' ? 'Доходы' : name === 'expenses' ? 'Расходы' : 'Прибыль'
                  ]}
                  labelStyle={{ color: '#333' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#00C49F" 
                  strokeWidth={3}
                  dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#00C49F', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#FF8042" 
                  strokeWidth={3}
                  dot={{ fill: '#FF8042', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#FF8042', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#0088FE', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `₽${Number(value).toLocaleString('ru-RU')}`, 
                    name === 'income' ? 'Доходы' : name === 'expenses' ? 'Расходы' : 'Прибыль'
                  ]}
                  labelStyle={{ color: '#333' }}
                />
                <Bar dataKey="income" fill="#00C49F" name="Доходы" />
                <Bar dataKey="expenses" fill="#FF8042" name="Расходы" />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={summaryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ₽${Number(value).toLocaleString('ru-RU')}`}
                >
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`₽${Number(value).toLocaleString('ru-RU')}`, 'Сумма']}
                  labelStyle={{ color: '#333' }}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Сводка по категориям */}
      {chartType !== 'pie' && (
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>Расходы по категориям</Text>
          <Box h="200px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#666" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#666" fontSize={12} width={80} />
                <Tooltip 
                  formatter={(value: any) => [`₽${Number(value).toLocaleString('ru-RU')}`, 'Сумма']}
                  labelStyle={{ color: '#333' }}
                />
                <Bar dataKey="value" fill="#8884D8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}

      {/* Краткая сводка */}
      <Box mt={6} p={4} bg="gray.50" borderRadius="lg">
        <HStack justify="space-around" flexWrap="wrap" gap={4}>
          {summaryData.map((item, index) => (
            <Box key={index} textAlign="center">
              <Text fontSize="sm" color="gray.600" mb={1}>{item.name}</Text>
              <Text fontSize="lg" fontWeight="bold" color={item.color}>
                ₽{Number(item.value).toLocaleString('ru-RU')}
              </Text>
            </Box>
          ))}
        </HStack>
      </Box>
    </Box>
  );
}; 