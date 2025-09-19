
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Building2, Edit, Power, Plus, Mail } from "lucide-react";

interface Company {
  id: number;
  name_empresa: string;
  email: string | null;
  telefone: string | null;
  plano: string | null;
  ativo: boolean | null;
  limite_leads: number | null;
  limite_mensagens: number | null;
  created_at: string | null;
  // Todos os campos estão na tabela empresas
  host?: string | null;
  instance?: string | null;
  token?: string | null;
  prompt?: string | null;
  tipo_de_api_conectada?: string | null;
  versao_api?: string | null;
}

interface NewCompany {
  name_empresa: string;
  email: string;
  telefone: string;
  plano: string;
  limite_leads: number;
  limite_mensagens: number;
  tipo_de_api_conectada: string;
  versao_api: string;
}

export const CompanyManagement = () => {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState<NewCompany>({
    name_empresa: "",
    email: "",
    telefone: "",
    plano: "free",
    limite_leads: 1000,
    limite_mensagens: 10000,
    tipo_de_api_conectada: "api_oficial",
    versao_api: "v19.0"
  });
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies-management"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("name_empresa");
      
      if (error) throw error;
      
      return data as Company[];
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: number; ativo: boolean }) => {
      const { error } = await supabase
        .from("empresas")
        .update({ ativo })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies-management"] });
      toast({
        title: "Sucesso",
        description: "Status da empresa atualizado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da empresa",
        variant: "destructive",
      });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (company: Partial<Company> & { id: number }) => {
      console.log("Updating company:", company);
      
      // Atualizar todos os dados na tabela empresas
      const { id, ...empresaData } = company;
      
      console.log("Empresa data to update:", empresaData);
      
      const { error } = await supabase
        .from("empresas")
        .update(empresaData)
        .eq("id", id);
      
      if (error) {
        console.error("Error updating empresa:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies-management"] });
      setEditingCompany(null);
      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar empresa",
        variant: "destructive",
      });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: NewCompany) => {
      const { data, error } = await supabase.functions.invoke('create-company-invite', {
        body: {
          email: companyData.email,
          name_empresa: companyData.name_empresa,
          telefone: companyData.telefone,
          nome_usuario: companyData.email.split('@')[0],
          plano: companyData.plano,
          limite_leads: companyData.limite_leads,
          limite_mensagens: companyData.limite_mensagens,
          tipo_de_api_conectada: companyData.tipo_de_api_conectada,
          versao_api: companyData.versao_api
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies-management"] });
      setCreatingCompany(false);
      setNewCompany({
        name_empresa: "",
        email: "",
        telefone: "",
        plano: "free",
        limite_leads: 1000,
        limite_mensagens: 10000,
        tipo_de_api_conectada: "api_oficial",
        versao_api: "v19.0"
      });
      toast({
        title: "Sucesso",
        description: "Empresa criada e convite enviado por email!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar empresa",
        variant: "destructive",
      });
    },
  });

  const handleSaveCompany = () => {
    if (!editingCompany) return;
    updateCompanyMutation.mutate(editingCompany);
  };

  const handleCreateCompany = () => {
    if (!newCompany.name_empresa || !newCompany.email) {
      toast({
        title: "Erro",
        description: "Nome da empresa e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createCompanyMutation.mutate(newCompany);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gerenciamento de Empresas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gerenciamento de Empresas
          </CardTitle>
          
          <Dialog open={creatingCompany} onOpenChange={setCreatingCompany}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Criar Nova Empresa
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-name">Nome da Empresa *</Label>
                  <Input
                    id="new-name"
                    value={newCompany.name_empresa}
                    onChange={(e) => setNewCompany({
                      ...newCompany,
                      name_empresa: e.target.value
                    })}
                    placeholder="Ex: Empresa ABC Ltda"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-email">Email do Administrador *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newCompany.email}
                    onChange={(e) => setNewCompany({
                      ...newCompany,
                      email: e.target.value
                    })}
                    placeholder="admin@empresa.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-telefone">Telefone</Label>
                  <Input
                    id="new-telefone"
                    value={newCompany.telefone}
                    onChange={(e) => setNewCompany({
                      ...newCompany,
                      telefone: e.target.value
                    })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-plano">Plano</Label>
                  <Select
                    value={newCompany.plano}
                    onValueChange={(value) => setNewCompany({
                      ...newCompany,
                      plano: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Configuração da API */}
                <div>
                  <Label htmlFor="new-tipo-api">Tipo de API</Label>
                  <Select
                    value={newCompany.tipo_de_api_conectada}
                    onValueChange={(value) => setNewCompany({
                      ...newCompany,
                      tipo_de_api_conectada: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_oficial">API Oficial</SelectItem>
                      <SelectItem value="mega_api">Mega API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="new-versao-api">Versão da API</Label>
                  <Select
                    value={newCompany.versao_api}
                    onValueChange={(value) => setNewCompany({
                      ...newCompany,
                      versao_api: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v19.0">v19.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-limite-leads">Limite de Leads</Label>
                    <Input
                      id="new-limite-leads"
                      type="number"
                      value={newCompany.limite_leads}
                      onChange={(e) => setNewCompany({
                        ...newCompany,
                        limite_leads: parseInt(e.target.value) || 1000
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-limite-mensagens">Limite de Mensagens</Label>
                    <Input
                      id="new-limite-mensagens"
                      type="number"
                      value={newCompany.limite_mensagens}
                      onChange={(e) => setNewCompany({
                        ...newCompany,
                        limite_mensagens: parseInt(e.target.value) || 10000
                      })}
                    />
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Um convite via Supabase Auth será enviado para o email informado. O usuário receberá um link para definir a senha e acessar o sistema.
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCreatingCompany(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateCompany}
                    disabled={createCompanyMutation.isPending}
                  >
                    {createCompanyMutation.isPending ? "Criando..." : "Criar e Enviar Convite"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies?.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{company.name_empresa}</h4>
                  <Badge 
                    variant={company.ativo ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {company.ativo ? "Ativa" : "Inativa"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {company.plano || "free"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {company.email} • Leads: {company.limite_leads || 1000} • Mensagens: {company.limite_mensagens || 10000}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingCompany(company)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Empresa</DialogTitle>
                    </DialogHeader>
                    {editingCompany && (
                      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Dados Básicos */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <h3 className="font-medium">Dados Básicos</h3>
                          </div>
                          
                          <div>
                            <Label htmlFor="name">Nome da Empresa</Label>
                            <Input
                              id="name"
                              value={editingCompany.name_empresa}
                              onChange={(e) => setEditingCompany({
                                ...editingCompany,
                                name_empresa: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={editingCompany.email || ""}
                              onChange={(e) => setEditingCompany({
                                ...editingCompany,
                                email: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="plano">Plano</Label>
                            <Select
                              value={editingCompany.plano || "free"}
                              onValueChange={(value) => setEditingCompany({
                                ...editingCompany,
                                plano: value
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="limite_leads">Limite de Leads</Label>
                              <Input
                                id="limite_leads"
                                type="number"
                                value={editingCompany.limite_leads || 1000}
                                onChange={(e) => setEditingCompany({
                                  ...editingCompany,
                                  limite_leads: parseInt(e.target.value)
                                })}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="limite_mensagens">Limite de Mensagens</Label>
                              <Input
                                id="limite_mensagens"
                                type="number"
                                value={editingCompany.limite_mensagens || 10000}
                                onChange={(e) => setEditingCompany({
                                  ...editingCompany,
                                  limite_mensagens: parseInt(e.target.value)
                                })}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="ativo"
                              checked={editingCompany.ativo || false}
                              onCheckedChange={(checked) => setEditingCompany({
                                ...editingCompany,
                                ativo: checked
                              })}
                            />
                            <Label htmlFor="ativo">Empresa Ativa</Label>
                          </div>
                        </div>

                        <Separator />

                         {/* Configurações da API */}
                         <div className="space-y-4">
                           <div className="flex items-center gap-2">
                             <Building2 className="h-4 w-4" />
                             <h3 className="font-medium">Configurações da API</h3>
                           </div>
                           
                           <div>
                             <Label htmlFor="tipo-api">Tipo de API</Label>
                             <Select
                               value={editingCompany.tipo_de_api_conectada || "api_oficial"}
                               onValueChange={(value) => setEditingCompany({
                                 ...editingCompany,
                                 tipo_de_api_conectada: value
                               })}
                             >
                               <SelectTrigger>
                                 <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="api_oficial">API Oficial</SelectItem>
                                 <SelectItem value="mega_api">Mega API</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>

                           <div>
                             <Label htmlFor="versao-api">Versão da API</Label>
                             <Select
                               value={editingCompany.versao_api || "v19.0"}
                               onValueChange={(value) => setEditingCompany({
                                 ...editingCompany,
                                 versao_api: value
                               })}
                             >
                               <SelectTrigger>
                                 <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="v19.0">v19.0</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                           
                           <div>
                            <Label htmlFor="host">Host Instance</Label>
                            <Input
                              id="host"
                              placeholder="Ex: https://api.megachat.com.br"
                              value={editingCompany.host || ""}
                              onChange={(e) => setEditingCompany({
                                ...editingCompany,
                                host: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="instance">Instance</Label>
                            <Input
                              id="instance"
                              placeholder="Ex: minha-instancia"
                              value={editingCompany.instance || ""}
                              onChange={(e) => setEditingCompany({
                                ...editingCompany,
                                instance: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="token">Token da API</Label>
                            <Input
                              id="token"
                              type="password"
                              placeholder="Token de autenticação"
                              value={editingCompany.token || ""}
                              onChange={(e) => setEditingCompany({
                                ...editingCompany,
                                token: e.target.value
                              })}
                            />
                          </div>
                        </div>

                        <Separator />

                        {/* Configurações do Sistema */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <h3 className="font-medium">Prompt do Sistema</h3>
                          </div>
                          
                           <div>
                             <Label htmlFor="prompt">Prompt Personalizado</Label>
                             <Textarea
                               id="prompt"
                               placeholder="Digite o prompt personalizado para este cliente..."
                               value={editingCompany.prompt || ""}
                               onChange={(e) => setEditingCompany({
                                 ...editingCompany,
                                 prompt: e.target.value
                               })}
                               rows={4}
                             />
                           </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setEditingCompany(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleSaveCompany}
                            disabled={updateCompanyMutation.isPending}
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant={company.ativo ? "destructive" : "default"}
                  size="sm"
                  onClick={() => toggleActiveMutation.mutate({
                    id: company.id,
                    ativo: !company.ativo
                  })}
                  disabled={toggleActiveMutation.isPending}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {(!companies || companies.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma empresa encontrada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
