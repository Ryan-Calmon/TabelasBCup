import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAdminTheme } from '@/lib/useAdminTheme';

const AdminSignup = () => {
  useAdminTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        toast.success('Conta criada! Anote seu User ID: ' + data.user.id, { duration: 10000 });
        alert(
          `IMPORTANTE! Anote este User ID:\n\n${data.user.id}\n\n` +
          `Agora você precisa:\n` +
          `1. Ir para Supabase > Database > Tables > user_roles\n` +
          `2. Clicar em "Insert row"\n` +
          `3. Adicionar:\n` +
          `   - user_id: ${data.user.id}\n` +
          `   - role: admin\n` +
          `4. Depois volte e faça login em /admin`
        );
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="mb-6 space-y-2">
          <p className="font-mono-tab text-[10px] uppercase tracking-[0.4em] text-ink/50">
            painel · novo administrador
          </p>
          <h1 className="font-display text-5xl uppercase tracking-tight leading-none">
            Criar conta
          </h1>
        </header>

        <form
          onSubmit={handleSignup}
          className="bg-white border border-ink/10 shadow-brutal-sm p-6 space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono-tab text-[10px] uppercase tracking-[0.25em] text-ink/60">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
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
              minLength={6}
              className="rounded-none border-ink/20 focus-visible:ring-0 focus-visible:border-ink"
            />
            <p className="font-mono-tab text-[10px] uppercase tracking-[0.25em] text-ink/50">
              mínimo 6 caracteres
            </p>
          </div>
          <Button
            type="submit"
            className="w-full rounded-none bg-ink text-volt hover:bg-ink/90 font-mono-tab uppercase tracking-[0.25em]"
            disabled={loading}
          >
            {loading ? 'Criando…' : 'Criar conta'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-none border-ink/20 hover:bg-ink hover:text-volt font-mono-tab text-[11px] uppercase tracking-[0.25em]"
            onClick={() => navigate('/admin')}
          >
            já tenho conta · fazer login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;
