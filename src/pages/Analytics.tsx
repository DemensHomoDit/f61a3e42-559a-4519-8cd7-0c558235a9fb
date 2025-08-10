import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Helmet } from "react-helmet-async";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Analytics = () => {
  return (
    <Layout>
      <Helmet>
        <title>Аналитика и ИИ — ПромСтрой Контроль</title>
        <meta name="description" content="Прогнозы сроков, выявление узких мест и рекомендации по оптимизации." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main className="space-y-6 animate-fade-in" role="main">
        <header>
          <h1 className="text-3xl font-bold text-primary">Аналитика и ИИ</h1>
          <p className="text-muted-foreground mt-1">Прогнозирование и рекомендации</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3" aria-label="Прогнозы">
          <Card className="shadow-construction lg:col-span-2">
            <CardHeader>
              <CardTitle>Прогноз завершения объектов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[{name:'Северная звезда',v:84},{name:'Горизонт',v:58},{name:'Технопарк',v:95}].map((p)=>(
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{p.name}</span>
                    <span className="text-muted-foreground">{p.v}%</span>
                  </div>
                  <Progress value={p.v} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-construction">
            <CardHeader>
              <CardTitle>Риски задержек</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {name:'Материалы',lvl:'Высокий',variant:'destructive'},
                {name:'Персонал',lvl:'Средний',variant:'secondary'},
                {name:'Погода',lvl:'Низкий',variant:'default'},
              ].map((r)=> (
                <div key={r.name} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{r.name}</span>
                  <Badge variant={r.variant as any}>{r.lvl}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </Layout>
  );
};

export default Analytics;