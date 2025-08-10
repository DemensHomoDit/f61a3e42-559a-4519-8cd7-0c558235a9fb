import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Helmet } from "react-helmet-async";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Objects = () => {
  return (
    <Layout>
      <Helmet>
        <title>Объекты — ПромСтрой Контроль</title>
        <meta name="description" content="Список строительных объектов: статусы, этапы, сроки и ответственные." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main className="space-y-6 animate-fade-in" role="main">
        <header>
          <h1 className="text-3xl font-bold text-primary">Объекты</h1>
          <p className="text-muted-foreground mt-1">Центральный модуль управления стройками</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3" aria-label="Ключевые показатели">
          <Card className="shadow-construction">
            <CardHeader>
              <CardTitle>Статусы объектов</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-semibold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Активные</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-warning">2</div>
                <div className="text-sm text-muted-foreground">Приостановлены</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-success">19</div>
                <div className="text-sm text-muted-foreground">Завершены</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-construction lg:col-span-2">
            <CardHeader>
              <CardTitle>Прогресс по этапам</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[{name:'Фундамент',v:72},{name:'Каркас',v:40},{name:'Инженерка',v:55},{name:'Отделка',v:28}].map((s)=>(
                <div key={s.name}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">{s.v}%</span>
                  </div>
                  <Progress value={s.v} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section aria-label="Список объектов">
          <Card className="shadow-construction">
            <CardHeader>
              <CardTitle>Объекты в работе</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Адрес</TableHead>
                    <TableHead>Заказчик</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Прогресс</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {name:"ЖК 'Северная звезда'", addr:"Москва", client:"ООО СтройИнвест", status:"В срок", p:78},
                    {name:"ТЦ 'Горизонт'", addr:"Санкт-Петербург", client:"Торговый Дом", status:"Задержка", p:45},
                    {name:"Технопарк", addr:"Казань", client:"ИТ Холдинг", status:"Завершение", p:92}
                  ].map((o)=> (
                    <TableRow key={o.name} className="hover-scale">
                      <TableCell className="font-medium">{o.name}</TableCell>
                      <TableCell>{o.addr}</TableCell>
                      <TableCell>{o.client}</TableCell>
                      <TableCell>
                        <Badge variant={o.status === 'Задержка' ? 'destructive' : o.status === 'В срок' ? 'default' : 'secondary'}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{o.p}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </Layout>
  );
};

export default Objects;