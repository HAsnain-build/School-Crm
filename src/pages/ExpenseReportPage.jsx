import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import * as expensesApi from '../api/expenses';
import { CategoryDonutChart } from '../components/Charts';
import { downloadCsv } from '../utils/csv';
import { formatMoney, formatMonthLabel } from '../utils/erpLogic';

const MONTHS = ['2026-12', '2026-11', '2026-10', '2026-09'];

export default function ExpenseReportPage() {
  const [month, setMonth] = useState('2026-11');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    expensesApi
      .getExpenseReport(month)
      .then((res) => setReport(res))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [month]);

  const handleExport = () => {
    if (!report) return;
    downloadCsv(
      `expense-report-${month}.csv`,
      ['Category', 'Amount (Rs.)'],
      report.byCategory.map((c) => [c.name, c.amount])
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/expenses"
            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Expenses List
          </Link>
          <h1 className="font-display font-bold text-xl text-slate-900 mt-1">
            Monthly Expense Report — {formatMonthLabel(month)}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Report month"
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> CSV
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 px-4 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {loading || !report ? (
        <div className="erp-panel text-sm text-slate-500">Preparing report...</div>
      ) : (
        <>
          <div className="erp-panel">
            <h2 className="font-display font-bold text-base text-slate-900 mb-4">
              Expenses by Category
            </h2>
            {report.byCategory.length === 0 ? (
              <p className="text-xs text-slate-500">No expenses recorded for this month.</p>
            ) : (
              <CategoryDonutChart items={report.byCategory} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="erp-card">
              <div className="erp-card-header">
                <span className="font-display font-semibold text-sm">Category Breakdown</span>
                <span className="text-xs tabular-nums font-bold">{formatMoney(report.totalExpense)}</span>
              </div>
              <div className="erp-table-wrap">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byCategory.map((c) => (
                      <tr key={c.name}>
                        <td className="font-medium">{c.name}</td>
                        <td className="text-right tabular-nums font-semibold">{formatMoney(c.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="erp-card">
              <div className="erp-card-header">
                <span className="font-display font-semibold text-sm">Payee Summary</span>
              </div>
              <div className="erp-table-wrap">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Payee</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byPayee.map((p) => (
                      <tr key={p.payee}>
                        <td className="font-medium">{p.payee}</td>
                        <td className="text-right tabular-nums font-semibold">{formatMoney(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Net Savings Summary */}
          <div className="erp-panel bg-slate-50/80">
            <h2 className="font-display font-bold text-base text-slate-900 mb-3">
              Monthly Summary (For Reference)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-xs text-slate-500">Fee Collected</div>
                <div className="font-display font-bold text-base text-emerald-700 tabular-nums mt-0.5">
                  {formatMoney(report.feeCollected)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-xs text-slate-500">Salaries Paid</div>
                <div className="font-display font-bold text-base text-slate-900 tabular-nums mt-0.5">
                  - {formatMoney(report.salaryPaid)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-xs text-slate-500">Total Expenses</div>
                <div className="font-display font-bold text-base text-slate-900 tabular-nums mt-0.5">
                  - {formatMoney(report.totalExpense)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-xs text-slate-500">Net Balance</div>
                <div
                  className={`font-display font-bold text-base tabular-nums mt-0.5 ${
                    report.netSavings >= 0 ? 'text-blue-700' : 'text-red-600'
                  }`}
                >
                  {formatMoney(report.netSavings)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
