import { useComparisonCalculator } from "@/hooks/useComparisonCalculator";
import { ComparisonChart } from "./ComparisonChart";
import { ASSET_CONFIG } from "@/constants";
import type { Asset } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { InputForm } from "./InputForm";
import { TrendingUp, TrendingDown } from "lucide-react";

export function ComparisonView() {
  const { t } = useTranslation();
  const comparison = useComparisonCalculator();

  const formatting = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  // Mock a DcaCalculatorHook for InputForm to work
  // We only need setters and current values for common params
  const mockDca: any = {
    ...comparison,
    asset: "BTC", // Dummy value
    setAsset: () => {}, // Disable asset selection in comparison mode?
    loading: comparison.loading,
    error: comparison.error,
    isComparison: true,
  };

  const assets: Asset[] = ["BTC", "Gold", "Silver"];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <InputForm dca={mockDca} />
      </aside>

      <section className="lg:col-span-8 space-y-8">
        {comparison.loading ? (
          <div className="flex h-full min-h-[400px] items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-white/2 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-slate-400">{t("input.loading")}</p>
            </div>
          </div>
        ) : (
          <>
            <ComparisonChart results={comparison.results} />

            <Card className="bg-card/50 border-white/10 shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold">{t("comparison.title")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/5 bg-white/5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-6 py-4">{t("comparison.table.asset")}</th>
                        <th className="px-6 py-4">{t("comparison.table.invested")}</th>
                        <th className="px-6 py-4">{t("comparison.table.value")}</th>
                        <th className="px-6 py-4">{t("comparison.table.roi")}</th>
                        <th className="px-6 py-4">{t("comparison.table.units")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {assets.map((asset) => {
                        const result = comparison.results[asset];
                        if (!result) return null;
                        const isProfit = result.roi >= 0;
                        const config = ASSET_CONFIG[asset];

                        return (
                          <tr key={asset} className="hover:bg-white/2 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-3 w-3 rounded-full" 
                                  style={{ backgroundColor: config.color }}
                                />
                                <span className="font-bold">{t(`assets.${asset}`)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {formatting.format(result.totalInvested)}
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {formatting.format(result.currentValue)}
                            </td>
                            <td className={`px-6 py-4 font-bold ${isProfit ? "text-emerald-500" : "text-red-500"}`}>
                              <div className="flex items-center gap-1">
                                {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {result.roi.toFixed(2)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              {result.totalUnits.toFixed(asset === "BTC" ? 6 : 4)} {config.unit}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </div>
  );
}