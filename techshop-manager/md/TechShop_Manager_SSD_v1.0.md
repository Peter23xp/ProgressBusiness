**TECHSHOP MANAGER**

Système de Gestion Commercial Multi-Sites

Goma · Bukavu · Kinshasa — RDC

**Propriété**

**Valeur**

Document

Screen Specification Document (SSD)

Version

1.0.0

Date

2025

Projet

TechShop Manager — Goma, Nord-Kivu, RDC

Destinataires

Equipe de developpement Front-End & Back-End

Total ecrans

42 ecrans documentes

Total modules

10 modules

Statut

Document de reference technique — Confidentiel

# **0\. ARCHITECTURE GLOBALE DE NAVIGATION**

## **0.1 Structure de Navigation par Role**

**Role**

**Ecrans accessibles**

**Permissions**

**Acces modules**

Super Admin

Tous les 42 ecrans

CRUD + Configuration + Suppression

Tous les modules + Parametres avances

Directeur Regional

32 ecrans

Lecture + Validation transferts + Rapports

Dashboard, Clients, Stocks, Ventes, Parrainage, Rapports

Gerant de Site

28 ecrans

CRUD limite a son site

Dashboard, Clients, Stocks, Ventes, Parrainage

Agent Commercial

18 ecrans

Lecture + Creation clients + Ventes

Clients, Onboarding, Caisse, Stock (lecture)

Formateur

8 ecrans

Validation etape formation uniquement

Clients (liste + fiche), Onboarding (etape 2)

Client (portail)

4 ecrans

Lecture seule — donnees personnelles

Portail client uniquement

## **0.2 Arborescence Complete des Ecrans**

**ID**

**Ecran**

**Module**

**Route**

**Role minimum**

**SCR-001**

Page de Connexion

Auth

/login

Public

**SCR-002**

Reinitialisation Mot de Passe

Auth

/reset-password

Public

**SCR-003**

Tableau de Bord Principal

Dashboard

/dashboard

Agent

**SCR-004**

Dashboard Directeur Regional

Dashboard

/dashboard/regional

Dir. Regional

**SCR-005**

Liste des Clients

Clients

/clients

Agent

**SCR-006**

Fiche Detail Client

Clients

/clients/:id

Agent

**SCR-007**

Onboarding — Etape 1 (Recit)

Clients

/clients/new/recit

Agent

**SCR-008**

Onboarding — Etape 2 (Formation)

Clients

/clients/:id/formation

Formateur

**SCR-009**

Onboarding — Etape 3 (Fiche)

Clients

/clients/:id/fiche

Agent

**SCR-010**

Onboarding — Activation

Clients

/clients/:id/activate

Agent

**SCR-011**

Import Matricules Externes

Clients

/clients/import

Gerant

**SCR-012**

Interface de Caisse (POS)

Ventes

/sales/pos

Agent

**SCR-013**

Historique des Ventes

Ventes

/sales

Gerant

**SCR-014**

Detail d'une Vente

Ventes

/sales/:id

Gerant

**SCR-015**

Recu / Facture

Ventes

/sales/:id/receipt

Agent

**SCR-016**

Retours et Avoirs

Ventes

/sales/returns

Gerant

**SCR-017**

Inventaire par Site

Stocks

/stocks

Agent

**SCR-018**

Detail Produit — Stock

Stocks

/stocks/:produitId

Gerant

**SCR-019**

Entree de Stock

Stocks

/stocks/entry

Gerant

**SCR-020**

Transfert Inter-Sites

Stocks

/stocks/transfer

Gerant

**SCR-021**

Validation Reception Transfert

Stocks

/stocks/transfer/:id/receive

Gerant

**SCR-022**

Alertes et Seuils Stock

Stocks

/stocks/alerts

Gerant

**SCR-023**

Inventaire Physique

Stocks

/stocks/inventory

Gerant

**SCR-024**

Vue Globale Parrainage

Parrainage

/parrainage

Gerant

**SCR-025**

Arbre de Parrainage Client

Parrainage

/parrainage/tree/:clientId

Agent

**SCR-026**

Config. Recompenses Parrainage

Parrainage

/parrainage/config

Super Admin

**SCR-027**

Programme de Fidelite

Fidelite

/fidelite

Gerant

**SCR-028**

Historique Points Client

Fidelite

/fidelite/client/:id

Agent

**SCR-029**

Configuration Niveaux Fidelite

Fidelite

/fidelite/config

Super Admin

**SCR-030**

Rapports Dashboard

Rapports

/reports

Gerant

**SCR-031**

Rapport Ventes Detaille

Rapports

/reports/sales

Dir. Regional

**SCR-032**

Rapport Stocks Multi-Sites

Rapports

/reports/stocks

Dir. Regional

**SCR-033**

Rapport Parrainage

Rapports

/reports/parrainage

Gerant

**SCR-034**

Export Excel / PDF

Rapports

/reports/export

Gerant

**SCR-035**

Portail Client — Accueil

Portail

/portal/home

Client

**SCR-036**

Portail Client — Mes Achats

Portail

/portal/purchases

Client

**SCR-037**

Portail Client — Mes Points

Portail

/portal/points

Client

**SCR-038**

Portail Client — Mes Filleuls

Portail

/portal/referrals

Client

**SCR-039**

Gestion des Utilisateurs

Parametres

/settings/users

Super Admin

**SCR-040**

Gestion des Sites

Parametres

/settings/sites

Super Admin

**SCR-041**

Profil Utilisateur

Parametres

/settings/profile

Agent

**SCR-042**

Configuration Generale

Parametres

/settings/general

Super Admin

# **1\. MODULE AUTHENTIFICATION**

**SCR-001 Page de Connexion** \[ Module: AUTH \] \[ Role min: Public \]

**■ Wireframe**

+---------------------------------------------------------------+

| \[ LOGO TECHSHOP MANAGER \] |

| Systeme de Gestion Commercial — Goma, RDC |

| |

| +-----------------------------------------------------------+|

| | Telephone ou Email ||

| | \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]||

| | Mot de passe ||

| | \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]||

| | \[ \] Se souvenir de moi Mot de passe oublie ? ||

| | \[ SE CONNECTER (btn bleu) \] ||

| +-----------------------------------------------------------+|

| Hors-ligne ? \[Mode degrade\] v1.0 | Goma, RDC |

+---------------------------------------------------------------+

**■ Composants de l'ecran**

**Composant**

**Type**

**Validation**

**Note**

Logo TechShop

Image statique

—

Charge depuis /assets/logo.png

Champ telephone/email

Input text

Requis, min 9 chars

Accepte +243XXXXXXXXX ou email

Champ mot de passe

Input password

Requis, min 6 chars

Icone oeil pour afficher/masquer

Case souvenir

Checkbox

—

Persiste token 30 jours si coche

Lien MDP oublie

Link

—

Redirige vers SCR-002

Bouton Connexion

Button primary

Form valid

Desactive si champs vides

Indicateur connexion

Badge

—

Vert=connecte, Rouge=serveur inaccessible

Lien mode degrade

Link discret

—

Visible seulement si offline detecte

**■ Etats de l'ecran**

▸ Defaut : formulaire vide, bouton SE CONNECTER desactive

▸ Chargement : spinner sur bouton, champs desactives

▸ Erreur credentials : toast rouge 'Telephone ou mot de passe incorrect' (max 5 tentatives)

▸ Erreur reseau : toast orange 'Serveur inaccessible — verifier la connexion'

▸ Verrouillage : apres 5 echecs, compte bloque 15 min

▸ Offline detecte : banner jaune en haut + lien 'Mode degrade' visible

▸ Succes : redirect selon role (voir regles metier)

**■ Appels API**

**POST /api/v1/auth/login** — Authentification utilisateur

Params: body: { identifier, password, rememberMe }

Reponse: { accessToken, refreshToken, user: { id, role, name, siteId, siteName } }

**POST /api/v1/auth/refresh** — Renouveler le token

Params: body: { refreshToken }

Reponse: { accessToken, expiresIn }

**■ Regles Metier**

**1\.** Apres connexion → rediriger selon role: Super Admin→/dashboard, Agent→/sales/pos, Formateur→/clients, Client→/portal/home

**2\.** Token JWT stocke en memoire (pas localStorage) + httpOnly cookie pour refresh token

**3\.** Mode degrade offline utilise le dernier accessToken valide (max 8h depuis derniere sync)

**4\.** Verrouillage apres 5 tentatives : duree 15 minutes, notification Super Admin par log

