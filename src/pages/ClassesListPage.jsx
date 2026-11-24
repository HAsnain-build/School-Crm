import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import * as classesApi from '../api/classes';
import { formatMoney } from '../utils/erpLogic';

export default function ClassesListPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classesApi
      .getClasses()
      .then((res) => setClasses(res))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-xl text-slate-900">Classes (Montessori – Class 10)</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Click any class card to view its students and monthly fee
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="erp-panel h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map((cls) => (
            <button
              key={cls.id}
              type="button"
              onClick={() => navigate(`/classes/${cls.id}`)}
              className="erp-panel text-left hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900">{cls.name}</h2>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Monthly Fee: <strong className="text-slate-800">{formatMoney(cls.monthlyFee)}</strong>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="font-bold text-slate-900">{cls.totalStudents} Total</span>
                  <span className="text-emerald-600 font-medium">{cls.activeStudents} Active</span>
                  <span className="text-red-600 font-medium">{cls.inactiveStudents} Inactive</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
