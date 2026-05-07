import { useState, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Users, Copy, ZoomIn, ZoomOut, RotateCcw,
  ChevronRight, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { parrainageApi } from '@/lib/parrainage.api';
import { formatDate, formatUSD, cn } from '@/lib/utils';
import type { TreeNode, FilleulFlat } from '@/lib/parrainage.api';
import type { TypeRecompense } from '@/types';

// ── SVG Tree ──────────────────────────────────────────────────────────────────

const NODE_W = 140;
const NODE_H = 60;
const H_GAP = 24;
const V_GAP = 90;

interface LayoutNode extends TreeNode {
  x: number;
  y: number;
  subtreeWidth: number;
}

function calcLayout(node: TreeNode, depth = 0): LayoutNode {
  if (!node.filleuls || node.filleuls.length === 0) {
    return { ...node, x: 0, y: depth * (NODE_H + V_GAP), subtreeWidth: NODE_W };
  }
  const children = node.filleuls.map(c => calcLayout(c, depth + 1));
  const totalChildrenWidth = children.reduce((s, c) => s + c.subtreeWidth, 0) + H_GAP * (children.length - 1);
  const subtreeWidth = Math.max(NODE_W, totalChildrenWidth);
  let cx = 0;
  for (const child of children) {
    child.x += cx + (child.subtreeWidth - NODE_W) / 2;
    cx += child.subtreeWidth + H_GAP;
  }
  const x = (totalChildrenWidth - NODE_W) / 2;
  return { ...node, x, y: depth * (NODE_H + V_GAP), subtreeWidth, filleuls: children as TreeNode[] };
}

function collectNodes(node: LayoutNode): LayoutNode[] {
  const res: LayoutNode[] = [node];
  for (const c of node.filleuls as LayoutNode[]) res.push(...collectNodes(c));
  return res;
}

function collectEdges(node: LayoutNode): { x1: number; y1: number; x2: number; y2: number; depth: number }[] {
  const res: { x1: number; y1: number; x2: number; y2: number; depth: number }[] = [];
  for (const c of node.filleuls as LayoutNode[]) {
    res.push({ x1: node.x + NODE_W / 2, y1: node.y + NODE_H, x2: c.x + NODE_W / 2, y2: c.y, depth: node.niveau });
    res.push(...collectEdges(c));
  }
  return res;
}

const NODE_FILL: Record<number, { fill: string; stroke: string; text: string }> = {
  0: { fill: '#1E3A5F', stroke: '#2E86C1', text: '#ffffff' },
  1: { fill: '#D6E4F0', stroke: '#2E86C1', text: '#1E3A5F' },
  2: { fill: '#EDE7F6', stroke: '#9C27B0', text: '#4A148C' },
};

const STATUT_DOT: Record<string, string> = {
  ACTIF: '#22c55e',
  EN_COURS: '#f59e0b',
  SUSPENDU: '#ef4444',
};

function SvgNode({ node, onClick, tooltip, onHover }: {
  node: LayoutNode;
  onClick: (id: string) => void;
  tooltip: string | null;
  onHover: (id: string | null) => void;
}) {
  const colors = NODE_FILL[node.niveau] ?? NODE_FILL[2];
  const isDashed = node.statut === 'EN_COURS';
  const isGray = node.statut === 'SUSPENDU';
  const dotColor = STATUT_DOT[node.statut] ?? '#9ca3af';
  const label = `${node.prenom} ${node.nom}`.substring(0, 16);
  const codeLabel = node.codeParrain.substring(0, 12);

  return (
    <g
      style={{ cursor: 'pointer', opacity: isGray ? 0.5 : 1 }}
      onClick={() => onClick(node.clientId)}
      onMouseEnter={() => onHover(node.clientId)}
      onMouseLeave={() => onHover(null)}
      transform={`translate(${node.x},${node.y})`}
    >
      <rect
        width={NODE_W}
        height={NODE_H}
        rx={8}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={node.niveau === 0 ? 2 : 1}
        strokeDasharray={isDashed ? '5 3' : undefined}
      />
      <text x={NODE_W / 2} y={22} textAnchor="middle" fill={colors.text} fontSize={12} fontWeight="bold" style={{ fontFamily: 'system-ui' }}>
        {label}
      </text>
      <text x={NODE_W / 2} y={40} textAnchor="middle" fill={colors.text} fontSize={10} opacity={0.7} style={{ fontFamily: 'monospace' }}>
        {codeLabel}
      </text>
      <circle cx={NODE_W - 10} cy={NODE_H - 10} r={5} fill={dotColor} />

      {tooltip === node.clientId && (
        <g transform={`translate(${NODE_W / 2 - 75},-70)`}>
          <rect width={150} height={62} rx={6} fill="white" stroke="#e5e7eb" strokeWidth={1} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
          <text x={8} y={16} fontSize={11} fill="#374151" fontWeight="bold">{node.prenom} {node.nom}</text>
          <text x={8} y={30} fontSize={10} fill="#6b7280">{node.codeParrain}</text>
          <text x={8} y={44} fontSize={10} fill="#6b7280">Statut : {node.statut}</text>
          <text x={8} y={58} fontSize={10} fill="#6b7280">Niveau {node.niveau === 0 ? 'Racine' : node.niveau}</text>
        </g>
      )}
    </g>
  );
}

function ParrainageTreeSvg({ racine, onNodeClick }: { racine: TreeNode; onNodeClick: (id: string) => void }) {
  const layout = useMemo(() => calcLayout(racine), [racine]);
  const allNodes = useMemo(() => collectNodes(layout), [layout]);
  const allEdges = useMemo(() => collectEdges(layout), [layout]);
  const [zoom, setZoom] = useState(1);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const svgW = Math.max(layout.subtreeWidth + H_GAP * 2, 400);
  const svgH = Math.max(allNodes.reduce((m, n) => Math.max(m, n.y + NODE_H), 0) + 40, 200);

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-2">
        <button type="button" onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="btn-secondary p-1.5">
          <ZoomIn size={14} />
        </button>
        <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="btn-secondary p-1.5">
          <ZoomOut size={14} />
        </button>
        <button type="button" onClick={() => setZoom(1)} className="btn-secondary p-1.5">
          <RotateCcw size={14} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <svg
          width={svgW * zoom}
          height={svgH * zoom}
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ display: 'block' }}
        >
          <g transform={`translate(${H_GAP},20)`}>
            {allEdges.map((e, i) => (
              <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#94A3B8" strokeWidth={e.depth === 0 ? 1.5 : 1} />
            ))}
            {allNodes.map(n => (
              <SvgNode key={n.clientId} node={n} onClick={onNodeClick} tooltip={hoverId} onHover={setHoverId} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

// ── Filleuls Table ─────────────────────────────────────────────────────────────

function FilleulsTable({ filleuls, typeRecompense }: { filleuls: FilleulFlat[]; typeRecompense: TypeRecompense }) {
  const [onlyDirect, setOnlyDirect] = useState(false);
  const displayed = onlyDirect ? filleuls.filter(f => f.niveau === 1) : filleuls;
  const nbDirect = filleuls.filter(f => f.niveau === 1).length;
  const nbIndirect = filleuls.filter(f => f.niveau === 2).length;
  const nbActifs = filleuls.filter(f => f.statut === 'ACTIF').length;
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="period-toggle">
          <button type="button" className={cn('period-btn', !onlyDirect && 'active')} onClick={() => setOnlyDirect(false)}>Tous niveaux</button>
          <button type="button" className={cn('period-btn', onlyDirect && 'active')} onClick={() => setOnlyDirect(true)}>Directs uniquement</button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Filleul</th>
              <th>Niveau</th>
              <th>Statut</th>
              <th>Date activation</th>
              <th>Gains générés</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((f, i) => (
              <tr key={f.id}>
                <td className="text-[12px] text-text-muted font-mono">{i + 1}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0">
                      {f.prenom[0]}{f.nom[0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{f.prenom} {f.nom}</p>
                      <p className="text-[10px] text-text-muted">{f.telephone}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    f.niveau === 1 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700',
                  )}>
                    {f.niveau === 1 ? 'Direct' : 'Indirect'}
                  </span>
                </td>
                <td>
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    f.statut === 'ACTIF' ? 'bg-green-100 text-success' : 'bg-amber-100 text-amber-700',
                  )}>
                    {f.statut}
                  </span>
                </td>
                <td className="text-[12px] text-text-muted">{f.dateActivation ? formatDate(f.dateActivation) : '—'}</td>
                <td className="font-mono text-[12px] text-success font-semibold">
                  {f.pointsGeneresPourParrain > 0
                    ? typeRecompense === 'POINTS'
                      ? `${f.pointsGeneresPourParrain} pts`
                      : formatUSD(f.pointsGeneresPourParrain)
                    : '—'}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => navigate(`/clients/${f.id}`)}
                    className="text-[11px] text-primary-accent hover:text-primary font-medium transition-colors"
                  >
                    Fiche →
                  </button>
                </td>
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-muted text-[13px]">
                  Aucun filleul{onlyDirect ? ' direct' : ''} trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-text-muted">
        {nbDirect} filleul{nbDirect > 1 ? 's' : ''} direct{nbDirect > 1 ? 's' : ''} · {nbIndirect} indirect{nbIndirect > 1 ? 's' : ''} · {nbActifs} actif{nbActifs > 1 ? 's' : ''} au total
      </p>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function ArbreParrainagePage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [view, setView] = useState<'tree' | 'list'>('tree');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['parrainage', 'tree', clientId],
    queryFn: () => parrainageApi.getTree(clientId!),
    staleTime: 3 * 60_000,
    retry: 1,
    enabled: !!clientId,
  });

  function copyCode() {
    if (data?.arbre.codeParrain) {
      navigator.clipboard.writeText(data.arbre.codeParrain);
      toast.success('Code parrain copié !');
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="skeleton h-9 w-9 rounded-lg" />
          <div className="skeleton h-6 w-56 rounded" />
        </div>
        <div className="card"><div className="skeleton h-64 rounded-xl" /></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-3">
        <AlertCircle size={36} className="text-danger mx-auto opacity-60" />
        <h2 className="text-[16px] font-bold text-primary">Client introuvable</h2>
        <p className="text-[13px] text-text-muted">Ce profil de parrainage n'existe pas ou a été supprimé.</p>
        <button type="button" onClick={() => navigate('/parrainage')} className="btn-secondary text-[13px]">
          <ArrowLeft size={14} /> Retour au parrainage
        </button>
      </div>
    );
  }

  const { arbre, stats, parrainParent, filleuls } = data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/parrainage')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:border-border-strong hover:text-text transition-colors"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h1 className="text-[18px] font-extrabold text-primary">
            Réseau de {arbre.prenom} {arbre.nom}
          </h1>
          <p className="text-[12px] text-text-muted">Arbre de parrainage</p>
        </div>
      </div>

      {/* Parrain parent */}
      {parrainParent && (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-[12px] font-bold text-blue-700 shrink-0">
            {parrainParent.prenom[0]}{parrainParent.nom[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-blue-600 font-semibold">
              Filleul de {parrainParent.prenom} {parrainParent.nom}
              <span className="font-mono ml-1 opacity-70">({parrainParent.codeParrain})</span>
            </p>
            {parrainParent.recompenseRecue > 0 && (
              <p className="text-[11px] text-blue-500">
                Récompense reçue : {stats.typeRecompense === 'POINTS' ? `${parrainParent.recompenseRecue} pts` : formatUSD(parrainParent.recompenseRecue)}
              </p>
            )}
          </div>
          <Link
            to={`/parrainage/tree/${parrainParent.id}`}
            className="text-[12px] text-blue-600 hover:text-blue-800 font-medium shrink-0"
          >
            Voir son arbre →
          </Link>
        </div>
      )}

      {/* Profil + stats */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-black text-[18px] shadow">
              {arbre.prenom[0]}{arbre.nom[0]}
            </div>
            <div>
              <h2 className="font-bold text-[18px] text-primary">{arbre.prenom} {arbre.nom}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded text-[12px] font-bold">
                  {arbre.codeParrain}
                </span>
                <button type="button" onClick={copyCode} className="text-text-subtle hover:text-primary transition-colors">
                  <Copy size={13} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="font-black text-[24px] text-primary leading-none">{stats.nbFilleulsTotal}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-0.5">Filleuls</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[24px] text-success leading-none">{stats.nbFilleulsActifs}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-0.5">Actifs</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[24px] text-primary leading-none">
                {stats.typeRecompense === 'POINTS' ? `${stats.gainsTotaux} pts` : formatUSD(stats.gainsTotaux)}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-0.5">Gains totaux</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vue toggle */}
      <div className="flex items-center gap-3">
        <div className="period-toggle">
          <button type="button" className={cn('period-btn', view === 'tree' && 'active')} onClick={() => setView('tree')}>
            Arbre visuel
          </button>
          <button type="button" className={cn('period-btn', view === 'list' && 'active')} onClick={() => setView('list')}>
            Vue liste
          </button>
        </div>
      </div>

      {/* Contenu */}
      {view === 'tree' ? (
        <div className="card">
          {arbre.filleuls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <ParrainageTreeSvg racine={arbre} onNodeClick={id => navigate(`/clients/${id}`)} />
              <p className="text-[13px] text-text-muted">Ce client n'a pas encore de filleuls.</p>
              {arbre.statut === 'ACTIF' && (
                <p className="text-[12px] text-primary-accent">
                  Le code parrain <span className="font-mono font-bold">{arbre.codeParrain}</span> peut être partagé pour recruter.
                </p>
              )}
            </div>
          ) : (
            <ParrainageTreeSvg racine={arbre} onNodeClick={id => navigate(`/clients/${id}`)} />
          )}
        </div>
      ) : (
        <div className="card">
          <FilleulsTable filleuls={filleuls} typeRecompense={stats.typeRecompense} />
        </div>
      )}
    </div>
  );
}
