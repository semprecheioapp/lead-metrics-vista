import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Mail, UserX, RotateCcw, Shield, Clock, UserCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAgentManagement, ActiveMember, PendingInvite } from "@/hooks/useAgentManagement";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgentManagementTableProps {
  activeMembers: ActiveMember[];
  pendingInvites: PendingInvite[];
}

export const AgentManagementTable = ({ activeMembers, pendingInvites }: AgentManagementTableProps) => {
  const { revokeInvite, isRevokingInvite, resendInvite, isResendingInvite } = useAgentManagement();
  const [selectedInvite, setSelectedInvite] = useState<string>("");

  const handleRevokeInvite = (inviteId: string) => {
    setSelectedInvite(inviteId);
    revokeInvite(inviteId);
  };

  const isInviteExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="active" className="gap-2">
          <UserCheck className="h-4 w-4" />
          Membros Ativos ({activeMembers.length})
        </TabsTrigger>
        <TabsTrigger value="pending" className="gap-2">
          <Clock className="h-4 w-4" />
          Convites Pendentes ({pendingInvites.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Membros Ativos
            </CardTitle>
            <CardDescription>
              Agentes que já aceitaram o convite e têm acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum membro ativo encontrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Membro desde</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.profiles.nome || "Nome não informado"}
                      </TableCell>
                      <TableCell>{member.profiles.email}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(member.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Shield className="h-4 w-4" />
                              Editar Permissões
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <RotateCcw className="h-4 w-4" />
                              Reset 2FA
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <UserX className="h-4 w-4" />
                              Desativar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Convites Pendentes
            </CardTitle>
            <CardDescription>
              Convites enviados que ainda não foram aceitos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingInvites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum convite pendente</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome/E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enviado</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvites.map((invite) => {
                    const isExpired = isInviteExpired(invite.expires_at);
                    return (
                      <TableRow key={invite.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {invite.name || invite.email}
                            </div>
                            {invite.name && (
                              <div className="text-sm text-muted-foreground">
                                {invite.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isExpired ? 'destructive' : 'outline'}>
                            {isExpired ? 'Expirado' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(invite.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </TableCell>
                        <TableCell>
                          {isExpired ? (
                            <span className="text-destructive">Expirado</span>
                          ) : (
                            formatDistanceToNow(new Date(invite.expires_at), {
                              locale: ptBR
                            })
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1"
                                onClick={() => { setSelectedInvite(invite.id); resendInvite(invite.id); }}
                                disabled={isResendingInvite && selectedInvite === invite.id}
                              >
                                <Mail className="h-3 w-3" />
                                {isResendingInvite && selectedInvite === invite.id ? 'Reenviando...' : 'Reenviar'}
                              </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                                  <UserX className="h-3 w-3" />
                                  Revogar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revogar Convite</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja revogar o convite para {invite.name || invite.email}? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRevokeInvite(invite.id)}
                                    disabled={isRevokingInvite && selectedInvite === invite.id}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isRevokingInvite && selectedInvite === invite.id ? 'Revogando...' : 'Revogar'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};