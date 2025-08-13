import { Card, CardHeader, CardBody, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, HStack } from "@chakra-ui/react";
import React from "react";

export const SalariesTable: React.FC<{ rows: any[]; onPay?: (row: any)=> void }> = ({ rows = [], onPay }) => (
  <Card>
    <CardHeader p={4}><Heading size="sm">Список зарплат</Heading></CardHeader>
    <CardBody pt={0} px={4} pb={4}>
      <Table variant="stripedGreen">
        <Thead>
          <Tr>
            <Th>Сотрудник</Th>
            <Th>Сумма</Th>
            <Th>Дата</Th>
            <Th>Тип</Th>
            {onPay && <Th isNumeric>Действия</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {Array.isArray(rows) && rows.map((s)=> (
            <Tr key={s?.id || Math.random()}>
              <Td fontWeight={600}>{s?.user_id || '—'}</Td>
              <Td>₽{(typeof s?.amount==='number'?s.amount:Number(s?.amount??0)).toLocaleString('ru-RU')}</Td>
              <Td>{s?.date ?? '—'}</Td>
              <Td><Badge colorScheme="green">{s?.type || '—'}</Badge></Td>
              {onPay && (
                <Td isNumeric>
                  <HStack justify="flex-end">
                    <Button size="xs" variant="ghost" colorScheme="green" onClick={()=> onPay(s)}>Оплата</Button>
                  </HStack>
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </CardBody>
  </Card>
); 