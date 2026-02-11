import type { InvestmentResult } from "../api";

export function exportToCSV(result: InvestmentResult, asset: string) {
  const { transactions, totalInvested, currentValue, roi, totalUnits, averagePrice } = result;

  const summaryHeaders = ["Metric", "Value"];
  const summaryData = [
    ["Asset", asset],
    ["Total Invested (USD)", totalInvested.toFixed(2)],
    ["Current Value (USD)", currentValue.toFixed(2)],
    ["Total ROI (%)", roi.toFixed(2) + "%"],
    ["Total Units accumulated", totalUnits.toFixed(8)],
    ["Average Purchase Price", averagePrice.toFixed(2)],
    ["Lump Sum Value (USD)", result.lumpSumValue.toFixed(2)],
    ["Inflation Adjusted Value (USD)", result.inflationAdjustedValue.toFixed(2)],
  ];

  const transactionHeaders = [
    "Date",
    "Invested (USD)",
    "Asset Price",
    "Units Bought",
  ];

  const transactionData = transactions.map((t) => [
    t.date,
    t.amount.toFixed(2),
    t.price.toFixed(2),
    t.units.toFixed(8),
  ]);

  let csvContent = "data:text/csv;charset=utf-8,";

  // Add Summary
  csvContent += "INVESTMENT SUMMARY\n";
  summaryHeaders.forEach((h) => (csvContent += h + ","));
  csvContent += "\n";
  summaryData.forEach((row) => {
    csvContent += row.join(",") + "\n";
  });
  csvContent += "\n";

  // Add Transactions
  csvContent += "TRANSACTION HISTORY\n";
  csvContent += transactionHeaders.join(",") + "\n";

  transactionData.forEach((row) => {
    csvContent += row.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${asset}_dca_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
