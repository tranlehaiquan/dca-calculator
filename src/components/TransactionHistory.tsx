import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import type { InvestmentResult } from "../api";
import type { Asset } from "../constants";
import { ASSET_CONFIG } from "../constants";

interface TransactionHistoryProps {
  transactions: InvestmentResult["transactions"];
  currentPrice: number;
  asset: Asset;
}

export function TransactionHistory({ transactions, currentPrice, asset }: TransactionHistoryProps) {
  const { t } = useTranslation();
  const config = ASSET_CONFIG[asset];
  
  const formatting = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader>
        <CardTitle>{t("transactions.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 font-medium text-muted-foreground">{t("transactions.date")}</th>
                <th className="pb-3 font-medium text-muted-foreground">{t("transactions.amount")}</th>
                <th className="pb-3 font-medium text-muted-foreground">{t("transactions.price")}</th>
                <th className="pb-3 font-medium text-muted-foreground">{t("transactions.units")}</th>
                <th className="pb-3 font-medium text-muted-foreground">{t("transactions.current_value")}</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">{t("transactions.roi")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.slice().reverse().map((tx, idx) => {
                const txValue = tx.units * currentPrice;
                const txRoi = ((currentPrice - tx.price) / tx.price) * 100;
                const isProfit = txRoi >= 0;

                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono">{tx.date}</td>
                    <td className="py-3">{formatting.format(tx.amount)}</td>
                    <td className="py-3">{formatting.format(tx.price)}</td>
                    <td className="py-3 font-mono text-xs">
                      {tx.units.toFixed(asset === "BTC" ? 8 : 4)} {config.unit}
                    </td>
                    <td className="py-3 font-medium">{formatting.format(txValue)}</td>
                    <td className={`py-3 text-right font-bold ${isProfit ? "text-emerald-500" : "text-red-500"}`}>
                      {isProfit ? "+" : ""}{txRoi.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}