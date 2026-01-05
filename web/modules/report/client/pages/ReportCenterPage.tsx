"use client";

import { IBaseTabs, IBaseTab } from "@base/client/components";
import { IBaseCard } from "@base/client";
import ReactECharts from "echarts-for-react";
import { useTranslations } from "next-intl";

const overviewOption: echarts.EChartsOption = {
  tooltip: { trigger: "axis" },
  grid: { left: 32, right: 24, top: 32, bottom: 32 },
  xAxis: {
    type: "category",
    data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    boundaryGap: false,
  },
  yAxis: {
    type: "value",
    splitLine: { lineStyle: { type: "dashed" } },
  },
  series: [
    {
      name: "Sales",
      type: "line",
      smooth: true,
      showSymbol: false,
      areaStyle: {
        opacity: 0.18,
      },
      data: [120, 200, 150, 80, 70, 110],
    },
  ],
};

export default function ReportCenterPage() {
  const t = useTranslations("report.center");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500">
            {t("description")}
          </p>
        </div>
      </div>

      <IBaseTabs aria-label={t("ariaLabel")} color="primary">
        <IBaseTab key="overview" title={t("tabs.overview.title")}>
          <IBaseCard className="p-4">
            <div className="mb-3 text-sm font-medium text-slate-700">
              {t("tabs.overview.salesOverTime")}
            </div>
            <ReactECharts
              lazyUpdate
              notMerge
              option={overviewOption}
              style={{ width: "100%", height: 360 }}
            />
          </IBaseCard>
        </IBaseTab>

        <IBaseTab key="inventory" title={t("tabs.inventory.title")}>
          <IBaseCard className="p-4">
            <div className="text-sm text-slate-500">
              {t("tabs.inventory.placeholder")}
            </div>
          </IBaseCard>
        </IBaseTab>
      </IBaseTabs>
    </div>
  );
}
