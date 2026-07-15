"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DailyMetricPoint,
} from "@/types/admin";

interface DashboardAnalyticsChartProps {
  jobs: DailyMetricPoint[];
  users: DailyMetricPoint[];
}

interface ChartPoint {
  date: string;
  label: string;
  jobs: number;
  users: number;
}

function formatDateLabel(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function combineSeries(
  jobs: DailyMetricPoint[],
  users: DailyMetricPoint[],
): ChartPoint[] {
  const points = new Map<
    string,
    ChartPoint
  >();

  for (const item of jobs) {
    points.set(item.date, {
      date: item.date,
      label: formatDateLabel(item.date),
      jobs: item.value,
      users: 0,
    });
  }

  for (const item of users) {
    const currentPoint = points.get(item.date);

    if (currentPoint) {
      currentPoint.users = item.value;
    } else {
      points.set(item.date, {
        date: item.date,
        label: formatDateLabel(item.date),
        jobs: 0,
        users: item.value,
      });
    }
  }

  return Array.from(points.values()).sort(
    (first, second) =>
      new Date(first.date).getTime() -
      new Date(second.date).getTime(),
  );
}

export function DashboardAnalyticsChart({
  jobs,
  users,
}: DashboardAnalyticsChartProps) {
  const data = combineSeries(jobs, users);

  if (data.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/8 bg-black/20">
        <p className="text-sm text-zinc-600">
          Todavía no existen datos diarios para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 12,
            bottom: 0,
            left: -18,
          }}
        >
          <defs>
            <linearGradient
              id="jobsGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#dc2626"
                stopOpacity={0.35}
              />

              <stop
                offset="100%"
                stopColor="#dc2626"
                stopOpacity={0}
              />
            </linearGradient>

            <linearGradient
              id="usersGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#a1a1aa"
                stopOpacity={0.18}
              />

              <stop
                offset="100%"
                stopColor="#a1a1aa"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#52525b",
              fontSize: 11,
            }}
            minTickGap={24}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#52525b",
              fontSize: 11,
            }}
            allowDecimals={false}
          />

          <Tooltip
            cursor={{
              stroke:
                "rgba(220,38,38,0.28)",
              strokeWidth: 1,
            }}
            contentStyle={{
              background: "#111113",
              border:
                "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              color: "#ffffff",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.45)",
            }}
            labelStyle={{
              color: "#a1a1aa",
              marginBottom: "8px",
            }}
            formatter={(
              value,
              name,
            ) => [
              Number(value).toLocaleString(
                "es-MX",
              ),
              name === "jobs"
                ? "Trabajos Try-On"
                : "Usuarios",
            ]}
          />

          <Area
            type="monotone"
            dataKey="jobs"
            stroke="#dc2626"
            strokeWidth={2.4}
            fill="url(#jobsGradient)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#dc2626",
              stroke: "#450a0a",
              strokeWidth: 3,
            }}
          />

          <Area
            type="monotone"
            dataKey="users"
            stroke="#a1a1aa"
            strokeWidth={1.7}
            fill="url(#usersGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#d4d4d8",
              stroke: "#27272a",
              strokeWidth: 3,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}