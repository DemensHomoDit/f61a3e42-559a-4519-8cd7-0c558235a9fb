import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Finances = () => {
  return (
    <Layout>
      <Helmet>
        <title>Финансы — ПромСтрой Контроль</title>
        <meta name="description" content="Контроль расходов, начислений и себестоимости по объектам." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main className="space-y-6 animate-fade-in" role="main">
        <header>
          <h1 className="text-3xl font-bold text-primary">Финансы</h1>
          <p className="text-muted-foreground mt-1">Агрегированные показатели и детализация по объектам</p>
        </header>

        <section className="grid gap-6 md:grid-cols-3" aria-label="Агрегированные показатели">
          {[{title:'Расходы за месяц',value:'₽4.2M',muted:'-8% к плану',variant:'success'},{title:'Выплаты сотрудникам',value:'₽2.1M',muted:'за текущий период',variant:'secondary'},{title:'Себестоимость объектов',value:'₽18.6M',muted:'с начала года',variant:'default'}].map((m)=>(
            <Card key={m.title} className="shadow-construction">
              <CardHeader>
                <CardTitle>{m.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-primary">{m.value}</div>
                <div className="text-sm text-muted-foreground">{m.muted}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section aria-label="Транзакции по объектам">
          <Card className="shadow-construction">
            <CardHeader>
              <CardTitle>Последние операции</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Объект</TableHead>
                    <TableHead>Статья</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead className="text-right">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {date:'10.08',obj:"Северная звезда",cat:"Материалы",sum:"₽320,000",status:"Проведено"},
                    {date:'10.08',obj:"Горизонт",cat:"Зарплата",sum:"₽180,000",status:"Ожидает"},
                    {date:'09.08',obj:"Технопарк",cat:"Аренда техники",sum:"₽95,000",status:"Проведено"}
                  ].map((r)=> (
                    <TableRow key={r.obj + r.date} className="hover-scale">
                      <TableCell>{r.date}</TableCell>
                      <TableCell className="font-medium">{r.obj}</TableCell>
                      <TableCell>{r.cat}</TableCell>
                      <TableCell>{r.sum}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={r.status === 'Ожидает' ? 'secondary' : 'default'}>{r.status}</Badge>
                      </TableCell>
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

export default Finances;