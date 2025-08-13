import { Card, CardHeader, CardBody, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@chakra-ui/react";
import React from "react";

export const AbsencesTable: React.FC<{ rows: any[] }> = ({ rows = [] }) => (
  <Card>
    <CardHeader p={4}><Heading size="sm">Список отсутствий</Heading></CardHeader>
    <CardBody pt={0} px={4} pb={4}>
      <Table variant="stripedGreen">
        <Thead>
          <Tr>
            <Th>Сотрудник</Th>
            <Th>Тип</Th>
            <Th>Сумма</Th>
            <Th>Дата</Th>
            <Th>Причина</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Array.isArray(rows) && rows.map((a)=> (
            <Tr key={a?.id || Math.random()}>
              <Td fontWeight={600}>{a?.user_id || '—'}</Td>
              <Td><Badge colorScheme="red">{a?.type || '—'}</Badge></Td>
              <Td>₽{(typeof a?.amount==='number'?a.amount:Number(a?.amount??0)).toLocaleString('ru-RU')}</Td>
              <Td>{a?.date ?? '—'}</Td>
              <Td>{a?.reason ?? '—'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </CardBody>
  </Card>
); 