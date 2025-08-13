import { HStack, FormControl, FormLabel, Input, Select as CSelect, Button } from "@chakra-ui/react";
import React from "react";

type Props = {
  search: string; setSearch: (v: string)=> void;
  from: string; setFrom: (v: string)=> void;
  to: string; setTo: (v: string)=> void;
  objectId: string; setObjectId: (v: string)=> void;
  userId: string; setUserId: (v: string)=> void;
  objects: any[]; users: any[];
  onReset: ()=> void;
  // Новые настройки внешнего вида
  placeholder?: string;
  searchLabel?: string;
  showObject?: boolean;
  showUser?: boolean;
  showSearch?: boolean;
  showDates?: boolean;
};

export const FinanceFilters: React.FC<Props> = ({ search, setSearch, from, setFrom, to, setTo, objectId, setObjectId, userId, setUserId, objects, users, onReset, placeholder, searchLabel, showObject = true, showUser = true, showSearch = true, showDates = true }) => {
  const ph = placeholder ?? "Поиск";
  const sl = searchLabel ?? "Поиск";
  return (
    <HStack gap={3} align="center" flexWrap="wrap">
      {showSearch && (
        <FormControl maxW="sm">
          <FormLabel htmlFor="finSearch" mb={1}>{sl}</FormLabel>
          <Input id="finSearch" title={sl} placeholder={ph} value={search} onChange={(e) => setSearch(e.target.value)} />
        </FormControl>
      )}
      {showDates && (
        <>
          <FormControl>
            <FormLabel htmlFor="fromDate" mb={1}>С даты</FormLabel>
            <Input id="fromDate" title="Дата с" type="date" value={from} onChange={(e)=> setFrom(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="toDate" mb={1}>По дату</FormLabel>
            <Input id="toDate" title="Дата по" type="date" value={to} onChange={(e)=> setTo(e.target.value)} />
          </FormControl>
        </>
      )}
      {showObject && (
        <FormControl minW="52">
          <FormLabel htmlFor="byObject" mb={1}>Объект</FormLabel>
          <CSelect id="byObject" title="Фильтр по объекту" aria-label="Фильтр по объекту" value={objectId} onChange={(e)=> setObjectId(e.target.value)}>
            <option value="">Все</option>
            {objects.map((o:any)=> <option key={o.id} value={o.id}>{o.name}</option>)}
          </CSelect>
        </FormControl>
      )}
      {showUser && (
        <FormControl minW="52">
          <FormLabel htmlFor="byUser" mb={1}>Сотрудник</FormLabel>
          <CSelect id="byUser" title="Фильтр по сотруднику" aria-label="Фильтр по сотруднику" value={userId} onChange={(e)=> setUserId(e.target.value)}>
            <option value="">Все</option>
            {users.map((u:any)=> <option key={u.id} value={u.id}>{u.full_name ?? u.username ?? `ID ${u.id}`}</option>)}
          </CSelect>
        </FormControl>
      )}
      <Button variant="ghost" onClick={onReset}>Сбросить</Button>
    </HStack>
  );
}; 