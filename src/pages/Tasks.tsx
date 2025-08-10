import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Helmet } from "react-helmet-async";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Tasks = () => {
  const rows = [
    {name:"Монтаж опалубки", obj:"Северная звезда", assignee:"Бригада №3", due:"12.08", status:"В работе"},
    {name:"Армирование", obj:"Горизонт", assignee:"Бригада №1", due:"11.08", status:"Просрочено"},
    {name:"Заливка бетона", obj:"Технопарк", assignee:"Бригада №2", due:"14.08", status:"Запланировано"},
  ];
  const statusBadge = (s:string) => s === 'Просрочено' ? 'destructive' : s === 'В работе' ? 'default' : 'secondary';

  return (
    <Layout>
      <Helmet>
        <title>Задачи — ПромСтрой Контроль</title>
        <meta name="description" content="Планирование и контроль задач: статусы, сроки, ответственные." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main className="space-y-6 animate-fade-in" role="main">
        <header>
          <h1 className="text-3xl font-bold text-primary">Задачи</h1>
          <p className="text-muted-foreground mt-1">Гибкое управление работами</p>
        </header>

        <section>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">В работе</TabsTrigger>
              <TabsTrigger value="planned">Запланировано</TabsTrigger>
              <TabsTrigger value="overdue">Просрочено</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <Card className="shadow-construction">
                <CardHeader>
                  <CardTitle>Текущие задачи</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Задача</TableHead>
                        <TableHead>Объект</TableHead>
                        <TableHead>Ответственные</TableHead>
                        <TableHead>Срок</TableHead>
                        <TableHead className="text-right">Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r)=> (
                        <TableRow key={r.name} className="hover-scale">
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell>{r.obj}</TableCell>
                          <TableCell>{r.assignee}</TableCell>
                          <TableCell>{r.due}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={statusBadge(r.status) as any}>{r.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="planned">
              <Card className="shadow-construction">
                <CardHeader>
                  <CardTitle>Запланированные</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Покажем ближайшие задачи…</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overdue">
              <Card className="shadow-construction">
                <CardHeader>
                  <CardTitle>Просроченные</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Нужно обратить внимание на 7 задач.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </Layout>
  );
};

export default Tasks;