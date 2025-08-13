import { Table, Thead, Tbody, Tr, Th, Td, HStack, Avatar, Text, Badge, Button, IconButton } from "@chakra-ui/react";
import { Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { User } from "@/types";
import React from "react";

interface Props {
  users: User[];
  onEdit: (u: User) => void;
  onDelete: (id: number) => void;
}

const roleColor = (r?: string) => r === 'admin' ? 'red' : r === 'foreman' ? 'blue' : r === 'worker' ? 'green' : 'gray';
const roleLabel = (r?: string) => r === 'admin' ? 'Админ' : r === 'foreman' ? 'Прораб' : r === 'worker' ? 'Рабочий' : r === 'employee' ? 'Сотрудник' : r;

const EmployeesTable: React.FC<Props> = ({ users = [], onEdit, onDelete }) => (
  <Table variant="simple" size="sm">
    <Thead>
      <Tr>
        <Th>Сотрудник</Th><Th>Логин</Th><Th>Роль</Th><Th>Должность</Th><Th>Телефон</Th><Th>Действия</Th>
      </Tr>
    </Thead>
    <Tbody>
      {users.map(u => (
        <Tr key={u.id}>
          <Td><HStack spacing={3}><Avatar size="sm" name={u.full_name} /><Text fontWeight={600}>{u.full_name || '—'}</Text></HStack></Td>
          <Td>{u.username || '—'}</Td>
          <Td><Badge colorScheme={roleColor(u.role)}>{roleLabel(u.role)}</Badge></Td>
          <Td>{u.position || '—'}</Td>
          <Td>{u.phone ?? '—'}</Td>
          <Td>
            <HStack gap={2}>
              <Button size="xs" colorScheme="blue" as={Link} to={`/people/${u.id}`}>Профиль</Button>
              <IconButton size="xs" aria-label="edit" icon={<Edit size={14}/>} onClick={()=> onEdit(u)} />
              <IconButton size="xs" aria-label="delete" icon={<Trash2 size={14}/>} colorScheme="red" onClick={()=> onDelete(u.id)} />
            </HStack>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

export default EmployeesTable; 