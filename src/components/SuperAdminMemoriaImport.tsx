import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Empresa {
  id: number;
  name_empresa: string;
}

export const SuperAdminMemoriaImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, name_empresa')
        .eq('ativo', true)
        .order('name_empresa');

      if (error) {
        console.error('Erro ao carregar empresas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de empresas.",
          variant: "destructive",
        });
      } else {
        setEmpresas(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setIsLoadingEmpresas(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });
      
      return row;
    });
  };

  const mapRowToMemoria = (row: any) => {
    // Verificar se tem conteúdo válido
    const content = row.content || row.mensagem || row.prompt || row.pergunta || row.response || row.resposta;
    const type = row.type || (row.prompt || row.pergunta ? "human" : "ai");
    
    if (!content || !type) return null;

    // Criar objeto message no formato JSONB correto
    const message = {
      type: type,
      content: content,
      additional_kwargs: {},
      response_metadata: {}
    };

    const memoria = {
      empresa_id: parseInt(selectedEmpresa),
      session_id: row.session_id || row.sessao || "",
      message: message,
      data_atual: row.data_atual || row.data || new Date().toISOString().split('T')[0],
      created_at: row.created_at || row.data_criacao || new Date().toISOString(),
    };

    return memoria;
  };

  const handleImport = async () => {
    if (!file || !selectedEmpresa || !user) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo e uma empresa para importar.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      const memorias = rows
        .map(mapRowToMemoria)
        .filter(memoria => memoria !== null && memoria.session_id && memoria.message);

      if (memorias.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhuma conversa válida encontrada no arquivo.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('memoria_ai')
        .insert(memorias);

      if (error) {
        console.error('Erro ao importar conversas:', error);
        toast({
          title: "Erro",
          description: "Erro ao importar conversas. Verifique o formato do arquivo.",
          variant: "destructive",
        });
      } else {
        const empresaName = empresas.find(e => e.id === parseInt(selectedEmpresa))?.name_empresa;
        toast({
          title: "Sucesso",
          description: `${memorias.length} conversas importadas com sucesso para ${empresaName}!`,
        });
        setFile(null);
        setSelectedEmpresa('');
        const input = document.getElementById('csv-input-memoria') as HTMLInputElement;
        if (input) input.value = '';
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar o arquivo CSV.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Importar Conversas AI (Super Admin)
        </CardTitle>
        <CardDescription>
          Importe conversas da IA para qualquer empresa do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Formato esperado:</strong> CSV com colunas "session_id", "type" (human/ai), "content" (mensagem), "data_atual" (YYYY-MM-DD). Cada linha representa uma mensagem individual.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Empresa de Destino</label>
            <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa} disabled={isLoadingEmpresas}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingEmpresas ? "Carregando empresas..." : "Selecione uma empresa"} />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id.toString()}>
                    {empresa.name_empresa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            id="csv-input-memoria"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isImporting || !selectedEmpresa}
          />
          
          {file && (
            <div className="text-sm text-muted-foreground">
              Arquivo selecionado: {file.name}
            </div>
          )}

          <Button 
            onClick={handleImport}
            disabled={!file || isImporting || !selectedEmpresa}
            className="w-full"
          >
            {isImporting ? 'Importando...' : 'Importar Conversas'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};