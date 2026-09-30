import type { AcademyResourceSpec } from './types';

/**
 * Nuvra Academy — resource catalogue, keyed by lesson slug.
 *
 * Every lesson ships at least one usable resource: a template to fill in, a
 * checklist to tick, a script to adapt, a workbook page or a real link inside
 * Nuvra. Resources are projected into `lesson_resources` by
 * `scripts/seed-academy.ts`, so an administrator can edit them from
 * Admin → Académie without a deploy.
 *
 * The catalogue is merged with the resources authored inline in the module
 * files (`builder.ts`); entries are de-duplicated by title.
 */
export const LESSON_RESOURCES: Record<string, AcademyResourceSpec[]> = {
  // ── Module 1 — Comprendre l’écosystème digital ─────────────────────
  'fonctionnement-activite-digitale': [
    {
      title: 'Carte des six flux d’une activité digitale',
      kind: 'TEMPLATE',
      description:
        'La page HTML, le tunnel, le produit, l’email, l’automatisation et la donnée : ce qui entre, ce qui sort, ce qui est mesurable à chaque étage.',
    },
    {
      title: 'Grille de lecture d’une offre concurrente',
      kind: 'CHECKLIST',
      description:
        'Douze questions à poser à une offre que vous trouvez bonne — pour apprendre la structure sans copier le contenu.',
    },
  ],
  'produit-ou-service': [
    {
      title: 'Arbre de décision produit / service',
      kind: 'WORKBOOK',
      description:
        'Cinq questions qui tranchent : livrable tangible ou résultat dans le temps, réversibilité, coût de revient, besoin de présence, capacité à être systématisé.',
      href: '/dashboard/products?new=1',
    },
  ],
  'modeles-economiques': [
    {
      title: 'Tableau des modèles — marge, CAC, effort',
      kind: 'TEMPLATE',
      description:
        'Abonnement, vente unique, coaching, freelance, publicité, affiliation : revenus prévisibles, effort de livraison et risque, côte à côte.',
    },
  ],
  'comprendre-une-audience': [
    {
      title: 'Fiche persona en une page',
      kind: 'TEMPLATE',
      description:
        'Contexte, journée type, frustration actuelle, solution imaginée, objections, langage exact de la personne.',
    },
    {
      title: 'Banque de vingt phrasesclients',
      kind: 'WORKBOOK',
      description:
        'La méthode pour copier la façon de parler de votre client : Twenty questions, conversations, tickets, commentaires publics.',
    },
  ],
  'trouver-un-probleme': [
    {
      title: 'Grille de scoring d’un problème',
      kind: 'TEMPLATE',
      description:
        'Fréquence, intensité, coût du statu quo, urgentité, budget existant. Un problème sous 12/20 ne paie pas de tunnel.',
    },
    {
      title: 'Journal de terrain — dix conversations',
      kind: 'WORKBOOK',
      description:
        'Dix rendez-vous de dix minutes, trois questions ouvertes, une grille de prise de notes et la synthèse qui en sort.',
    },
  ],
  'choisir-une-niche': [
    {
      title: 'Matrice de sélection de niche',
      kind: 'WORKBOOK',
      description:
        'Compétence × accès à la communauté × budget du marché ×blink repeats. Vous ne cochez une case que si les quatre colonnes sont pleines.',
    },
  ],
  'proposition-de-valeur': [
    {
      title: 'Gabarit de proposition de valeur',
      kind: 'TEMPLATE',
      description:
        'Pour [cible], qui [besoin], [solution] en [durée], sans [obstacle]. Trois variantes testables, pas une seule.',
    },
  ],
  'parcours-client': [
    {
      title: 'Carte du parcours en 7 étapes',
      kind: 'TEMPLATE',
      description:
        'Déclencheur → recherche → comparaison → décision → achat → usage → recommandation, avec l’objectif de chaque étape.',
    },
  ],
  'erreurs-des-debutants': [
    {
      title: 'Checklist anti-erreurs avant lancement',
      kind: 'CHECKLIST',
      description:
        'Les quinze points de contrôle à passer avant de publier : offre, prix, preuve, tunnel, suivi, mesure.',
    },
  ],

  // ── Module 2 — Trouver et construire son offre ─────────────────────
  'identifier-un-probleme': [
    {
      title: 'Grille problème / solution / preuve',
      kind: 'TEMPLATE',
      description:
        'Trois colonnes, une ligne par problème candidat. Une ligne sans preuve (message, chiffre,verbatim) est éliminée.',
    },
  ],
  'etudier-son-marche': [
    {
      title: 'Plan d’étude de marché sur 7 jours',
      kind: 'WORKBOOK',
      description:
        'Jour par jour : veille concurrentielle, lecture d’avis, mots-clés de recherche, forums, prix pratiqués, synthèse et décision.',
    },
  ],
  'definir-son-client-ideal': [
    {
      title: 'Fiche client idéal',
      kind: 'TEMPLATE',
      description:
        'Une seule personne, pas un segment : situation, niveau, motivation principale, frein principal, budget, où elle passe ses journées.',
    },
  ],
  'creer-un-avatar-client': [
    {
      title: 'Script d’entretien avatar (12 questions)',
      kind: 'SCRIPT',
      description:
        'Question par question, dans l’ordre, avec les relances. À enregistrer, transcrire et classer par thème.',
    },
  ],
  'transformation-promise': [
    {
      title: 'Déclaratif de transformation',
      kind: 'TEMPLATE',
      description:
        'De [état A] à [état B] en [durée], en [prérequis], avec [preuve]. Le mot « donc » ne doit jamais apparaître dans la phrase.',
    },
  ],
  'construire-une-offre': [
    {
      title: 'Blueprint de l’offre',
      kind: 'TEMPLATE',
      description:
        'Promesse, livrables, format, durée, accompagnement, garantie, bonus, prix, preuve — une ligne par bloc, sans adjectif.',
      href: '/dashboard/products?new=1',
    },
  ],
  'positionnement': [
    {
      title: 'Grille de positionnement',
      kind: 'WORKBOOK',
      description:
        'Ce que vous ne faites pas, pour qui, à la place de quoi, sur quel critère vous gagnez. Le « non » est la moitié du positionnement.',
    },
  ],
  'pricing': [
    {
      title: 'Calculateur de prix',
      kind: 'TEMPLATE',
      description:
        'Coût de revient, marge cible, taux de conversion observé, valeur perçue, prix des alternatives. Trois scenarios : bas, cible, premium.',
      href: '/dashboard/products?new=1',
    },
  ],
  'bonus': [
    {
      title: 'Liste de 20 bonus utile',
      kind: 'WORKBOOK',
      description:
        'Un bonus n’est pas un cadeau : c’est un raccourci vers le résultat. Chaque ligne doit répondre à « quel temps est-ce que ça fait gagner ? ».',
    },
  ],
  'garantie': [
    {
      title: 'Modèles de garantie',
      kind: 'SCRIPT',
      description:
        'Garantie de résultat, de moyens, de remboursement, inversion du risque — avec le texte exact affiché sous le bouton d’achat.',
    },
  ],
  'objections': [
    {
      title: 'Tableau des dix objections',
      kind: 'WORKBOOK',
      description:
        'Objection · ce qu’elle dit vraiment · réponse en deux phrases · preuve. Les trois premières sont toujours les mêmes.',
    },
  ],
  'offre-irresistible': [
    {
      title: 'Score d irresistibleité de l’offre',
      kind: 'CHECKLIST',
      description:
        'Dix critères notés de 0 à 2. Sous 14/20, l’offre n’est pas prête à être vendue : retour au blueprint.',
    },
  ],
  'transformer-offre-en-produit': [
    {
      title: 'Plan de transformation offre → produit',
      kind: 'WORKBOOK',
      description:
        'Ce qui devient page, tunnel, email, formation, automatisation. Une ligne par livrable, avec l’outil Nuvra associé.',
      href: '/dashboard/products?new=1',
    },
  ],

  // ── Module 3 — Construire son tunnel ──────────────────────────────
  'quest-ce-quun-funnel': [
    {
      title: 'Schéma de funnel',
      kind: 'TEMPLATE',
      description:
        'Les quatre étages avec, pour chacun : l’objectif, la promesse, la page, l’action attendue, le taux de conversion visé.',
      href: '/dashboard/funnels?new=1',
    },
  ],
  'le-parcours-client-dans-le-tunnel': [
    {
      title: 'Parcours annoté',
      kind: 'WORKBOOK',
      description:
        'Reprenez un tunnel existant et annotez, à chaque écran, la pensée du visiteur et l’action qu’on lui demande.',
    },
  ],
  'landing-page': [
    {
      title: 'Gabarit de landing page',
      kind: 'TEMPLATE',
      description:
        'Promesse, sous-promesse, preuve, bénéfices, objections, CTA. L’ordre est fixe, seul le texte change.',
      href: '/dashboard/pages?new=1',
    },
  ],
  'lead-capture': [
    {
      title: 'Formulaire : 5 champs maximum',
      kind: 'TEMPLATE',
      description:
        'Chaque champ justifié par son usage. Un champ que vous ne réutilisez pas est un champ à supprimer.',
    },
  ],
  'lead-magnet': [
    {
      title: 'Idéateur de lead magnets',
      kind: 'WORKBOOK',
      description:
        'Dix idées classées par effort de création et par valeur perçue, avec pour chacune l’action immédiate qu’elle déclenche.',
    },
  ],
  'page-de-vente': [
    {
      title: 'Structure de page de vente',
      kind: 'TEMPLATE',
      description:
        'Les seize blocs dans l’ordre, avec le rôle de chacun et la longueur conseillée.',
      href: '/dashboard/pages?new=1',
    },
  ],
  'checkout': [
    {
      title: 'Checklist checkout',
      kind: 'CHECKLIST',
      description:
        'Champs obligatoires, moyen de paiement, frais affichés avant validation, page de merci testée, e-mail de confirmation.',
    },
  ],
  'order-bump': [
    {
      title: 'Catalogue de 15 order bumps',
      kind: 'WORKBOOK',
      description:
        'Ajouts à 9 €, 19 €, 29 € qui complètent l’achat principal, avec leur justification en une phrase.',
    },
  ],
  'upsell': [
    {
      title: 'Plan d’upsell',
      kind: 'TEMPLATE',
      description:
        'Offre suivante, moment de la proposition, prix, durée de l’offre, traitement de l’acceptation et du refus.',
    },
  ],
  'downsell': [
    {
      title: 'Arbre de downsell',
      kind: 'TEMPLATE',
      description:
        'Trois paliers de réponse à un refus : alternative moins chère, paiement en trois fois, Magnet, avec le taux de reprise visé.',
    },
  ],
  'thank-you-page': [
    {
      title: 'Script de page de remerciement',
      kind: 'SCRIPT',
      description:
        'Ce que voit le client dans les trois minutes qui suivent l’achat, et la prochaine action que vous lui demandez.',
    },
  ],
  'livraison': [
    {
      title: 'Plan de livraison',
      kind: 'WORKBOOK',
      description:
        'Accès, e-mails, formation, facturation, support : qui fait quoi, sous quel délai, avec quel message.',
    },
  ],
  'suivi-client': [
    {
      title: 'Séquence de suivi après achat',
      kind: 'TEMPLATE',
      description:
        'J+0, J+2, J+7, J+21 : l’objectif de chaque message, l’offre, l’appel à l’action et le signal de non-réponse.',
    },
  ],
  'mesurer-les-conversions': [
    {
      title: 'Tableau de bord des conversions',
      kind: 'TEMPLATE',
      description:
        'Une ligne par étape : visiteurs, leads, ventes, montant, taux, source. À remplir chaque semaine, jamais à la mémoire.',
      href: '/dashboard/analytics',
    },
  ],

  // ── Module 4 — Créer sa première formation ─────────────────────────
  'trouver-un-sujet': [
    {
      title: 'Grille de choix de sujet',
      kind: 'TEMPLATE',
      description:
        'Sujet que vous maîtrisez × résultat que le client veut × vérifiable en fin de parcours. Trois lignes minimum avant de choisir.',
    },
  ],
  'identifier-une-transformation': [
    {
      title: 'Fiche de transformation pédagogique',
      kind: 'TEMPLATE',
      description:
        'Point de départ mesurable, point d’arrivée mesurable, chemin en N étapes, prérequis, durée totale.',
    },
  ],
  'definir-son-etudiant-ideal': [
    {
      title: 'Portrait étudiant',
      kind: 'TEMPLATE',
      description:
        'Son niveau réel, son temps disponible, ce qu’il a déjà tenté, ce qui l’a bloqué, comment il préfère apprendre.',
    },
  ],
  'structurer-son-programme': [
    {
      title: 'Plan de programme en trois colonnes',
      kind: 'WORKBOOK',
      description:
        'Module · résultat annoncé · projet produit à la fin. Un module sans projet n’est pas un module.',
    },
  ],
  'construire-ses-modules': [
    {
      title: 'Plan de modules',
      kind: 'TEMPLATE',
      description:
        'Ordre, durée cible, outcome mesurable, prérequis. Le module suivant ne s’ouvre qu’après une preuve du précédent.',
    },
  ],
  'construire-ses-lecons': [
    {
      title: 'Plan de leçons',
      kind: 'WORKBOOK',
      description:
        'Une leçon = une promesse. Si vous ne pouvez pas la résumer en une phrase, découpez-la.',
    },
  ],
  'ecrire-une-lecon-pedagogique': [
    {
      title: 'Gabarit de leçon',
      kind: 'TEMPLATE',
      description:
        'Objectifs, explication, exemple chiffré, application, exercice, résumé, suite — l’ordre qui fait retenir.',
    },
  ],
  'creer-ses-videos': [
    {
      title: 'Plan de production vidéo',
      kind: 'WORKBOOK',
      description:
        'Liste des vidéos, durée cible, format, ce qu’il faut filmer ou montrer à l’écran, ordre de tournage.',
    },
  ],
  'enregistrer-une-video': [
    {
      title: 'Liste de contrôle avant d’enregistrer',
      kind: 'CHECKLIST',
      description:
        'Son, lumière, fond, script écrit, première phrase, durée, sous-titres prévus.',
    },
  ],
  'creer-ses-supports': [
    {
      title: 'Catalogue de supports',
      kind: 'TEMPLATE',
      description:
        'PDF de travail, tableur de calcul, canevas, modèle de fichier, questionnaire — un support par décision à prendre.',
    },
  ],
  'creer-des-quiz': [
    {
      title: 'Gabarit de question de quiz',
      kind: 'TEMPLATE',
      description:
        'Une question, quatre réponses, une seule bonne, une explication qui justifie la bonne réponse.',
    },
  ],
  'creer-une-experience-etudiante': [
    {
      title: 'Parcours étudiant minute par minute',
      kind: 'WORKBOOK',
      description:
        'Après l’achat : premier écran, premier e-mail, première leçon, premier résultat, premier point de contrôle.',
    },
  ],
  'creer-un-certificat': [
    {
      title: 'Critères de délivrance du certificat',
      kind: 'CHECKLIST',
      description:
        'Conditions minimales : leçons terminées, projet déposé, quiz réussi. Un certificat sans condition n’a aucune valeur.',
    },
  ],
  'definir-le-prix-dune-formation': [
    {
      title: 'Grille de prix de formation',
      kind: 'TEMPLATE',
      description:
        'Prix du marché, comparaison avec l’action de conseil, coût d’acquisition tolérable, nombre de participants nécessaire.',
      href: '/dashboard/courses?new=1',
    },
  ],
  'publier-une-formation': [
    {
      title: 'Checklist de publication',
      kind: 'CHECKLIST',
      description:
        'Prix, image, description, programme visible, e-mail de bienvenue, paiement testé de bout en bout.',
    },
  ],
  'vendre-sa-formation': [
    {
      title: 'Plan de vente sur 14 jours',
      kind: 'WORKBOOK',
      description:
        'Semaine 1 : liste et message. Semaine 2 : séquence, preuve, objections, appel à l’action.',
      href: '/dashboard/emails?new=1',
    },
  ],
  'creer-sa-premiere-formation-avec-nuvra': [
    {
      title: 'Checklist de mise en ligne dans Nuvra',
      kind: 'CHECKLIST',
      description:
        'Formation créée, modules ajoutés, leçon pilote publiée, quiz vérifié, page de vente branchée, test d’achat passé.',
      href: '/dashboard/courses?new=1',
    },
  ],

  // ── Module 5 — Acquisition ────────────────────────────────────────
  'comprendre-lacquisition': [
    {
      title: 'Carte des sources d’acquisition',
      kind: 'TEMPLATE',
      description:
        'Créée, empruntée, payante : coût, délai, volume, contrôle, dépendance. Vous choisissez deux sources, pas dix.',
    },
  ],
  'contenu-organique': [
    {
      title: 'Calendrier éditorial 30 jours',
      kind: 'WORKBOOK',
      description:
        'Quatre publications par semaine : un contenu de fond, une preuve, une histoire, une offre. Rempli à l’avance, jamais improvisé.',
    },
  ],
  'personal-branding': [
    {
      title: 'Positionnement éditorial',
      kind: 'TEMPLATE',
      description:
        'À qui vous parlez, de quoi vous parlez, sous quel angle, avec quelles preuves. Trois phrases, réutilisables partout.',
    },
  ],
  'reseaux-sociaux': [
    {
      title: 'Matrice de choix de réseau',
      kind: 'WORKBOOK',
      description:
        'Un seul réseau principal, un seul réseau secondaire, le reste en réutilisation. Format, rythme, objectif, mesure.',
    },
  ],
  'construire-une-audience': [
    {
      title: 'Plan de croissance d’audience',
      kind: 'WORKBOOK',
      description:
        'Objectif à 30, 60, 90 jours, une action par semaine, une mesure par action.',
    },
  ],
  'creer-du-contenu': [
    {
      title: 'Banque de trente idées de contenu',
      kind: 'WORKBOOK',
      description:
        'Trente idées réparties en trois familles : dix histoires vécues, dix objections rencontrées, dix preuves obtenues. Vous ne partez jamais d’une page blanche.',
    },
  ],
  'hooks': [
    {
      title: 'Banque de 40 hooks',
      kind: 'TEMPLATE',
      description:
        'Quatre familles : la question, la erreur, le chiffre, la confession. Testez-les, ne les croyez pas sur parole.',
    },
  ],
  'storytelling': [
    {
      title: 'Trame narrative en cinq temps',
      kind: 'TEMPLATE',
      description:
        'Situation, rupture, quête, résolution, retour à vous. Le paradoxe d’abord, l’explication après.',
    },
  ],
  'cta': [
    {
      title: 'Banque d’appels à l’action',
      kind: 'TEMPLATE',
      description:
        'Un verbe, un bénéfice, une urgence réelle. Comparez toujours deux formulations en A/B.',
      href: '/dashboard/pages?new=1',
    },
  ],
  'email-marketing': [
    {
      title: 'Plan d’emailing 30 jours',
      kind: 'WORKBOOK',
      description:
        'Séquence de bienvenue, séquence de nurturing, séquence de relance. Fréquence, promesse, appel à l’action par message.',
      href: '/dashboard/emails?new=1',
    },
  ],
  'seo': [
    {
      title: 'Liste de 30 requêtes cibles',
      kind: 'WORKBOOK',
      description:
        'Volume, intention, concurrence, page à produire. Une requête par page, jamais cinq.',
    },
  ],
  'partenariats': [
    {
      title: 'Modèle de proposition de partenariat',
      kind: 'SCRIPT',
      description:
        'Message d’approche, contrepartie proposée, suivi à sept jours, conditions à écrire noir sur blanc.',
    },
  ],
  'affilies': [
    {
      title: 'Kit d’affiliation',
      kind: 'TEMPLATE',
      description:
        'Offre, commission, lien de suivi, supports de promotion, règles de communication, délai de paiement.',
      href: '/dashboard/marketplace',
    },
  ],
  'transformer-son-audience-en-leads': [
    {
      title: 'Tunnel lead magnet',
      kind: 'TEMPLATE',
      description:
        'Contenu gratuit, formulaire minimal, page de remerciement, e-mail de bienvenue, première action offerte.',
      href: '/dashboard/funnels?new=1',
    },
  ],
  'acquisition-avec-nuvra': [
    {
      title: 'Tableau de suivi des canaux',
      kind: 'TEMPLATE',
      description:
        'Une ligne par canal : contacts, leads, ventes, coût, revenu. Le canal qui ne tient pas ses chiffres sort du tableau.',
      href: '/dashboard/analytics',
    },
  ],

  // ── Module 6 — Conversion ─────────────────────────────────────────
  'comprendre-la-conversion': [
    {
      title: 'Entonnoir de conversion',
      kind: 'TEMPLATE',
      description:
        'Visiteurs → engaged → leads → ventes → clients. Le taux le plus faible désigne l’étape à réparer en premier.',
      href: '/dashboard/analytics',
    },
  ],
  'copywriting': [
    {
      title: 'Gabarit de copy en 7 blocs',
      kind: 'TEMPLATE',
      description:
        'Attention, intérêt, problème, agitation, solution, preuve, action. Une phrase par bloc, au brouillon.',
    },
  ],
  'headline': [
    {
      title: '20 headlines testables',
      kind: 'TEMPLATE',
      description:
        'Bénéfice, objection, curiosité, comparaison, urgence. Une seule promise par headline, jamais de liste.',
    },
  ],
  'proposition-de-valeur-sur-page': [
    {
      title: 'Bandeau de proposition de valeur',
      kind: 'TEMPLATE',
      description:
        'Pour qui, quel résultat, en combien de temps, avec quelle preuve. Visible sans défiler, lisible en trois secondes.',
    },
  ],
  'preuve-sociale': [
    {
      title: 'Collecte de preuves',
      kind: 'WORKBOOK',
      description:
        'Témoignages, résultats chiffrés, captures, mentions, avis. Demandez une preuve après chaque livraison réussie.',
    },
  ],
  'objections-et-reponses': [
    {
      title: 'FAQ de conversion',
      kind: 'TEMPLATE',
      description:
        'Dix questions réelles, dix réponses de moins de cinquante mots, placées avant l’achat et dans l’e-mail de relance.',
    },
  ],
  'cta-de-vente': [
    {
      title: 'Test de boutons d’achat',
      kind: 'TEMPLATE',
      description:
        'Texte, couleur, position, micro-copy sous le bouton. Un seul changement à la fois, sinon vous n’apprenez rien.',
    },
  ],
  'page-de-vente-conversion': [
    {
      title: 'Grille d’audit de page de vente',
      kind: 'CHECKLIST',
      description:
        'Vingt points notés de 0 à 1. En dessous de 14, on ne cherche pas de trafic : on répare la page.',
      href: '/dashboard/pages?new=1',
    },
  ],
  'checkout-de-conversion': [
    {
      title: 'Checklist de réduction des frictions',
      kind: 'CHECKLIST',
      description:
        'Champs, autocomplétion, moyens de paiement, frais, redirection, e-mail, page de merci. Chaque point supprimé vaut des ventes.',
    },
  ],
  'order-bump-en-vente': [
    {
      title: 'Order bump : ce qui se vend, ce qui ne se vend pas',
      kind: 'WORKBOOK',
      description:
        'Testez les complements d’usage avant les complements de contenu. Notez le taux d’acceptation de chaque ligne.',
    },
  ],
  'upsell-en-conversion': [
    {
      title: 'Plan d’upsell post-achat',
      kind: 'TEMPLATE',
      description:
        'L’offre suivante est présentée au moment où le résultat vient d’être obtenu. Pas avant, pas dix fois.',
    },
  ],
  'ab-testing': [
    {
      title: 'Protocole de test A/B',
      kind: 'WORKBOOK',
      description:
        'Hypothèse, variable, durée, taille d’échantillon, critère d’arrêt. On teste une chose, on conclut, puis on arrête.',
    },
  ],
  'optimisation-du-funnel': [
    {
      title: 'Tableau d’optimisation',
      kind: 'TEMPLATE',
      description:
        'Une ligne par étape : valeur actuelle, hypothèse, action, résultat attendu, date de re-mesure.',
      href: '/dashboard/analytics',
    },
  ],
  'transformer-un-visiteur-en-client': [
    {
      title: 'Checklist de conversion finale',
      kind: 'CHECKLIST',
      description:
        'Offre claire, prix affiché, preuve proche du bouton, objections traitées, paiement sans friction, suivi automatique.',
    },
  ],

  // ── Module 7 — Automatisation ─────────────────────────────────────
  'pourquoi-automatiser': [
    {
      title: 'Carte des tâches à automatiser',
      kind: 'WORKBOOK',
      description:
        'Fréquence, durée, règle fixe, conséquence d’un oubli. Automatisez ce qui est répétitif et sans exception.',
    },
  ],
  leads: [
    {
      title: 'Pipeline de leads',
      kind: 'TEMPLATE',
      description:
        'Statuts, transitions, champs obligatoires, action déclenchée à chaque changement de statut.',
      href: '/dashboard/leads',
    },
  ],
  'sequences-email': [
    {
      title: 'Plan de séquence',
      kind: 'TEMPLATE',
      description:
        'Déclencheur, cadence, objectif par message, sortie à la réponse, relance à l’absence de réponse.',
      href: '/dashboard/emails?new=1',
    },
  ],
  'segmentation': [
    {
      title: 'Règles de segmentation',
      kind: 'TEMPLATE',
      description:
        'Segment, critère, taille minimale, fréquence d’envoi. Un segment de douze personnes ne mérite pas une séquence.',
    },
  ],
  'tags': [
    {
      title: 'Nomenclature de tags',
      kind: 'TEMPLATE',
      description:
        'Préfixe par catégorie : source-, offre-, niveau-, statut-. Un tag créé à la main n’existe pas.',
    },
  ],
  'declencheurs': [
    {
      title: 'Catalogue de déclencheurs',
      kind: 'TEMPLATE',
      description:
        'Inscription, achat, abandon, ouverture, clic, fin de formation, anniversaire. Un déclencheur = un événement vérifiable.',
      href: '/dashboard/automations?new=1',
    },
  ],
  'workflows': [
    {
      title: 'Gabarit de workflow',
      kind: 'TEMPLATE',
      description:
        'Déclencheur, conditions, actions, branche « sinon », sortie, mesure de réussite.',
      href: '/dashboard/automations?new=1',
    },
  ],
  'emails-transactionnels': [
    {
      title: 'Catalogue d’e-mails transactionnels',
      kind: 'CHECKLIST',
      description:
        'Confirmation, facture, accès, rappel, mot de passe. Objet, contenu, délai, expéditeur, lien de désinscription.',
    },
  ],
  'abandon-de-checkout': [
    {
      title: 'Séquence d’abandon de panier',
      kind: 'SCRIPT',
      description:
        'Message 1 à une heure, message 2 à vingt-quatre heures, message 3 à soixante-douze heures, avec le rappel d’aide.',
    },
  ],
  'onboarding-client': [
    {
      title: 'Onboarding client en 7 jours',
      kind: 'WORKBOOK',
      description:
        'J0 accès, J1 première action, J3 résultat, J5 preuve, J7 satisfaction, J14 offre suivante.',
    },
  ],
  'onboarding-etudiant': [
    {
      title: 'Onboarding étudiant',
      kind: 'TEMPLATE',
      description:
        'Bienvenue, plan de travail, première leçon, mise en route du channel de support, jalon de fin.',
    },
  ],
  'relance': [
    {
      title: 'Arbre de relance',
      kind: 'TEMPLATE',
      description:
        'Ce qui déclenche la relance, le délai, l’angle utilisé, l’offre, et l’arrêt automatique après trois tentatives.',
    },
  ],
  'certification-automatisee': [
    {
      title: 'Règles de certification',
      kind: 'CHECKLIST',
      description:
        'Conditions de délivrance, validation manuelle ou automatique, modèle de certificat, archivage de la preuve.',
    },
  ],
  'automatisation-commerciale': [
    {
      title: 'Plan d’automatisation commerciale',
      kind: 'WORKBOOK',
      description:
        'Tâches automatisées, temps récupéré, erreurs évitées, indicateur suivi pendant trente jours.',
      href: '/dashboard/automations?new=1',
    },
  ],
  'construire-son-premier-workflow': [
    {
      title: 'Checklist du premier workflow',
      kind: 'CHECKLIST',
      description:
        'Déclencheur choisi, branche principale testée, branche « sinon », e-mail envoyé, stop automatique, mesure activée.',
      href: '/dashboard/automations?new=1',
    },
  ],

  // ── Module 8 — Croissance ─────────────────────────────────────────
  kpis: [
    {
      title: 'Tableau de bord des 10 KPI',
      kind: 'TEMPLATE',
      description:
        'Une ligne par indicateur : définition, source, fréquence, cible, valeur actuelle, écart.',
      href: '/dashboard/analytics',
    },
  ],
  analytics: [
    {
      title: 'Plan de lecture des statistiques',
      kind: 'WORKBOOK',
      description:
        'Trois questions par écran : que montre-t-il, quelle décision déclenche-t-il, qui agit, quand.',
      href: '/dashboard/analytics',
    },
  ],
  revenus: [
    {
      title: 'Journal des revenus',
      kind: 'TEMPLATE',
      description:
        'Date, produit, volume, prix, frais, net. Les frais sont comptés séparément, jamais mélangés au chiffre d’affaires.',
    },
  ],
  conversion: [
    {
      title: 'Tableau des taux de conversion',
      kind: 'TEMPLATE',
      description:
        'Par étape et par source. Comparez vos chiffres à la médiane de votre niche, jamais à une promesse.',
      href: '/dashboard/analytics',
    },
  ],
  cac: [
    {
      title: 'Calcul du CAC',
      kind: 'TEMPLATE',
      description:
        'Dépense ÷ nouveaux clients. Dépense marketing et vente additionnées, frais de paiement inclus et affichés à part.',
    },
  ],
  ltv: [
    {
      title: 'Calcul de la LTV',
      kind: 'TEMPLATE',
      description:
        'Panier moyen × marge brute × fréquence d’achat × durée de vie. Comparez toujours LTV ÷ CAC.',
    },
  ],
  optimisation: [
    {
      title: 'Backlog d’optimisation',
      kind: 'WORKBOOK',
      description:
        'Hypothèse, impact estimé, effort, test, résultat. Une ligne par idée, rien ne part sans mesure.',
    },
  ],
  upsells: [
    {
      title: 'Catalogue d’upsells',
      kind: 'WORKBOOK',
      description:
        'Offre suivante, déclencheur, taux d’acceptation visé, impact sur le panier moyen.',
    },
  ],
  'cross-sells': [
    {
      title: 'Matrice de ventes croisées',
      kind: 'TEMPLATE',
      description:
        'Produit principal × produit complémentaire × argument. Trois combinaisons maximum par produit.',
    },
  ],
  'affiliations-pour-la-croissance': [
    {
      title: 'Plan d’affiliation à 90 jours',
      kind: 'WORKBOOK',
      description:
        'Partenaires ciblés, Kit envoyé, suivi, performance par partenaire, activation de la marketplace.',
      href: '/dashboard/marketplace',
    },
  ],
  marketplace: [
    {
      title: 'Checklist de publication marketplace',
      kind: 'CHECKLIST',
      description:
        'Offre claire, visuels, prix, livraison, support, commission, avis — ce que voit l’acheteur avant de décider.',
      href: '/dashboard/marketplace',
    },
  ],
  scaling: [
    {
      title: 'Plan de montée en charge',
      kind: 'TEMPLATE',
      description:
        'Ce qui casse en premier, la capacité à renforcer, la délégation à mettre en place, les coûts à provisionner.',
    },
  ],
  'automatisation-en-croissance': [
    {
      title: 'Plan d’automatisation à l’échelle',
      kind: 'WORKBOOK',
      description:
        'Volume, seuil de déclenchement, intervention humaine, coût par automatisation, temps gagné cumulé.',
      href: '/dashboard/automations?new=1',
    },
  ],
  retention: [
    {
      title: 'Tableau de rétention',
      kind: 'TEMPLATE',
      description:
        'Cohorte par mois d’achat, activité à J+7, J+30, J+90, revenu par cohorte. La rétention se mesure, elle ne se ressent pas.',
      href: '/dashboard/analytics',
    },
  ],
  fidelisation: [
    {
      title: 'Programme de fidélisation',
      kind: 'TEMPLATE',
      description:
        'Avantages réels, rythme, condition d’accès, coût pour Nuvra, effet attendu sur la fréquence d’achat.',
    },
  ],
  'plan-de-croissance': [
    {
      title: 'Plan de croissance 90 jours',
      kind: 'WORKBOOK',
      description:
        'Objectif, trois leviers, une action par semaine, un indicateur par levier, une revue mensuelle.',
      href: '/dashboard/analytics',
    },
  ],
  'construire-son-systeme-de-croissance': [
    {
      title: 'Nuvra Growth System — check de livraison',
      kind: 'CHECKLIST',
      description:
        'Offre, tunnel, formation, acquisition, conversion, automatisation, indicateurs : chaque brique existe, fonctionne et est mesurée.',
      href: '/dashboard/analytics',
    },
    {
      title: 'Plan de 90 jours',
      kind: 'WORKBOOK',
      description:
        'Les quatre-vingt-dix jours qui suivent la fin de l’Académie, écrits à l’avance, avec leurs jalons et leurs indicateurs.',
    },
  ],
};
