import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Empresa {
  id: number;
  name_empresa: string;
}

export const SuperAdminLeadsImport = () => {
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

  const mapRowToLead = (row: any) => {
    const lead = {
      empresa_id: parseInt(selectedEmpresa),
      name: row.name || row.nome || row.cliente || null,
      number: row.number || row.telefone || row.phone || row.celular || null,
      etapa: 1,
      qualificacao: row.qualificacao || row.status || null,
      origem: 'import',
      created_at: row.created_at || row.data || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return lead;
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
      
      const leads = rows
        .map(mapRowToLead)
        .filter(lead => lead.name || lead.number);

      if (leads.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum lead válido encontrado no arquivo.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('novos_leads')
        .insert(leads);

      if (error) {
        console.error('Erro ao importar leads:', error);
        toast({
          title: "Erro",
          description: "Erro ao importar leads. Verifique o formato do arquivo.",
          variant: "destructive",
        });
      } else {
        const empresaName = empresas.find(e => e.id === parseInt(selectedEmpresa))?.name_empresa;
        toast({
          title: "Sucesso",
          description: `${leads.length} leads importados com sucesso para ${empresaName}!`,
        });
        setFile(null);
        setSelectedEmpresa('');
        const input = document.getElementById('csv-input-superadmin') as HTMLInputElement;
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
          <Upload className="h-5 w-5" />
          Importar Leads (Super Admin)
        </CardTitle>
        <CardDescription>
          Importe leads para qualquer empresa do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Super Admin:</strong> Você pode importar leads para qualquer empresa.
            Selecione a empresa de destino antes de fazer a importação.
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
            id="csv-input-superadmin"
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
            {isImporting ? 'Importando...' : 'Importar Leads'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};