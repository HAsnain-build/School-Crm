import { useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || 'Principal');
  const [email, setEmail] = useState(user?.email || 'principal@school.com');
  const [phone, setPhone] = useState(user?.phone || '0300-8451122');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({ name, email, phone });
      addToast('Profile saved');
    } catch (err) {
      addToast(err?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-xl text-slate-900">Principal Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Update your name and contact details</p>
      </div>

      <form onSubmit={handleSubmit} className="erp-panel flex flex-col gap-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <img
            src="/src/assets/images/principal_avatar_1795458597869.jpg"
            alt={name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="font-display font-bold text-lg text-slate-900">{name}</div>
            <div className="text-xs text-slate-500">{user?.role || 'Owner / Principal'} · @{user?.username}</div>
          </div>
        </div>

        <div>
          <label htmlFor="prof-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Name
          </label>
          <input
            id="prof-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div>
          <label htmlFor="prof-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email
          </label>
          <input
            id="prof-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div>
          <label htmlFor="prof-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Phone
          </label>
          <input
            id="prof-phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono-num"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
