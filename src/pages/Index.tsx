import { useState } from "react";
import { Calculator } from "@/components/Calculator";
import { Calculator as CalcIcon, BarChart3, Layers, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Tab = "calc" | "levels" | "chart";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("calc");
  const navigate = useNavigate();

  const tabs = [
    { id: "calc" as Tab, icon: CalcIcon, label: "Calcular" },
    { id: "levels" as Tab, icon: Layers, label: "Níveis" },
    { id: "chart" as Tab, icon: BarChart3, label: "Gráfico" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact header */}
      <header className="safe-top sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between py-3 px-4 max-w-lg mx-auto">
          <h1 className="text-lg font-bold gradient-text">GiftsTok</h1>
          <button onClick={() => navigate("/install")} className="p-2 -mr-2 touch-target text-muted-foreground hover:text-primary transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20">
        <Calculator activeTab={activeTab} />
      </main>

      {/* Bottom navigation */}
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border/50">
        <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all touch-target ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "animate-glow" : ""}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
