"use client";

interface Point {
  date: string;
  value: number;
}

interface Series {
  label: string;
  points: Point[];
}

interface Props {
  title: string;
  description: string;
  series: Series[];
  valueFormatter?: (value: number) => string;
}

const WIDTH = 900;
const HEIGHT = 280;
const LEFT = 54;
const RIGHT = 18;
const TOP = 20;
const BOTTOM = 38;

function buildPath(
  points: Point[],
  maximum: number,
): string {
  const chartWidth =
    WIDTH - LEFT - RIGHT;
  const chartHeight =
    HEIGHT - TOP - BOTTOM;

  if (points.length === 0) {
    return "";
  }

  return points
    .map((point, index) => {
      const x =
        LEFT +
        (points.length === 1
          ? chartWidth / 2
          : (index /
              (points.length - 1)) *
            chartWidth);

      const y =
        TOP +
        chartHeight -
        (point.value / maximum) *
          chartHeight;

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function formatDate(value: string): string {
  const date = new Date(
    `${value}T00:00:00`,
  );

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(
        "es-MX",
        {
          day: "2-digit",
          month: "short",
        },
      ).format(date);
}

export function AnalyticsLineChart({
  title,
  description,
  series,
  valueFormatter = (value) =>
    value.toLocaleString("es-MX"),
}: Props) {
  const allValues = series.flatMap(
    (item) =>
      item.points.map(
        (point) => point.value,
      ),
  );

  const maximum = Math.max(
    1,
    ...allValues,
  );

  const referencePoints =
    series[0]?.points ?? [];

  const tickIndexes = Array.from(
    new Set([
      0,
      Math.floor(
        (referencePoints.length - 1) / 2,
      ),
      Math.max(
        0,
        referencePoints.length - 1,
      ),
    ]),
  ).filter(
    (index) =>
      referencePoints[index] !==
      undefined,
  );

  return (
    <article className="luxia-panel rounded-3xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold text-white">
            {title}
          </h2>
          <p className="mt-2 text-xs leading-5 text-zinc-600">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {series.map(
            (item, index) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-[10px] text-zinc-500"
              >
                <span
                  className={
                    index === 0
                      ? "size-2 rounded-full bg-red-500"
                      : "size-2 rounded-full bg-zinc-400"
                  }
                />
                {item.label}
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={title}
          className="min-w-[700px]"
        >
          {[0, 0.25, 0.5, 0.75, 1].map(
            (ratio) => {
              const y =
                TOP +
                (HEIGHT -
                  TOP -
                  BOTTOM) *
                  ratio;
              const value =
                maximum *
                (1 - ratio);

              return (
                <g key={ratio}>
                  <line
                    x1={LEFT}
                    y1={y}
                    x2={WIDTH - RIGHT}
                    y2={y}
                    stroke="currentColor"
                    className="text-white/[0.06]"
                  />
                  <text
                    x={LEFT - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-zinc-700 text-[10px]"
                  >
                    {valueFormatter(
                      Math.round(value),
                    )}
                  </text>
                </g>
              );
            },
          )}

          {series.map(
            (item, index) => (
              <path
                key={item.label}
                d={buildPath(
                  item.points,
                  maximum,
                )}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  index === 0
                    ? "text-red-500"
                    : "text-zinc-400"
                }
              />
            ),
          )}

          {tickIndexes.map((index) => {
            const point =
              referencePoints[index];

            const chartWidth =
              WIDTH - LEFT - RIGHT;

            const x =
              LEFT +
              (referencePoints.length ===
              1
                ? chartWidth / 2
                : (index /
                    (referencePoints.length -
                      1)) *
                  chartWidth);

            return (
              <text
                key={index}
                x={x}
                y={HEIGHT - 10}
                textAnchor="middle"
                className="fill-zinc-700 text-[10px]"
              >
                {formatDate(point.date)}
              </text>
            );
          })}
        </svg>
      </div>
    </article>
  );
}
