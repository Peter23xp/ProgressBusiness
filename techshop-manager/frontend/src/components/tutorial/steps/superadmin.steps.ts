// frontend/src/components/tutorial/steps/superadmin.steps.ts
import type { TutorialStep } from '@/store/tutorial.store';

export const superadminSteps: TutorialStep[] = [
  {
    id: 'sa-welcome',
    sectionId: 'bienvenue',
    sectionLabel: 'Bienvenue',
    type: 'welcome',
    title: 'Bienvenue',
    description: 'Bienvenue dans TechShop Manager.',
  },
  {
    id: 'sa-parametres',
    sectionId: 'acces-complet',
    sectionLabel: 'Accès complet',
    type: 'spotlight',
    targetId: 'sidebar-nav-parametres',
    title: 'Paramètres — Votre panneau d\'administration',
    description:
      'En tant que **Super Admin**, vous avez accès au panneau Paramètres qui vous permet de gérer les utilisateurs, les sites, et toute la configuration de l\'application.',
    placement: 'right',
  },
  {
    id: 'sa-site-selector',
    sectionId: 'acces-complet',
    sectionLabel: 'Accès complet',
    type: 'spotlight',
    targetId: 'header-site-selector',
    targetRoute: '/dashboard',
    title: 'Accès à tous les sites',
    description:
      'Vous pouvez visualiser et agir sur les données de **tous les sites** sans restriction. Le sélecteur de site vous permet de filtrer les données par site ou de voir la vue consolidée.',
    placement: 'bottom',
  },
  {
    id: 'sa-users',
    sectionId: 'gestion-utilisateurs',
    sectionLabel: 'Utilisateurs',
    type: 'tooltip',
    targetRoute: '/settings/users',
    title: 'Gérer les utilisateurs',
    description:
      'Créez des comptes pour vos agents, formateurs et gérants. Assignez-leur un rôle et un site. Un SMS avec le mot de passe temporaire est envoyé automatiquement.',
    tip: 'Un utilisateur désactivé ne peut plus se connecter mais ses données historiques sont conservées.',
    requiresOnline: true,
  },
  {
    id: 'sa-sites',
    sectionId: 'gestion-utilisateurs',
    sectionLabel: 'Utilisateurs',
    type: 'tooltip',
    targetRoute: '/settings/sites',
    title: 'Gérer les sites',
    description:
      'Configurez les 3 sites de l\'entreprise (Goma, Bukavu, Kinshasa). Chaque site a son Gérant responsable assigné ici.',
    requiresOnline: true,
  },
  {
    id: 'sa-parrainage-config',
    sectionId: 'config-parrainage',
    sectionLabel: 'Parrainage',
    type: 'tooltip',
    targetRoute: '/parrainage/config',
    title: 'Configuration du parrainage',
    description:
      'Définissez le type et la valeur de la récompense attribuée aux parrains lors de l\'activation d\'un filleul : points, remise sur prochaine vente ou commission en CDF.',
  },
  {
    id: 'sa-parrainage-niveaux',
    sectionId: 'config-parrainage',
    sectionLabel: 'Parrainage',
    type: 'tooltip',
    title: 'Parrainage multi-niveaux',
    description:
      'Vous pouvez activer le parrainage à 2 niveaux : le parrain direct reçoit une récompense plus élevée, et le parrain du parrain une récompense secondaire.',
    tip: 'Testez avec des petits montants avant d\'activer en production.',
  },
  {
    id: 'sa-fidelite-config',
    sectionId: 'config-fidelite',
    sectionLabel: 'Fidélité',
    type: 'tooltip',
    targetRoute: '/fidelite/config',
    title: 'Niveaux de fidélité',
    description:
      'Configurez les 4 niveaux (Bronze, Argent, Or, Platine) : le nombre de points requis pour chaque niveau et le pourcentage de remise accordé à chaque niveau.',
  },
  {
    id: 'sa-fidelite-ratio',
    sectionId: 'config-fidelite',
    sectionLabel: 'Fidélité',
    type: 'tooltip',
    title: 'Ratio points / CDF',
    description:
      'Définissez combien de points un client gagne pour chaque tranche de 1 000 CDF dépensés. Ce ratio s\'applique à toutes les ventes enregistrées dans l\'application.',
  },
  {
    id: 'sa-rapports',
    sectionId: 'rapports',
    sectionLabel: 'Rapports',
    type: 'spotlight',
    targetId: 'sidebar-nav-rapports',
    title: 'Rapports globaux',
    description:
      'Toutes les données de tous les sites accessibles depuis un seul endroit. Idéal pour les bilans mensuels ou les présentations à votre direction.',
    placement: 'right',
  },
  {
    id: 'sa-export',
    sectionId: 'rapports',
    sectionLabel: 'Rapports',
    type: 'tooltip',
    targetRoute: '/reports/export',
    title: 'Exports automatisés',
    description:
      'Générez des exports XLSX, PDF ou CSV pour n\'importe quelle période et n\'importe quel site. Les fichiers sont disponibles au téléchargement pendant 15 minutes.',
    requiresOnline: true,
  },
  {
    id: 'sa-sms-config',
    sectionId: 'config-generale',
    sectionLabel: 'Configuration',
    type: 'tooltip',
    targetRoute: '/settings/general',
    title: 'Configuration SMS (Africa\'s Talking)',
    description:
      'Configurez ici votre clé API Africa\'s Talking pour activer l\'envoi de SMS : codes OTP, SMS de bienvenue et récapitulatifs de vente.',
    requiresOnline: true,
  },
  {
    id: 'sa-retours',
    sectionId: 'config-generale',
    sectionLabel: 'Configuration',
    type: 'tooltip',
    title: 'Politiques de retour',
    description:
      'Définissez le délai maximum pour les retours produits (en jours) et les éventuels frais de retour applicables.',
  },
  {
    id: 'sa-portail',
    sectionId: 'portail',
    sectionLabel: 'Portail client',
    type: 'tooltip',
    targetRoute: '/portal/home',
    title: 'Le portail client',
    description:
      'Vos clients peuvent accéder à ce portail depuis leur téléphone pour consulter leurs achats, leurs points et leur arbre de parrainage. C\'est leur espace personnel.',
  },
  {
    id: 'sa-securite',
    sectionId: 'securite',
    sectionLabel: 'Sécurité',
    type: 'tooltip',
    title: 'Sécurité des tokens',
    description:
      'TechShop Manager utilise une architecture sécurisée : le token de session n\'est jamais stocké dans le navigateur. En cas de vol de session, vous pouvez invalider tous les tokens depuis les paramètres utilisateur.',
  },
  {
    id: 'sa-deconnexion',
    sectionId: 'securite',
    sectionLabel: 'Sécurité',
    type: 'tooltip',
    targetId: 'header-user-menu',
    title: 'Déconnexion sécurisée',
    description:
      'La déconnexion invalide immédiatement la session sur tous les appareils de l\'utilisateur. Utilisez cela si un appareil est perdu ou volé.',
    placement: 'bottom',
  },
  {
    id: 'sa-restart-tutorial',
    sectionId: 'aide',
    sectionLabel: 'Aide',
    type: 'tooltip',
    targetId: 'profile-btn-restart-tutorial',
    targetRoute: '/settings/profile',
    title: 'Relancer ce tutoriel',
    description:
      'Vous pouvez toujours revenir sur ce tutoriel depuis votre profil si vous souhaitez revoir une fonctionnalité.',
    placement: 'top',
    nextLabel: 'Terminer ✓',
  },
  {
    id: 'sa-completion',
    sectionId: 'fin',
    sectionLabel: 'Fin',
    type: 'completion',
    title: 'Félicitations !',
    description: 'Vous avez terminé le tutoriel.',
  },
];

export function getTutorialStepsForRole(role: string): TutorialStep[] {
  switch (role) {
    case 'SUPER_ADMIN':
      return superadminSteps;
    default:
      return superadminSteps;
  }
}
