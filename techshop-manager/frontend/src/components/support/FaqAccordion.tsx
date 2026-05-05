import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Comment activer le compte d\'un client ?',
    answer: 'Dans le module Clients, ouvrez la fiche du client. Suivez les 4 étapes d\'onboarding dans l\'ordre : Récit de vente → Formation → Fiche client → Activation. Toutes les étapes doivent être marquées "Complété" avant que le bouton d\'activation soit disponible.',
  },
  {
    question: 'Comment effectuer un transfert de stock entre sites ?',
    answer: 'Allez dans Stocks → Transferts → Nouveau transfert. Sélectionnez le site source, le site de destination, le produit et la quantité. Le stock source est débité immédiatement. Le site de destination doit confirmer la réception via Stocks → Transferts en attente.',
  },
  {
    question: 'Que faire si la synchronisation hors-ligne ne fonctionne pas ?',
    answer: 'Les données saisies hors-ligne sont stockées localement dans le navigateur (IndexedDB). Lorsque la connexion est rétablie, la synchronisation se déclenche automatiquement. Si elle reste bloquée, rafraîchissez la page ou videz le cache du navigateur depuis les paramètres.',
  },
  {
    question: 'Comment générer un rapport d\'export Excel ?',
    answer: 'Accédez au module Rapports. Choisissez le type de rapport (ventes, stocks, clients), définissez la période et les filtres souhaités, puis cliquez sur "Exporter". Le fichier Excel sera téléchargé automatiquement une fois la génération terminée.',
  },
  {
    question: 'Comment réinitialiser le PIN d\'un client pour le portail ?',
    answer: 'Ouvrez la fiche du client, section "Portail client". Cliquez sur "Réinitialiser le PIN". Un nouveau PIN temporaire sera envoyé par SMS au numéro du client (si le service SMS est configuré), ou vous pouvez le saisir manuellement.',
  },
  {
    question: 'Les ventes enregistrées hors-ligne sont-elles sécurisées ?',
    answer: 'Oui. Les ventes hors-ligne sont stockées chiffrées dans IndexedDB du navigateur. Elles sont synchronisées avec le serveur dès que la connexion est disponible. Évitez de vider le cache du navigateur entre-temps pour ne pas perdre les données non synchronisées.',
  },
  {
    question: 'Comment modifier le seuil d\'alerte d\'un produit en stock ?',
    answer: 'Dans Stocks, cliquez sur un produit pour afficher sa fiche détaillée. Dans le tableau "Stock par site", cliquez sur l\'icône de paramètres (engrenage) de la ligne souhaitée. Saisissez le nouveau seuil d\'alerte et enregistrez. Le statut se met à jour en temps réel.',
  },
  {
    question: 'Quels rôles peuvent créer de nouveaux utilisateurs ?',
    answer: 'Seul le SUPER_ADMIN peut créer, modifier ou désactiver des comptes utilisateurs depuis le module Paramètres → Utilisateurs. Le DIRECTEUR_REGIONAL et les GÉRANTS ne peuvent pas gérer les accès utilisateurs.',
  },
];

interface AccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className={cn(
      'border border-border rounded-xl overflow-hidden transition-colors',
      isOpen ? 'bg-white shadow-sm' : 'bg-slate-50/50',
    )}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-inset"
      >
        <span className="text-[13px] font-semibold text-primary leading-snug">
          {item.question}
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={cn(
            'flex-shrink-0 text-text-muted transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-[13px] text-text leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <AccordionItem
          key={i}
          item={item}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}
