import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useAdminTheme } from '@/lib/useAdminTheme';

const AdminAuth = () => {
  useAdminTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .single();

        if (roleData) {
          toast.success('Login realizado com sucesso!');
          navigate('/admin/dashboard');
        } else {
          await supabase.auth.signOut();
          toast.error('Você não tem permissão de administrador.');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4 relative">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 inline-flex items-center gap-2 font-mono-tab text-[11px] uppercase tracking-[0.3em] text-ink/60 hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> público
      </button>

      <div className="w-full max-w-md">
        <header className="mb-6 space-y-2">
          <p className="font-mono-tab text-[10px] uppercase tracking-[0.4em] text-ink/50">
            painel · acesso restrito
          </p>
          <h1 className="font-display text-6xl uppercase tracking-tight leading-none">
            Brothers
            <br />
            <span className="text-ink/40">Cup</span>
          </h1>
        </header>

        <form
          onSubmit={handleLogin}
          className="bg-white border border-ink/10 shadow-brutal-sm p-6 space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono-tab text-[10px] uppercase tracking-[0.25em] text-ink/60">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@brotherscup.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="rounded-none border-ink/20 focus-visible:ring-0 focus-visible:border-ink"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono-tab text-[10px] uppercase tracking-[0.25em] text-ink/60">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="rounded-none border-ink/20 focus-visible:ring-0 focus-visible:border-ink"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-none bg-ink text-volt hover:bg-ink/90 font-mono-tab uppercase tracking-[0.25em]"
            disabled={loading}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full text-ink/60 hover:text-ink font-mono-tab text-[11px] uppercase tracking-[0.25em]"
            onClick={() => navigate('/admin/signup')}
          >
            criar primeira conta de admin →
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
