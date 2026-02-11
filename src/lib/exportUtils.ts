import type { InvestmentResult } from "../api";

export function exportToCSV(transactions: InvestmentResult["transactions"]) {
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

  // Add Transactions

  csvContent += transactionHeaders.join(",") + "\n";

  transactionData.forEach((row) => {
    csvContent += row.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");

  link.setAttribute("href", encodedUri);

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}
