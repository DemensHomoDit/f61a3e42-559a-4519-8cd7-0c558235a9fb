import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Select, HStack, VStack, Button, useToast } from "@chakra-ui/react";
import React from "react";

interface FormData {
  username: string; full_name: string; role: string; phone: string; email: string; position: string; department: string; hire_date: string; salary: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isEditing?: boolean;
  onSubmit: () => void;
  loading?: boolean;
}

const EmployeeFormModal: React.FC<Props> = ({ isOpen, onClose, formData, setFormData, isEditing = false, onSubmit, loading = false }) => {
  const toast = useToast();
  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditing ? 'Редактировать сотрудника' : 'Добавить нового сотрудника'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4} align="stretch">
            <HStack gap={4}>
              <FormControl isRequired>
                <FormLabel>Логин</FormLabel>
                <Input value={formData.username} onChange={handleChange('username')} placeholder="Уникальный логин" />
              </FormControl>
              <FormControl>
                <FormLabel>Полное имя</FormLabel>
                <Input value={formData.full_name} onChange={handleChange('full_name')} placeholder="Иванов Иван Иванович" />
              </FormControl>
            </HStack>
            <HStack gap={4}>
              <FormControl>
                <FormLabel id="empRoleLabel" htmlFor="empRole">Роль</FormLabel>
                <Select id="empRole" value={formData.role} onChange={handleChange('role')} aria-labelledby="empRoleLabel" title="Выберите роль">
                  <option value="employee">Сотрудник</option>
                  <option value="worker">Рабочий</option>
                  <option value="foreman">Прораб</option>
                  <option value="admin">Администратор</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Должность</FormLabel>
                <Input value={formData.position} onChange={handleChange('position')} placeholder="Должность" />
              </FormControl>
            </HStack>
            <HStack gap={4}>
              <FormControl>
                <FormLabel>Телефон</FormLabel>
                <Input value={formData.phone} onChange={handleChange('phone')} placeholder="+7 (xxx) xxx-xx-xx" />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={formData.email} onChange={handleChange('email')} placeholder="email@example.com" />
              </FormControl>
            </HStack>
            <HStack gap={4}>
              <FormControl>
                <FormLabel>Отдел</FormLabel>
                <Input value={formData.department} onChange={handleChange('department')} placeholder="Отдел" />
              </FormControl>
              <FormControl>
                <FormLabel>Дата приема</FormLabel>
                <Input type="date" value={formData.hire_date} onChange={handleChange('hire_date')} />
              </FormControl>
            </HStack>
            <FormControl>
              <FormLabel>Зарплата</FormLabel>
              <Input type="number" value={formData.salary} onChange={handleChange('salary')} placeholder="Зарплата в рублях" />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack gap={3}>
            <Button variant="ghost" onClick={onClose}>Отмена</Button>
            <Button variant={isEditing ? 'primary' : 'success'} onClick={onSubmit} isLoading={loading} isDisabled={!formData.username}>
              {isEditing ? 'Сохранить' : 'Добавить'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EmployeeFormModal; 