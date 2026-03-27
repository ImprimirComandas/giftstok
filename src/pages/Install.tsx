import { useState, useEffect } from "react";
import { ArrowLeft, Share, MoreVertical, Download, Smartphone, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="safe-top sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center py-3 px-4 max-w-lg mx-auto">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 touch-target">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold gradient-text ml-2">Instalar App</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto space-y-6">
        {isInstalled ? (
          <div className="card-glass rounded-xl p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">App já instalado!</h2>
            <p className="text-sm text-muted-foreground">O GiftsTok já está na sua tela inicial.</p>
          </div>
        ) : (
          <>
            {/* Native install button for Android/Chrome */}
            {deferredPrompt && (
              <div className="card-glass rounded-xl p-5 space-y-3 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Instalação rápida</h2>
                    <p className="text-xs text-muted-foreground">Toque para instalar agora</p>
                  </div>
                </div>
                <Button onClick={handleInstall} className="w-full h-12 text-base font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl">
                  <Download className="w-4 h-4 mr-2" /> Instalar Agora
                </Button>
              </div>
            )}

            {/* iOS Instructions */}
            {(isIOS || !deferredPrompt) && (
              <div className="card-glass rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-bold text-foreground">
                    {isIOS ? "Instalar no iPhone/iPad" : "Instalar no Android"}
                  </h2>
                </div>

                {isIOS ? (
                  <div className="space-y-4">
                    <Step number={1} icon={<Share className="w-4 h-4" />} title="Abra no Safari" description="Este app precisa ser aberto no navegador Safari." />
                    <Step number={2} icon={<Share className="w-4 h-4" />} title="Toque em Compartilhar" description='Toque no ícone de compartilhar (quadrado com seta para cima) na barra inferior.' />
                    <Step number={3} icon={<Plus className="w-4 h-4" />} title="Adicionar à Tela Inicial" description='Role para baixo e toque em "Adicionar à Tela de Início".' />
                    <Step number={4} icon={<CheckCircle className="w-4 h-4" />} title="Confirmar" description='Toque em "Adicionar" no canto superior direito.' />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Step number={1} icon={<MoreVertical className="w-4 h-4" />} title="Abra no Chrome" description="Abra este site no Google Chrome." />
                    <Step number={2} icon={<MoreVertical className="w-4 h-4" />} title="Menu do Chrome" description="Toque nos três pontos (⋮) no canto superior direito." />
                    <Step number={3} icon={<Download className="w-4 h-4" />} title='Toque em "Instalar app"' description='Selecione "Instalar aplicativo" ou "Adicionar à tela inicial".' />
                    <Step number={4} icon={<CheckCircle className="w-4 h-4" />} title="Confirmar" description='Toque em "Instalar" para confirmar.' />
                  </div>
                )}
              </div>
            )}

            <div className="card-glass rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-foreground">Por que instalar?</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>✨ Acesso rápido pela tela inicial</li>
                <li>📱 Experiência em tela cheia</li>
                <li>⚡ Carregamento mais rápido</li>
                <li>🔔 Sem barra do navegador</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const Step = ({ number, icon, title, description }: { number: number; icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
      {number}
    </div>
    <div>
      <div className="flex items-center gap-1.5">
        <span className="text-primary">{icon}</span>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  </div>
);

export default Install;
