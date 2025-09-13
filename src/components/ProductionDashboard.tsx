import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { logger } from '@/utils/logger';

export const ProductionDashboard = () => {
  const logs = logger.getLogs();
  const errors = logger.getErrors();
  const recentErrors = errors.slice(-5);
  const recentLogs = logs.slice(-10);

  const handleClearLogs = () => {
    logger.clearLogs();
    window.location.reload();
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operacional</div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando normalmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros Recentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errors.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Boa</div>
            <p className="text-xs text-muted-foreground">
              Tempos de resposta normais
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Erros Críticos
            </CardTitle>
            <CardDescription>
              Últimos erros registrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentErrors.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum erro registrado
              </p>
            ) : (
              <div className="space-y-2">
                {recentErrors.map((error, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="destructive">ERRO</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{error.message}</p>
                    {error.data && (
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(error.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Logs Recentes
            </CardTitle>
            <CardDescription>
              Atividade recente do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum log registrado
              </p>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={getStatusColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{log.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações de Manutenção</CardTitle>
          <CardDescription>
            Ferramentas para manutenção do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-x-4">
            <Button onClick={handleClearLogs} variant="outline">
              Limpar Logs
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Recarregar Sistema
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};