**SCR-002 Reinitialisation Mot de Passe** \[ Module: AUTH \] \[ Role min: Public \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Champ telephone

Input tel

Format +243XXXXXXXXX

Numero Mobile Money du compte

Bouton Envoyer code

Button primary

Telephone valide

Declenche envoi SMS OTP

Champ code OTP

Input number

6 chiffres

Expire apres 10 minutes

Nouveau mot de passe

Input password

Min 6 chars

Confirmation requise

Bouton Reinitialiser

Button primary

OTP valide

Finalise le reset

Lien retour

Link

—

Retour vers SCR-001

**■ Appels API**

**POST /api/v1/auth/forgot-password** — Envoyer OTP par SMS

Params: body: { phone }

Reponse: { success, expiresIn: 600, maskedPhone }

**POST /api/v1/auth/reset-password** — Reinitialiser avec OTP

Params: body: { phone, otp, newPassword }

Reponse: { success, message }

**■ Regles Metier**

**1\.** L'OTP expire apres 10 minutes — afficher compte a rebours visible

**2\.** Maximum 3 tentatives OTP invalides avant verrouillage 30 minutes

**3\.** Un seul OTP actif a la fois par numero de telephone

# **2\. MODULE DASHBOARD**

**SCR-003 Tableau de Bord Principal** \[ Module: DASHBOARD \] \[ Role min: Agent \]

**■ Wireframe**

+------------------------------------------------------------------+

| TECHSHOP \[GOMA▼\] Jean-Pierre ▾ \[Deconnexion\]|

+------------+-----------------------------------------------------+

| Dashboard | Tableau de Bord Aujourd'hui ▾ |

| Clients | +------------+ +------------+ +------------+ |

| Ventes | |Clients | |Ventes Jour | |AlertesStock| |

| Stocks | |ACTIF: 1248 | |847 500 CDF | | 3 | |

| Parrain. | +------------+ +------------+ +------------+ |

| Fidelite | +------------+ Ventes 7 jours (barres) |

| Rapports | |Nv Filleuls | \[================================\] |

| Portail | | 12/mois | |

| Params. | +------------+ Transactions | Alertes stock |

| | \[liste 5\] \[liste 3\] |

+------------+-----------------------------------------------------+

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Selecteur de site

Select

—

Filtre tout le dashboard par site (si droits multi-sites)

KPI — Clients actifs

Stat card

—

Count clients statut=ACTIF sur le site selectionne

KPI — Ventes du jour

Stat card

—

Somme ventes du jour en CDF avec separateurs de milliers

KPI — Alertes stock

Stat card

—

Count produits sous seuil minimum, badge rouge si >0

KPI — Nouveaux filleuls

Stat card

—

Filleuls ayant complete l'activation ce mois

Graphique barres ventes

Chart.js Bar

—

7 derniers jours, donnees par site, tooltip CDF

Transactions recentes

Table 5 lignes

—

Client, produit, montant, site, statut — lien vers SCR-014

Alertes stock

List 3 items

—

Produit, site, stock actuel vs seuil — lien vers SCR-022

**■ Appels API**

**GET /api/v1/dashboard/stats** — KPIs du tableau de bord

Params: query: { siteId?, period: 'today'|'week'|'month' }

Reponse: { clientsActifs, ventesJour, alertesStock, nouveauxFilleuls }

**GET /api/v1/dashboard/sales-chart** — Donnees graphique ventes

Params: query: { siteId?, days: number }

Reponse: { labels: string\[\], datasets: \[{ site, data: number\[\] }\] }

**GET /api/v1/dashboard/recent-transactions** — 5 dernieres transactions

Params: query: { siteId?, limit: 5 }

Reponse: { transactions: \[{ id, clientNom, produit, montant, site, statut, createdAt }\] }

**GET /api/v1/dashboard/stock-alerts** — Alertes stock actuelles

Params: query: { siteId?, limit: 3 }

Reponse: { alerts: \[{ produitNom, sku, siteNom, stockActuel, seuilAlerte }\] }

**■ Regles Metier**

**1\.** Un Agent ne voit que les donnees de son site — selecteur de site masque

**2\.** Un Directeur Regional voit une vue consolidee de tous ses sites

**3\.** Le Super Admin voit toutes les donnees de tous les sites

**4\.** Les KPIs se rafraichissent automatiquement toutes les 5 minutes (polling)

**5\.** Si hors-ligne, afficher les dernieres donnees connues avec badge 'Donnees en cache'

**SCR-004 Dashboard Directeur Regional** \[ Module: DASHBOARD \] \[ Role min: Dir. Regional \]

**■ Composants specifiques**

**Composant**

**Type**

**Validation**

**Note**

Tableau comparatif sites

Table

—

CA | Ventes | Clients | Alertes pour chaque site

Graphique courbe CA

Chart.js Line

—

Evolution CA mensuel — une courbe par site

Top 5 produits vendus

Ranked list

—

Produit, quantite totale vendue, CA genere

Top 5 parrains du mois

Ranked list

—

Parrain, nb filleuls actives, recompenses dues

Bouton Export rapport

Button

—

Declenche generation PDF/Excel (SCR-034)

**■ Appels API**

**GET /api/v1/dashboard/regional** — Vue consolidee multi-sites

Params: query: { period: 'month'|'quarter'|'year' }

Reponse: { sites: \[{ id, nom, ca, ventes, clients, alertes }\], topProduits, topParrains }

# **3\. MODULE CLIENTS**

**SCR-005 Liste des Clients** \[ Module: CLIENTS \] \[ Role min: Agent \]

**■ Wireframe**

+------------------------------------------------------------------+

| Clients \[ + Nouveau Client \] |

| \[ Rechercher par nom, tel, code \] \[Site▼\] \[Statut▼\] \[Niv.▼\] |

| ID | Nom | Tel | Site | Statut |

| TSG-0001 | BAHATI Jean-Pierre | +243 81 234 | Goma | ● ACTIF |

| TSG-0002 | KAMBALE Marie | +243 99 876 | Goma | ● ACTIF |

| TSG-0003 | MUNYANGA Patrick | +243 85 111 | Buk. | ○ EN\_COURS|

| TSG-0004 | NGABO Yvette | +243 97 555 | Kins. | ● ACTIF |

| < Prec. Page 1 / 12 Suiv. > 50 clients/page |

+------------------------------------------------------------------+

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Barre de recherche

Input search

—

Filtre temps reel sur nom, telephone, code parrain, matricule

Filtre Site

Select

—

Tous les sites | Goma | Bukavu | Kinshasa (selon droits)

Filtre Statut

Select

—

Tous | ACTIF | EN\_COURS | SUSPENDU

Filtre Niveau

Select

—

Tous | Bronze | Argent | Or | Platine

Tableau clients

Table

—

Colonnes: ID, Nom, Telephone, Site, Statut, Code parrain, Points, Niveau

Badge Statut

Badge

—

Vert ACTIF | Orange EN\_COURS | Rouge SUSPENDU | Gris ARCHIVE

Badge Niveau

Badge

—

Marron Bronze | Argent Argent | Jaune Or | Violet Platine

Bouton Nouveau Client

Button primary

—

Ouvre SCR-007 (etape 1 onboarding)

Ligne cliquable

Row

—

Clic → SCR-006 (fiche detail)

Pagination

Paginator

—

50 elements/page desktop, 25 mobile

**■ Appels API**

**GET /api/v1/clients** — Liste paginee des clients

Params: query: { siteId?, statut?, niveau?, search?, page=1, limit=50 }

Reponse: { data: \[Client\], meta: { total, page, limit, totalPages } }

**■ Regles Metier**

**1\.** Un Agent voit uniquement les clients de son site — filtrage automatique cote serveur

**2\.** La recherche porte sur: nom, prenom, telephone, code parrain, matricule externe

**3\.** Les clients ARCHIVE sont masques par defaut — filtre specifique requis

**SCR-006 Fiche Detail Client** \[ Module: CLIENTS \] \[ Role min: Agent \]

**■ Wireframe**

+------------------------------------------------------------------+

| ← Clients TSG-0001 — BAHATI Jean-Pierre \[ Modifier \] |

| \[JB\] BAHATI Jean-Pierre ● ACTIF ■ Or 2450 pts |

| +243 81 234 5678 | Goma | Code parrain: TSG-0001 |

| Matricule: NK-GOM-001-0001 | Inscrit: 12 jan. 2025 |

| \[ Infos \] \[ Onboarding \] \[ Parrainage \] \[ Achats \] \[ Points \] |

| ( Onglet Onboarding actif ) |

| ✓ Recit acheté 12/01/25 Agent: Marie K. Montant: 5000 CDF |

| ✓ Formation faite 13/01/25 Formateur: Paul B. |

| ✓ Fiche achetee 13/01/25 Agent: Marie K. Montant:10000 CDF |

| ✓ Compte active 13/01/25 |

+------------------------------------------------------------------+

**■ Composants par Onglet**

**Onglet**

**Contenu**

Informations

Prenom, nom, telephone, email, site inscription, date inscription, matricule externe (si present), notes

Onboarding

Timeline 4 etapes avec: statut (✓/en cours/en attente), date validation, agent/formateur, montant paye (recit et fiche)

Parrainage

Code parrain personnel | Parrain du client (si parraine) | Liste filleuls avec statut, date activation, points generes | Total gains

Achats

Historique achats: date, produit, quantite, montant, site, mode paiement, remise appliquee | Filtre par periode

Points

Solde actuel + niveau | Historique mouvements: date, type (ACHAT/PARRAINAGE/EXPIRATION), description, points +/-, solde apres

**■ Appels API**

**GET /api/v1/clients/:id** — Fiche complete d'un client

Params: params: { id }

Reponse: { client, onboarding: EtapeOnboarding\[\], parrainage, achats, pointsHistorique }

**PATCH /api/v1/clients/:id** — Mettre a jour un client

Params: body: { prenom?, nom?, telephone?, email?, notes? }

Reponse: { client: Client }

**■ Regles Metier**

**1\.** Le bouton 'Modifier' est visible uniquement pour Gerant et Super Admin

**2\.** Le telephone ne peut etre modifie que si aucune transaction n'y est rattachee

**3\.** Si statut EN\_COURS, afficher banniere indiquant l'etape manquante

**4\.** Le matricule externe ne peut etre renseigne qu'une seule fois (immuable apres saisie)

# **4\. MODULE ONBOARDING**

▸ Note architecture: parcours a 4 etapes sequentielles obligatoires. Chaque etape est validee cote serveur avant de permettre l'acces a l'etape suivante. Un client ne peut acheter aucun produit tant que l'etape 4 (activation) n'est pas completee.

**SCR-007 Onboarding — Etape 1: Achat du Recit** \[ Module: CLIENTS \] \[ Role min: Agent \]

**■ Wireframe**

+------------------------------------------------------------------+

| Nouveau client ●────────○────────○────────○ |

| Recit Formation Fiche Activation |

| ETAPE 1 SUR 4 — Informations personnelles & Achat du recit |

| Prenom \* \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\] Nom \* \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\] |

