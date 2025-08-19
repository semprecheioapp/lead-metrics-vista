import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface InviteEmailProps {
  company_name: string
  invitee_name?: string
  inviter_name: string
  accept_url: string
}

export const InviteEmail = ({
  company_name,
  invitee_name,
  inviter_name,
  accept_url,
}: InviteEmailProps) => (
  <Html>
    <Head />
    <Preview>Você foi convidado para {company_name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Convite para {company_name}</Heading>
        
        <Text style={text}>
          {invitee_name ? `Olá ${invitee_name},` : 'Olá,'}
        </Text>
        
        <Text style={text}>
          Você foi convidado por <strong>{inviter_name}</strong> para fazer parte da equipe da empresa <strong>{company_name}</strong>.
        </Text>
        
        <Text style={text}>
          Para aceitar o convite e acessar o sistema, clique no botão abaixo:
        </Text>
        
        <Link
          href={accept_url}
          target="_blank"
          style={button}
        >
          Aceitar Convite
        </Link>
        
        <Text style={text}>
          Ou copie e cole este link no seu navegador:
        </Text>
        
        <Text style={link}>
          {accept_url}
        </Text>
        
        <Text style={footer}>
          Este convite expira em 7 dias. Se você não solicitou este convite, 
          pode ignorar este email com segurança.
        </Text>
        
        <Text style={footer}>
          Atenciosamente,<br />
          Equipe do Sistema
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '24px 0',
}

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '24px 0',
}

const link = {
  color: '#007ee6',
  fontSize: '12px',
  textDecoration: 'underline',
  margin: '24px 0',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  margin: '24px 0',
}