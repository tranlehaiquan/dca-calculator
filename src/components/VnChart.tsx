import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useState } from "react";
import { format } from "date-fns";
import type { InvestmentResult } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface VnChartProps {
  data: InvestmentResult["history"];
  symbol: string;
}

export function VnChart({ data, symbol }: VnChartProps) {
  const { t } = useTranslation();
  const [showPrice, setShowPrice] = useState(false);

  if (!data || data.length === 0) return null;

  const mainColor = "#3b82f6"; // Blue 500

  return (
    <Card className="bg-card/50 overflow-hidden border-white/10 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">{t("chart.title")}</CardTitle>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showPrice"
            checked={showPrice}
            onCheckedChange={(checked) => setShowPrice(!!checked)}
          />
          <Label
            htmlFor="showPrice"
            className="text-muted-foreground cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("chart.show_price", { asset: symbol })}
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={mainColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickMargin={10}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`;
                }}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `₫${(value / 1000000).toFixed(1)}M`}
              />
              {showPrice && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={12}
                  domain={["auto", "auto"]}
                  tickFormatter={(value) => `₫${value.toLocaleString()}`}
                />
              )}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                }}
                formatter={(value: any, name?: string) => {
                  let displayName = name || "";
                  if (name === "Total Invested")
                    displayName = t("chart.tooltip.total_invested");
                  if (name === "Portfolio Value")
                    displayName = t("chart.tooltip.portfolio_value");
                  
                  return [
                    `₫${value?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                    displayName,
                  ];
                }}
                labelFormatter={(label) =>
                  format(new Date(label), "MMM d, yyyy")
                }
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="invested"
                stroke="#94a3b8"
                fillOpacity={1}
                fill="url(#colorInvested)"
                name={t("chart.tooltip.total_invested")}
                strokeWidth={2}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="value"
                stroke={mainColor}
                fillOpacity={1}
                fill="url(#colorValue)"
                name={t("chart.tooltip.portfolio_value")}
                strokeWidth={2}
              />
              {showPrice && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  name={t("chart.tooltip.price", {
                    asset: symbol,
                  })}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
