import { Box, Heading, HStack, FormControl, FormLabel, Select, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFinanceJournal } from "@/api/client";

export function FinanceJournal({ objects }: { objects: any[] }) {
  const { data: rows = [] } = useQuery<any[]>({ queryKey: ['finance.journal'], queryFn: getFinanceJournal, retry: 0, refetchOnWindowFocus: false });
  const [kind, setKind] = useState('');
  const [category, setCategory] = useState('');
  const [objectId, setObjectId] = useState('');

  const categories = useMemo(()=> Array.from(new Set(rows.map(r=> String(r.category||'').trim()).filter(Boolean))).sort(), [rows]);

  const filtered = useMemo(()=> rows.filter(r=> {
    if (kind && r.kind !== kind) return false;
    if (category && r.category !== category) return false;
    if (objectId && String(r.object_id||'') !== objectId) return false;
    return true;
  }), [rows, kind, category, objectId]);

  return (
    <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
      <HStack justify="space-between" mb={4}>
        <Heading size="sm">Журнал транзакций</Heading>
      </HStack>
      <HStack gap={3} flexWrap="wrap" mb={4}>
        <FormControl minW="40">
          <FormLabel htmlFor="fjKind">Вид</FormLabel>
          <Select id="fjKind" value={kind} onChange={(e)=> setKind(e.target.value)} placeholder="Все" aria-label="Фильтр по виду" title="Фильтр по виду">
            <option value="income">Доход</option>
            <option value="expense">Расход</option>
          </Select>
        </FormControl>
        <FormControl minW="48">
          <FormLabel htmlFor="fjCat">Категория</FormLabel>
          <Select id="fjCat" value={category} onChange={(e)=> setCategory(e.target.value)} placeholder="Все" aria-label="Фильтр по категории" title="Фильтр по категории">
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormControl>
        <FormControl minW="48">
          <FormLabel htmlFor="fjObj">Объект</FormLabel>
          <Select id="fjObj" value={objectId} onChange={(e)=> setObjectId(e.target.value)} placeholder="Все объекты" aria-label="Фильтр по объекту" title="Фильтр по объекту">
            {objects.map(o=> <option key={o.id} value={o.id}>{o.name}</option>)}
          </Select>
        </FormControl>
      </HStack>
      <Box overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Дата</Th>
              <Th>Вид</Th>
              <Th>Категория</Th>
              <Th>Объект</Th>
              <Th>Источник</Th>
              <Th isNumeric>Сумма</Th>
              <Th>Статус</Th>
              <Th>Описание</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map(r=> {
              const obj = objects.find(o=> o.id === r.object_id);
              return (
                <Tr key={`${r.source}-${r.source_id}`}>
                  <Td>{(r.date||'').slice(0,10) || '—'}</Td>
                  <Td>{r.kind === 'income' ? <Badge colorScheme="green">Доход</Badge> : <Badge colorScheme="red">Расход</Badge>}</Td>
                  <Td>{r.category || '—'}</Td>
                  <Td>{obj?.name || '—'}</Td>
                  <Td><Badge>{r.source}</Badge></Td>
                  <Td isNumeric>₽{Number(r.amount||0).toLocaleString('ru-RU')}</Td>
                  <Td>{r.status || '—'}</Td>
                  <Td maxW="56" isTruncated title={r.description||''}>{r.description || '—'}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
} 