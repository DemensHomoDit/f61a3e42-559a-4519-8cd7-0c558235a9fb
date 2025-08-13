import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getReceivables, getPayables } from "@/api/client";

export function ReceivablesPayables() {
  const { data: receivables = [] } = useQuery<any[]>({ queryKey: ['finance.receivables'], queryFn: getReceivables, retry: 0, refetchOnWindowFocus: false });
  const { data: payables = { suppliers: {}, employees: {} } } = useQuery<any>({ queryKey: ['finance.payables'], queryFn: getPayables, retry: 0, refetchOnWindowFocus: false });

  const totalRecv = receivables.reduce((s,r)=> s + Number(r.amount||0), 0);
  const totalSuppliers = Object.values(payables.suppliers || {}).reduce((s:any,v:any)=> s + Number(v||0), 0);
  const totalEmployees = Object.values(payables.employees || {}).reduce((s:any,v:any)=> s + Number(v||0), 0);

  return (
    <Box display="flex" flexDirection="column" gap={6}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Stat bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100">
          <StatLabel>Дебиторка (клиенты)</StatLabel>
          <StatNumber>₽{totalRecv.toLocaleString('ru-RU')}</StatNumber>
        </Stat>
        <Stat bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100">
          <StatLabel>Кредиторка (поставщики)</StatLabel>
          <StatNumber>₽{totalSuppliers.toLocaleString('ru-RU')}</StatNumber>
        </Stat>
        <Stat bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100">
          <StatLabel>Кредиторка (сотрудники)</StatLabel>
          <StatNumber>₽{totalEmployees.toLocaleString('ru-RU')}</StatNumber>
        </Stat>
      </SimpleGrid>

      <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100">
        <Heading size="sm" mb={4}>Дебиторская задолженность</Heading>
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>№</Th>
                <Th>Клиент</Th>
                <Th>Объект</Th>
                <Th>Дата</Th>
                <Th>Срок</Th>
                <Th>Просрочка</Th>
                <Th isNumeric>Сумма</Th>
                <Th>Статус</Th>
              </Tr>
            </Thead>
            <Tbody>
              {receivables.map(r=> (
                <Tr key={r.id}>
                  <Td>{r.number || r.id}</Td>
                  <Td>{r.customer || '—'}</Td>
                  <Td>{r.object_id || '—'}</Td>
                  <Td>{(r.date||'').slice(0,10) || '—'}</Td>
                  <Td>{(r.due_date||'').slice(0,10) || '—'}</Td>
                  <Td>{Number(r.days_overdue||0) > 0 ? <Badge colorScheme="red">{r.days_overdue} дн</Badge> : '—'}</Td>
                  <Td isNumeric>₽{Number(r.amount||0).toLocaleString('ru-RU')}</Td>
                  <Td>{r.status || '—'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100">
        <Heading size="sm" mb={4}>Кредиторская задолженность</Heading>
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Контрагент</Th>
                <Th>Тип</Th>
                <Th isNumeric>Сумма</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(payables.suppliers||{}).map(([id, val]: any)=> (
                <Tr key={`sup-${id}`}>
                  <Td>Поставщик #{id || '—'}</Td>
                  <Td>Поставщик</Td>
                  <Td isNumeric>₽{Number(val||0).toLocaleString('ru-RU')}</Td>
                </Tr>
              ))}
              {Object.entries(payables.employees||{}).map(([id, val]: any)=> (
                <Tr key={`emp-${id}`}>
                  <Td>Сотрудник #{id || '—'}</Td>
                  <Td>Сотрудник</Td>
                  <Td isNumeric>₽{Number(val||0).toLocaleString('ru-RU')}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
} 