import type { InvestmentResult } from "../api";
import type { Asset } from "../constants";

export function exportToCSV(result: InvestmentResult, asset: Asset) {
  const summaryHeaders = ["Total Invested", "Current Value", "Total Units", "ROI (%)", "Average Price", "Purchase Count"];
  const summaryData = [
    result.totalInvested.toFixed(2),
    result.currentValue.toFixed(2),
    result.totalUnits.toFixed(8),
    result.roi.toFixed(2),
    result.averagePrice.toFixed(2),
    result.purchaseCount
  ];

  const transactionHeaders = ["Date", "Invested (USD)", "Asset Price", "Units Bought"];
  const transactionData = result.transactions.map(t => [
    t.date,
    t.amount.toFixed(2),
    t.price.toFixed(2),
    t.units.toFixed(8)
  ]);

  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add Summary
  csvContent += "INVESTMENT SUMMARY\n";
  csvContent += summaryHeaders.join(",") + "\n";
  csvContent += summaryData.join(",") + "\n\n";

  // Add Transactions
  csvContent += "TRANSACTION HISTORY\n";
  csvContent += transactionHeaders.join(",") + "\n";
  transactionData.forEach(row => {
    csvContent += row.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${asset}_DCA_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}