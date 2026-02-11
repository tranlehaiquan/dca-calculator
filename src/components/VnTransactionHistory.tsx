import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import type { InvestmentResult } from "../api";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

interface VnTransactionHistoryProps {
  result: InvestmentResult;
  symbol: string;
}

export const VnTransactionHistory = memo(function VnTransactionHistory({
  result,
  symbol,
}: VnTransactionHistoryProps) {
  const { transactions, currentPrice } = result;
  const { t } = useTranslation();

  const formatting = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => {
            // Simple CSV export for VN stocks
            const headers = [
              "Date",
              "Amount",
              "Price",
              "Units",
              "Value",
              "ROI",
            ];
            const rows = transactions.map((tx) => [
              tx.date,
              tx.amount,
              tx.price,
              tx.units,
              tx.units * currentPrice,
              ((currentPrice - tx.price) / tx.price) * 100,
            ]);

            const csvContent = [
              headers.join(","),
              ...rows.map((r) => r.join(",")),
            ].join("");

            const blob = new Blob([csvContent], {
              type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute(
              "download",
              `dca_report_${symbol}_${new Date().toISOString().split("T")[0]}.csv`,
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
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
                          {tx.units.toFixed(2)}
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
