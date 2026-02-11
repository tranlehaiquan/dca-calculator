import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import type { InvestmentResult } from "../api";
import type { Asset } from "../constants";
import { ASSET_CONFIG } from "../constants";
import { Button } from "./ui/button";
import { exportToCSV } from "@/lib/exportUtils";
import { Download } from "lucide-react";

interface TransactionHistoryProps {
  result: InvestmentResult;
  asset: Asset;
}

export const TransactionHistory = memo(function TransactionHistory({
  result,
  asset,
}: TransactionHistoryProps) {
  const { transactions, currentPrice } = result;
  const { t } = useTranslation();
  const config = ASSET_CONFIG[asset];

  const formatting = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => exportToCSV(result, asset)}
        >
          <Download size={16} />
          {t("report.export_csv")}
        </Button>
      </div>
      <Card className="bg-card/50 border-white/10">
        <CardHeader>
          <CardTitle>{t("transactions.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-muted-foreground pb-3 font-medium">
                    {t("transactions.date")}
                  </th>
                  <th className="text-muted-foreground pb-3 font-medium">
                    {t("transactions.amount")}
                  </th>
                  <th className="text-muted-foreground pb-3 font-medium">
                    {t("transactions.price")}
                  </th>
                  <th className="text-muted-foreground pb-3 font-medium">
                    {t("transactions.units")}
                  </th>
                  <th className="text-muted-foreground pb-3 font-medium">
                    {t("transactions.current_value")}
                  </th>
                  <th className="text-muted-foreground pb-3 text-right font-medium">
                    {t("transactions.roi")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions
                  .slice()
                  .reverse()
                  .map((tx, idx) => {
                    const txValue = tx.units * currentPrice;
                    const txRoi = ((currentPrice - tx.price) / tx.price) * 100;
                    const isProfit = txRoi >= 0;

                    return (
                      <tr
                        key={idx}
                        className="transition-colors hover:bg-white/5"
                      >
                        <td className="py-3 font-mono">{tx.date}</td>
                        <td className="py-3">{formatting.format(tx.amount)}</td>
                        <td className="py-3">{formatting.format(tx.price)}</td>
                        <td className="py-3 font-mono text-xs">
                          {tx.units.toFixed(asset === "BTC" ? 8 : 4)}{" "}
                          {config.unit}
                        </td>
                        <td className="py-3 font-medium">
                          {formatting.format(txValue)}
                        </td>
                        <td
                          className={`py-3 text-right font-bold ${isProfit ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {isProfit ? "+" : ""}
                          {txRoi.toFixed(2)}%
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
  );
});
