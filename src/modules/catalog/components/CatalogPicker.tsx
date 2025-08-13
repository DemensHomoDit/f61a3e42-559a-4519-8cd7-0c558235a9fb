import { FormControl, FormLabel, Select as CSelect, Input, HStack, Button } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { useCatalog } from "@/modules/catalog/hooks/useCatalog";

export const CatalogPicker: React.FC<{
  value: { item?: string; type?: string; supplier_id?: string; price?: string; url?: string };
  onChange: (v: any)=> void;
}> = ({ value, onChange }) => {
  const { items, suppliers, createItem, createSupp } = useCatalog();
  const [newItemName, setNewItemName] = useState("");
  const [newSuppName, setNewSuppName] = useState("");

  const byType = useMemo(()=> (items as any[]).filter(i=> !value.type || i.type === value.type), [items, value.type]);

  const onSelectItem = (id: string) => {
    if (!id) { onChange({ ...value, item: "" }); return; }
    const it = (items as any[]).find(i=> String(i.id)===id);
    if (!it) return;
    onChange({ ...value, item: it.name, price: String(it.price ?? ''), supplier_id: it.supplier_id ? String(it.supplier_id) : '' });
  };

  const onSelectSupplier = (id: string) => onChange({ ...value, supplier_id: id });

  return (
    <>
      <FormControl>
        <FormLabel htmlFor="catalogItem">Номенклатура</FormLabel>
        <CSelect id="catalogItem" title="Выбор номенклатуры" aria-label="Выбор номенклатуры" value={byType.find(i=> i.name===value.item)?.id ?? ''} onChange={(e)=> onSelectItem(e.target.value)}>
          <option value="">—</option>
          {byType.map((i:any)=> <option key={i.id} value={i.id}>{i.name}</option>)}
        </CSelect>
      </FormControl>
      <HStack>
        <Input placeholder="Новый предмет" value={newItemName} onChange={(e)=> setNewItemName(e.target.value)} />
        <Button size="sm" onClick={()=> createItem.mutate({ name: newItemName, type: value.type, price: Number(value.price||0)||0 })}>Создать</Button>
      </HStack>

      <FormControl>
        <FormLabel htmlFor="catalogSupplier">Поставщик</FormLabel>
        <CSelect id="catalogSupplier" title="Выбор поставщика" aria-label="Выбор поставщика" value={value.supplier_id ?? ''} onChange={(e)=> onSelectSupplier(e.target.value)}>
          <option value="">—</option>
          {suppliers.map((s:any)=> <option key={s.id} value={s.id}>{s.name}</option>)}
        </CSelect>
      </FormControl>
      <HStack>
        <Input placeholder="Новый поставщик" value={newSuppName} onChange={(e)=> setNewSuppName(e.target.value)} />
        <Button size="sm" onClick={()=> createSupp.mutate({ name: newSuppName })}>Создать</Button>
      </HStack>

      <FormControl>
        <FormLabel htmlFor="buyUrl">Ссылка на магазин</FormLabel>
        <Input id="buyUrl" placeholder="https://..." value={value.url ?? ''} onChange={(e)=> onChange({ ...value, url: e.target.value })} />
      </FormControl>
    </>
  );
}; 