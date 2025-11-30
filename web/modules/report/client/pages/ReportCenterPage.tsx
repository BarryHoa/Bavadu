"use client";

import { IBaseTabs, Tab } from "@base/client/components";
import { Card } from "@heroui/card";
import ReactECharts from "echarts-for-react";

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
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Report Center
          </h1>
          <p className="text-sm text-slate-500">
            Tổng quan báo cáo chính theo Sales, Purchasing, Inventory, Product.
          </p>
        </div>
      </div>

      <IBaseTabs aria-label="Report groups" color="primary">
        <Tab key="overview" title="Overview">
          <Card className="p-4">
            <div className="mb-3 text-sm font-medium text-slate-700">
              Sales over time (sample)
            </div>
            <ReactECharts
              option={overviewOption}
              style={{ width: "100%", height: 360 }}
              notMerge
              lazyUpdate
            />
          </Card>
        </Tab>

        <Tab key="inventory" title="Inventory">
          <Card className="p-4">
            <div className="text-sm text-slate-500">
              Bạn có thể thêm biểu đồ tồn kho, vòng quay kho, v.v. ở đây.
            </div>
          </Card>
        </Tab>
      </IBaseTabs>
    </div>
  );
}
