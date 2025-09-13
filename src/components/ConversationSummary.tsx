import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, TrendingUp, Heart, AlertCircle, CheckCircle, Clock, Target, Lightbulb } from "lucide-react";

interface SummaryData {
  titulo: string;
  descricao: string;
  pontos_principais: string[];
  sentimento: 'positivo' | 'neutro' | 'negativo';
  status_lead: string;
  proximos_passos: string[];
  tempo_conversa: string;
  nivel_interesse: number | string;
  recomendacoes: string[];
}

interface ConversationSummaryProps {
  summary: SummaryData;
}

export const ConversationSummary = ({ summary }: ConversationSummaryProps) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positivo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'negativo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const getInterestLevel = (level: number | string): string => {
    if (typeof level === 'number') {
      if (level >= 8) return 'alto';
      if (level >= 5) return 'medio';
      return 'baixo';
    }
    return level;
  };

  const getInterestColor = (level: string | number) => {
    const normalizedLevel = getInterestLevel(level);
    switch (normalizedLevel) {
      case 'alto': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'baixo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positivo': return <CheckCircle className="w-4 h-4" />;
      case 'negativo': return <AlertCircle className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          {summary.titulo}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="space-y-4 pr-2">
            {/* Descrição */}
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                {summary.descricao}
              </p>
            </div>

            {/* Métricas principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="text-center">
                <Badge variant="outline" className={`${getSentimentColor(summary.sentimento)} mb-2 text-xs`}>
                  <div className="flex items-center gap-1">
                    {getSentimentIcon(summary.sentimento)}
                    <span className="capitalize">{summary.sentimento}</span>
                  </div>
                </Badge>
                <div className="text-xs text-muted-foreground">Sentimento</div>
              </div>
              
              <div className="text-center">
                <Badge variant="outline" className={`${getInterestColor(summary.nivel_interesse)} text-xs`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span className="capitalize">{getInterestLevel(summary.nivel_interesse)}</span>
                </Badge>
                <div className="text-xs text-muted-foreground">Interesse</div>
              </div>
              
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  {summary.status_lead}
                </Badge>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
              
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {summary.tempo_conversa}
                </Badge>
                <div className="text-xs text-muted-foreground">Duração</div>
              </div>
            </div>

            {/* Pontos principais */}
            <div>
              <h4 className="text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                Pontos Principais
              </h4>
              <ul className="space-y-1">
                {summary.pontos_principais.map((ponto, index) => (
                  <li key={index} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="break-words">{ponto}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Próximos passos */}
            <div>
              <h4 className="text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                Próximos Passos
              </h4>
              <ul className="space-y-1">
                {summary.proximos_passos.map((passo, index) => (
                  <li key={index} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="break-words">{passo}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recomendações */}
            <div>
              <h4 className="text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                Recomendações
              </h4>
              <ul className="space-y-1">
                {summary.recomendacoes.map((recomendacao, index) => (
                  <li key={index} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="break-words">{recomendacao}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};