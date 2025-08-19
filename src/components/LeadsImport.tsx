import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const LeadsImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { empresaId } = useAuth();
  const { toast } = useToast();

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
    // Mapear campos comuns do CSV para a estrutura do banco
    const lead = {
      empresa_id: empresaId,
      name: row.name || row.nome || row.cliente || null,
      number: row.number || row.telefone || row.phone || row.celular || null,
      etapa: 1, // Todos começam como "Novo"
      qualificacao: row.qualificacao || row.status || null,
      origem: 'import',
      created_at: row.created_at || row.data || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return lead;
  };

  const handleImport = async () => {
    if (!file || !empresaId) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo e certifique-se de estar logado.",
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
        .filter(lead => lead.name || lead.number); // Só importa se tiver nome ou telefone

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
        toast({
          title: "Sucesso",
          description: `${leads.length} leads importados com sucesso!`,
        });
        setFile(null);
        // Reset input
        const input = document.getElementById('csv-input') as HTMLInputElement;
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
          Importar Leads
        </CardTitle>
        <CardDescription>
          Importe seus leads existentes de um arquivo CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Formato esperado:</strong> CSV com colunas como "name/nome", "number/telefone", "qualificacao/status".
            Todos os leads serão automaticamente associados à sua empresa.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Input
            id="csv-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isImporting}
          />
          
          {file && (
            <div className="text-sm text-muted-foreground">
              Arquivo selecionado: {file.name}
            </div>
          )}

          <Button 
            onClick={handleImport}
            disabled={!file || isImporting}
            className="w-full"
          >
            {isImporting ? 'Importando...' : 'Importar Leads'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};