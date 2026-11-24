import { useState } from 'react';
import { formatMoney } from '../utils/erpLogic';

export function StudentsBarChart({ data = [], onBarClick }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const maxVal = Math.max(20, ...data.map((d) => d.total || 0));
  const yMax = Math.ceil(maxVal / 5) * 5;

  const shortLabel = (name) => {
    if (!name) return '';
    if (name.toLowerCase().startsWith('montessori')) return 'Mnt';
    return name.replace(/^Class\s+/i, 'C');
  };

  return (
    <div className="w-full select-none">
      <div className="flex items-end gap-1 sm:gap-2 h-52 pt-6 pb-2 px-0.5">
        {data.map((item, idx) => {
          const pct = yMax > 0 ? Math.max(6, Math.round((item.total / yMax) * 100)) : 6;
          const isHovered = hoveredIdx === idx;
          return (
            <button
              key={item.id}
              type="button"
              title={`${item.name}: ${item.total} students`}
              onClick={() => onBarClick && onBarClick(item)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 min-w-0 h-full flex flex-col items-center justify-end group cursor-pointer focus:outline-none"
              aria-label={`${item.name}: ${item.total} students`}
            >
              <span
                className={`text-[10px] sm:text-[11px] font-semibold tabular-nums mb-1 transition-colors ${
                  isHovered ? 'text-blue-700' : 'text-slate-600'
                }`}
              >
                {item.total}
              </span>
              <div className="w-full max-w-[34px] flex-1 flex items-end">
                <div
                  style={{ height: `${pct}%` }}
                  className={`w-full rounded-t-md transition-all duration-200 ${
                    isHovered
                      ? 'bg-gradient-to-t from-blue-700 to-blue-400 shadow-md'
                      : 'bg-gradient-to-t from-[#0052bd] to-[#1a75ff]'
                  }`}
                />
              </div>
              <span className="mt-2 text-[9px] sm:text-[11px] font-medium text-slate-600 w-full text-center leading-tight">
                {shortLabel(item.name)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FeeDonutChart({ collected = 0, pending = 0 }) {
  const total = collected + pending;
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const collectedDash = total > 0 ? (collected / total) * circumference : 0;
  const pendingDash = Math.max(0, circumference - collectedDash);

  return (
    <div className="flex flex-wrap xl:flex-nowrap items-center justify-center gap-4 py-2 w-full">
      <div className="relative w-36 h-36 shrink-0">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="20"
          />
          {pending > 0 && (
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="20"
              strokeDasharray={`${pendingDash} ${circumference}`}
              strokeDashoffset={-collectedDash}
            />
          )}
          {collected > 0 && (
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth="20"
              strokeDasharray={`${collectedDash} ${circumference}`}
              strokeDashoffset={0}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display font-bold text-2xl text-slate-900 tabular-nums">
            {pct}%
          </span>
          <span className="text-xs font-medium text-slate-500">Collected</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 min-w-[120px]">
        <div className="flex items-start gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
          <div>
            <div className="text-xs text-slate-500 font-medium">Collected</div>
            <div className="font-display font-bold text-sm text-slate-900 tabular-nums whitespace-nowrap">
              {formatMoney(collected)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" />
          <div>
            <div className="text-xs text-slate-500 font-medium">Pending</div>
            <div className="font-display font-bold text-sm text-slate-900 tabular-nums whitespace-nowrap">
              {formatMoney(pending)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CHART_COLORS = [
  '#0066eb',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#ef4444',
  '#64748b',
];

export function CategoryDonutChart({ items = [] }) {
  const total = items.reduce((s, i) => s + (i.amount || 0), 0);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative w-40 h-40 shrink-0">
        <svg viewBox="0 0 150 150" className="w-full h-full -rotate-90">
          <circle cx="75" cy="75" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="22" />
          {total > 0 &&
            items.map((item, idx) => {
              const segLen = (item.amount / total) * circumference;
              const currentOffset = offset;
              offset += segLen;
              return (
                <circle
                  key={item.name}
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="none"
                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                  strokeWidth="22"
                  strokeDasharray={`${segLen} ${circumference}`}
                  strokeDashoffset={-currentOffset}
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <span className="text-[11px] font-medium text-slate-500">Total</span>
          <span className="font-display font-bold text-sm text-slate-900 tabular-nums">
            {formatMoney(total)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 w-full">
        {items.map((item, idx) => {
          const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                <span className="text-slate-700 font-medium truncate">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                {formatMoney(item.amount)} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
