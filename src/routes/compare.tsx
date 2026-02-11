import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { SEO } from '../components/SEO';

const ComparisonView = lazy(() => import("../components/ComparisonView").then(m => ({ default: m.ComparisonView })));

export const Route = createFileRoute('/compare')({
  component: CompareComponent,
});

function CompareComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <SEO 
        title={`${t("comparison.title")} - Compare BTC, Gold, and Silver Returns`}
        description="Compare the historical Dollar Cost Averaging (DCA) performance between Bitcoin, Gold, and Silver to see which investment strategy performed best."
      />
      <header className="mb-16 space-y-4 text-center">
        <h1 className="text-5xl font-black tracking-tight md:text-6xl">
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t("comparison.title")}
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
        <Suspense fallback={<div className="h-[600px] w-full animate-pulse rounded-3xl bg-white/5" />}>
          <ComparisonView />
        </Suspense>
      </main>
    </div>
  );
}
