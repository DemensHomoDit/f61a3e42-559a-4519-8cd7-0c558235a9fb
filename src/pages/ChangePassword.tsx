import { Box, Card, CardBody, VStack, Heading, FormControl, FormLabel, Input, Button, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { changePassword } from '@/api/client';

const ChangePassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation() as any;
  const username = location?.state?.username || '';
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) { toast({ title: 'Нет имени пользователя', status: 'error' }); return; }
    if (!oldPassword || !newPassword) { toast({ title: 'Заполните все поля', status: 'error' }); return; }
    if (newPassword !== confirm) { toast({ title: 'Пароли не совпадают', status: 'error' }); return; }
    try {
      setLoading(true);
      await changePassword({ username, old_password: oldPassword, new_password: newPassword });
      toast({ title: 'Пароль обновлён', status: 'success' });
      navigate('/');
    } catch (e) {
      toast({ title: 'Ошибка смены пароля', status: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Box className="bg-gray-50 min-h-screen p-6" display="flex" alignItems="center" justifyContent="center">
      <Card className="modern-card" maxW="lg" w="full">
        <CardBody>
          <VStack spacing={6} align="stretch" as="form" onSubmit={onSubmit}>
            <Heading size="md">Смена пароля</Heading>
            <FormControl>
              <FormLabel>Логин</FormLabel>
              <Input value={username} isReadOnly />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Текущий пароль</FormLabel>
              <Input type="password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Новый пароль</FormLabel>
              <Input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Подтверждение пароля</FormLabel>
              <Input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
            </FormControl>
            <Button type="submit" className="modern-button" isLoading={loading}>Обновить пароль</Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default ChangePassword; 