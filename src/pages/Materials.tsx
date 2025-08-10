import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Materials = () => {
  const list = [
    {name:'Цемент М500', qty:'120 т', status:'В наличии'},
    {name:'Арматура A500', qty:'18 т', status:'В пути'},
    {name:'Плиты ПБ', qty:'85 шт', status:'Требует закупки'},
  ];
  const variant = (s:string) => s === 'В наличии' ? 'success' : s === 'В пути' ? 'secondary' : 'destructive';

  return (
    <Layout>
      <Helmet>
        <title>Материалы — ПромСтрой Контроль</title>
        <meta name="description" content="Управление складом, доставкой и потребностями объектов." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main className="space-y-6 animate-fade-in" role="main">
        <header>
          <h1 className="text-3xl font-bold text-primary">Материалы и инструмент</h1>
          <p className="text-muted-foreground mt-1">Склад, на объектах и в пути</p>
        </header>

        <section>
          <Card className="shadow-construction">
            <CardHeader>
              <CardTitle>Состояние материалов</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Наименование</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead className="text-right">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((m)=> (
                    <TableRow key={m.name} className="hover-scale">
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.qty}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={variant(m.status) as any}>{m.status}</Badge>
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

export default Materials;