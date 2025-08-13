import { Card, CardHeader, CardBody, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, HStack } from "@chakra-ui/react";
import React from "react";

export const PurchasesTable: React.FC<{ rows: any[]; onPay?: (row: any)=> void }> = ({ rows, onPay }) => (
  <Card>
    <CardHeader p={4}><Heading size="sm">Список закупок</Heading></CardHeader>
    <CardBody pt={0} px={4} pb={4}>
      <Table variant="stripedGreen">
        <Thead>
          <Tr>
            <Th>Товар</Th>
            <Th>Статус</Th>
            <Th>Сумма</Th>
            <Th>Дата</Th>
            <Th>Ответственный</Th>
            {onPay && <Th isNumeric>Действия</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((p)=> (
            <Tr key={p.id}>
              <Td fontWeight={600}>{p.item}</Td>
              <Td><Badge colorScheme={p.status === 'completed' ? 'green' : p.status === 'issued' ? 'red' : 'gray'}>{p.status}</Badge></Td>
              <Td>₽{(typeof p.amount==='number'?p.amount:Number(p.amount??0)).toLocaleString('ru-RU')}</Td>
              <Td>{p.date ?? '—'}</Td>
              <Td>{p.assignee_id ?? '—'}</Td>
              {onPay && (
                <Td isNumeric>
                  <HStack justify="flex-end">
                    <Button size="xs" variant="ghost" colorScheme="green" onClick={()=> onPay(p)}>Оплата</Button>
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