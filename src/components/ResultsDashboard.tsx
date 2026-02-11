import { memo } from "react";
import { ASSET_CONFIG } from "../constants";
import type { Asset } from "../constants";
import type { InvestmentResult } from "../api";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Coins,
  BarChart3,
  Calculator,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface ResultsDashboardProps {
  result: InvestmentResult;
  asset: Asset;
}

export const ResultsDashboard = memo(function ResultsDashboard({
  result,
  asset,
}: ResultsDashboardProps) {
  const { t } = useTranslation();

  const isProfit = result.roi >= 0;
  const formatting = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const config = ASSET_CONFIG[asset];

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="bg-card/50 border-white/10 transition-transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <Wallet size={16} className="text-[var(--asset-primary)]" />
              {t("results.total_invested")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatting.format(result.totalInvested)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--asset-primary)]/20 bg-gradient-to-br from-[var(--asset-primary)]/10 to-transparent transition-transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <Coins size={16} className="text-[var(--asset-primary)]" />
              {t("results.value_in", { asset: t(`assets.${asset}`) })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result.totalUnits.toFixed(asset === "BTC" ? 8 : 4)} {config.unit}
            </div>
            <p className="text-muted-foreground mt-1 text-xs font-medium">
              {t("results.current_value")}:{" "}
              {formatting.format(result.currentValue)}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`border-white/10 transition-transform hover:-translate-y-1 ${isProfit ? "bg-emerald-500/5" : "bg-red-500/5"}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              {isProfit ? (
                <TrendingUp size={16} className="text-emerald-500" />
              ) : (
                <TrendingDown size={16} className="text-red-500" />
              )}
              {t("results.total_change")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${isProfit ? "text-emerald-500" : "text-red-500"}`}
            >
              {isProfit ? "+" : ""}
              {result.roi.toFixed(2)}%
            </div>
            <p
              className={`mt-1 text-xs font-medium ${isProfit ? "text-emerald-500/70" : "text-red-500/70"}`}
            >
              {isProfit ? "+" : ""}
              {formatting.format(result.currentValue - result.totalInvested)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics / Detailed Report Integration */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/5 bg-white/2 p-4 backdrop-blur-sm">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium">
            <Calculator size={14} className="text-blue-400" />
            {t("report.purchase_count")}
          </div>
          <div className="text-lg font-bold">{result.purchaseCount}</div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/2 p-4 backdrop-blur-sm">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium">
            <BarChart3 size={14} className="text-purple-400" />
            {t("report.average_price")}
          </div>
          <div className="text-lg font-bold">
            {formatting.format(result.averagePrice)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/2 p-4 backdrop-blur-sm">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium">
            <ArrowDownCircle size={14} className="text-emerald-400" />
            {t("report.best_price")}
          </div>
          <div className="text-lg font-bold">
            {formatting.format(result.bestPrice)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/2 p-4 backdrop-blur-sm">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium">
            <ArrowUpCircle size={14} className="text-red-400" />
            {t("report.worst_price")}
          </div>
          <div className="text-lg font-bold">
            {formatting.format(result.worstPrice)}
          </div>
        </div>
      </div>
    </div>
  );
});
