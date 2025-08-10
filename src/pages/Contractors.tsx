import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Contractors = () => {
  const contractors = [
    {name:'СтройМонтаж', score:4.6, jobs:32},
    {name:'ИнжТехСервис', score:4.2, jobs:18},
  ];
  const suppliers = [
    {name:'БетонПоставка', items:12, terms:'5-7 дней'},
    {name:'МеталлРесурс', items:8, terms:'3-5 дней'},
  ];

  return (
    <Layout>
      <Helmet>
        <title>Подрядчики и поставщики — ПромСтрой Контроль</title>
        <meta name="description" content="Карточки подрядчиков и поставщиков: качество, сроки и условия." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main className="space-y-6 animate-fade-in" role="main">
        <header>
          <h1 className="text-3xl font-bold text-primary">Подрядчики и поставщики</h1>
          <p className="text-muted-foreground mt-1">История работ и условия поставок</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2" aria-label="Подрядчики">
          {contractors.map((c)=>(
            <Card key={c.name} className="shadow-construction">
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-muted-foreground">Качество</span>
                <Badge variant="secondary">{c.score}</Badge>
                <span className="text-muted-foreground">Проектов</span>
                <Badge variant="default">{c.jobs}</Badge>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2" aria-label="Поставщики">
          {suppliers.map((s)=>(
            <Card key={s.name} className="shadow-construction">
              <CardHeader>
                <CardTitle>{s.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-muted-foreground">Позиций</span>
                <Badge variant="secondary">{s.items}</Badge>
                <span className="text-muted-foreground">Сроки</span>
                <Badge variant="default">{s.terms}</Badge>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </Layout>
  );
};

export default Contractors;