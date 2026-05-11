import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 mx-auto">
            <span className="text-2xl" aria-hidden>⚠</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">Une erreur est survenue</h1>
            <p className="text-sm text-text-muted mt-1">
              L'application a rencontré un problème inattendu.
            </p>
          </div>
          <details className="text-left bg-bg-card border border-border rounded-xl p-3">
            <summary className="text-xs font-semibold text-text-muted cursor-pointer">
              Détails techniques
            </summary>
            <pre className="mt-2 text-[11px] text-danger whitespace-pre-wrap break-all">
              {this.state.error.message}
            </pre>
          </details>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-accent text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={14} />
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
}
