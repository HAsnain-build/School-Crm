import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as settingsApi from '../api/settings';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setClasses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await settingsApi.getSettings();
      setSettings(res.settings);
      setClasses(res.classes);
    } catch {
      setSettings(null);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const saveSettings = async (payload) => {
    const res = await settingsApi.updateSettings(payload);
    setSettings(res.settings);
    setClasses(res.classes);
    return res;
  };

  const resetDemo = async () => {
    const res = await settingsApi.resetDemoData();
    setSettings(res.settings);
    setClasses(res.classes);
    return res;
  };

  return (
    <SettingsContext.Provider
      value={{ settings, classes, loading, refreshSettings, saveSettings, resetDemo }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
