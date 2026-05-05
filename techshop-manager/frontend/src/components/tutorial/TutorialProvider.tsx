// frontend/src/components/tutorial/TutorialProvider.tsx
import { createContext, useContext, type ReactNode } from 'react';
import { useTutorial } from '@/hooks/useTutorial';

type TutorialContextValue = ReturnType<typeof useTutorial>;

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const tutorial = useTutorial();
  return (
    <TutorialContext.Provider value={tutorial}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorialContext(): TutorialContextValue {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorialContext must be used inside TutorialProvider');
  return ctx;
}
