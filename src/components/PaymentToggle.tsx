import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X } from 'lucide-react';
import type { Player } from '@/types';

const STANDARD_AMOUNT = 150;

interface PaymentToggleProps {
  player: Player;
  paid: boolean;
  amount: number;
  onToggle: (amount: number) => void;
  onSplitPayment?: (currentAmount: number, nextMonthAmount: number) => void;
  disabled?: boolean;
  variant?: 'default' | 'advance';
}

export function PaymentToggle({ 
  player, paid, amount = 150, onToggle, onSplitPayment, disabled = false, variant = 'default' 
}: PaymentToggleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputAmount, setInputAmount] = useState((amount || 150).toString());
  const [splitEnabled, setSplitEnabled] = useState(false);

  const parsedAmount = parseFloat(inputAmount) || 0;
  const overpayment = parsedAmount - STANDARD_AMOUNT;
  const showSplitOption = parsedAmount > STANDARD_AMOUNT && onSplitPayment;

  const handleConfirm = () => {
    if (splitEnabled && overpayment > 0 && onSplitPayment) {
      onSplitPayment(STANDARD_AMOUNT, overpayment);
    } else {
      onToggle(parsedAmount || STANDARD_AMOUNT);
    }
    setIsEditing(false);
    setSplitEnabled(false);
  };

  const handleCancel = () => {
    setInputAmount(amount.toString());
    setIsEditing(false);
    setSplitEnabled(false);
  };

  const handleToggleClick = () => {
    if (paid) {
      onToggle(amount);
    } else {
      setInputAmount(String(STANDARD_AMOUNT));
      setSplitEnabled(false);
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full p-4 rounded-xl bg-secondary/50 border border-border transition-all duration-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
            {player.firstName[0]}{player.lastName[0]}
          </div>
          <p className="font-medium text-foreground">
            {player.firstName} {player.lastName}
          </p>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="pr-8"
              placeholder="150"
              autoFocus
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              zł
            </span>
          </div>
          <Button size="icon" variant="default" onClick={handleConfirm} className="shrink-0">
            <Check className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={handleCancel} className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {showSplitOption && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={splitEnabled}
                onCheckedChange={(checked) => setSplitEnabled(checked === true)}
              />
              <span className="text-sm text-foreground">Przenieś nadpłatę na następny miesiąc</span>
            </label>
            {splitEnabled && (
              <div className="text-xs text-muted-foreground space-y-1 pl-6">
                <p>Bieżący miesiąc: <span className="font-semibold text-foreground">{STANDARD_AMOUNT} zł</span></p>
                <p>Następny miesiąc: <span className="font-semibold text-success">{overpayment} zł</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const isAdvance = variant === 'advance';

  return (
    <div className={cn(
      "w-full p-4 rounded-xl flex items-center justify-between gap-4 transition-all duration-200 border",
      paid 
        ? "bg-success/10 border-success/30" 
        : isAdvance
          ? "bg-muted/30 border-border"
          : "bg-destructive/10 border-destructive/30"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
          paid 
            ? "bg-success/20 text-success" 
            : isAdvance
              ? "bg-muted text-muted-foreground"
              : "bg-destructive/20 text-destructive"
        )}>
          {player.firstName[0]}{player.lastName[0]}
        </div>
        <div>
          <p className="font-medium text-foreground">
            {player.firstName} {player.lastName}
          </p>
          {paid && (
            <p className="text-sm text-success font-semibold">{amount} zł</p>
          )}
        </div>
      </div>
      
      <button
        onClick={handleToggleClick}
        disabled={disabled}
        className={cn(
          "px-4 py-2 rounded-lg font-semibold text-sm tap-target transition-all duration-200 whitespace-nowrap",
          paid 
            ? "gradient-success text-success-foreground glow-success" 
            : isAdvance
              ? "bg-muted text-muted-foreground hover:bg-accent"
              : "gradient-destructive text-destructive-foreground glow-destructive",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        {paid ? 'Zapłacone' : isAdvance ? 'Opłać z góry' : 'Nie zapłacone'}
      </button>
    </div>
  );
}
