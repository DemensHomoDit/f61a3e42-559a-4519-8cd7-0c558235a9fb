import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  Users, 
  CheckSquare, 
  DollarSign, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  Activity,
  Truck,
  HardHat
} from "lucide-react";

export function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Оперативная панель</h1>
          <p className="text-muted-foreground mt-1">
            Контроль строительных объектов в реальном времени
          </p>
        </div>
        <Badge variant="outline" className="text-success border-success/30 bg-success/10">
          <Activity className="h-3 w-3 mr-1" />
          Система активна
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-construction hover:shadow-elevated transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активные объекты
            </CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">12</div>
            <p className="text-xs text-success">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +2 новых на этой неделе
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-construction hover:shadow-elevated transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Сотрудники на объектах
            </CardTitle>
            <HardHat className="h-4 w-4 text-construction-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">147</div>
            <p className="text-xs text-muted-foreground">
              134 работают, 13 в перерыве
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-construction hover:shadow-elevated transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Выполнено задач сегодня
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">89</div>
            <p className="text-xs text-warning">
              <Clock className="h-3 w-3 inline mr-1" />
              7 задач просрочены
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-construction hover:shadow-elevated transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Затраты за месяц
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₽4.2M</div>
            <p className="text-xs text-success">
              В пределах бюджета (-8%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Projects */}
        <Card className="lg:col-span-2 shadow-construction">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2 text-primary" />
              Активные объекты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "ЖК 'Северная звезда'", progress: 78, status: "В срок", location: "Москва" },
                { name: "Торговый центр 'Горизонт'", progress: 45, status: "Задержка", location: "СПб" },
                { name: "Офисный комплекс 'Технопарк'", progress: 92, status: "Завершение", location: "Казань" },
                { name: "Склад логистического центра", progress: 23, status: "Начальный", location: "Н.Новгород" }
              ].map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge 
                        variant={project.status === "В срок" ? "default" : project.status === "Завершение" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{project.location}</div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">{project.progress}% завершено</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Team Status */}
          <Card className="shadow-construction">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-construction-orange" />
                Статус команды
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">На рабочих местах</span>
                  <Badge variant="default" className="bg-success">134</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">В перерыве</span>
                  <Badge variant="secondary">13</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Опоздавшие</span>
                  <Badge variant="destructive">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Продуктивность</span>
                  <Badge variant="outline" className="text-success border-success">87%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Events */}
          <Card className="shadow-construction">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                События дня
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <Truck className="h-4 w-4 text-construction-orange mt-0.5" />
                  <div>
                    <div className="font-medium">Доставка материалов</div>
                    <div className="text-muted-foreground">ЖК 'Северная звезда' - 09:30</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckSquare className="h-4 w-4 text-success mt-0.5" />
                  <div>
                    <div className="font-medium">Завершен фундамент</div>
                    <div className="text-muted-foreground">Склад логистического центра - 14:15</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <div>
                    <div className="font-medium">Замечание ИИ</div>
                    <div className="text-muted-foreground">Нарушение техники безопасности - 16:22</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}