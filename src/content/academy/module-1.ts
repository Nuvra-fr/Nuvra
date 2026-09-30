import type { AcademyModuleInput } from './types';

/**
 * Module 1 — Comprendre l'écosystème digital.
 * Ten lessons: from "how a digital business actually makes money" to a written,
 * validated business definition stored in the learner's own Nuvra workspace.
 */
export const MODULE_1: AcademyModuleInput = {
  slug: 'ecosysteme-digital',
  title: "Comprendre l'écosystème digital",
  description:
    "Avant de construire quoi que ce soit, tu dois voir comment une activité digitale gagne réellement de l'argent, comment elle attire des personnes, et ce qui sépare une offre qui vend d'une offre qui reste sur l'étagère.",
  objectives: [
    'Expliquer avec tes mots comment une activité digitale génère du revenu',
    'Distinguer produit digital, service et modèle économique',
    'Décrire une audience précise plutôt qu’un public vague',
    'Formuler un problème rentable et le vérifier',
    'Choisir une niche que tu peux réellement défendre',
    'Écrire ta proposition de valeur en une phrase testable',
    'Décrire le parcours client de bout en bout',
    'Reconnaître les cinq erreurs qui font échouer les débutants',
    'Formaliser ton projet dans Nuvra (atelier Define Your Business)',
  ],
  deliverable:
    "Une fiche business complète enregistrée dans ton espace Nuvra : niche, audience, problème, solution, offre, objectif, modèle économique.",
  lab: {
    title: 'Atelier — Define Your Business',
    goal:
      'Transformer ce que tu as appris en une fiche business structurée, enregistrée dans ton compte Nuvra.',
    steps: [
      'Ouvrir l’atelier et remplir les sept champs à partir de tes recherches, pas de généralités',
      'Écrire le problème avec les mots exacts de ton audience',
      'Nommer ton offre et son prix de départ',
      'Enregistrer : la fiche reste consultable dans ton espace et sert de référence pour tout le reste de la formation',
    ],
    action: {
      action: 'define_business',
      label: "Ouvrir l'atelier Define Your Business",
      route: '/dashboard/academy/ecosysteme-digital/lecon/comprendre-une-audience/atelier',
      requiredEntity: 'Une fiche business enregistrée dans votre atelier',
      completionCheck: 'business_defined',
      hint: 'Renseigne les sept champs de ta fiche business — tu pourras la revoir à tout moment.',
    },
  },
  video: {
    title: 'Module 1 — Voir le système complet dans Nuvra',
    description:
      "Tour d'horizon de l'écosystème digital et de l'architecture Nuvra qui va le matérialiser pendant toute la formation.",
    durationSec: 540,
    script: `00:00 — Accroche
Une activité digitale n'est pas un site web avec un bouton. C'est une chaîne : une audience, un problème clair, une offre, un chemin de vente, une livraison, et un suivi. Ce module te donne la carte de cette chaîne, et à la fin tu écris ta propre fiche business dans Nuvra.

00:45 — Les quatre flux
Quatre flux suffisent à faire tourner une activité : l'acquisition (les personnes arrivent), la conversion (elles deviennent clientes), la livraison (elles reçoivent ce qu'elles ont acheté) et la rétention (elles reviennent). Chaque module de l'Académie correspond à un flux. Les modules 5 et 6 traitent l'acquisition et la conversion, les modules 3 et 4 la livraison, les modules 7 et 8 la répétition et la croissance.

02:10 — Où Nuvra intervient
Dans Nuvra, un flux devient des objets concrets. L'acquisition devient des pages, des formulaires et des séquences email. La conversion devient un tunnel avec ses étapes. La livraison devient des produits, des formations et des clients. La rétention devient des automatisations, des tags et des campagnes. Le fait que ces objets partagent les mêmes contacts est ce qui rend le système cohérent.

04:00 — L'atelier final du module
Tu vas remplir l'atelier Define Your Business. Sept champs : niche, audience, problème, solution, offre, objectif, modèle économique. Ce document n'est pas un exercice d'écriture : c'est le cahier des charges de tout ce que tu construiras dans les modules suivants. Nous y reviendrons à chaque étape.

06:30 — Ce que tu repars avec
Une fiche business écrite et un vocabulaire commun. Dans la leçon suivante, on distingue précisément produit et service, parce que ce choix détermine ton prix, ton temps et ta capacité à tenir une promesse.`,
    chapters: [
      { title: 'Les quatre flux d’une activité digitale', time: 0 },
      { title: 'Où Nuvra intervient dans la chaîne', time: 130 },
      { title: 'Comprendre vs apprendre', time: 250 },
      { title: 'L’atelier Define Your Business', time: 300 },
      { title: 'Prochaines étapes', time: 390 },
    ],
    transcript:
      "Une activité digitale n'est pas un site web avec un bouton. C'est une chaîne : une audience, un problème clair, une offre, un chemin de vente, une livraison et un suivi. Quatre flux suffisent à faire tourner une activité : l'acquisition, la conversion, la livraison et la rétention. Dans Nuvra, l'acquisition devient des pages, des formulaires et des séquences email. La conversion devient un tunnel. La livraison devient des produits, des formations et des clients. La rétention devient des automatisations. Tu vas remplir l'atelier Define Your Business avec sept champs : niche, audience, problème, solution, offre, objectif et modèle économique. Ce document est le cahier des charges de tout ce que tu construiras ensuite.",
    storyboard: [
      {
        time: '00:00',
        visual:
          'Fond ink-950, grain très léger, logo Nuvra centré ; apparition du titre « L’écosystème digital ».',
        narration:
          "Une activité digitale n'est pas un site web avec un bouton. C'est une chaîne.",
        onScreenText: 'L’écosystème digital',
      },
      {
        time: '00:45',
        visual:
          'Schéma quatre blocs alignés : Acquisition, Conversion, Livraison, Rétention. Un trait bleu reliant chaque bloc au module correspondant.',
        narration:
          "Quatre flux suffisent à faire tourner une activité : l'acquisition, la conversion, la livraison et la rétention.",
        onScreenText: '4 flux · 8 modules',
      },
      {
        time: '02:10',
        visual:
          'Capture d’écran Nuvra : le menu latéral s’illumine bloc par bloc (Pages, Tunnels, Produits, Formations, Emails, Automations).',
        narration:
          "Dans Nuvra, chaque flux devient des objets concrets qui partagent les mêmes contacts.",
        onScreenText: 'Nuvra = le système',
      },
      {
        time: '04:00',
        visual:
          'Formulaire “Define Your Business” affiché champ par champ, curseur qui valide chaque saisie.',
        narration:
          'Sept champs : niche, audience, problème, solution, offre, objectif, modèle économique.',
        onScreenText: 'Atelier · 7 champs',
      },
      {
        time: '06:30',
        visual:
          'Carte finale : l’atelier enregistré, badge « Fiche business créée » et flèche vers le module 2.',
        narration:
          'Cette fiche est le cahier des charges de tout le reste de la formation.',
        onScreenText: 'Ta fiche business',
      },
    ],
  },
  lessons: [
    {
      slug: 'fonctionnement-activite-digitale',
      title: "Comment fonctionne une activité digitale",
      short:
        "Les quatre flux — acquisition, conversion, livraison, rétention — et la boucle qui les relie.",
      objectives: [
        'Nommer les quatre flux d’une activité digitale',
        'Situer un outil Nuvra dans chaque flux',
        'Repérer le maillon faible d’une activité',
      ],
      minutes: 9,
      intro:
        "La plupart des débutants échouent non pas par manque d'effort, mais parce qu'ils construisent un seul maillon. Ils créent une page et attendent des ventes, ou ils vendent sans jamais construire de liste. Comprendre la chaîne entière avant de tirer la première corde évite des mois de travail dispersé.",
      explain:
        "Une activité digitale repose sur quatre flux qui s'alimentent l'un l'autre.\n\nL'acquisition fait entrer des personnes dans ton univers. Elle peut être organique (contenu, référencement, bouche-à-oreille) ou payée (publicité, affiliation). Son unité de compte est le lead, c'est-à-dire une personne identifiable.\n\nLa conversion transforme une partie de ces personnes en clientes. Elle passe par une offre claire, une page qui explique, et un paiement sans friction. Son unité de compte est la commande.\n\nLa livraison fait ce que la cliente a payé : le produit, la formation, l'accès. C'est l'étape que l'on oublie le plus souvent, et c'est celle qui génère le taux de réachat et le bouche-à-oreille.\n\nLa rétention ramène les clientes et crée de la recommandation : suivi, contenu, campagnes, offres complémentaires. Son unité de compte est la deuxième commande.\n\nLe point clé : chaque flux alimente le suivant avec les mêmes personnes. Une visiteuse qui devient cliente doit se retrouver dans ton CRM, recevant les bons emails, au bon moment. C'est exactement ce que Nuvra relie nativement : un contact est le même objet dans les pages, les tunnels, les commandes, les emails et les automatisations.",
      example:
        "Camille publie trois articles par semaine sur l'organisation pour les freelances. Les lecteurs s'inscrivent sur une page d'aimant à prospects. Trois jours plus tard, une automation leur envoie un email qui présente son audit. Cinq pour cent achètent l'audit. Chaque client reçoit ensuite, trois semaines plus tard, une invitation à une formation. Trois de ces clients deviennent.Apprenants payants. Aucun outil supplémentaire : la même liste de contacts circule dans tout le système.",
      apply:
        "Avant toute nouvelle tâche, demande-toi : « à quel flux cela appartient-il ? ». Si tu ne peux pas répondre, la tâche est probablement une distraction plutôt qu’un levier.\n\nMesure chaque flux séparément. Si tu as 1 000 visites mais 0 lead, le problème est l'acquisition. Si tu as 100 leads mais 0 vente, c'est la conversion. Si tu as 20 ventes mais 0 Twoième achat, c'est la rétention. Chaque flux a son propre indicateur, donc chaque flux a son propre diagnostic.",
      nuvra:
        "Ouvre le tableau de bord Nuvra et regarde la barre latérale : chaque entrée correspond à un flux. Products et Courses servent la livraison. Funnels et Pages servent la conversion. Leads et Customers servent la rétention. Emails et Automations servent l'acquisition. Analytics, à la fin, te dira où le flux casse.\n\nNote mentalement cette correspondance : tout au long de la formation, chaque module t'apprendra à remplir un flux de cette barre latérale.",
      exercise: {
        title: 'Cartographier les quatre flux',
        instructions:
          "Pour l'activité que tu veux construire, écris une ligne par flux avec l'action concrète que tu mèneras. Sois spécifique : « publier 2 vidéos par semaine sur TikTok » plutôt que « faire de la contenu ».",
        checklist: [
          'Acquisition : une action hebdomadaire précise',
          'Conversion : une action précise (page, tunnel, offre)',
          'Livraison : ce que tu livres exactement',
          'Rétention : ce qui ramène les clientes vers toi',
        ],
        worksheet: [
          { key: 'acquisition', label: 'Acquisition', type: 'textarea' },
          { key: 'conversion', label: 'Conversion', type: 'textarea' },
          { key: 'livraison', label: 'Livraison', type: 'text' },
          { key: 'retention', label: 'Rétention', type: 'textarea' },
        ],
      },
      quiz: {
        title: 'Quiz — Les quatre flux',
        passingScore: 80,
        questions: [
          {
            question: "Une cliente achète mais ne revient jamais. Quel flux est en défaut ?",
            options: [
              'Acquisition',
              'Conversion',
              'Livraison',
              'Rétention',
            ],
            answerIndex: 3,
            explanation:
              "Le parcours s’est déroulé jusqu’à la vente : c’est donc la rétention, qui vise la deuxième commande et la recommandation, qui doit être travaillée.",
          },
          {
            question: "Dans Nuvra, quel ensemble d’outils sert directement le flux Livraison ?",
            options: [
              'Pages et Funnels',
              'Leads et Emails',
              'Products et Courses',
              'Analytics',
            ],
            answerIndex: 2,
            explanation:
              "Products et Courses portent ce que la cliente achète : ce sont les objets de livraison du système Nuvra.",
          },
        ],
      },
      video: {
        narration:
          "Avant de construire, regarde la chaîne complète. Quatre flux, quatre indicateurs, quatre familles d'outils dans Nuvra. Savoir où se trouve ton maillon faible, c'est savoir sur quoi travailler cette semaine.",
        visualNotes: [
          'Schéma quatre blocs en apparition séquentielle sur fond sombre',
          'Chaque flux affiche son indicateur (lead, commande, livraison, réachat)',
          'Capture du menu latéral Nuvra avec surlignage par flux',
        ],
      },
    },
    {
      slug: 'produit-ou-service',
      title: 'Produit vs service',
      short:
        "Deux modèles de livraison, deux modèles de prix, deux modèles de vie.",
      objectives: [
        'Distinguer produit digital et service',
        'Choisir un modèle selon ton temps disponible',
        'Calculer le prix horaire effectif de chaque option',
      ],
      minutes: 8,
      intro:
        "Cette décision structure tout le reste : elle détermine ton prix, ton temps, ta capacité à monter en charge, et la promesse que tu peux tenir. Choisir trop tard, c'est souvent choisir à l'envers.",
      explain:
        "Un produit digital est un contenu computérisé livré sans interaction : ebook, template, formation enregistrée, bibliothèque de fichiers, logiciel. Tu le crées une fois, tu le vends à l'identique. Marge proche de 100 %, aucune limite de livraison, et un prix qui peut être élevé sans que ton agenda en pâtisse.\n\nUn service, c'est du temps humain vendu : audit, coaching, design, développement, conseil. Marge faible, capacité limitée par tes heures, mais prix élevé et valeur perçue forte quand l'expertise est réelle.\n\nLe modèle hybride est souvent le plus rentable au démarrage : tu vends du service à forte marge pour financer et apprendre, puis tu transposes ce que tu as fait mille fois dans un produit. C'est ce que la plupart des bons opérateurs font.\n\nLe critère de décision est la répétabilité. Si tu ne peux pas le refaire à l'identique pour la dixième cliente, ce n'est pas encore un produit.",
      example:
        "Sofia facture 1 500 € un audit de tunnel de 5 heures : c'est 300 €/h et elle ne peut en faire que deux par semaine. Elle transforme l'audit en diagnostic standardisé, puis en formation de 197 € qu'elle vend à ses clients. Elle garde le service pour les offres premium et vend le produit à volume.",
      apply:
        "Calcule ton prix horaire actuel en divisant ton prix par le nombre d'heures que la livraison te demande réellement. Si ce chiffre te surprend, ton prix est faux.\n\nVérifie la répétabilité : écris la livraison en étapes. Si deux clientes recevront exactement la même chose, tu as un produit. Si la seconde demande un travail que la première n'a pas demandé, tu as un service.",
      nuvra:
        "Dans Nuvra, les deux existent et sont gérés dans le même espace. Products accepte quatre types : DIGITAL, SERVICE, AUDIO et TEMPLATE. Un template Notion est un produit digital ; un audit de 30 minutes est un service.\n\nVa dans Products et regarde la colonne Type : c'est la première décision à prendre quand tu crées ton offre, et elle détermine ce que tu peux automatiser ensuite.",
      exercise: {
        title: 'Choisir ton modèle de livraison',
        instructions:
          "Réponds pour l'offre que tu veux vendre cette année. Sois honnête sur ta disponibilité : c'est la variable la plus sous-estimée.",
        checklist: [
          'Modèle retenu : produit, service ou hybride',
          'Temps réel de livraison par cliente',
          'Prix visé',
          'Prix horaire effectif calculé',
        ],
        worksheet: [
          { key: 'modele', label: 'Modèle de livraison', type: 'text' },
          { key: 'temps', label: 'Temps de livraison par cliente', type: 'text' },
          { key: 'prix', label: 'Prix visé', type: 'text' },
          { key: 'horaire', label: 'Prix horaire effectif', type: 'text' },
        ],
      },
      video: {
        narration:
          "Produit ou service : la question n'est pas une question de goûts, c'est une question de répétabilité. Si la dixième cliente reçoit exactement ce que la première a reçu, tu as un produit. Sinon, tu as un service — et c'est très bien aussi.",
      },
    },
    {
      slug: 'modeles-economiques',
      title: 'Les différents modèles économiques',
      short:
        "Paiement unique, abonnement, commission, freelance : quatre façons de gagner de l'argent avec la même audience.",
      objectives: [
        'Décrire les quatre modèles économiques du digital',
        'Associer un modèle à un type de promesse',
        'Calculer la valeur lifetime d’un client abonné',
      ],
      minutes: 9,
      intro:
        "Le modèle économique décide de la monetisation. Même audience, même expertise, deux modèles différents et deux revenus très différents. Choisir son modèle tôt, c'est éviter de construire une offre qui ne peut pas se soutenir.",
      explain:
        "Le paiement unique est le plus simple : tu vends, tu encaisses, tu livres. Revenu immédiat, mais plafonné par le nombre de ventes et sans revenu récurrent.\n\nL'abonnement est un accès renouvelé : formation continue, outil, communauté, service récurrent. Le revenu devient prévisible, ce qui change tout : on peut investir dans l'acquisition parce que la valeur mensuelle d'un client couvre le coût.\n\nLa commission te rémunère pour une transaction que tu n'as pas produite : affiliation, apport d'affaires, partenariat. Revenu sans coût de production, mais faible taux de conversion et aucune relation durable.\n\nLe freelance / prestation vend votre temps directement. C'est le revenu le plus rapide au démarrage, le plus plafonné, et souvent le meilleur véhicule d'apprentissage.\n\nLa valeur lifetime (LTV) résume l'intérêt d'un modèle : revenu total généré par un client sur toute sa durée de relation. Un client à 49 € qui achète une fois vaut 49 €. Un client à 19 €/mois pendant douze mois vaut 228 €. Le prix n'est pas la variable la plus importante : la durée l'est.",
      example:
        "Karim vend un template à 29 € (paiement unique) et propose ensuite un club à 9 €/mois. Le template sert de produit d'appel : 40 % des acheteurs rejoignent le club la première semaine. En douze mois, un client du club rapporte 108 €, sans coût marginal.",
      apply:
        "Commence par un modèle paiement unique simple pour valider une offre, puis ajoute un abonnement quand tu as la bibliothèque de contenu ou la récurrence pour le tenir. L'inverse — construire un club avant d'avoir vendu une seule fois — est la cause la plus fréquente d'abandon.",
      nuvra:
        "Nuvra supporte les deux axes : un produit à prix fixe dans Products, une formation payante dans Courses, et des abonnements de plateforme dans Plans (FREE, PRO, BUSINESS, AGENCY). Pour un abonnement adressé à *ton* audience, l'outil adapté reste ta formation en accès prolongé, administrée depuis ton espace.",
      exercise: {
        title: 'Choisir son modèle économique',
        instructions:
          'Compare quatre modèles sur ta propre offre, avec les mêmes chiffres, puis choisis celui que tu peux défendre pendant six mois.',
        checklist: [
          'Les quatre modèles comparés sur la même offre',
          'Revenu mensuel estimé pour chaque modèle',
          'Effort de livraison estimé par modèle',
          'Modèle retenu et raison du choix',
          'Risque principal du modèle retenu',
        ],
        worksheet: [
          { key: 'comparatif', label: 'Comparatif des quatre modèles', type: 'textarea' },
          { key: 'choix', label: 'Modèle retenu et pourquoi', type: 'textarea' },
        ],
      },
      quiz: {
        title: 'Quiz — Modèles économiques',
        passingScore: 80,
        questions: [
          {
            question: "Quel modèle génère le revenu le plus prévisible ?",
            options: ['Paiement unique', 'Abonnement', 'Commission', 'Freelance'],
            answerIndex: 1,
            explanation:
              "Un abonnement renouvelé produit un revenu récurrent : il est prévisible et finance l'acquisition.",
          },
          {
            question: "Un client paie 19 €/mois pendant 10 mois. Sa valeur lifetime est de :",
            options: ['19 €', '190 €', '228 €', '1 900 €'],
            answerIndex: 1,
            explanation: "19 € × 10 mois = 190 €. C'est la somme sur toute la relation, pas le prix affiché.",
          },
          {
            question:
              "Le meilleur test pour savoir si vous vendez un produit, c'est :",
            options: [
              "La tenth cliente reçoit la même chose que la première",
              "Le prix de vente",
              "La durée de la formation",
              "Le nombre de personnes dans la liste",
            ],
            answerIndex: 0,
            explanation:
              "Un produit se livre à l'identique. Si la dixième livraison demande un travail sur mesure, vous faites une prestation — avec le prix, la charge et les limites d'une prestation.",
          },
        ],
      },
    },
    {
      slug: 'comprendre-une-audience',
      title: 'Comprendre une audience',
      short:
        "Passer de « tout le monde » à une personne précise que vous pouvez nommer.",
      objectives: [
        'Remplacer un public vague par un persona précis',
        'Identifier les trois dimensions d’une audience utile',
        'Collecter des preuves plutôt que des suppositions',
      ],
      minutes: 10,
      intro:
        "« Les entrepreneurs », « les 25-35 ans », « les gens qui s’intéressent au marketing » : ce sont des catégories, pas des audiences. Une audience est un groupe de personnes que tu peux décrire par leur situation, pas par leur âge. Tant que tu ne peux pas nommer les problèmes que vit une personne précise, tu ne peux pas lui écrire une page de vente.",
      explain:
        "Une audience utile se décrit sur trois dimensions.\n\nLa situation : ce que la personne vit aujourd'hui, concrètement. « Elle vend en ligne depuis six mois mais ne dépasse pas 3 ventes par mois. »\n\nLa tentative : ce qu'elle a déjà essayé et pourquoi ça a échoué. « Elle a posté sur les réseaux sans offre claire, et n'a pas eu de demandes entrantes. »\n\nLe déclencheur : ce qui lui fait agir maintenant plutôt que dans six mois. « Elle vient de voir le chiffre de ses ventes et se rend compte qu'elle travaille sans revenu stable. »\n\nCes trois dimensions se collectent, elles ne s'inventent pas. Les sources les plus fiables sont les conversations réelles : commentaires sous tes posts, questions en messages privés, réponses à un formulaire, entretiens de dix minutes. Dix conversations valent mieux qu'un long questionnaire supposé.\n\nLa taille n'est pas le critère. Une audience de 2 000 personnes très bien ciblées vaut mieux que 200 000 personnes indifférentes, parce que l'offre ne s'adresse qu'à une partie d'un groupe large.",
      example:
        "Thomas voulait « enseigner le marketing aux artistes ». Après dix conversations, il a compris qu'il s'adressait en réalité à des photographes qui vendent leurs tirages en ligne sans site, qui perdent 20 % de leur temps en messages de commande, et qui bundle un kit de tirages et une page de vente à 79 €.",
      apply:
        "Écris trois profils de personnes distinctes, puis choisis celui qui a le problème le plus vif et le plus facile à atteindre. Écris pour cette personne comme si tu lui parlais dans un café : son vocabulaire, ses exemples exacts, ses objections.",
      nuvra:
        "Dans Nuvra, ce que tu apprends sur ton audience devient exploitable immédiatement. Le formulaire d'une page crée des contacts dans ton CRM avec une source. Les tags permettent de segmenter par intention. Le champ Notes de chaque contact accueille les verbatims : note tes citations exactes, elles deviendront tes titres de page de vente.",
      action: {
        action: 'create_page',
        label: 'Créer ma page de collecte',
        route: '/dashboard/pages?new=1',
        requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
        completionCheck: 'page_created',
        hint: 'Une page avec un formulaire devient ta première source de réponses d’audience.',
      },
      exercise: {
        title: 'Construire une fiche d’audience',
        instructions:
          "Complète les trois dimensions pour ton audience. Si une case reste floue, c'est qu'il te manque une conversation à avoir.",
        checklist: [
          'Situation décrite en une phrase concrète',
          'Tentatives déjà tentées et échecs',
          'Déclencheur de passage à l’action',
          'Trois verbatims réels collectés',
        ],
        worksheet: [
          { key: 'situation', label: 'Situation', type: 'textarea' },
          { key: 'tentatives', label: 'Tentatives', type: 'textarea' },
          { key: 'declencheur', label: 'Déclencheur', type: 'textarea' },
          { key: 'verbatims', label: 'Verbatims collectés', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'trouver-un-probleme',
      title: 'Trouver un problème réel',
      short:
        "Chercher la douleur que l’audience articulate déjà toute seule.",
      objectives: [
        'Distinguer un vrai problème d’un besoin apparu',
        'Évaluer un problème selon sa fréquence, son intensité et sa capacité à payer',
        'Reformuler un problème avec les mots de l’audience',
      ],
      minutes: 9,
      intro:
        "Le produit le mieux vendu du marché répond à un problème que son acheteur formule lui-même. Si tu dois expliquer le problème avant de vendre, tu te places sur un besoin que personne ne chercheactively à résoudre.",
      explain:
        "Un bon problème remplit quatre conditions.\n\nIl est fréquent : beaucoup de personnes le vivent, pas seulement quelques cas isolés.\n\nIl est intense : il provoque une frustration, une perte de temps, de l'argent ou du statut. Un problème mou ne déclenche pas d'achat.\n\nIl est coûteux : la personne investit déjà de l'argent ou du temps pour le contourner. Un problème que personne ne paie pas pour résoudre n'est pas un bon produit.\n\nIl est formulable : l'audience en parle avec ses propres mots, ce qui te donne des titres de page et des accroches gratuites.\n\nOù les trouver ? Dans les forums et commentaires (les questions répétées), dans les conversations clients existantes, dans les demandes non satisfaites des autres plateformes, et surtout dans tes propres irritations professionnelles. Le meilleur problème est souvent celui que tu vis toi-même depuis des mois.",
      example:
        "« Je n'arrive pas à vendre » est un problème mou. « Je passe six heures par semaine à répondre à des questions avant-vente qui n'aboutissent pas » est un problème précis, coûteux et formulé par les concernées elles-mêmes.",
      apply:
        "Écris le problème sous la forme : « Quand [situation], [personne] subit [conséquence précise] et essaie [solution actuelle] sans succès. » Si tu ne peux pas remplir la case « essaie », tu as un besoin, pas un problème.",
      nuvra:
        "Une fois le problème formulé, transforme-le en un champ de formulaire. Dans Nuvra, ta page de collecte peut poser exactement la question « Quel est ton plus gros problème aujourd'hui ? ». Les réponses arrivent dans Contacts et deviennent, après quelques semaines, ta meilleure matière pour une page de vente.",
      exercise: {
        title: 'Formuler un problème qui pique',
        instructions:
          'Écris le problème de ta cliente en une phrase, puis teste-la sur trois personnes de ton audience. Note leurs mots exacts, pas les tiens.',
        checklist: [
          'Problème formulé : quand [situation], [personne] subit [conséquence précise]',
          'Trois verbatims collectés',
          'Verbe le plus souvent employé par les personnes interrogées',
          'Conséquence mesurable trouvée',
        ],
        worksheet: [
          { key: 'formulation', label: 'Votre formulation du problème', type: 'textarea' },
          { key: 'verbatims', label: 'Mots exacts de votre audience', type: 'textarea' },
        ],
      },
      quiz: {
        title: 'Quiz — Trouver un problème',
        passingScore: 80,
        questions: [
          {
            question: "Quel de ces problèmes est le plus vendable ?",
            options: [
              'Améliorer ma vie',
              'Je perds 8 h par semaine dans des relances manuelles',
              'Apprendre le marketing',
              'Être plus productif',
        ],
            answerIndex: 1,
            explanation:
              "Il est précis, coûteux, fréquent et formulé par les concernées : c'est un problème, pas un souhait.",
          },
                  {
            question:
              "Une cliente décrit son problème avec ses propres mots. Pourquoi est-ce si important ?",
            options: [
              "C'est plus rapide à écrire",
              "Ses mots exacts sont ceux qu'elle utilisera en cherchant une solution",
              "Cela rend la page plus longue",
              "Cela évite de créer un tunnel",
            ],
            answerIndex: 1,
            explanation:
              "Votre cliente cherchera la solution avec ses propres mots : reprendre les siens, c'est être trouvé là où elle cherche, et parler une langue qu'elle reconnaît déjà.",
          },
],
      },
    },
    {
      slug: 'choisir-une-niche',
      title: 'Choisir une niche',
      short:
        "Réduire le marché pour augmenter la pertinence — et rendre la décision facile.",
      objectives: [
        'Choisir une niche sur trois critères',
        'Vérifier qu’une niche est adressable et défendable',
        'Documenter son choix de niche en une page',
      ],
      minutes: 9,
      intro:
        "Une niche n'est pas une restriction que tu t'imposes : c'est ce qui rend ton message crédible. Un généraliste qui parle de « marketing » se fond dans le bruit ; un spécialiste qui parle de « la première vente de vos templates » se fait entendre immédiatement.",
      explain:
        "Une bonne niche combine trois caractéristiques.\n\nLa douleur est vive dans ce groupe précis. Si personne dans le groupe ne spends d'argent pour résoudre le problème, le marché est trop petit.\n\nL'accès est possible. Tu peux atteindre ces personnes : elles ont un compte actif, un forum, une lettre d'information, une communauté identifiable. Une niche qu'on ne peut pas atteindre est une niche morte.\n\nLa crédibilité est atteignable. Tu peux parler de ce sujet avec autorité, même en partant de zéro : la crédibilité se construit, mais elle doit être constructible.\n\nLe test de la niche tient en une question : « Puis-je nommer dix personnes réelles de ce groupe, et dire où elles se parlent ? » Si oui, la niche existe.\n\nAttention à l'erreur inverse : choisir une niche si étroite qu'elle ne peut pas soutenir un volume suffisant. La bonne niche est étroite dans le problème, large dans la population.",
      example:
        "« Formateurs professionnels » est trop large. « Formateurs indépendants qui vendent leur première formation en ligne et n'ont pas de système de delivery des élèves » est spécifique : la douleur est nette, le groupe est accessible sur des groupes dédiés, et la crédibilité se construit en trois mois de contenu.",
      apply:
        "Écris ta niche en trois éléments : [qui] + [dans quelle situation précise] + [qu'il cherche à]. Lis-le à voix haute : si un ami te répond « ah, je connais quelqu'un comme ça », la niche est bonne. S'il dit « c'est qui ? », elle est encore trop large.",
      nuvra:
        "Une fois la niche choisie, ton Nuvra Link et ta page d'accueil doivent la dire en une ligne. Dans Nuvra, tu peux aussi créer des tags distincts par segment de niche dans ton CRM : un tag « niche-freelance », un tag « niche-coach ». Tes campagnes email se segmenteront ensuite sans travail manuel.",
      exercise: {
        title: 'Documenter sa niche',
        instructions:
          "Remplis cette fiche et teste-la sur trois personnes de ton entourage ou de ton marché.",
        checklist: [
          'Niche formulée en « qui + situation + objectif »',
          'Trois noms de personnes réelles du groupe',
          'Où ce groupe se rassemble (forums, comptes, groupes)',
          'Une phrase qui ferait dire « ah, je connais »',
        ],
        worksheet: [
          { key: 'niche', label: 'Votre niche', type: 'textarea' },
          { key: 'personnes', label: 'Personnes réelles identifiées', type: 'textarea' },
          { key: 'canaux', label: 'Où ce groupe se rassemble', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'proposition-de-valeur',
      title: 'Construire une proposition de valeur',
      short:
        "La phrase qui relie votre audience, son problème, votre solution et la preuve que cela marche.",
      objectives: [
        'Construire une proposition de valeur en une phrase',
        'Distinguer caractéristique, bénéfice et résultat',
        'Tester la force d’une proposition de valeur',
      ],
      minutes: 9,
      intro:
        "La proposition de valeur est la pièce la plus difficile à écrire et la plus rentable d'obtenir. Elle est ce que votre page, vos emails et vos conversations répétent. Si elle n'est pas nette, rien d'autre ne fonctionne.",
      explain:
        "Une proposition de valeur répond à quatre questions simultanément : à qui tu parles, quel problème tu résous, comment tu le résous, et pourquoi te croire.\n\nLa structure la plus fiable est : « J'aide [audience précise] à [résultat concret] en [méthode distinctive], sans [objection principale]. »\n\nAttention à la différence entre caractéristique et bénéfice. « Une formation de 6 modules avec quizzes » est une caractéristique. « Tu termines avec un système de vente construit et testé » est un bénéfice. « Tu as ton premier client en 30 jours » est un résultat — c'est le niveau qui déclenche la décision.\n\nLe « sans » est ce qui différencie : sans engagement annuel, sans knowledge technique, sansAudience.radius. C'est souvent la réponse à la principale objection.\n\nTest de force : si ta proposition peut être appliquée à trois entreprises différentes sans changement, elle n'est pas encore spécifique. Réécris jusqu'à ce qu'un concurrent clairement différent ne puisse pas la reprendre telle quelle.",
      example:
        "Faible : « J'aide les entrepreneurs à grow leur business en ligne avec le digital. »\n\nForte : « J'aide les consultants qui vendent leurs services à ', aide les freelances designers qui ont plus de 5 ans d'expérience à obtenir leur première mission recurrente en 30 jours, avec une page de vente et une séquence de 5 emails — sans publicité payée. »",
      apply:
        "Écris trois versions, puis supprime tout adjectif (« unique », « unique en son genre », « le meilleur du marché ») et tout ce qui ne décrit pas un résultat mesurable. Garde la plus précise, même si elle paraît moins élégante.",
      nuvra:
        "Ta proposition de valeur n'est pas qu'un texte : c'est un bloc dans Nuvra. Dans PageRenderer, le bloc hero de ta page de vente contient le titre et le sous-titre. Écris ton titre d'abord, il détermine tout le reste de la page.\n\nElle doit aussi apparaître dans la description de ton produit (Products) et dans le titre de ta formation (Courses) : c'est la cohérence qui augmente la conversion.",
      exercise: {
        title: 'Écrire ma proposition de valeur',
        instructions:
          "Produis trois versions. Donne-les à un lecteur de ton audience. S'il te demande « c'est pour qui exactement ? », la version n'est pas prête.",
        checklist: [
          'Audience nommée précisément',
          'Résultat mesurable formulé',
          'Méthode distinctive décrite',
          'Objection principale traitée',
        ],
        worksheet: [
          { key: 'v1', label: 'Version 1', type: 'textarea' },
          { key: 'v2', label: 'Version 2', type: 'textarea' },
          { key: 'v3', label: 'Version 3', type: 'textarea' },
          { key: 'retenue', label: 'Version retenue', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'parcours-client',
      title: 'Comprendre le parcours client',
      short:
        "Les cinq étapes que traverse une cliente, et l'action qui compte à chacune.",
      objectives: [
        'Décrire les étapes du parcours client',
        'Associer une action concrète et un indicateur à chaque étape',
        'Repérer l’étape où votre tunnel perd le plus de monde',
      ],
      minutes: 9,
      intro:
        "Une cliente n'est pas un chiffre : c'est une trajectoire. Quand vous savez à quelle étape elle se trouve, vous savez quoi lui montrer. La plupart des tunnels ratent parce qu'ils essaient de vendre à quelqu'un qui n'en est qu'à la découverte.",
      explain:
        "Le parcours comporte cinq étapes.\n\n1. Découverte : la personne découvre un contenu, une recommandation ou une publicité. Elle ne te connaît pas. Objectif : être trouvable et cohérent.\n\n2. Compréhension : elle visite une page et cherche à savoir si ton problème est le sien. Objectif : la page doit valider sa situation, pas vendre.\n\n3. Confiance : elle consulte des preuves — avis, cas, méthode, aperçu. Objectif : réduire le risque perçu.\n\n4. Décision : elle compare, hésite, cherche une raison de ne pas acheter. Objectif : répondre aux objections, pas ajouter du contexte.\n\n5. Utilisation et aftermath : elle utilise, obtient le résultat, puis devient prescriptrice. Objectif : accompagner et ouvrir la prochaine conversation.\n\nChaque étape a son propre indicateur : visites, taux de lecture, demandes, ventes, réachat. Mesurer l'ensemble donne un taux de conversion global qui masque l'endroit exact du problème.",
      example:
        "Un tunnel qui convertit à 1,2 % n'est pas « mauvais » en soi. Mais si 9 000 visiteurs n'arrivent jamais à la page de vente, le problème est en étape 2, et aucune optimisation du checkout n'y changera quoi que ce soit.",
      apply:
        "Écris pour chaque étape : ce que la personne fait, ce qu'elle ressent, ce que tu lui proposes, et comment tu le sais. La dernière colonne — le « comment tu le sais » — est ce qui transforme une intuition en décision.",
      nuvra:
        "Nuvra mesure ce parcours pour toi. Le bloc page de tes pages enregistre des vues ; les formulaires créent des contacts ; les commandes sont liées aux contacts dans Customers ; et Analytics regroupe ces événements par page. Utilise ces données pour identifier l'étape qui fuit au lieu de deviner.",
      exercise: {
        title: 'Cartographier son parcours client',
        instructions:
          "Écris les quatre étapes de ton parcours dans les mots de ta cliente, puis identifie l'endroit où elle décroche le plus souvent.",
        checklist: [
          'Découverte, évaluation, achat, rétention écrites avec ses verbatims',
          'Question posée à chaque étape',
          'Étape où l\'abandon est le plus fréquent',
          'Une action corrective choisie pour cette étape',
        ],
        worksheet: [
          { key: 'etapes', label: 'Les quatre étapes', type: 'textarea' },
          { key: 'rupture', label: 'Où elle décroche, et pourquoi', type: 'textarea' },
        ],
      },
      quiz: {
        title: 'Quiz — Parcours client',
        passingScore: 80,
        questions: [
          {
            question: "Une page de vente reçoit 2 000 visites et 12 commandes. La page précédente perd 90 % de ses visiteurs. Où est le problème ?",
            options: [
              'Au checkout',
              'Sur la page précédente (étape de compréhension)',
              'Sur le prix',
              'Dans l’email de bienvenue',
            ],
            answerIndex: 1,
            explanation:
              "Le taux de conversion de la page de vente est correct ; la fuite se produit en amont, à l’étape de compréhension.",
          },
          {
            question:
              "À quelle étape du parcours client une offre constructive ?",
            options: [
              'À la découverte, pour créer le besoin',
              'À la rétention, quand le résultat est obtenu',
              'Au paiement, pour lever le doute final',
              'Partout, si le message est bon',
            ],
            answerIndex: 1,
            explanation:
              "Tant que la cliente n'a pas obtenu de résultat, elle n'a rien à recommander : c'est là que la recommandation se gagne.",
          },
        ],
      },
    },
    {
      slug: 'erreurs-des-debutants',
      title: 'Les erreurs des débutants',
      short:
        "Cinq erreurs récurrentes, leur signal observable et le correctif en une action.",
      objectives: [
        'Identifier les cinq erreurs qui font échouer les débutants',
        'Repérer une erreur en cours dans sa propre activité',
        'Appliquer le correctif correspondant dès cette semaine',
      ],
      minutes: 8,
      intro:
        "Les mêmes cinq erreurs reviennent dans presque toutes les Activités digitales. Les connaître ne suffit pas : l'intérêt est de pouvoir les voir chez les autres — et donc les éviter chez soi.",
      explain:
        "Erreur 1 — construire avant de comprendre. On crée un site, une identité, un tunnel, avant d'avoir validé une audience et un problème. Signal : six semaines de travail, zéro conversation avec un acheteur potentiel.\n\nErreur 2 — cibler tout le monde. Un message général ne convertit personne. Signal : personne ne sait à qui ton offre s'adresse.\n\nErreur 3 — choisir le produit avant le problème. Signal : tu peux expliquer les fonctionnalités, jamais le bénéfice.\n\nErreur 4 — tout faire seul. Écrire, designing, vendre, livrer. Signal : la vente te paraît hibernation sur la{-}garde, alors qu'elle est ton cœur de métier.\n\nErreur 5 — ignorer la donnée. Décider à l'intuition. Signal : tu ne connais pas ton taux de conversion et tu ne sais pas où en sont tes ventes.\n\nChacune a un correctif simple : valide avant de construire, cible une audience, observe avant de coder, délègue ce qui te bloque, mesure chaque semaine. Le plus difficile n'est pas de les connaître : c'est de les avouer.",
      example:
        "Un.createur passe un mois à refaire son logo. Le même mois, il écrit dix messages à des freelances et découvre que trois d'entre eux paieraient 200 € pour un template de proposition commerciale. Une conversation lui aurait évité un mois.",
      apply:
        "Cette semaine, applique l'inverse de chacune des cinq erreurs, même partiellement. Une conversation, un message plus précis, une simplification de l'offre, une délégation, un chiffre consulté.",
      nuvra:
        "Nuvra te permet de constater les erreurs par la donnée plutôt que par l'impression. Si tu n'as aucune commande mais beaucoup de contacts sans tag, c'est l'erreur 2. Si tu as des commandes mais aucun produit créé cette semaine, c'est l'erreur 5. Regarde CRM et Analytics avant de décider quoi que ce soit.",
      exercise: {
        title: 'Auto-diagnostic',
        instructions:
        "Coche les erreurs que tu reconnais, puis écris l'action corrective que tu engages cette semaine pour chacune.",
        checklist: [
          'Construire avant de comprendre',
          'Cibler tout le monde',
          'Choisir le produit avant le problème',
          'Tout faire seul',
          'Ignorer la donnée',
        ],
        worksheet: [
          { key: 'erreurs', label: 'Erreurs reconnues', type: 'textarea' },
          { key: 'actions', label: 'Actions correctives de la semaine', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'definir-votre-business',
      title: 'Construire son projet avec Nuvra',
      short:
        "L'atelier Define Your Business : sept champs, une fiche business stockée dans votre espace.",
      objectives: [
        'Remplir un modèle de définition d’activité en sept champs',
        'Enregistrer sa fiche business dans Nuvra',
        'Utiliser sa fiche comme cahier des charges des modules suivants',
      ],
      minutes: 12,
      intro:
        "Tous les modules suivants vont produire des éléments concrets : un produit, un tunnel, une page, une séquence, une automatisation. Sans document initial, ces éléments riskent de se contredire. Cette leçon est le moment où vous écrivez le cahier des charges de votre activité.",
      explain:
        "Le modèle tient en sept champs.\n\nNiche : le groupe précis auquel vous vous adressez et la situation qu'il traverse.\n\nAudience : la personne nommée, sa tentative, son déclencheur.\n\nProblème : la formulation « quand… subit… et essaie… sans succès ».\n\nSolution : ce que vous apportez, et en quoi elle est différente.\n\nOffre : le nom, le format, le prix, ce que le client reçoit exactement.\n\nObjectif : le résultat mesurable à 30, 60 et 90 jours.\n\nModèle économique : paiement unique, abonnement, service ou hybride, et le plan pour le lancement.\n\nUne fiche complète n'est pas longue : une page est suficiente. Ce qui compte est que chaque champ soit précis au point d'être vérifiable. « Une audience de entrepreneurs » ne le sera jamais ; « les freelances de moins de 2 ans qui vendent en ligne sans site » se vérifie en une conversation.\n\nCette fiche est enregistrée dans votre espace. Vous pourrez y revenir, la modifier, et l'utiliser comme référence pour valider les décisions des modules 2 à 8.",
      example:
        "Fiche exemple : niche — consultants indépendants qui vendent une prestation de conseil ; audience —those de 32 à 45 ans qui facturent à l'heure et stagnent à 2 clients par mois ; problème — ils vendent du temps et ne peuvent pas augmenter leur revenu sans travailler plus ; solution — une offre packagée à résultat, avec tunnel de booking et suivi automatisé ; offre — Diagnostic + plan de pricing, 490 € ; objectif — 5 clients en 90 jours ; modèle — service premium, puis produit de formation en automatisation.",
      apply:
        "Remplissez la fiche maintenant, pas plus tard. Les modules suivants vont vous demander d'y faire référence à chaque décision : prix (module 2), tunnel (module 3), séquence (module 7), indicateurs (module 8).",
      nuvra:
        "Ouvrez l'atelier ci-dessous. Les sept champs sont enregistrés dans votre compte Nuvra et restent accessibles depuis votre page Académie. C'est le premier livrable réel que vous construisez dans la plateforme : vous utilisez le même modèle de données que le reste de la formation.",
      action: {
        action: 'define_business',
        label: "Ouvrir l'atelier Define Your Business",
        route: '/dashboard/academy/ecosysteme-digital/lecon/definir-votre-business/atelier',
        requiredEntity: 'Une fiche business enregistrée dans votre atelier',
        completionCheck: 'business_defined',
        hint: 'Renseigne les sept champs : ils resteront enregistrés dans ton espace.',
      },
      exercise: {
        title: 'Fiche business complète',
        instructions:
          "Renseigne les sept champs. Un champ vague est un signal : il te manque une conversation, pas une inspiration.",
        checklist: [
          'Niche définie',
          'Audience décrite avec ses mots',
          'Problème formulé « quand… subit… »',
          'Solution différenciée',
          'Offre nommée et prix fixé',
          'Objectif à 30 / 60 / 90 jours',
          'Modèle économique choisi',
        ],
        worksheet: [
          { key: 'niche', label: 'Niche', type: 'textarea' },
          { key: 'audience', label: 'Audience', type: 'textarea' },
          { key: 'probleme', label: 'Problème', type: 'textarea' },
          { key: 'solution', label: 'Solution', type: 'textarea' },
          { key: 'offre', label: 'Offre', type: 'text' },
          { key: 'objectif', label: 'Objectif à 30/60/90 jours', type: 'textarea' },
          { key: 'modele', label: 'Modèle économique', type: 'text' },
        ],
      },
      quiz: {
        title: 'Quiz — Fiche business',
        passingScore: 80,
        questions: [
          {
            question: "Quel champ doit contenir un résultat mesurable ?",
            options: ['La niche', 'La solution', 'L’objectif', 'Le modèle économique'],
            answerIndex: 2,
            explanation:
              "L'objectif est le seul champ où un chiffre est obligatoire : c'est lui qui permet de savoir si l'activité fonctionne.",
          },
          {
            question: "Une fiche business sert d’abord à :",
            options: [
              'Faire joli',
              'Servir de cahier des charges pour les décisions suivantes',
              'Remplir une obligation légale',
              'Copier celle d’un concurrent',
            ],
            answerIndex: 1,
            explanation:
              "Elle sert de référence commune : prix, tunnel, messages et indicateurs en découlent.",
          },
        ],
      },
      resources: [
        {
          title: 'Modèle de fiche business',
          kind: 'TEMPLATE',
          description: 'Les sept champs, avec une exemple rempli et les erreurs fréquentes.',
        },
        {
          title: 'Liste des dix conversations à mener',
          kind: 'CHECKLIST',
          description: 'Dix questions qui font apparaître le problème réel d’une audience.',
        },
      ],
      video: {
        narration:
          "C'est l'étape la plus importante du module : tout ce que tu construiras ensuite en découle. Sept champs, une page, et un document que Nuvra garde pour toi. Remplis-le avant de passer à la suite.",
      },
    },
  ],
};
