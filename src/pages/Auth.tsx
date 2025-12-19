import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Coins, Lock, Mail, ArrowLeft } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Check if user is admin
          const { data: isAdmin } = await supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin'
          });
          
          if (isAdmin) {
            navigate('/admin');
          } else {
            toast({
              title: "Acesso negado",
              description: "Você não tem permissão de administrador.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
          }
        }
      }
    );

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: isAdmin } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
        
        if (isAdmin) {
          navigate('/admin');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`
          }
        });

        if (error) throw error;

        toast({
          title: "Conta criada!",
          description: "Entre em contato com um administrador para ativar suas permissões.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      let message = "Ocorreu um erro. Tente novamente.";
      
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou senha inválidos.";
      } else if (error.message.includes("User already registered")) {
        message = "Este email já está cadastrado.";
      } else if (error.message.includes("Password should be at least")) {
        message = "A senha deve ter pelo menos 6 caracteres.";
      }

      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card-glass rounded-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative">
              <Coins className="w-10 h-10 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-primary/30 -z-10"></div>
            </div>
            <h1 className="text-2xl font-bold gradient-text">Admin Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Carregando..." : isSignUp ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? "Já tem conta? Entrar" : "Não tem conta? Cadastrar"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para calculadora
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;