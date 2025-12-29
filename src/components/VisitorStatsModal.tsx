import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { History } from "lucide-react";
import { Currency } from "@/constants/levels";

interface CalculationHistory {
  id: string;
  current_level: number;
  target_level: number;
  points_needed: number;
  amount_calculated: number;
  created_at: string;
  currency_code: string;
  user_points: number | null;
}

interface VisitorStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: CalculationHistory[];
  selectedCurrency: Currency;
  isLoading: boolean;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const VisitorStatsModal = ({
  open,
  onOpenChange,
  history,
  selectedCurrency,
  isLoading,
}: VisitorStatsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Histórico de Cálculos
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>
          ) : history.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {history.map((calc) => (
                <div
                  key={calc.id}
                  className="bg-accent/20 rounded-lg p-4 border border-border/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-lg">
                        Nível {calc.current_level} → {calc.target_level}
                      </span>
                      {calc.user_points && (
                        <p className="text-sm text-muted-foreground">
                          {Number(calc.user_points).toLocaleString('pt-BR')} pontos atuais
                        </p>
                      )}
                    </div>
                    <span className="text-primary font-bold text-lg">
                      {selectedCurrency.symbol}{Number(calc.amount_calculated).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{Number(calc.points_needed).toLocaleString('pt-BR')} pontos necessários</span>
                    <span>{formatDate(calc.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              Nenhum histórico encontrado.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
