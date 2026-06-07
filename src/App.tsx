import { useState, useCallback } from 'react';
import type { Profile, PartialProfile } from './types/profile';
import type { Insights } from './types/insights';
import { compute } from './engine';
import { FormWizard } from './components/form/FormWizard';
import { Report } from './components/report/Report';

const STORAGE_KEY = 'retirement_clarity_profile_v1';

type AppView = 'form' | 'report';

function loadProfile(): PartialProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PartialProfile;
  } catch {
    return null;
  }
}

function saveProfile(profile: Profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export default function App() {
  const [view, setView] = useState<AppView>('form');
  const [insights, setInsights] = useState<Insights | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [asOf] = useState(() => new Date());

  const savedProfile = loadProfile();

  const handleFormComplete = useCallback((completed: Profile) => {
    saveProfile(completed);
    const result = compute(completed, asOf);
    setProfile(completed);
    setInsights(result);
    setView('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [asOf]);

  const handleEdit = useCallback(() => {
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (view === 'report' && insights && profile) {
    return (
      <Report
        insights={insights}
        profile={profile}
        asOf={asOf}
        onEdit={handleEdit}
      />
    );
  }

  return (
    <FormWizard
      initial={savedProfile ?? {}}
      onComplete={handleFormComplete}
    />
  );
}