| Telephone \* \[+243 \_\_\_\_\_\_\_\_\_\_\_\_\_\] Email \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\] |

| Site \[Goma ▼ \] |

| Code parrain \[Optionnel \] Matricule \[Optionnel\] |

| —— Achat du Recit —————————————————————————————————————————— |

| Montant paye \* \[5 000 CDF \] Mode paiement \[Cash ▼\] |

| Numero recu \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\] |

| \[ Enregistrer & Passer a la Formation → \] |

+------------------------------------------------------------------+

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Stepper 4 etapes

Stepper UI

—

Etape active = plein, suivantes = vides, precedentes = cochees

Prenom

Input text

Requis, min 2 chars

—

Nom de famille

Input text

Requis, min 2 chars

—

Telephone

Input tel

Requis, format +243XXXXXXXXX

Verification unicite en temps reel

Email

Input email

Optionnel

—

Site

Select

Requis

Pre-rempli avec le site de l'agent connecte

Code parrain

Input text

Optionnel, format TSG-XXXX

Verification existence en temps reel

Matricule externe

Input text

Optionnel

Si fourni par le systeme tiers

Montant recit

Input number

Requis, > 0

En CDF, pre-rempli avec montant configure

Mode de paiement

Select

Requis

Cash | M-Pesa | Airtel Money | Virement

Numero recu

Input text

Requis si Mobile Money

Numero de transaction MM

Bouton Enregistrer

Button primary

Form complet

Cree le client + enregistre etape RECIT

**■ Etats de l'ecran**

▸ Telephone deja utilise: message 'Ce numero est deja enregistre' avec lien vers fiche existante

▸ Code parrain invalide: message rouge 'Code parrain introuvable'

▸ Code parrain valide: message vert 'Parrain: \[Nom du parrain\]' confirmant la liaison

▸ Soumission reussie: toast vert + redirection automatique vers SCR-008

▸ Erreur serveur: toast rouge + donnees du formulaire conservees (pas de perte de saisie)

**■ Appels API**

**POST /api/v1/clients/onboarding/recit** — Creer client + valider etape recit

Params: body: { prenom, nom, telephone, email?, siteId, codeParrain?, matriculeExterne?, montantRecit, modePaiement, numeroRecu? }

Reponse: { client: { id, codeParrain }, etape: OnboardingEtape }

**GET /api/v1/clients/check-phone/:phone** — Verifier unicite du telephone

Params: params: { phone }

Reponse: { exists: boolean, clientId? }

**GET /api/v1/parrainage/check-code/:code** — Verifier code parrain

Params: params: { code }

Reponse: { valid: boolean, parrainNom? }

**■ Regles Metier**

**1\.** Le telephone est l'identifiant primaire du client — unicite stricte dans toute la base

**2\.** Si code parrain fourni, la relation parrain/filleul est creee immediatement (statut EN\_ATTENTE)

**3\.** La recompense du parrain n'est declenchee qu'apres l'etape 4 (activation complete)

**4\.** Un client ne peut pas se parrainer lui-meme (verification cote serveur)

**5\.** Le matricule externe, s'il est fourni, est verifie pour unicite avant enregistrement

