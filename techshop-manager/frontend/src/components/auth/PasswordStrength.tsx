interface PasswordStrengthProps {
  password: string;
}

function getScore(password: string): number {
  if (!password) return 0;
  if (password.length < 6) return 1;
  const criteria = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  const met = criteria.filter(Boolean).length;
  if (password.length >= 10 && met === 4) return 4;
  if (password.length >= 8 && met >= 2) return 3;
  return 2;
}

const LEVELS = [
  { label: '', color: '', pct: 0 },
  { label: 'Faible', color: 'bg-danger', pct: 25 },
  { label: 'Moyen', color: 'bg-warning', pct: 50 },
  { label: 'Fort', color: 'bg-yellow-400', pct: 75 },
  { label: 'Solide', color: 'bg-success', pct: 100 },
];

const CRITERIA = [
  { test: /[a-z]/, label: 'Au moins une minuscule' },
  { test: /[A-Z]/, label: 'Au moins une majuscule' },
  { test: /[0-9]/, label: 'Au moins un chiffre' },
  { test: /[^a-zA-Z0-9]/, label: 'Au moins un caractère spécial' },
  { test: /.{6}/, label: 'Minimum 6 caractères' },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;
  const score = getScore(password);
  const level = LEVELS[score];

  const unmet = CRITERIA.filter((c) => !c.test.test(password));

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${level.color}`}
            style={{ width: `${level.pct}%` }}
          />
        </div>
        <span className={`text-xs font-medium w-12 text-right ${level.color.replace('bg-', 'text-').replace('bg-success', 'text-success').replace('bg-danger', 'text-danger').replace('bg-warning', 'text-warning')}`}>
          {level.label}
        </span>
      </div>
      {score < 4 && unmet.length > 0 && (
        <ul className="text-xs text-danger space-y-0.5 mt-1">
          {unmet.map((c) => (
            <li key={c.label}>• {c.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
