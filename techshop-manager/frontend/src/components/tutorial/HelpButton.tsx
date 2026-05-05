import { useState, createPortal } from 'react';
import { HelpCircle } from 'lucide-react';
import { useTutorialStore } from '@/store/tutorial.store';
import { useTutorialContext } from './TutorialProvider';

export function HelpButton() {
  const { isActive, isCompleted } = useTutorialStore();
  const tutorial = useTutorialContext();
  const [open, setOpen] = useState(false);

  if (isActive || !isCompleted) return null;

  return createPortal(
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', bottom: 56, right: 0,
            background: 'white', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            padding: '8px 0', width: 240, border: '1px solid #eee',
          }}
        >
          <button
            role="menuitem"
            onClick={() => { setOpen(false); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '10px 16px', fontSize: 13, color: '#333',
              background: 'none', border: 'none', cursor: 'pointer',
              minHeight: 44,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            ▶ Revoir le tutoriel de cette page
          </button>
          <button
            role="menuitem"
            onClick={() => { setOpen(false); tutorial.restart(); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '10px 16px', fontSize: 13, color: '#333',
              background: 'none', border: 'none', cursor: 'pointer',
              minHeight: 44,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            ▶ Relancer le tutoriel complet
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Aide au tutoriel"
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#2E86C1', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(46,134,193,0.4)',
        }}
      >
        <HelpCircle size={22} color="white" />
      </button>
    </div>,
    document.body,
  );
}