**SCR-008 Onboarding — Etape 2: Validation Formation** \[ Module: CLIENTS \] \[ Role min: Formateur \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Info client

Display card

—

Nom, telephone, site — lecture seule

Stepper

Stepper

—

Etape 2 active, etape 1 cochee

Nom du formateur

Input text

Requis

Pre-rempli avec le nom de l'utilisateur connecte

Date de formation

Date picker

Requis

Aujourd'hui par defaut, date future interdite

Notes de formation

Textarea

Optionnel, max 300 chars

—

Case confirmation

Checkbox

Requis

'Je certifie que ce client a suivi la formation'

Bouton Valider

Button primary

Checkbox coche

Enregistre etape FORMATION

**■ Appels API**

**POST /api/v1/clients/:id/onboarding/formation** — Valider la formation

Params: params: { id } | body: { formateurId, dateFormation, dureeMinutes?, notes? }

Reponse: { etape: OnboardingEtape, nextStep: 'fiche' }

**■ Regles Metier**

**1\.** Seuls les utilisateurs avec role FORMATEUR ou GERANT peuvent valider cette etape

**2\.** La formation ne peut etre validee que si l'etape RECIT est deja completee

**3\.** Un formateur ne peut valider que des clients de son site

**SCR-009 Onboarding — Etape 3: Achat de la Fiche** \[ Module: CLIENTS \] \[ Role min: Agent \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Info client

Display card

—

Resume onboarding: recit ✓, formation ✓

Stepper

Stepper

—

Etape 3 active

Montant fiche

Input number

Requis, > 0

En CDF, pre-rempli avec montant configure

Mode de paiement

Select

Requis

Cash | M-Pesa | Airtel Money | Virement

Numero transaction

Input text

Requis si Mobile Money

Numero de transaction

Bouton Valider

Button primary

Form complet

Enregistre etape FICHE

**■ Appels API**

**POST /api/v1/clients/:id/onboarding/fiche** — Valider l'achat de la fiche

Params: params: { id } | body: { montantFiche, modePaiement, numeroTransaction? }

Reponse: { etape: OnboardingEtape, nextStep: 'activation' }

**SCR-010 Onboarding — Etape 4: Activation du Compte** \[ Module: CLIENTS \] \[ Role min: Agent \]

**■ Wireframe**

+------------------------------------------------------------------+

| ETAPE 4 SUR 4 — Activation du compte |

| ✓ Recit achete ✓ Formation validee ✓ Fiche achetee |

| RECAPITULATIF |

| Nom : BAHATI Jean-Pierre |

| Telephone : +243 81 234 5678 |

| Parrain : MASUDI Serge (TSG-0005) — Lie |

| Recit paye: 5 000 CDF — Cash |

| Fiche paye: 10 000 CDF — Airtel Money #MM12345 |

| Total paye: 15 000 CDF |

| Code parrain genere: TSG-0128 |

| \[ ✓ ACTIVER LE COMPTE ET GENERER LE CODE PARRAIN \] |

+------------------------------------------------------------------+

**■ Appels API**

**POST /api/v1/clients/:id/onboarding/activate** — Activer le compte client

Params: params: { id }

Reponse: { client: { id, statut: 'ACTIF', codeParrain }, parrainRecompense? }

**■ Regles Metier**

**1\.** L'activation n'est possible que si les 3 etapes precedentes sont toutes COMPLETE

**2\.** A l'activation: generer un code parrain unique format TSG-XXXX (incremental par site)

**3\.** Si un parrain existe: creer le Parrainage en statut VALIDE et declencher calcul recompense

**4\.** Envoyer un SMS de bienvenue au nouveau client avec son code parrain (si SMS configure)

**5\.** Le client passe au statut ACTIF — il peut desormais acheter des produits

**SCR-011 Import de Matricules Externes** \[ Module: CLIENTS \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Zone upload CSV

File input

Fichier .csv max 5MB

Format attendu: matricule, telephone

Bouton Previsualiser

Button

Fichier selectionne

Affiche les 10 premieres lignes

Tableau previsualisation

Table

—

Matricule | Telephone | Client trouve | Statut import

Badge statut ligne

Badge

—

Vert=trouve | Orange=non trouve | Rouge=erreur format

Bouton Importer

Button primary

Previ. valide

Lance l'import complet

Rapport post-import

Display

—

X importes | Y non trouves | Z erreurs

**■ Appels API**

**POST /api/v1/clients/import/preview** — Previsualiser le CSV

Params: body: FormData { file: File }

Reponse: { preview: \[{ matricule, telephone, clientId?, statut }\], total }

**POST /api/v1/clients/import/execute** — Lancer l'import

Params: body: FormData { file: File }

Reponse: { imported, notFound, errors, details: \[\] }

# **5\. MODULE VENTES**

**SCR-012 Interface de Caisse (POS)** \[ Module: VENTES \] \[ Role min: Agent \]

**■ Wireframe**

+------------------------------------------------------------------+

| CAISSE — Goma Vendeur: Jean-Pierre |

| \[ Rechercher un produit par nom ou SKU... \] |

| +----------------------------+ +----------------------------+ |

| | Samsung A54 — 450 000 CDF | | PANIER | |

| | Stock: 12 unites \[+\] | | Samsung A54 x1 | |

| | Chargeur 65W — 28000 \[+\] | | 450 000 CDF \[-\]\[+\] | |

| +----------------------------+ | ———————————————————————— | |

| | Client: BAHATI J.P. | |

| CLIENT | Pts: 2450 | Or | |

| \[ Rechercher client... \] | Remise: -22 500 CDF | |

| > BAHATI J.P. (ACTIF) | ———————————————————————— | |

| | TOTAL: 427 500 CDF | |

| | \[Cash\]\[M-Pesa\]\[Virement\] | |

| | \[ VALIDER LA VENTE \] | |

| +----------------------------+ |

+------------------------------------------------------------------+

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Recherche produit

Input search

—

Par nom ou SKU, resultats temps reel (debounce 300ms)

Carte produit

Card

—

Nom, SKU, prix, stock disponible sur ce site, bouton \[+\]

Panier — liste articles

List

—

Article, quantite avec \[-\]\[+\], prix unitaire, sous-total ligne

Recherche client

Input search

—

Par nom ou telephone, seulement clients ACTIFS

Carte client selectionne

Card

—

Nom, statut, points fidelite, niveau, remise applicable

Badge remise fidelite

Badge vert

—

Montant de la remise calculee selon le niveau

Selecteur mode paiement

Button group

Requis

Cash | M-Pesa | Airtel Money | Virement

Champ montant recu

Input number

Requis Cash

Calcule automatiquement la monnaie a rendre

Champ reference MM

Input text

Requis Mobile Money

Numero de transaction Mobile Money

Bouton Valider la vente

Button primary

Panier non vide + paiement

Cree la vente et met a jour le stock

**■ Etats de l'ecran**

▸ Panier vide: message 'Ajouter des produits pour commencer une vente'

▸ Stock insuffisant: badge rouge sur produit + bouton \[+\] desactive si stock=0

▸ Client non selectionne: avertissement 'Vente sans client — points non attribues'

▸ Vente validee: modal confirmation → impression recu → panier vide automatiquement

▸ Hors-ligne: vente enregistree localement avec sync differee, badge 'En attente sync'

**■ Appels API**

**GET /api/v1/produits/search** — Recherche produits

Params: query: { q, siteId, limit: 10 }

Reponse: { produits: \[{ id, sku, nom, prixVente, stockDisponible }\] }

**GET /api/v1/clients/search** — Recherche client pour caisse

Params: query: { q, statut: 'ACTIF' }

Reponse: { clients: \[{ id, nom, telephone, pointsFidelite, niveauFidelite, remiseApplicable }\] }

**POST /api/v1/ventes** — Creer une vente

Params: body: { clientId?, siteId, lignes: \[{ produitId, quantite }\], modePaiement, appliquerRemiseFidelite }

Reponse: { vente, pointsAttribues?, remiseAppliquee?, recuId }

**■ Regles Metier**

**1\.** Stock verifie cote serveur a la validation — erreur 409 si insuffisant

**2\.** Remise fidelite: Bronze=0%, Argent=3%, Or=5%, Platine=8% — configurable dans SCR-029

**3\.** Remises fidelite et bons parrainage non cumulables par defaut

**4\.** Points attribues uniquement si client ACTIF selectionne (vente anonyme = 0 points)

**5\.** Ratio points: 1 point pour 1 000 CDF depenses (arrondi inferieur) — configurable

**6\.** Vente hors-ligne: stockee dans IndexedDB, synchronisee a la reconnexion

**SCR-013 Historique des Ventes** \[ Module: VENTES \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Filtre date

Date range picker

—

Aujourd'hui | Cette semaine | Ce mois | Personnalise

Filtre site

Select

—

Selon droits de l'utilisateur

Tableau ventes

Table

—

N° vente, Date, Client, Montant CDF, Mode paiement, Agent, Site

Bouton Export

Button

—

Export CSV ou PDF de la liste filtree

Total periode

Stat card

—

Somme des ventes de la periode filtree

**■ Appels API**

**GET /api/v1/ventes** — Liste des ventes

Params: query: { siteId?, dateDebut?, dateFin?, modePaiement?, page=1, limit=50 }

Reponse: { ventes: \[Vente\], meta: { total, totalMontant, page } }

**SCR-014 Detail d'une Vente** \[ Module: VENTES \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

En-tete vente

Display

—

N° vente, date, agent, site, statut (VALIDE / RETOURNEE / ANNULEE)

Client

Display card

—

Nom, telephone, niveau fidelite (si vente avec client)

Lignes de vente

Table

—

Produit, SKU, quantite, prix unitaire, sous-total

Recapitulatif

Display

—

Sous-total, remise fidelite, remise parrainage, TOTAL

Paiement

Display

—

Mode paiement, reference MM si applicable, monnaie rendue

Bouton Imprimer recu

Button

—

Ouvre SCR-015

Bouton Initier retour

Button

—

Visible si vente < 7 jours — ouvre SCR-016

**■ Appels API**

**GET /api/v1/ventes/:id** — Detail d'une vente

Params: params: { id }

Reponse: { vente: VenteDetail avec lignes, client, paiement }

**SCR-015 Recu / Facture** \[ Module: VENTES \] \[ Role min: Agent \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

En-tete recu

Display

—

Logo TechShop, nom site, adresse, date/heure, N° recu

Info client

Display

—

Nom du client (ou 'Client anonyme')

Tableau articles

Table

—

Produit, quantite, prix unitaire, sous-total

Totaux

Display

—

Sous-total, remise (si applicable), TOTAL TTC

Paiement

Display

—

Mode de paiement, reference, monnaie rendue

Bouton Imprimer

Button

—

@media print + envoi vers imprimante thermique 80mm

Bouton Partager SMS

Button

—

Envoie le recapitulatif par SMS au client

**■ Appels API**

**POST /api/v1/ventes/:id/sms-recu** — Envoyer recu par SMS

Params: params: { id } | body: { telephone }

Reponse: { success, messageId? }

**SCR-016 Retours et Avoirs** \[ Module: VENTES \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Ref. vente originale

Display card

—

N° vente, date, client, montant

Articles retournes

Checklist

Requis

Selectionner les articles retournes + quantites

Motif du retour

Select + Textarea

Requis

Defectueux | Mauvaise taille | Erreur commande | Autre

Mode remboursement

Select

Requis

Cash | Avoir credit compte | M-Pesa

Bouton Valider retour

Button primary

Form complet

Cree l'avoir et remet le stock

**■ Appels API**

**POST /api/v1/ventes/:id/retour** — Enregistrer un retour

Params: body: { lignes: \[{ produitId, quantite }\], motif, modeRemboursement }

Reponse: { avoir, stockRemis: boolean }

**■ Regles Metier**

**1\.** Un retour n'est possible que dans les 7 jours suivant la vente (configurable)

**2\.** Seul un Gerant ou Super Admin peut initier un retour

**3\.** Les points de fidelite attribues sont deduits au prorata du retour

**4\.** Le stock est remis automatiquement sur le site de vente original

# **6\. MODULE STOCKS**

**SCR-017 Inventaire par Site** \[ Module: STOCKS \] \[ Role min: Agent \]

**■ Wireframe**

+------------------------------------------------------------------+

| Stocks \[Goma▼\] \[ + Entree \] \[ Transfert \] |

| \[ Rechercher produit \] \[Categorie▼\] \[Statut stock▼\] |

| SKU | Nom produit | Cat. | Prix | Stock | Stat |

| SAM-A54 | Samsung Galaxy A54 | Phone | 450 000 | 12 | OK |

| APL-14 | iPhone 14 | Phone | 1200000 | 2 | ⚠️ |

| JBL-T110 | Ecouteurs JBL T110 | Audio | 35 000 | 45 | OK |

| CHG-65W | Chargeur rapide 65W | Acces | 28 000 | 0 | 🔴 |

| Legende: OK | ⚠️ ALERTE (< seuil) | 🔴 RUPTURE (= 0) |

+------------------------------------------------------------------+

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Selecteur de site

Select

—

Filtre l'inventaire par site (selon droits)

Recherche produit

Input

—

Par nom ou SKU

Filtre categorie

Select

—

Tous | Smartphones | Accessoires | Audio | Informatique

Filtre statut

Select

—

Tous | OK | ALERTE | RUPTURE

Tableau inventaire

Table

—

SKU, Nom, Categorie, Prix vente, Stock, Seuil alerte, Statut

Badge statut stock

Badge

—

Vert OK | Orange ALERTE | Rouge RUPTURE

Bouton Entree de stock

Button

—

Ouvre SCR-019

Bouton Transfert

Button

—

Ouvre SCR-020

**■ Appels API**

**GET /api/v1/stocks** — Inventaire filtre

Params: query: { siteId, categorie?, statut?, search?, page=1, limit=50 }

Reponse: { stocks: \[{ produit, siteId, quantite, seuilAlerte, statut }\], meta }

**■ Regles Metier**

**1\.** Un Agent voit uniquement le stock de son site — selecteur masque

**2\.** Statut calcule: OK si stock > seuil, ALERTE si 0 < stock ≤ seuil, RUPTURE si stock = 0

**3\.** Lignes ALERTE en fond orange, RUPTURE en fond rouge

**SCR-018 Detail Produit — Stock** \[ Module: STOCKS \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Infos produit

Display card

—

SKU, nom, description, categorie, prix vente, prix achat

Stock par site

Table

—

Site | Stock actuel | Seuil alerte | Statut | Derniere MaJ

Historique mouvements

Table filtree

—

Date, type mouvement, quantite, reference, agent, site

Filtre mouvements

Select + Date range

—

Type: ENTREE | SORTIE\_VENTE | TRANSFERT | INVENTAIRE

Bouton Modifier seuil

Button

Gerant

Modifier le seuil d'alerte pour ce site

**■ Appels API**

**GET /api/v1/produits/:id/stocks** — Stock par site pour un produit

Params: params: { id }

Reponse: { produit, stocksBySite: \[{ siteId, siteNom, quantite, seuilAlerte, statut }\] }

**PATCH /api/v1/stocks/:siteId/:produitId/seuil** — Modifier seuil d'alerte

Params: params: { siteId, produitId } | body: { seuilAlerte: number }

Reponse: { stockSite }

**SCR-019 Entree de Stock** \[ Module: STOCKS \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Site destinataire

Select

Requis

Site de reception

Produit

Search + Select

Requis

Recherche par SKU ou nom

Quantite recue

Input number

Requis, > 0

Quantite entrante

Reference fournisseur

Input text

Optionnel

N° bon de livraison

Date reception

Date picker

Requis

Aujourd'hui par defaut

Notes

Textarea

Optionnel

Max 200 chars

Bouton Enregistrer

Button primary

Form complet

Cree le mouvement ENTREE

**■ Appels API**

**POST /api/v1/stocks/entree** — Enregistrer une entree de stock

Params: body: { siteId, produitId, quantite, referenceFournisseur?, dateReception, notes? }

Reponse: { mouvement: MouvementStock, stockApres: number }

**SCR-020 Transfert Inter-Sites** \[ Module: STOCKS \] \[ Role min: Gerant \]

**■ Wireframe**

+------------------------------------------------------------------+

| Transfert de stock |

| Site source : \[Goma ▼\] Site destination: \[Bukavu ▼\] |

| Produit : \[ Samsung Galaxy A54 (Stock Goma: 12) \] |

| Quantite : \[5 \] |

| Motif : \[Reapprovisionnement Bukavu \] |

| Recap: Samsung A54: Goma (12→7) | Bukavu (3→8) |

| \[ INITIER LE TRANSFERT — Notif. envoyee a Bukavu \] |

+------------------------------------------------------------------+

**■ Appels API**

**POST /api/v1/stocks/transfert** — Initier un transfert

Params: body: { siteSourceId, siteDestinationId, produitId, quantite, motif? }

Reponse: { transfert: { id, statut: 'EN\_TRANSIT' }, stockSourceApres: number }

**SCR-021 Validation Reception Transfert** \[ Module: STOCKS \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Detail transfert

Display card

—

Expediteur, produit, quantite envoyee, date expedition

Quantite reellement recue

Input number

Requis

Pour signaler des ecarts

Observations

Textarea

Si ecart

Explication d'un ecart

Bouton Confirmer

Button primary

—

Valide transfert, met a jour stock destination

Bouton Signaler probleme

Button secondary

—

Ouvre formulaire signalement

**■ Appels API**

**PATCH /api/v1/stocks/transfert/:id/recevoir** — Valider la reception

Params: params: { id } | body: { quantiteRecue, observations? }

Reponse: { transfert: { statut: 'RECU' }, stockDestinationApres: number, ecart? }

**■ Regles Metier**

**1\.** Seul le Gerant du site destinataire peut valider la reception

**2\.** Le stock source est decremente a l'INITIATION du transfert

**3\.** Le stock destination est incremente a la VALIDATION de reception seulement

**4\.** Un transfert non valide apres 72h declenche une alerte automatique

**SCR-022 Alertes et Seuils Stock** \[ Module: STOCKS \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Liste alertes actives

Table

—

Produit, site, stock actuel, seuil, type alerte, depuis quand

Bouton Commander

Button

—

Marque l'alerte comme 'En cours de commande'

Bouton Modifier seuil

Button

—

Modifier le seuil directement depuis la liste

**■ Appels API**

**GET /api/v1/stocks/alertes** — Liste des alertes stock

Params: query: { siteId?, type?: 'ALERTE'|'RUPTURE' }

Reponse: { alertes: \[{ produit, site, stockActuel, seuilAlerte, type, depuis }\] }

**SCR-023 Inventaire Physique** \[ Module: STOCKS \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Selecteur site

Select

Requis

Site a inventorier

Liste produits a compter

Table editable

—

SKU, Nom, Stock systeme, Stock compte (input), Ecart auto

Barre de progression

Progress bar

—

X produits comptes / Total

Bouton Valider inventaire

Button primary

Tous produits comptes

Cree les ajustements

**■ Appels API**

**POST /api/v1/stocks/inventaire** — Soumettre l'inventaire physique

Params: body: { siteId, dateInventaire, lignes: \[{ produitId, quantiteComptee }\] }

Reponse: { ajustements: \[{ produit, avant, apres, ecart }\], totalAjustements }

# **7\. MODULE PARRAINAGE**

**SCR-024 Vue Globale Parrainage** \[ Module: PARRAINAGE \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

KPI — Parrainages actifs

Stat card

—

Total relations parrain/filleul actives

KPI — Recompenses versees

Stat card

—

Recompenses distribuees sur la periode

KPI — Meilleur parrain

Stat card

—

Client avec le plus de filleuls actives ce mois

Tableau parrainages recents

Table

—

Parrain, filleul, date, statut badge

Badge statut parrainage

Badge

—

Gris EN\_ATTENTE | Bleu VALIDE | Vert RECOMPENSE\_VERSEE

**■ Appels API**

**GET /api/v1/parrainage/stats** — Statistiques parrainage

Params: query: { siteId?, period }

Reponse: { actifs, recompensesVersees, meilleurParrain: { nom, nbFilleuls } }

**GET /api/v1/parrainage** — Liste des parrainages

Params: query: { siteId?, statut?, page=1, limit=50 }

Reponse: { parrainages: \[{ parrain, filleul, dateCreation, statut, recompense? }\] }

**SCR-025 Arbre de Parrainage Client** \[ Module: PARRAINAGE \] \[ Role min: Agent \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

En-tete client

Display card

—

Nom, code parrain, total filleuls, gains parrainage cumules

Visualisation arbre

SVG tree

—

Noeud central=client, branches=filleuls, couleurs selon statut

Tooltip noeud

Tooltip

—

Hover: nom, statut, date activation, points generes pour le parrain

Tableau filleuls

Table

—

Nom, statut, date activation, points generes, recompense attribuee

Parrain du client

Display

—

Si ce client est filleul: afficher son parrain en haut

**■ Appels API**

**GET /api/v1/parrainage/tree/:clientId** — Arbre de parrainage

Params: query: { niveaux: 1|2 }

Reponse: { client, parrain?, filleuls: \[{ client, filleuls: \[\] }\], totalGains }

**SCR-026 Configuration des Recompenses Parrainage** \[ Module: PARRAINAGE \] \[ Role min: Super Admin \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Toggle multi-niveaux

Switch

—

Activer/desactiver le parrainage a 2 niveaux

Type de recompense

Select

Requis

POINTS | REMISE\_PROCHAINE\_VENTE | COMMISSION\_CDF

Valeur recompense N1

Input number

Requis

Ex: 500 pts, 5%, ou 2000 CDF

Valeur recompense N2

Input number

Si multi-niveaux

Ex: 200 pts (parrain du parrain)

Condition declenchement

Select

—

A l'activation filleul | Au premier achat filleul

Plafond mensuel

Input number

Optionnel

Max recompenses par mois par parrain

**■ Appels API**

**GET /api/v1/parrainage/config** — Lire la configuration parrainage

Params: —

Reponse: { regleParrainage }

**PUT /api/v1/parrainage/config** — Mettre a jour la configuration

Params: body: { typeRecompense, valeurNiveau1, valeurNiveau2?, multiNiveaux, conditionDeclenchement, plafondMensuel? }

Reponse: { regleParrainage }

# **8\. MODULE FIDELITE**

**SCR-027 Programme de Fidelite** \[ Module: FIDELITE \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Tableau des niveaux

Table

—

Niveau, seuil points, remise %, avantages, couleur badge

Top 10 clients fideles

Ranked list

—

Rang, nom, niveau badge, points, dernier achat

Historique attributions

Table

—

Date, client, montant achat, points attribues, solde apres

Stat — Points distribues

Stat card

—

Total points attribues sur la periode

Stat — Remises accordees

Stat card

—

Total remises fidelite accordees en CDF

**■ Appels API**

**GET /api/v1/fidelite/stats** — Statistiques fidelite

Params: query: { siteId?, period }

Reponse: { pointsDistribues, remisesAccordees, repartitionNiveaux }

**GET /api/v1/fidelite/top-clients** — Top clients fideles

Params: query: { siteId?, limit: 10 }

Reponse: { clients: \[{ id, nom, niveau, points, dernierAchat }\] }

**SCR-028 Historique Points d'un Client** \[ Module: FIDELITE \] \[ Role min: Agent \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

En-tete client

Display card

—

Nom, niveau actuel, solde points, prochaine recompense a X pts

Barre progression niveau

Progress bar

—

Points actuels / seuil prochain niveau

Tableau historique

Table

—

Date, type (ACHAT/PARRAINAGE/REMISE/EXPIRATION), delta pts, solde

Couleur delta

Texte colore

—

Vert si +points, Rouge si -points

**■ Appels API**

**GET /api/v1/fidelite/client/:clientId** — Historique points client

Params: query: { type?, page=1, limit=30 }

Reponse: { solde, niveau, progressionProchainNiveau, historique: \[MouvementPoints\] }

**SCR-029 Configuration Niveaux de Fidelite** \[ Module: FIDELITE \] \[ Role min: Super Admin \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Tableau niveaux editables

Table editable

—

4 lignes: Bronze/Argent/Or/Platine — seuils et remises modifiables

Ratio points/CDF

Input number

Requis

Ex: 1 point par 1000 CDF

Duree validite points

Input number

Optionnel

En mois, 0 = jamais expirent

Cumul remises

Toggle

—

Autoriser cumul fidelite + parrainage

Bouton Sauvegarder

Button primary

—

Sauvegarde + recalcul niveaux en arriere-plan

**■ Appels API**

**PUT /api/v1/fidelite/config** — Mettre a jour la configuration fidelite

Params: body: { ratioPtsCDF, niveaux: \[{ nom, seuilPts, remisePct }\], dureeValiditeMois?, cumulRemises }

Reponse: { config: FideliteConfig, affectedClients: number }

# **9\. MODULE RAPPORTS**

**SCR-030 Rapports Dashboard** \[ Module: RAPPORTS \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Selecteur periode

Select + date range

—

Ce mois | Dernier mois | Ce trimestre | Personnalise

Graphique courbe CA

Chart.js Line

—

CA quotidien/hebdomadaire selon periode, par site

Graphique camembert

Chart.js Doughnut

—

Repartition par site en CDF et %

Tableau resume par site

Table

—

Site | CA | Ventes | Clients nouveaux | Alertes stock

Top 5 produits

Chart.js Bar

—

Par quantite vendue

**■ Appels API**

**GET /api/v1/rapports/ventes** — Donnees rapport ventes

Params: query: { siteId?, dateDebut, dateFin, granularite: 'day'|'week'|'month' }

Reponse: { seriesCA, totalCA, nbVentes, topProduits, parSite }

**SCR-031 Rapport Ventes Detaille** \[ Module: RAPPORTS \] \[ Role min: Dir. Regional \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Filtres avances

Multi-select

—

Site, agent, produit, categorie, mode paiement, periode

Tableau detaille

Table exportable

—

Chaque vente: date, N°, client, agent, produits, montant

Totaux par agent

Sous-tableau

—

Agent | Nb ventes | CA total | Remises accordees

**■ Appels API**

**GET /api/v1/rapports/ventes/detail** — Rapport ventes detaille

Params: query: { siteId?, agentId?, dateDebut, dateFin, page=1 }

Reponse: { ventes: \[VenteDetail\], totauxParAgent, grandTotal }

**SCR-032 Rapport Stocks Multi-Sites** \[ Module: RAPPORTS \] \[ Role min: Dir. Regional \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Tableau consolide

Table

—

Produit | Stock Goma | Stock Bukavu | Stock Kinshasa | Total | Valeur

Produits rupture

Alert list

—

Produits en rupture sur au moins un site

Valeur totale inventaire

Stat card

—

Somme prix achat x stock tous produits tous sites

**■ Appels API**

**GET /api/v1/rapports/stocks** — Rapport stocks consolide

Params: query: { dateDebut?, dateFin? }

Reponse: { produitsConsolides, valeurTotale, ruptures }

**SCR-033 Rapport Parrainage** \[ Module: RAPPORTS \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Top parrains

Ranked table

—

Rang, nom, nb filleuls, recompenses, CA genere par filleuls

Funnel conversion onboarding

Funnel chart

—

Recits vendus → Formations → Fiches → Activations (taux)

Recompenses dues

Table

—

Parrains avec recompenses VALIDE non encore versees

**■ Appels API**

**GET /api/v1/rapports/parrainage** — Rapport parrainage

Params: query: { siteId?, dateDebut, dateFin }

Reponse: { topParrains, funnel, recompensesDues }

**SCR-034 Export Excel / PDF** \[ Module: RAPPORTS \] \[ Role min: Gerant \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Type de rapport

Select

Requis

Ventes | Stocks | Parrainage | Fidelite | Clients

Format export

Radio

Requis

XLSX | PDF | CSV

Barre de progression

Progress bar

—

Visible pendant generation

Bouton Telecharger

Button primary

Generation terminee

Declenche le telechargement

**■ Appels API**

**POST /api/v1/rapports/export** — Generer un export

Params: body: { type, format, filtres: {} }

Reponse: { jobId } — puis polling GET /api/v1/rapports/export/:jobId

**GET /api/v1/rapports/export/:jobId** — Statut et URL de l'export

Params: params: { jobId }

Reponse: { statut: 'PENDING'|'READY'|'ERROR', downloadUrl? }

# **10\. MODULE PORTAIL CLIENT**

**SCR-035 Portail Client — Accueil** \[ Module: PORTAIL \] \[ Role min: Client \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Salutation

Display

—

'Bonjour \[Prenom\]' + niveau fidelite badge

Carte points

Stat card

—

Solde points actuel + barre vers prochain niveau

Code parrain

Display card

—

Code personnel + compteur filleuls actifs

Derniers achats

Mini-list

—

3 derniers achats avec date et montant

**■ Appels API**

**GET /api/v1/portal/me** — Donnees du portail client

Params: Authorization: Bearer <clientToken>

Reponse: { client, soldePoints, niveau, filleulsActifs, dernierAchats }

**SCR-036 Portail Client — Mes Achats** \[ Module: PORTAIL \] \[ Role min: Client \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Liste achats

Table

—

Date, produits, montant total, points gagnes, mode paiement

Filtre periode

Select

—

Ce mois | 3 derniers mois | Tout

Total depense

Stat card

—

Somme sur la periode filtree

**SCR-037 Portail Client — Mes Points** \[ Module: PORTAIL \] \[ Role min: Client \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Solde + badge niveau

Stat card

—

Points actuels et badge Bronze/Argent/Or/Platine

Barre progression

Progress bar

—

Points actuels vs seuil prochain niveau

Tableau niveaux

Table

—

Tous les niveaux avec seuils et avantages

Historique mouvements

Table

—

Date, description, +/- points, solde apres

**SCR-038 Portail Client — Mes Filleuls** \[ Module: PORTAIL \] \[ Role min: Client \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Mon code parrain

Display card

—

Code unique a partager, bouton copier

Stats

Stat cards

—

Filleuls totaux | Filleuls actifs | Gains totaux parrainage

Liste filleuls

Table

—

Prenom/nom, date activation, statut, points generes

Recompenses recues

Table

—

Date, type recompense, valeur, statut (verse/en attente)

**■ Appels API**

**GET /api/v1/portal/filleuls** — Filleuls du client connecte

Params: Authorization: Bearer <clientToken>

Reponse: { filleuls: \[{ prenom, dateActivation, statut, pointsGeneres }\], totalGains }

# **11\. MODULE PARAMETRES**

**SCR-039 Gestion des Utilisateurs** \[ Module: PARAMETRES \] \[ Role min: Super Admin \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Tableau utilisateurs

Table

—

Nom, role badge, site assigne, statut, derniere connexion

Bouton Creer utilisateur

Button primary

—

Modal: nom, telephone, role, site, MDP temporaire

Bouton Desactiver

Button danger

—

Revoque l'acces sans supprimer les donnees

Bouton Reinit. MDP

Button

—

Genere et envoie MDP temporaire par SMS

**■ Appels API**

**GET /api/v1/users** — Liste des utilisateurs

Params: query: { role?, siteId?, actif? }

Reponse: { users: \[User\] }

**POST /api/v1/users** — Creer un utilisateur

Params: body: { nom, telephone, role, siteId, passwordTemp }

Reponse: { user, smsSent: boolean }

**PATCH /api/v1/users/:id/desactiver** — Desactiver un utilisateur

Params: params: { id }

Reponse: { user: { actif: false } }

**SCR-040 Gestion des Sites** \[ Module: PARAMETRES \] \[ Role min: Super Admin \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Liste sites

Table

—

Nom, ville, adresse, statut, nb utilisateurs, gerant actuel

Bouton Creer site

Button primary

—

Modal: nom, ville, adresse

Bouton Configurer

Button

—

Modifier nom, adresse, gerant assigne, statut

**■ Appels API**

**GET /api/v1/sites** — Liste des sites

Params: —

Reponse: { sites: \[Site avec stats\] }

**POST /api/v1/sites** — Creer un site

Params: body: { nom, ville, adresse, gerantId? }

Reponse: { site }

**SCR-041 Profil Utilisateur** \[ Module: PARAMETRES \] \[ Role min: Agent \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Infos personnelles

Form

—

Nom, telephone, email

Changement MDP

Form

—

Ancien MDP + Nouveau + Confirmation

Langue interface

Select

—

Francais (defaut) | Swahili (si disponible)

Statut connexion

Display

—

Derniere connexion, site actuel

**■ Appels API**

**PATCH /api/v1/users/me** — Mettre a jour son profil

Params: body: { nom?, email?, langue? }

Reponse: { user }

**PATCH /api/v1/users/me/password** — Changer son mot de passe

Params: body: { currentPassword, newPassword }

Reponse: { success: boolean }

**SCR-042 Configuration Generale** \[ Module: PARAMETRES \] \[ Role min: Super Admin \]

**■ Composants**

**Composant**

**Type**

**Validation**

**Note**

Integration SMS

Form

—

API Key Africa's Talking, Sender ID

Integration matricule ext.

Toggle + Form

—

Activer/desactiver, format attendu (regex)

Duree session

Select

—

8h | 12h | 24h

Politiques de retour

Form

—

Delai max retour (jours), frais retour %

Sauvegarde

Display

—

Derniere sauvegarde + bouton telecharger backup manuel

**■ Appels API**

**GET /api/v1/config** — Lire la configuration

Params: —

Reponse: { config: AppConfig }

**PUT /api/v1/config** — Mettre a jour la configuration

Params: body: Partial<AppConfig>

Reponse: { config: AppConfig }

# **12\. MODELES DE DONNEES PRINCIPAUX**

## **12.1 Entite Client**

**Champ**

**Type**

**Requis**

**Description**

**id**

UUID

Oui

Identifiant unique interne (auto-genere)

**prenom**

String

Oui

Prenom du client

**nom**

String

Oui

Nom de famille

**telephone**

String

Oui

Format +243XXXXXXXXX — UNIQUE dans toute la base

**email**

String

Non

Email optionnel — UNIQUE si fourni

**matriculeExterne**

String

Non

Importe du systeme tiers — UNIQUE si fourni, immuable

**codeParrain**

String

Auto

Format TSG-XXXX — genere a l'activation — UNIQUE

**statut**

Enum

Oui

EN\_COURS | ACTIF | SUSPENDU | ARCHIVE

**siteInscriptionId**

UUID FK

Oui

Site ou le client a ete enregistre

**parrainId**

UUID FK

Non

Client qui a parraine ce client (relation 1:1)

**pointsFidelite**

Integer

Auto

Solde de points actuel

**niveauFidelite**

Enum

Auto

BRONZE | ARGENT | OR | PLATINE (calcule)

**pointsCumules**

Integer

Auto

Total points accumules depuis inscription (pour niveaux)

**dateInscription**

Timestamp

Auto

Date de creation du profil

**dateActivation**

Timestamp

Non

Date de l'etape ACTIVATION completee

**createdBy**

UUID FK

Oui

Agent qui a cree le profil

## **12.2 Entite OnboardingEtape**

**Champ**

**Type**

**Requis**

**Description**

id

UUID

Oui

—

clientId

UUID FK

Oui

Client concerne

etape

Enum

Oui

RECIT | FORMATION | FICHE | ACTIVATION

statut

Enum

Oui

COMPLETE | EN\_COURS | EN\_ATTENTE

completeeAt

Timestamp

Non

Date de completion de l'etape

agentId

UUID FK

Oui

Utilisateur qui a valide l'etape

siteId

UUID FK

Oui

Site ou l'etape a ete validee

montant

Decimal

Non

Montant paye (pour RECIT et FICHE uniquement) en CDF

modePaiement

Enum

Non

CASH | MPESA | AIRTEL\_MONEY | VIREMENT

referenceTransaction

String

Non

Numero Mobile Money si applicable

notes

String

Non

Notes du formateur (etape FORMATION uniquement)

## **12.3 Entite Vente**

**Champ**

**Type**

**Requis**

**Description**

id

UUID

Oui

—

numeroVente

String

Oui

Format: {SITE}-{ANNEE}{MOIS}-{SEQ} ex: GOM-202501-0047

clientId

UUID FK

Non

Client associe (null si vente anonyme)

siteId

UUID FK

Oui

Site de la vente

agentId

UUID FK

Oui

Agent qui a effectue la vente

statut

Enum

Oui

VALIDE | RETOURNEE\_PARTIELLE | RETOURNEE | ANNULEE

montantBrut

Decimal

Oui

Sous-total avant remises en CDF

remiseFidelite

Decimal

Auto

Remise fidelite appliquee en CDF

montantNet

Decimal

Auto

Montant final paye (montantBrut - remises)

modePaiement

Enum

Oui

CASH | MPESA | AIRTEL\_MONEY | VIREMENT

referenceTransaction

String

Non

Numero Mobile Money

pointsAttribues

Integer

Auto

Points fidelite attribues sur cette vente

syncStatus

Enum

Auto

SYNCED | PENDING | CONFLICT

createdAt

Timestamp

Auto

—

## **12.4 Entite MouvementStock**

**Champ**

**Type**

**Requis**

**Description**

id

UUID

Oui

—

produitId

UUID FK

Oui

Produit concerne

siteId

UUID FK

Oui

Site concerne

type

Enum

Oui

ENTREE | SORTIE\_VENTE | TRANSFERT\_DEPART | TRANSFERT\_ARRIVEE | AJUSTEMENT\_INVENTAIRE

quantite

Integer

Oui

Quantite du mouvement (positif = entree, negatif = sortie)

quantiteAvant

Integer

Oui

Stock avant le mouvement

quantiteApres

Integer

Oui

Stock apres le mouvement

reference

String

Non

N° vente, N° BL fournisseur, ou N° transfert

agentId

UUID FK

Oui

Utilisateur qui a effectue le mouvement

createdAt

Timestamp

Auto

—

## **12.5 Entite Parrainage**

**Champ**

**Type**

**Requis**

**Description**

id

UUID

Oui

—

parrainId

UUID FK

Oui

Client parrain

filleulId

UUID FK

Oui

Client filleul — UNIQUE (un seul parrain possible)

niveau

Integer

Oui

1 = parrain direct, 2 = parrain du parrain

statut

Enum

Oui

EN\_ATTENTE | VALIDE | RECOMPENSE\_VERSEE

recompenseType

Enum

Non

POINTS | REMISE | COMMISSION

recompenseValeur

Decimal

Non

Valeur de la recompense attribuee

recompenseVerseAt

Timestamp

Non

Date de versement de la recompense

dateCreation

Timestamp

Auto

—

# **13\. STANDARDS UI GLOBAUX**

## **13.1 Palette de Couleurs**

**Role**

**Hex**

**Usage**

Bleu principal

#1E3A5F

Header, titres de section, fonds tableaux header

Bleu accent

#2E86C1

Boutons primaires, liens, bordures actives, badges info

Bleu clair fond

#D6E4F0

Fond tableaux alternes, info boxes

Vert succes

#1A6B3A

Statut ACTIF, stock OK, toast succes

Orange alerte

#E65100

Statut EN\_COURS, stock ALERTE, toast avertissement

Rouge danger

#B71C1C

Statut SUSPENDU, stock RUPTURE, erreurs, toast erreur

Violet platine

#4A148C

Badge niveau Platine uniquement

Gris texte

#212121

Corps de texte principal, donnees tableaux

Gris fond

#F5F5F5

Fond lignes alternees tableaux

Blanc

#FFFFFF

Fond principal des ecrans, cartes

## **13.2 Typographie**

**Usage**

**Police**

**Taille**

**Graisse**

Titres de page

Inter / System UI

22px

Bold (700)

Titres de section

Inter / System UI

18px

SemiBold (600)

Corps de texte

Inter / System UI

14px

Regular (400)

Labels formulaires

Inter / System UI

13px

Medium (500)

Donnees numeriques

Roboto Mono

14px

Regular (400)

Codes (SKU, parrain)

Roboto Mono

13px

Regular (400)

Minimum absolu

—

14px

Regle stricte accessibilite WCAG

## **13.3 Composants Reutilisables**

### **Toast Notifications**

**Type**

**Couleur**

**Duree**

**Exemple**

Succes

#1A6B3A

3 secondes

'Vente de 427 500 CDF enregistree avec succes'

Erreur

#B71C1C

8 secondes

'Stock insuffisant — Samsung A54 (0 disponible)'

Avertissement

#E65100

5 secondes

'Synchronisation en retard de plus de 2 heures'

Information

#2E86C1

4 secondes

'Export en cours de generation...'

### **Modale de Confirmation**

-   Titre: action en question (ex: 'Suspendre ce client ?')
-   Corps: consequences + donnees affectees
-   Boutons: \[Annuler\] secondaire | \[Confirmer\] primaire (rouge si action destructive)
-   Actions critiques: saisie textuelle de confirmation requise

### **Indicateur Offline**

-   Connecte + sync recente: barre invisible
-   Hors ligne: barre orange fixe 32px — 'Mode hors-ligne — X operations en attente'
-   Reconnexion: barre bleue — 'Synchronisation en cours...'
-   Sync reussie: barre verte 3 secondes — 'Synchronise !' puis disparait

## **13.4 Regles Globales de Developpement**

**Regle**

**Description**

Offline First

Toute ecriture → IndexedDB local d'abord, sync API ensuite. Jamais de blocage UX sur erreur reseau

Validation client

Tous les formulaires valident cote client avant envoi API

Responsive

Breakpoints: <480px (mobile), 480-768px (tablette), >768px (desktop)

Loading States

Tout appel API affiche skeleton loader ou spinner — jamais d'ecran blanc

Empty States

Chaque liste vide: message explicatif + action suggeree

Confirmation destructions

Toute action irreversible demande confirmation explicite

Permissions UI

Boutons inaccessibles au role courant sont masques (pas juste desactives)

Pagination

25 elements/page mobile, 50 elements/page desktop

Formats monetaires

Montants en CDF avec separateurs de milliers (ex: 1 200 000 CDF)

Accessibilite

Contraste WCAG AA minimum, taille touche min 44x44px, aria sur tous les inputs

Performances 3G

Temps chargement < 3s sur reseau simule 3G (10 Mbps)

Securite

Jamais de token en localStorage — memoire JS + httpOnly cookie uniquement

# **14\. ANNEXES TECHNIQUES**

## **14.1 Codes d'Erreur API**

**HTTP**

**Code interne**

**Message**

**Ecran(s)**

400

ERR\_VALIDATION

Donnees de formulaire invalides

Tous les formulaires

401

ERR\_UNAUTHORIZED

Token expire ou invalide

Redirect vers SCR-001

403

ERR\_FORBIDDEN

Role insuffisant

Message d'acces refuse

404

ERR\_NOT\_FOUND

Ressource introuvable

Page 404 dediee

409

ERR\_CONFLICT

Telephone ou matricule duplique

SCR-007

409

ERR\_STOCK\_INSUFFISANT

Stock insuffisant pour cette vente

SCR-012

409

ERR\_STEP\_ORDER

Etape onboarding non respectee

SCR-007 a 010

409

ERR\_ALREADY\_ACTIVE

Client deja active

SCR-010

409

ERR\_SELF\_PARRAINAGE

Auto-parrainage interdit

SCR-007

422

ERR\_BUSINESS

Regle metier violee

Selon contexte

429

ERR\_RATE\_LIMIT

Trop de requetes

Toast + delai affiche

500

ERR\_SERVER

Erreur serveur interne

Page erreur + bouton retry

503

ERR\_OFFLINE

Serveur inaccessible

Mode hors-ligne automatique

## **14.2 Checklist de Test par Ecran**

**Test**

**Priorite**

**Description**

Rendu mobile (Android 8+)

P0

Tester sur ecran 5 pouces minimum portrait et paysage

Mode hors-ligne

P0

Desactiver WiFi/4G, verifier fonctions critiques (vente, onboarding)

Permissions par role

P0

Tester chaque ecran avec chaque role — verifier masquage boutons

Validation formulaires

P0

Tester soumission avec champs vides, invalides, valeurs extremes

Workflow onboarding complet

P0

Tester les 4 etapes de bout en bout avec et sans parrain

Vente avec remise fidelite

P0

Verifier calcul remise et attribution points apres vente

Transfert stock inter-sites

P1

Initiation (Goma) + validation reception (Bukavu) + ecart

Synchronisation offline→online

P1

Creer vente hors-ligne, reconnecter, verifier sync sans erreur

Generation recu PDF/thermique

P1

Verifier rendu sur imprimante 58mm et 80mm

Export Excel/PDF rapports

P1

Compatibilite LibreOffice Calc et Acrobat Reader

Envoi SMS OTP + recu

P1

Tester avec Airtel (+24381) et M-Pesa (+24397)

Performances 3G

P1

Temps chargement < 3s sur reseau simule 3G

Parrainage multi-niveaux

P2

Activer multi-niveaux, verifier recompenses N1 et N2

Import CSV matricules

P2

Fichier valide, fichier avec erreurs, fichier vide

## **14.3 Variables d'Environnement Requises**

**\# === BASE DE DONNEES ===**

DATABASE\_URL=postgresql://user:password@localhost:5432/techshop

REDIS\_URL=redis://localhost:6379

**\# === AUTHENTIFICATION ===**

JWT\_SECRET=<generer avec: openssl rand -hex 64>

JWT\_REFRESH\_SECRET=<generer avec: openssl rand -hex 64>

JWT\_EXPIRES\_IN=8h

JWT\_REFRESH\_EXPIRES\_IN=7d

MAX\_LOGIN\_ATTEMPTS=5

LOCKOUT\_DURATION\_MINUTES=15

**\# === APPLICATION ===**

PORT=3000

NODE\_ENV=production

CORS\_ORIGIN=https://techshop.yourdomain.com

DEFAULT\_CURRENCY=CDF

**\# === SMS (Africa's Talking) ===**

AT\_API\_KEY=<cle\_api\_africa\_talking>

AT\_USERNAME=<username\_africa\_talking>

SMS\_SENDER\_ID=TechShopMgr

**\# === STOCKAGE FICHIERS ===**

STORAGE\_ENDPOINT=<url\_minio\_ou\_s3>

STORAGE\_BUCKET=techshop-files

STORAGE\_ACCESS\_KEY=<access\_key>

STORAGE\_SECRET\_KEY=<secret\_key>

**\# === SYNC OFFLINE ===**

OFFLINE\_SYNC\_INTERVAL\_MS=300000

**\# === EXPORT RAPPORTS ===**

EXPORT\_MAX\_ROWS=50000

EXPORT\_TEMP\_DIR=/tmp/techshop-exports

_— FIN DU DOCUMENT DE SPECIFICATION DES ECRANS —_

TechShop Manager | SSD v1.0 | 42 ecrans | 10 modules | Goma, RDC | 2025