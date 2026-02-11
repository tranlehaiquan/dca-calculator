import { createFileRoute } from '@tanstack/react-router';
import { useState, lazy, Suspense } from "react";
import { useDcaCalculator } from "../hooks/useDcaCalculator";
import { InputForm } from "../components/InputForm";
import { ResultsDashboard } from "../components/ResultsDashboard";
import { TransactionHistory } from "../components/TransactionHistory";
import { SEO } from "../components/SEO";
import { Bitcoin, Coins, Gem, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";

const Chart = lazy(() => import("../components/Chart").then(m => ({ default: m.Chart })));

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  const { t } = useTranslation();
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

  return (
    <div className={`asset-${dca.asset.toLowerCase()}`}>
      <SEO asset={dca.asset} />
      <header className="mb-16 space-y-4 text-center">
        <div className="mb-6 flex justify-center transition-transform duration-300 hover:scale-110">
          {renderLogo()}
        </div>
        <h1 className="text-5xl font-black tracking-tight md:text-6xl">
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t(`assets.${dca.asset}`)}
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
                <Suspense fallback={<div className="h-[400px] w-full animate-pulse rounded-3xl bg-white/5" />}>
                  <Chart data={dca.result.history} asset={dca.asset} />
                </Suspense>
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
      </main>
    </div>
  );
}
