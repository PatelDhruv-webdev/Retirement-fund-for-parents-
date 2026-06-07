import { useState, useCallback } from 'react';
import type { Profile, PartialProfile } from './types/profile';
import type { Insights } from './types/insights';
import { compute } from './engine';
import { FormWizard } from './components/form/FormWizard';
import { Report } from './components/report/Report';
import { Welcome } from './components/Welcome';
import { TaxGuide } from './components/TaxGuide';

const STORAGE_KEY = 'retirement_clarity_profile_v1';

type AppView = 'welcome' | 'form' | 'report' | 'guide';

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

function clearProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default function App() {
  const [view, setView] = useState<AppView>('welcome');
  const [insights, setInsights] = useState<Insights | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [asOf] = useState(() => new Date());
  const [savedProfile] = useState<PartialProfile | null>(() => loadProfile());

  const handleContinue = useCallback(() => {
    if (savedProfile) {
      setView('form');
    }
  }, [savedProfile]);

  const handleStartFresh = useCallback(() => {
    clearProfile();
    setProfile(null);
    setInsights(null);
    setView('form');
  }, []);

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

  const handleShowGuide = useCallback(() => {
    setView('guide');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackFromGuide = useCallback(() => {
    // Return to report if we have one, otherwise form
    setView(insights ? 'report' : 'form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [insights]);

  const handleNewCalculation = useCallback(() => {
    clearProfile();
    setProfile(null);
    setInsights(null);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (view === 'welcome') {
    return (
      <Welcome
        hasSavedData={savedProfile !== null}
        onContinue={handleContinue}
        onStartFresh={handleStartFresh}
      />
    );
  }

  if (view === 'guide') {
    return <TaxGuide onBack={handleBackFromGuide} />;
  }

  if (view === 'report' && insights && profile) {
    return (
      <Report
        insights={insights}
        profile={profile}
        asOf={asOf}
        onEdit={handleEdit}
        onShowGuide={handleShowGuide}
        onNewCalculation={handleNewCalculation}
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
