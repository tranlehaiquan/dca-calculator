import { Calendar as CalendarIcon, DollarSign, RefreshCw, Coins, Share2, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isValid, parse } from "date-fns";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { Asset, Frequency } from "@/constants";
import type { DcaCalculatorHook } from "@/hooks/useDcaCalculator";

interface InputFormProps {
  dca: DcaCalculatorHook;
}

export function InputForm({ dca }: InputFormProps) {
  const {
    asset,
    setAsset,
    amount,
    setAmount,
    frequency,
    setFrequency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    inflationRate,
    setInflationRate,
    calculate: onCalculate,
    loading: isLoading,
  } = dca;

  const isComparison = (dca as any).isComparison;

  const { t } = useTranslation();
  const [showCopied, setShowCopied] = useState(false);
  
  const handleDateInput = (val: string, setter: (v: string) => void) => {
    setter(val);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const getValidDate = (dateStr: string) => {
    const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  };

  const startD = getValidDate(startDate);
  const endD = getValidDate(endDate);

  return (
    <Card className="bg-card/50 border-white/10 shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          {t("input.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isComparison && (
          <div className="space-y-2">
            <Label className="text-secondary-foreground/70 flex items-center gap-2">
              <Coins size={14} /> {t("input.select_asset")}
            </Label>
            <Select value={asset} onValueChange={(val) => setAsset(val as Asset)}>
              <SelectTrigger className="w-full border-white/10 bg-black/20">
                <SelectValue placeholder={t("input.select_asset")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">{t("assets.BTC")}</SelectItem>
                <SelectItem value="Gold">{t("assets.Gold")}</SelectItem>
                <SelectItem value="Silver">{t("assets.Silver")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-secondary-foreground/70 flex items-center gap-2">
            <DollarSign size={14} /> {t("input.investment_amount")}
          </Label>
          <div className="relative">
            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
              $
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="1"
              className="border-white/10 bg-black/20 pl-7"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-secondary-foreground/70 flex items-center gap-2">
            <Percent size={14} /> {t("input.inflation_rate")}
          </Label>
          <Input
            type="number"
            value={inflationRate}
            onChange={(e) => setInflationRate(Number(e.target.value))}
            min="0"
            step="0.1"
            className="border-white/10 bg-black/20"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-secondary-foreground/70 flex items-center gap-2">
            <RefreshCw size={14} /> {t("input.frequency")}
          </Label>
          <Select
            value={frequency}
            onValueChange={(val) => setFrequency(val as Frequency)}
          >
            <SelectTrigger className="w-full border-white/10 bg-black/20">
              <SelectValue placeholder={t("input.frequency")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">
                {t("input.frequencies.daily")}
              </SelectItem>
              <SelectItem value="weekly">
                {t("input.frequencies.weekly")}
              </SelectItem>
              <SelectItem value="monthly">
                {t("input.frequencies.monthly")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label className="text-secondary-foreground/70 flex items-center gap-2">
              <CalendarIcon size={14} /> {t("input.start_date")}
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={startDate}
                onChange={(e) => handleDateInput(e.target.value, setStartDate)}
                placeholder="YYYY-MM-DD"
                className="border-white/10 bg-black/20 pr-10"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-white"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-white/10 p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startD}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(format(date, "yyyy-MM-dd"));
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-secondary-foreground/70 flex items-center gap-2">
              <CalendarIcon size={14} /> {t("input.end_date")}
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={endDate}
                onChange={(e) => handleDateInput(e.target.value, setEndDate)}
                placeholder="YYYY-MM-DD"
                className="border-white/10 bg-black/20 pr-10"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-white"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-white/10 p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endD}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(format(date, "yyyy-MM-dd"));
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || (startD ? date < startD : false)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Button
          className="bg-asset-gradient w-full transform font-bold text-black transition-all hover:-translate-y-0.5 hover:opacity-90"
          onClick={onCalculate}
          disabled={isLoading}
        >
          {isLoading ? t("input.loading") : t("input.calculate_btn")}
        </Button>

        <Button
          variant="outline"
          className="w-full border-white/10 bg-black/20 hover:bg-black/40 text-sm flex items-center gap-2"
          onClick={handleShare}
        >
          <Share2 size={14} />
          {showCopied ? t("input.share_success") : t("input.share_btn")}
        </Button>
      </CardContent>
    </Card>
  );
}
