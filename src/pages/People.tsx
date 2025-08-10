import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const People = () => {
  const people = [
    {name:'Иван Петров', role:'Прораб', prod:92},
    {name:'Алексей Смирнов', role:'Бригадир', prod:85},
    {name:'Сергей Иванов', role:'Рабочий', prod:78},
    {name:'Павел Соколов', role:'Рабочий', prod:74},
  ];

  return (
    <Layout>
      <Helmet>
        <title>Сотрудники — ПромСтрой Контроль</title>
        <meta name="description" content="Учет сотрудников, роли, продуктивность и присутствие." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main className="space-y-6 animate-fade-in" role="main">
        <header>
          <h1 className="text-3xl font-bold text-primary">Сотрудники</h1>
          <p className="text-muted-foreground mt-1">Роли, навыки и статистика</p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Список сотрудников">
          {people.map((p)=> (
            <Card key={p.name} className="shadow-construction hover:shadow-elevated transition-smooth">
              <CardHeader className="flex items-center text-center">
                <Avatar className="h-14 w-14">
                  <AvatarImage alt={p.name} />
                  <AvatarFallback>{p.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
                <CardTitle className="mt-2">{p.name}</CardTitle>
                <span className="text-sm text-muted-foreground">{p.role}</span>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-muted-foreground">Продуктивность</span>
                <Badge variant={p.prod > 85 ? 'default' : 'secondary'}>{p.prod}%</Badge>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </Layout>
  );
};

export default People;