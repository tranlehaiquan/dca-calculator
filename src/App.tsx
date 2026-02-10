import { useState } from "react";
import { useDcaCalculator } from "./hooks/useDcaCalculator";
import { ASSET_CONFIG } from "./constants";
import { InputForm } from "./components/InputForm";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { Chart } from "./components/Chart";
import { TransactionHistory } from "./components/TransactionHistory";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { SEO } from "./components/SEO";
import { Bitcoin, Coins, Gem, PanelLeftClose, PanelLeftOpen, BarChart2, Calculator } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./components/ui/button";
import { ComparisonView } from "./components/ComparisonView";

type View = "calculator" | "comparison";

function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>("calculator");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const dca = useDcaCalculator();

  const renderLogo = () => {
    switch (dca.asset) {
      case "BTC":
        return <Bitcoin size={64} className="text-[var(--btc-color)]" />;
      case "Gold":
        return <Gem size={64} className="text-[var(--gold-color)]" />;
      case "Silver":
        return <Coins size={64} className="text-[var(--silver-color)]" />;
    }
  };

  const assetLabel = ASSET_CONFIG[dca.asset].label;

  const renderCalculator = () => (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {isSidebarVisible && (
        <aside className="lg:col-span-4">
          <InputForm dca={dca} />
        </aside>
      )}

      <section className={`space-y-8 ${isSidebarVisible ? "lg:col-span-8" : "lg:col-span-12"}`}>
        {dca.result ? (
          <>
            <ResultsDashboard result={dca.result} asset={dca.asset} />
            <Chart data={dca.result.history} asset={dca.asset} />
            <TransactionHistory 
              transactions={dca.result.transactions} 
              currentPrice={dca.result.currentPrice} 
              asset={dca.asset} 
            />
          </>
        ) : (
          <div className="flex h-full min-h-[400px] items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-white/2 backdrop-blur-sm">
            <div className="space-y-4 p-8 text-center">
              <div className="mb-4 inline-block rounded-full bg-white/5 p-4">
                <Coins size={32} className="text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-300">
                {t("ready_state.title")}
              </h3>
              <p className="mx-auto max-w-xs text-slate-500">
                {t("ready_state.description")}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-[#0f111a] text-white selection:bg-[var(--asset-primary)] selection:text-black asset-${dca.asset.toLowerCase()}`}
    >
      <SEO asset={dca.asset} />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 p-1">
            <Button
              variant={view === "calculator" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("calculator")}
              className="flex items-center gap-2"
            >
              <Calculator size={16} />
              {t("comparison.nav_calculator")}
            </Button>
            <Button
              variant={view === "comparison" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("comparison")}
              className="flex items-center gap-2"
            >
              <BarChart2 size={16} />
              {t("comparison.nav_comparison")}
            </Button>
          </div>
          <LanguageSwitcher />
        </div>

        <header className="mb-16 space-y-4 text-center">
          <div className="mb-6 flex justify-center transition-transform duration-300 hover:scale-110">
            {renderLogo()}
          </div>
          <h1 className="text-5xl font-black tracking-tight md:text-6xl">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {view === "calculator" ? t(`assets.${dca.asset}`) : t("comparison.title")}
            </span>{" "}
            <span className="bg-asset-gradient bg-clip-text text-transparent">
              DCA
            </span>{" "}
            Calculator
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-medium text-slate-400">
            {t("app.subtitle")}
          </p>
        </header>

        <main>
          {dca.error && (
            <div className="mb-8 rounded-xl border border-red-500 bg-red-500/10 px-6 py-4 text-center font-semibold text-red-500 backdrop-blur-md">
              {dca.error}
            </div>
          )}

          {view === "calculator" && (
            <div className="mb-6 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-white"
              >
                {isSidebarVisible ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                {isSidebarVisible ? t("input.hide_form") : t("input.show_form")}
              </Button>
            </div>
          )}

          {view === "calculator" ? renderCalculator() : <ComparisonView />}
        </main>

        <footer className="mt-20 border-t border-white/5 pt-8 text-center text-sm text-slate-500">
          <p>
            {t("app.footer", {
              year: new Date().getFullYear(),
              asset: assetLabel,
            })}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;