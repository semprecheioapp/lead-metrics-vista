import { ReactNode } from "react";
import RetroGrid from "@/components/magicui/retro-grid";
import { cn } from "@/lib/utils";
interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}
export const AuthLayout = ({
  children,
  title,
  subtitle
}: AuthLayoutProps) => {
  return <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-slate-900 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #1E3A8A, #0F172A)'}}>
      {/* Background Grid */}
      <RetroGrid className="opacity-30" />
      
      {/* Main Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/20 to-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <img 
                src="/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png" 
                alt="MBK" 
                className="w-8 h-8 object-contain filter brightness-0 invert" 
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 font-inter tracking-tight">
            Dashboard Mbk
          </h1>
          {subtitle && (
            <p className="text-blue-200 text-lg font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Card */}
        <div 
          className="relative overflow-hidden rounded-xl border backdrop-blur-sm p-8 shadow-2xl"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: '#334155',
            borderRadius: '12px'
          }}
        >
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-blue-200 text-sm font-medium">
          <p>© 2025 MBK Automações. Todos os direitos reservados.</p>
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
    </div>;
};