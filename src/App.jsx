import { Component, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { ALLOWED_ERP_ROLES, isSafeInternalRedirect } from './utils/erpLogic';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsListPage from './pages/StudentsListPage';
import StudentFormPage from './pages/StudentFormPage';
import StudentProfilePage from './pages/StudentProfilePage';
import ClassesListPage from './pages/ClassesListPage';
import ClassDetailPage from './pages/ClassDetailPage';
import FeesOverviewPage from './pages/FeesOverviewPage';
import VouchersListPage from './pages/VouchersListPage';
import VoucherDetailPage from './pages/VoucherDetailPage';
import FeeCollectPage from './pages/FeeCollectPage';
import ReceiptsListPage from './pages/ReceiptsListPage';
import DefaultersPage from './pages/DefaultersPage';
import { TeachersListPage, TeacherFormPage } from './pages/TeachersPage';
import SalaryPage from './pages/SalaryPage';
import SalarySlipPage from './pages/SalarySlipPage';
import ExpensesPage from './pages/ExpensesPage';
import ExpenseReportPage from './pages/ExpenseReportPage';
import StockPage from './pages/StockPage';
import WhatsappPage from './pages/WhatsappPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

const ADMIN_ROLES = [...ALLOWED_ERP_ROLES];

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
            <h1 className="font-display font-bold text-lg text-slate-900">
              Something Went Wrong
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              There was a problem loading this page. Please try again.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.assign('/');
              }}
              className="mt-4 h-10 px-5 rounded-xl bg-[#0066eb] text-white text-sm font-semibold cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children, allowedRoles = ADMIN_ROLES }) {
  const { user, verifySession } = useAuth();
  const location = useLocation();

  useEffect(() => {
    verifySession();
  }, [location.pathname, verifySession]);

  const activeUser = user || verifySession();
  if (!activeUser) {
    const safeFrom = isSafeInternalRedirect(`${location.pathname}${location.search}`);
    return <Navigate to="/login" state={{ from: safeFrom }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(activeUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, verifySession } = useAuth();
  const location = useLocation();
  const activeUser = user || verifySession();

  if (activeUser) {
    const target = isSafeInternalRedirect(location.state?.from);
    return <Navigate to={target} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <SettingsProvider>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

                  <Route path="students" element={<ProtectedRoute><StudentsListPage /></ProtectedRoute>} />
                  <Route path="students/new" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><StudentFormPage /></ProtectedRoute>} />
                  <Route path="students/:id" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
                  <Route path="students/:id/edit" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><StudentFormPage /></ProtectedRoute>} />

                  <Route path="classes" element={<ProtectedRoute><ClassesListPage /></ProtectedRoute>} />
                  <Route path="classes/:id" element={<ProtectedRoute><ClassDetailPage /></ProtectedRoute>} />

                  <Route path="fees" element={<ProtectedRoute><FeesOverviewPage /></ProtectedRoute>} />
                  <Route path="fees/vouchers" element={<ProtectedRoute><VouchersListPage /></ProtectedRoute>} />
                  <Route path="fees/vouchers/:id" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><VoucherDetailPage /></ProtectedRoute>} />
                  <Route path="fees/collect/:voucherId" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><FeeCollectPage /></ProtectedRoute>} />
                  <Route path="fees/receipts" element={<ProtectedRoute><ReceiptsListPage /></ProtectedRoute>} />
                  <Route path="fees/defaulters" element={<ProtectedRoute><DefaultersPage /></ProtectedRoute>} />

                  <Route path="teachers" element={<ProtectedRoute><TeachersListPage /></ProtectedRoute>} />
                  <Route path="teachers/new" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><TeacherFormPage /></ProtectedRoute>} />
                  <Route path="teachers/:id/edit" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><TeacherFormPage /></ProtectedRoute>} />

                  <Route path="salary" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><SalaryPage /></ProtectedRoute>} />
                  <Route path="salary/slip/:id" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><SalarySlipPage /></ProtectedRoute>} />

                  <Route path="expenses" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><ExpensesPage /></ProtectedRoute>} />
                  <Route path="expenses/report" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><ExpenseReportPage /></ProtectedRoute>} />

                  <Route path="stock" element={<ProtectedRoute><StockPage /></ProtectedRoute>} />
                  <Route path="whatsapp" element={<ProtectedRoute><WhatsappPage /></ProtectedRoute>} />
                  <Route path="settings" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><SettingsPage /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                  <Route path="*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </SettingsProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
