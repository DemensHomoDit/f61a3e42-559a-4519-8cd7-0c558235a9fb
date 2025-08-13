import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Select, Button, HStack } from "@chakra-ui/react";
import { useState } from "react";

export type PaymentDialogProps = {
  isOpen: boolean;
  onClose: ()=> void;
  onSubmit: (payload: { amount: number; date: string; method: string; counterparty?: string; object_id?: number; notes?: string; })=> Promise<any> | void;
  title?: string;
  defaults?: Partial<{ amount: number; date: string; method: string; counterparty: string; object_id: number; notes: string; }>;
};

export function PaymentDialog({ isOpen, onClose, onSubmit, title = 'Оплата', defaults }: PaymentDialogProps) {
  const [amount, setAmount] = useState<string>(String(defaults?.amount ?? ''));
  const [date, setDate] = useState<string>(defaults?.date ?? new Date().toISOString().slice(0,10));
  const [method, setMethod] = useState<string>(defaults?.method ?? 'bank');
  const [counterparty, setCounterparty] = useState<string>(defaults?.counterparty ?? '');
  const [objectId, setObjectId] = useState<string>(defaults?.object_id ? String(defaults.object_id) : '');
  const [notes, setNotes] = useState<string>(defaults?.notes ?? '');

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack gap={4} mb={4}>
            <FormControl>
              <FormLabel htmlFor="pAmount">Сумма</FormLabel>
              <Input id="pAmount" type="number" value={amount} onChange={(e)=> setAmount(e.target.value)} placeholder="0" />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="pDate">Дата</FormLabel>
              <Input id="pDate" type="date" value={date} onChange={(e)=> setDate(e.target.value)} />
            </FormControl>
          </HStack>
          <FormControl mb={3}>
            <FormLabel htmlFor="pMethod">Способ</FormLabel>
            <Select id="pMethod" value={method} onChange={(e)=> setMethod(e.target.value)} aria-label="Способ оплаты" title="Способ оплаты">
              <option value="bank">Банк</option>
              <option value="card">Карта</option>
              <option value="cash">Наличные</option>
              <option value="other">Другое</option>
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel htmlFor="pCounterparty">Контрагент</FormLabel>
            <Input id="pCounterparty" value={counterparty} onChange={(e)=> setCounterparty(e.target.value)} placeholder="—" />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel htmlFor="pNotes">Комментарий</FormLabel>
            <Input id="pNotes" value={notes} onChange={(e)=> setNotes(e.target.value)} placeholder="—" />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="ghost" onClick={onClose}>Отмена</Button>
            <Button colorScheme="green" onClick={async ()=> { await onSubmit({ amount: Number(amount)||0, date, method, counterparty: counterparty||undefined, object_id: objectId? Number(objectId): undefined, notes: notes||undefined }); onClose(); }}>Оплатить</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 