import type { AcademyModuleInput } from './types';

/** Module 2 — Trouver et construire son offre. */
export const MODULE_2: AcademyModuleInput = {
  slug: 'offre',
  title: 'Trouver et construire son offre',
  description:
    "Une offre n'est pas une liste de fonctionnalités. C'est une transformation promise, à un prix qui a du sens, entourée de tout ce qui réduit le risque perçu. Ce module transforme une idée floue en produit prêt à être vendu.",
  objectives: [
    'Transformer une idée en problème documenté et priorisé',
    'Étudier un marché sans y consacrer des mois',
    'Définir un client idéal et créer son avatar',
    'Formuler une transformation promise mesurable',
    'Construire une offre complète et un positionnement net',
    'Fixer un prix par la valeur, pas par la peur',
    'Ajouter des bonus et une garantie qui réduisent le risque',
    'Traiter les objections avant qu’elles ne se posent',
    'Créer son premier produit dans Nuvra',
  ],
  deliverable:
    'Un produit réel créé et configuré dans Nuvra : titre, description, couverture, prix, statut de publication.',
  lab: {
    title: 'Lab — Créer son premier produit dans Nuvra',
    goal:
      'Transformer l’offre écrite en produit configuré dans le Product Builder de Nuvra.',
    steps: [
      'Ouvrir le Product Builder avec le bouton ci-dessous',
      'Renseigner le titre, la description, le type (DIGITAL, TEMPLATE, AUDIO ou SERVICE) et le prix',
      'Enregistrer en brouillon, puis publier quand la fiche est complète',
      'Revenir dans l’Académie : l’action passe automatiquement en « accomplished »',
    ],
    action: {
      action: 'create_product',
      label: 'Créer mon premier produit',
      route: '/dashboard/products?new=1',
      requiredEntity: 'Un produit Nuvra avec son prix et son checkout',
      completionCheck: 'product_created',
      hint: 'Ouvre le vrai Product Builder de Nuvra.',
    },
  },
  video: {
    title: 'Module 2 — De l’idée au produit publié',
    description:
      "Construction complète d'une offre, du problème au produit configuré dans Nuvra.",
    durationSec: 620,
    script: `00:00 — Accroche
Une offre ne se résume pas à un nom et un prix. C'est une chaîne : un problème documenté, une transformation mesurable, un prix defendable, des bonus qui réduisent le risque, une garantie, et des réponses aux objections. Dans cette vidéo, on construit cette chaîne et on la termine dans Nuvra.

01:00 — Documenter le problème
On ne part pas d'une idée de produit, on part d'un problème observé. Trois sources fiables : les conversations réelles, les questions répétées dans les communautés, et les solutions de fortune que les gens inventent déjà. Notez les mots exacts : ils deviendront vos titres.

02:30 — Le client idéal et l'avatar
Le client idéal est défini par un problème, un niveau de conscience et une capacité à payer. L'avatar est la version storyifiée : prénom, métier, journée type, objection principale, citation réelle. On construit l'avatar parce qu'une offre générique ne convertit personne.

04:10 — La transformation promise
On écrit la transformation au format Avant / Après. « Avant : six heures de relances manuelles. Après : un tableau qui relance automatiquement, et 0 h par semaine. » Si tu ne peux pas écrire l'après de façon mesurable, l'offre n'est pas prête.

05:40 — Prix, bonus, garantie
Le prix se justifie par le prix de la transformation, pas par la somme des heures. Les bonus augmentent la valeur perçue sans augmenter le coût de production. La garantie transfère le risque à landoffeur. Dans cet ordre : le prix seul convertit mal, le prix plus bonus convertit mieux, le prix plus bonus plus garantie convertit nettement.

07:30 — Dans Nuvra
On transforme l'offre en produit : Products, type, titre, description, prix, statut. La fiche produit est ce qui apparaîtra sur ta page de vente et dans ta boutique. Une fois publiée, elle devient vendable immédiatement via le checkout.

09:30 — Récapitulatif
Tu as maintenant un produit avec une promesse, un prix et une fiche. Le module suivant transforme cette fiche en tunnel qui vend.`,
    chapters: [
      { title: 'Documenter le problème', time: 0 },
      { title: 'Client idéal et avatar', time: 90 },
      { title: 'La transformation promise', time: 190 },
      { title: 'Prix, bonus, garantie', time: 340 },
      { title: 'Créer le produit dans Nuvra', time: 450 },
      { title: 'Récapitulatif', time: 570 },
    ],
    transcript:
      "Une offre ne se résume pas à un nom et un prix. C'est une chaîne : un problème documenté, une transformation mesurable, un prix défendable, des bonus qui réduisent le risque, une garantie et des réponses aux objections. On ne part pas d'une idée de produit mais d'un problème observé, en notant les mots exacts des personnes concernées. Le client idéal est défini par son problème, son niveau de conscience et sa capacité à payer ; l'avatar est sa version storyifiée. La transformation promise s'écrit au format Avant / Après. Le prix se justifie par la valeur de la transformation. Les bonus augmentent la valeur perçue et la garantie transfère le risque. Dans Nuvra, on transforme l'offre en produit avec un titre, une description, un prix et un statut de publication.",
    storyboard: [
      {
        time: '00:00',
        visual: 'Titre « Construire son offre » sur fond ink-950, trait bleu qui se trace.',
        narration: "Une offre, c'est une chaîne, pas une étiquette.",
        onScreenText: 'Construire son offre',
      },
      {
        time: '01:00',
        visual: 'Trois cartes : conversations, questions en communauté, solutions de fortune.',
        narration: 'On part d’un problème observé, jamais d’une idée de produit.',
        onScreenText: 'Sources de problèmes',
      },
      {
        time: '02:30',
        visual: 'Fiche avatar à gauche, photo stylisée et citations à droite.',
        narration: 'Un avatar, c’est une personne que l’on peut nommer et à qui l’on peut parler.',
        onScreenText: 'Avatar client',
      },
      {
        time: '04:10',
        visual: 'Comparaison Avant / Après en deux colonnes, chiffres en bleu.',
        narration: 'La transformation se mesure : avant six heures, après zéro.',
        onScreenText: 'Avant → Après',
      },
      {
        time: '05:40',
        visual: 'Empilement visuel : prix, bonus, garantie.',
        narration: 'Prix, bonus, garantie : trois leviers de conversion distincts.',
        onScreenText: 'Prix · Bonus · Garantie',
      },
      {
        time: '07:30',
        visual: 'Capture d’écran du Product Builder Nuvra, champs remplis un par un.',
        narration: 'Dans Nuvra, l’offre devient un produit vendable.',
        onScreenText: 'Product Builder',
      },
    ],
  },
  lessons: [
    {
      slug: 'identifier-un-probleme',
      title: 'Identifier un problème',
      short: "Trouver une douleur que l’audience articulate déjà toute seule.",
      objectives: [
        'Collecter des problèmes via des sources vérifiables',
        'Formuler un problème avec les mots de l’audience',
        'Prioriser un problème selon sa fréquence et son coût',
      ],
      minutes: 9,
      intro:
        "La première erreur d'un produit digital est de commencer par le produit. On part d'une idée, puis on cherche qui la voudrait. L'inverse est plus lent à démarrer et beaucoup plus rapide à valider.",
      explain:
        "Un problème exploitable doit être formulé par ceux qui le vivent, pas par toi. La méthode tient en trois étapes : collecter, formuler, prioriser.\n\nCollecter : dix conversations de dix minutes, des questions ouvertes dans les communautés, des messages privés, les questions reçues par d'autres dans ton domaine. Note les formulations exactes, elles sont des actifs.\n\nFormuler : écris le problème sous la forme « Quand [situation], [personne] subit [conséquence] et essaie [solution de fortune] sans succès. » Si la case « essaie » est vide, tu as un souhait, pas un problème.\n\nPrioriser : classe tes problèmes selon la fréquence (combien de personnes), l'intensité (combien ça perturbe) et le coût (ce qu'elles investissent déjà pour le contourner). Les trois combinés donnent ton ordre de travail.",
      example:
        "« Je n'ai pas de clients » est trop vague. « Les photographes qui vendent leurs tirages sur les réseaux perdent 20 % de leur temps en messages de commande et ratent les demandes du week-end » est exploitable : fréquent dans le groupe, coûteux, et formulé par eux.",
      apply:
        "Fixe-toi un objectif chiffré : dix conversations cette semaine. Ne vends rien pendant ces dix échanges, ne présente pas ton offre, note seulement les mots. Cette matière brute vaut plus qu'un mois de réflexion seul.",
      nuvra:
        "Transforme tes trouvailles en champ de collecte. Dans Nuvra, une page avec un bloc Formulaire crée un contact dans CRM à chaque réponse. Tu peux ensuite ajouter un tag par réponse (« problème-tracabilite », « problème-paiement ») : tes contacts se segmentent automatiquement et deviendront les premières campagnes du module 5.",
      action: {
        action: 'create_page',
        label: 'Créer ma page de collecte',
        route: '/dashboard/pages?new=1',
        requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
        completionCheck: 'page_created',
        hint: 'Crée une page avec un formulaire pour recueillir les réponses de ton audience.',
      },
      exercise: {
        title: 'Collecter trois problèmes',
        instructions:
          "Renseigne trois problèmes collectés, avec la source et la formulation exacte.",
        checklist: [
          'Au moins trois problèmes collectés',
          'Formulation « quand… subit… » pour chacun',
          'Source indiquée pour chacun',
        ],
        worksheet: [
          { key: 'p1', label: 'Problème 1 (avec source)', type: 'textarea' },
          { key: 'p2', label: 'Problème 2 (avec source)', type: 'textarea' },
          { key: 'p3', label: 'Problème 3 (avec source)', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'etudier-son-marche',
      title: 'Étudier son marché',
      short: 'Dimensionner, comprendre les concurrents et les solutions de substitution, sans y consacrer des mois.',
      objectives: [
        'Dimensionner un marché de façon réaliste',
        'Identifier les solutions de substitution d’un marché',
        'Lire un concurrent sans copier son offre',
      ],
      minutes: 8,
      intro:
        "Étudier son marché n'est pas un exercice académique. C'est le moyen de savoir si le problème est assez répandu pour soutenir une offre, et si quelqu'un paie déjà pour le résoudre. Un marché sans dépense existante est un signal d'alerte, pas un verdict automatique.",
      explain:
        "Trois lectures suffisent.\n\nLa taille observable : combien de personnes parlent déjà du problème en ligne ? Le nombre de résultats dans un groupe, de discussions sur un sujet, de produits existants sur une marketplace donne un ordre de grandeur. Tu n'as pas besoin d'un chiffre exact, mais d'un ordre.\n\nLes solutions de substitution : la vraie concurrence n'est pas seulement les autres formations. C'est le tableur, la consultation YouTube, la méthode improvisée, le fait de ne rien faire. Si ta concurrence principale est « ne rien faire », le problème est moins urgent que tu ne le crois.\n\nLes signaux de dépense : l'existence de produits payants, de cours, de consultants facturés, de budgets advertiseurs indique que de l'argent circule déjà. C'est le meilleur indicateur de viabilité.\n\nContre-exemple utile : quand plusieurs acteurs paient le même sujet, c'est soit un signe de marché, soit un signe de commodité. La nuance se tranche en comparant les prix et les promesses : si tout le monde vend « 30 jours de croissance », il y a de la place pour une promesse plus précise.",
      example:
        "Le marché « apprendre le marketing » est saturé. Le sous-marché « vendre ses formations en ligne quand on est consultant » est plus précis : moins de concurrence, une douleur plus vive, et un prix qui peut monter.\n\nContre-exemple utile : quand plusieurs acteurs parlent du même sujet, c'est soit un signe de marché, soit un signe de commodité. La nuance se tranche en comparant les prix et les promesses : si tout le monde vend « 30 jours de croissance », il y a de la place pour une promesse plus précise et mieux outillée.",
      apply:
        "Consacre une demi-journée à cette étude, pas plus. Relève cinq concurrents directs, cinq solutions de fortune et cinq signaux de dépense. Rends tes conclusions dans un tableau d'une page : taille observée, solutions de substitution, prix pratiqués, promesse restante à prendre.\n\nRègle de décision : si tu ne trouves personne qui paie déjà pour un problème proche, ne construis pas encore l'offre. Va le revalider sur le terrain d'abord.",
      nuvra:
        "Cette étude devient une page dans Nuvra. Crée une page de type LANDING qui explique le problème et affiche les trois alternatives que tu as identifiées, puis termine sur un formulaire. Les réponses te donneront la preuve qu'il existe — ou non — — un besoin dans cette niche.\n\nTu pourras ensuite créer des tags dans ton CRM pour distinguer les personnes intéressées par chaque solution de fortune : ce sont les leads les plus chauds de toute ta liste.",
      exercise: {
        title: 'Cartographier son marché',
        instructions:
          "Relève cinq acteurs, cinq solutions de fortune et cinq signaux de dépense pour ton marché.",
        checklist: [
          'Cinq concurrents ou solutions de substitution relevés',
          'Cinq solutions de fortune identifiées',
          'Cinq signaux de dépense observés',
          'Promesse restante formulée en une phrase',
        ],
        worksheet: [
          { key: 'concurrents', label: 'Concurrents et solutions de substitution', type: 'textarea' },
          { key: 'fortune', label: 'Solutions de fortune', type: 'textarea' },
          { key: 'depense', label: 'Signaux de dépense', type: 'textarea' },
          { key: 'promesse', label: 'Promesse restante', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'definir-son-client-ideal',
      title: 'Définir son client idéal',
      short: 'Choisir la personne que tu peux réellement convaincre et servir.',
      objectives: [
        'Définir un client idéal par problème, conscience et capacité à payer',
        'Choisir un client principal plutôt qu’un public multiple',
        'Écrire les critères de qualification en une liste',
      ],
      minutes: 8,
      intro:
        "Une offre qui vise « les entrepreneurs » ne dit rien à personne. Le client idéal est un choix : il exclut volontairement des personnes afin de parler à d'autres avec précision.",
      explain:
        "Trois critères définissent un client idéal.\n\nLe problème : il vit ce problème à une intensité qui justifie une action.\n\nLe niveau de conscience : il ignore le problème, il sait qu'il l'a mais ne cherche pas, il cherche une solution, ou il compare activement. Une page de vente et un contenu froid ne s'adressent pas au même niveau — un prospect qui compare attend des preuves, un prospect qui ignore a besoin d'un diagnostic.\n\nLa capacité à payer : elle est déterminée par la valeur du problème, pas par ton envie. Un problème à 2 000 € de dégâts annuels accepte une solution à 300 €, pas à 3 000 €.\n\nLe premier client n'est pas l'audience moyenne : c'est la personne dont le problème est le plus vif et dont la décision est la plus courte. Servir cette personne bien crée les références qui convainquent les plus sceptiquer la suite.",
      example:
        "Un scanner de leads à 2 000 € ne s'adresse pas au prospect « dans l'ensemble du marché ». Il s'adresse à une personne qui a un service à 1 500 €, qui prospecte à froid, qui perd 5 heures par semaine, et qui décide seule.",
      apply:
        "Écris trois profils. Puis supprimez-en un. Gardez celui dont le problème est le plus douloureux et la décision la plus courte, même s'il est minoritaire. Une offre qui lui parle fondera plus de ventes qu'une offre qui parle à tous.",
      nuvra:
        "Une fois ton client principal choisi, la segmentation devient un réglage technique. Dans Nuvra, chaque contact accepte plusieurs tags. Crée un tag par segment et un par niveau de conscience : tes pages de capture, tes campagnes et tes automations pourront ensuite cibler précisément au lieu de diffuser à tout le monde.",
      exercise: {
        title: 'Fiche client idéal',
        instructions:
          "Décris ton client principal et indique volontairement qui tu declines. Un client idéal sans exclusions est un public.",
        checklist: [
          'Problème décrit avec ses mots',
          'Niveau de conscience précisé',
          'Capacité à payer estimée',
          'Critère d’exclusion écrit',
        ],
        worksheet: [
          { key: 'probleme', label: 'Problème', type: 'textarea' },
          { key: 'conscience', label: 'Niveau de conscience', type: 'text' },
          { key: 'paiement', label: 'Capacité à payer', type: 'text' },
          { key: 'exclusions', label: 'Qui tu declines', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'creer-un-avatar-client',
      title: 'Créer un avatar client',
      short: 'Transformer un segment en une personne nommée, avec ses mots et ses objections.',
      objectives: [
        'Construire un avatar à partir de données réelles',
        'Intégrer des verbatims dans un message',
        'Utiliser l’avatar pour écrire et pour filtrer les prospects',
      ],
      minutes: 8,
      intro:
        "L'avatar est l'outil le plus sous-utilisé de la vente digitale. Il transforme une abstraction en personne : on n'écrit plus « pour les freelances », on écrit à Léa, 34 ans, qui vient de rater un appel de prospection.",
      explain:
        "Un avatar utile tient en une page et repose sur des éléments réels, pas inventés.\n\nIdentité : prénom, métier, ancienneté, taille de structure. Les détails concrets (utilise un outil précis, vend à des entreprises de 10 personnes) sont plus utiles que les adjectifs (« motivé »).\n\nJournée type : comment se passe sa journée, où le problème apparaît, ce qu'elle fait déjà pour le contourner.\n\nObjections : les trois raisons réelles de ne pas acheter, formulées comme elle les dirait.\n\nVerbatims : trois citations exactes issues de vraies conversations. C'est la matière la plus rentable : elles deviennent des titres, des accroches et des réponses.\n\nL'avatar sert ensuite de filtre : si un prospect ne ressemble pas à ton avatar, ce n'est pas ta faute si tu ne le convertis pas.",
      example:
        "Avatar : Léa, 34 ans, consultante indépendante, sept ans d'expérience, deux clients récurrents sur cinq. Elle envoie des propositions le lundi matin, en a envoyé 46 le mois dernier, n'a pas de suivi. Objections : « je n'ai pas le temps », « le mien n'est pas cher mais je ne veux pas me tromper », « les clients pleurent pas de toute façon ». Verbatim : « j’ai arrêté de relancer parce que j’avais honte d’insister ».",
      apply:
        "Construis ton avatar à partir de données réelles : un vrai message, une vraie conversation. Un avatar inventé produit une page qui ne parle à personne. Ensuite, relis ta page de vente en t'adressant à cette personne par son prénom : le texte s'améliore immédiatement.",
      nuvra:
        "L'avatar se traduit en tags dans Nuvra. Crée dans CRM un tag « avatar-lea » et applique-le à tes contacts qui lui ressemblent. Tu peux ensuite créer une automatisation qui envoie une séquence spécifique à ce tag, sans dupliquer tes contacts ni écrire un export CSV.",
      exercise: {
        title: 'Construire son avatar',
        instructions:
          "Remplis la fiche avatar avec des éléments issus de vraies conversations.",
        checklist: [
          'Identité précise avec détails concrets',
          'Journée type décrite',
          'Trois objections réelles',
          'Trois verbatims exacts',
        ],
        worksheet: [
          { key: 'identite', label: 'Identité', type: 'textarea' },
          { key: 'journee', label: 'Journée type', type: 'textarea' },
          { key: 'objections', label: 'Objections réelles', type: 'textarea' },
          { key: 'verbatims', label: 'Verbatims', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'transformation-promise',
      title: 'Définir la transformation promise',
      short: 'Écrire l’avant et l’après, de façon mesurable.',
      objectives: [
        'Formuler une transformation Avant / Après mesurable',
        'Choisir un délai crédible',
        'Déduire les preuves nécessaires pour la tenir',
      ],
      minutes: 8,
      intro:
        "Les offres digitales qui vendent le plus sont celles dont la transformation est décrite avec une précision presque embarrassante. « Gagner en ligne » ne se mesure pas. « Obtenir sa première vente de 90 € en 14 jours avec une page de vente déjà en ligne » se mesure, et se prouve.",
      explain:
        "Une transformation se compose de trois éléments.\n\nL'état initial : décrit par la personne, pas par toi. « Elle passe ses soirées sur un tableur. »\n\nL'état final : précis, daté, observable. « Elle a une page publiée, une liste de 50 contacts et une première commande. »\n\nLe chemin : la méthode qui produit la transformation, en trois à cinq étapes maximum. C'est ce qui rend la promesse crédible : on ne promet pas un résultat, on montre un chemin que l'on maîtrise.\n\nLe délai est un pari. Choisis un délai que tu tiens en moyenne, avec une marge : mieux vaut annoncer trois semaines et livrer en deux que l'inverse. Un délai trop court détruit la confiance plus sûrement qu'un prix trop élevé.\n\nUne transformation ne s'écrit pas seule : demande à trois personnes qui ont réussi ce qu'elles ont réellement obtenu, et par quels chemins. LeGap est presque toujours plus long que prévu dans leur récit.",
      example:
        "Avant : 46 propositions envoyées, aucune relance, 5 400 € de chiffre d'affaires irrégulier. Après 14 jours : une page de vente publiée, 50 contacts dans la liste, une séquence de relance, 3 clients. Méthode : clarifier l'offre, écrire la page, connecter le paiement, écrire les relances.",
      apply:
        "Écris la transformation en une phrase, puis teste-la : demande à cinq personnes de ton audience de te dire, après lecture, ce qu'elles obtiennent. Si leurs réponses divergent, ta transformation n'est pas claire.",
      nuvra:
        "Ta transformation est le cœur de ta fiche produit. Dans Products, le champ Description doit la contenir en premier. Elle sert aussi d'argument sur la page de vente et dans le titre de la formation. Garde la même formulation partout : la cohérence augmente la conversion.",
      exercise: {
        title: 'Écrire sa transformation',
        instructions:
          "Décris l'avant, l'après et le chemin. L'après doit être observable : si tu ne peux pas le constater en une phrase, il n'est pas défini.",
        checklist: [
          'Avant décrit avec un fait mesurable',
          'Après décrit avec un fait mesurable',
          'Chemin en trois étapes maximum',
          'Durée réaliste annoncée',
        ],
        worksheet: [{ key: 'transformation', label: 'Avant, après, chemin', type: 'textarea' }],
      },
      quiz: {
        title: 'Quiz — Transformation promise',
        passingScore: 80,
        questions: [
          {
            question: "Quelle formulation constitue la meilleure transformation promise ?",
            options: [
              'Devenir plus autonome',
              'Obtenir 3 clients en 14 jours grâce à une page publiée et une séquence de relance',
              'Apprendre le marketing digital',
              'Améliorer son chiffre d’affaires',
            ],
            answerIndex: 1,
            explanation:
              "Elle décrit un état final observable, un délai et une méthode : c’est la structure d’une promesse qui se prouve.",
          },
          {
            question:
              "Qu'est-ce qui rend une transformation crédible sur une page de vente ?",
            options: [
              "L'adjectif employé",
              "Un résultat observable, daté et vérifiable par le client",
              "La longueur de la promesse",
              "Le nombre de points d'exclamation",
            ],
            answerIndex: 1,
            explanation:
              "Une transformation crédible se constate : un résultat que la cliente peut vérifier elle-même vaut dix adjectifs que personne ne peut contrôler.",
          },

        ],
      },
    },
    {
      slug: 'construire-une-offre',
      title: 'Construire une offre',
      short: 'Assembler composants, promesse, prix, bonus et preuve en un ensemble cohérent.',
      objectives: [
        'Assembler les composants d’une offre',
        'Vérifier la cohérence entre promesse et contenu',
        'Nommer l’offre de façon claire et mémorisable',
      ],
      minutes: 9,
      intro:
        "Une offre, ce n'est pas une liste de composants. C'est un système : chaque élément répond à une question que l'acheteur se pose — « est-ce pour moi ? », « est-ce que ça marche ? », « ai-je le droit de me tromper ? ».",
      explain:
        "L'offre complète contient sept éléments.\n\nLe nom : il doit dire le bénéfice, pas la matière. « Le Sprint Offre » vaut mieux que « Module 1 » ; « Ta première page de vente en une heure » vaut mieux que « Formation landing pages ».\n\nLa promesse : l'état final, avec son délai.\n\nLe contenu : trois à sept éléments, jamais davantage. Plus il y a de modules, moins les gens les suivent.\n\nLa preuve : cas, exemples, chiffres, extraits. La preuve la plus efficace est un cas réel, même petit.\n\nLe prix : accordé à la valeur perçue.\n\nLes bonus : éléments de valeur perçue à coût de production quasi nul.\n\nLa garantie : la suppression du risque.\n\nL'ordre compte : promesse et contenu d'abord, prix au milieu, bonus après le prix, garantie juste avant le bouton. Cet ordre suit exactement la chronologie des questions de l'acheteur.",
      example:
        "Offre « Sprint Offre » : promesse d'une offre claire et d'une page publiée en 7 jours. Contenu : modèle d'offre, page de vente, séquence de relance, système de suivi. Preuve : 3 cas avec chiffres. Prix : 197 €. Bonus : bibliothèque de 12 titres de page, checklist de lancement. Garantie : 14 jours.",
      apply:
        "Écris l'offre sur une page, dans cet ordre. Puis relis-la en te demandant : « à quel moment le lecteur se demande-t-il si c'est trop cher ? ». La réponse indique où placer la garantie et la preuve.",
      nuvra:
        "Une fois l'offre écrite, Nuvra devient ton outil de livraison : Products pour les composants téléchargeables, Courses si tu vends un apprentissage, Automations pour la séquence de relance. Commence par un seul produit : il sera plus facile à vendre qu'un catalogue.",
      exercise: {
        title: "Assembler l'offre en sept blocs",
        instructions:
          "Reprends les sept éléments de l'offre et assemble-les en un document unique. C'est exactement le document que le lab de fin de module te demandera de livrer.",
        checklist: [
          'Cible, problème, promesse, bénéfices, preuve, offre et risque traités',
          'Offre écrite en une page maximum',
          'Prix et conditions de paiement décidés',
          'Offre lue à voix haute : chaque phrase comprise sans explication',
        ],
        worksheet: [{ key: 'offre', label: 'Votre offre en sept blocs', type: 'textarea' }],
      },
      quiz: {
        title: 'Quiz — Construction de l’offre',
        passingScore: 80,
        questions: [
          {
            question:
              "Quel élément manque le plus souvent dans une offre qui ne convertit pas ?",
            options: [
              'La preuve',
              'Le prix affiché',
              'Le nom du produit',
              'La couleur du bouton',
            ],
            answerIndex: 0,
            explanation:
              "Sans preuve, la promesse reste une affirmation. Un témoignage, un cas chiffré ou une démonstration suffit à lever le doute principal.",
          },
          {
            question: "Combien d’éléments doit contenir le contenu d’une offre ?",
            options: ['1 à 2', '3 à 7', '10 à 15', 'Autant que possible'],
            answerIndex: 1,
            explanation:
              "Au-delà de sept éléments, la charge augmente et le taux de complétion chute.",
          },
        ],
      },
    },
    {
      slug: 'positionnement',
      title: 'Positionnement',
      short: 'Être identifiable comme la meilleure option pour une audience précise.',
      objectives: [
        'Choisir une place de marché défendable',
        'Formuler un positionnement testable',
        'Vérifier la cohérence de son positionnement avec ses preuves',
      ],
      minutes: 8,
      intro:
        "Le positionnement répond à une seule question : « pourquoi vous plutôt qu'un autre ? ». Sans réponse claire, vous êtes interchangeable, et l'interchangeable se vend au prix le plus bas.",
      explain:
        "Un positionnement solide combine quatre éléments : l'audience visée, le cadre (le modèle mental dans lequel vous vous inscrivez), le bénéfice spécifique et la preuve.\n\nLe principe du cadre est le plus utile : face à une catégorie nouvelle, un client choisit celui qui lui paraît le plus familier. Un produit de « structuration d'offre » se compare à d'autres outils de structuration d'offre ; c'est plus facile que d'inventer une catégorie entière.\n\nTest de positionnement : demandez à trois personnes « à quoi ça sert ? » après avoir lu votre description. Si les réponses sont différentes de votre intention, votre positionnement n'est pas clair.\n\nLa cohérence est aussi une question d'actifs : le même vocabulaire doit revenir sur ta page, dans tes emails et dans tes produits. Un vocabulaire cohérent crée une association.",
      example:
        "« Notre solution aide les indépendants à structurer leur offre » (générique) devient « La seule méthode qui fait passer un indépendant de trois offres floues à une offre claire, avec le prix justifié, en 7 jours » (positionné). La différence tient à la méthode et au délai, pas aux adjectifs.",
      apply:
        "Écris trois positionnements possibles, un par cadre concurrent. Choisis celui où tu as la preuve la plus forte, pas celui qui sonne le mieux. Le positionnement doit pouvoir être défendu quand on te le demande.",
      nuvra:
        "Dans Nuvra, ton positionnement se voit sur la fiche produit (Products), sur la page de vente (Pages) et sur la carte de ta Nuvra Link. Utilise exactement la même formulation dans les trois endroits : c'est la cohérence, pas l'ornement, qui installe une perception de specialist.",
      exercise: {
        title: 'Test de positionnement',
        instructions:
          "Écris ton positionnement, puis fais-le tester à trois personnes de ton audience. Note leurs réponses spontanées.",
        checklist: [
          'Positionnement en une phrase',
          'Audience nommée',
          'Différence défendable énoncée',
          'Test à trois personnes effectué',
        ],
        worksheet: [
          { key: 'positionnement', label: 'Votre positionnement', type: 'textarea' },
          { key: 'reponses', label: 'Réponses entendues', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'pricing',
      title: 'Pricing',
      short: 'Fixer un prix par la valeur créée, pas par la peur de sa propre valeur.',
      objectives: [
        'Calculer un prix à partir de la valeur de la transformation',
        'Choisir une structure (unique, paliers, abonnement)',
        'Décider de la durée de la période de lancement',
      ],
      minutes: 9,
      intro:
        "Le prix est le moment où l'offre se confirme ou s'effondre. Un prix trop bas attire les mauvais clients et dévalorise le travail ; un prix trop élevé demande une confiance que vous n'avez pas encore construite. La bonne méthode part de la valeur, jamais du coût.",
      explain:
        "Trois manières de fixer un prix, trois logiques.\n\nLe prix par valeur : vous estimez ce que la transformation vaut pour la cliente (dépense évitée, revenu gagné, temps économisé) et vous en prélevez une fraction. C'est le modèle le plus rentable, et le plus difficile à expliquer.\n\nLe prix par comparaison : vous vous alignez sur ce que le marché paie déjà pour une promesse voisine.\n\nLe prix par coût : le calcul le plus courant et le moins pertinent. Il ignore la valeur perçue.\n\nLe format compte autant que le montant. Un paiement unique rassure sur la décision ; un abonnement augmente la valeur lifetime mais ajoute une promesse de durée. Un palier supérieur augmente le panier moyen de ceux qui hésitaient.\n\nEnfin, la période de lancement. Un prix réduit avec une date de fin crée l'urgence, à condition d'être vraie : si vous prolongez régulièrement, vous détruisez la confiance et l'urgence à jamais.",
      example:
        "Une cliente qui facture 2 000 € par mission et qui perd 3 000 € de chiffre d'affaires par mois en prospection manquant voit une solution à 90 €/mois comme triviale. À 400 €, elle hésite et compare. À 90 € avec onboarding et garantie, elle décide.",
      apply:
        "Écrivez trois prix : un prudent, un réaliste, un ambitieux. Demandez à cinq prospects potentiels lequel ils choisiraient et surtout pourquoi. La réponse à « pourquoi » vous apprend davantage que le prix choisi.",
      nuvra:
        "Nuvra gère les deux cas. Un produit à prix fixe se crée dans Products. Un abonnement se construit avec des plans et des abonnements, et le checkout gère le renouvellement. Les deux écrivent dans la même commande, avec les mêmes règles de commission et de remboursement.",
      exercise: {
        title: 'Fixer son prix',
        instructions:
          'Calcule ton prix à partir de la valeur estimée de ta transformation, puis structure ton offre.',
        checklist: [
          'Valeur estimée de la transformation chiffrée',
          'Prix unique ou structure en paliers',
          'Décision sur la durée de lancement',
          'Objectif de panier moyen si paliers',
        ],
        worksheet: [
          { key: 'valeur', label: 'Valeur estimée de la transformation', type: 'text' },
          { key: 'prix', label: 'Prix retenu', type: 'text' },
          { key: 'structure', label: 'Structure (unique, paliers, abonnement)', type: 'text' },
          { key: 'lancement', label: 'Période de lancement', type: 'text' },
        ],
      },
    },
    {
      slug: 'bonus',
      title: 'Bonus',
      short: 'Augmenter la valeur perçue sans gonfler le prix ni le travail.',
      objectives: [
        'Choisir des bonus pertinents et peu coûteux',
        'Utiliser les bonus pour résoudre une objection',
          'Présenter les bonus de façon structurée',
      ],
      minutes: 7,
      intro:
        "Un bonus n'est pas un cadeau. C'est un moyen de résoudre une objection précise. Si personne ne demandait « et si j'ai du mal à l'appliquer ? », un bonus d'implémentation est pertinent ; s'il s'agit plutôt de « est-ce que ça vaut ce prix ? », un bonus de valeur immédiate l'est davantage.",
      explain:
        "Trois familles de bonus fonctionnent.\n\nLes bonus d'implémentation : listes de contrôle, modèles, exemples remplis. Ils réduisent l'effort perçu, ce qui augmente la décision.\n\nLes bonus de valeur : ressources supplémentaires, sessions de questions, mises à jour. Ils augmentent la valeur immédiate du lot.\n\nLes bonus de risque : audits courts, sessions de démarrage. Ils réduisent le doute.\n\nUn bon bonus doit être livrable immédiatement, compréhensible en une phrase, et ne pas diluer l'attention sur l'offre principale. Trois bonus bien choisis valent mieux que dix.\n\nRègle de rédaction : chaque bonus porte un nom qui contient son bénéfice (« Générateur de 30 titres de page » plutôt que « Pack PDF »). Le nom fait 50 % du travail.",
      example:
        "Offre à 197 € : bonus 1 « 30 titres de page testés », bonus 2 « Checklist de lancement en 12 points », bonus 3 « Session de démarrage de 30 minutes ». Les trois répondent à des objections différentes : prix, effort, doute.",
      apply:
        "Écris la liste des objections de ta cliente, puis associe un bonus à chacune. Si tu ne peux pas associer un bonus à une objection, retire-le : c'est du bruit.",
      nuvra:
        "Un bonus digital est simplement un second produit à prix zéro dans Nuvra. Tu peux l'ajouter à une commande en tant que ligne distincte, ce qui te permet de suivre son taux de livraison et de l'afficher dans ton tableau de bord.",
      exercise: {
        title: 'Concevoir trois bonus',
        instructions:
          'Associe chaque bonus à une objection réelle de ton client.',
        checklist: [
          'Trois bonus identifiés',
          'Une objection associée par bonus',
          'Nom de chaque bonus porteur de bénéfice',
          'Livraison immédiate possible',
        ],
        worksheet: [
          { key: 'bonus', label: 'Bonus et objection associée', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'garantie',
      title: 'Garantie',
      short: 'Transférer le risque de l’acheteur vers le vendeur.',
      objectives: [
        'Choisir une durée de garantie pertinente',
        'Rédiger des conditions de garantie claires',
        'Savoir quand une garantie n’est pas pertinente',
      ],
      minutes: 7,
      intro:
        "La garantie ne sert pas à satisfaire la cliente : elle supprime l'obstacle cognitif qui empêche l'achat. Sur les offres à forte incertitude (formation, coaching), elle est l'un des leviers de conversion les plus puissants, et son abus détruit la rentabilité.",
      explain:
        "Une garantie efficace a trois propriétés.\n\nElle est proportionnée : elle couvre le risque perçu, pas le risque théorique. Une garantie de 14 jours sur un produit à 27 € ne rassure personne ; la même durée sur une formation à 497 € rassure beaucoup.\n\nElle est explicite : ce qui est couvert, ce qui ne l'est pas, et la procédure. Un « remboursement intégral, sans question » est plus puissant qu'une formule ambiguë.\n\nElle est tenable : ne promets que ce que tu peux honorer. Une garantie sur une prestation de conseil se mesure en heures ; une garantie sur un produit digital est immédiate.\n\nAttention à l'inversion : sur les offres à faible risque, la garantie n'apporte rien et dilue la perception de valeur. Utilise-la quand le coût de l'erreur est élevé pour la cliente.",
      example:
        "Formation à 497 € livrée en 7 jours : garantie « 14 jours, remboursement intégral si le programme ne vous convient pas, un simple email suffit ». Produit à 27 € : aucune garantie, mais un aperçu et un remboursement simple sous 48 h suffisent à lever le doute.",
      apply:
        "Écris ta garantie en trois lignes : durée, périmètre, procédure. Puis vérifie que tu tiens la promesse en moins de dix minutes. Si la procédure est longue, elle ne sera jamais utilisée et la confiance se perd.",
      nuvra:
        "Les remboursements sont déjà gérés par Nuvra, dans Payments. Un remboursement émis sur une commande Academy ou produit suit le même circuit : registre, ledger, et ajustement des commissions. Ta garantie n'est donc pas un texte décoratif : elle s'appuie sur un processus réel.",
      exercise: {
        title: 'Rédiger sa garantie',
        instructions:
          "Écris la garantie que tu tiendras, et vérifie que le processus de remboursement existe déjà dans Nuvra.",
        checklist: [
          'Durée choisie et justifiée',
          'Périmètre couvert explicite',
          'Procédure décrite en moins de trois étapes',
          'Remboursement gérable dans Payments',
        ],
        worksheet: [
          { key: 'garantie', label: 'Texte de la garantie', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'objections',
      title: 'Objections',
      short: 'Anticiper les raisons de ne pas acheter et y répondre précisément.',
      objectives: [
        'Recueillir les objections réelles',
        'Classer les objections par fréquence',
        'Rédiger une réponse qui ne se contente pas de réfuter',
      ],
      minutes: 8,
      intro:
        "Une objection est une information, pas un refus. « C'est cher » signifie souvent « je ne vois pas encore la valeur ». « Je n'ai pas le temps » signifie « je ne crois pas que le résultatJustifie l'effort ». Traiter une objection, c'est répondre à la peur qui se cache derrière.",
      explain:
        "On recueille les objections de trois manières : les questions posées en conversation, les questions fréquentes sur la page de vente, et les tags ou motifs d'abandon de checkout.\n\nOn les classe ensuite par fréquence et par gravité. Une objection qui bloque 80 % des ventes mérite une section entière.\n\nLa structure de réponse la plus robuste comprend trois temps : reconnaître, comprendre, montrer.\n\nReconnaître : « Tu as raison, 197 € n'est pas une petite somme. »\n\nComprendre : « La plupart de nos clientes hésitent parce qu'elles ont déjà payé pour une formation qu'elles n'ont pas terminée. »\n\nMontrer : « C'est pourquoi le programme se termine en 7 jours, avec un suivi quotidien, et la garantie de 14 jours. »\n\nCe qui ne fonctionne pas : multiplier les arguments, citer des pourcentages non sourcés, ou prétendre que l'objection est infondée.",
      example:
        "Objection « je n'ai pas le temps ». Mauvaise réponse : « C'est faux, tout le monde a le temps. » Bonne réponse : « La version express dure 15 minutes par jour. Si après une semaine tu n'as pas vu de résultat, la garantie te rembourse. »",
      apply:
        "Écris les trois objections les plus fréquentes de ton audience, puis rédige une réponse complète pour chacune. Teste tes réponses en les envoyant à trois prospects : si la conversation s'arrête, la réponse n'a pas traité la peur.",
      nuvra:
        "Une objection se traite au bon endroit du tunnel. Les objections de prix se traitent sur la page de vente (bonus, garantie, paliers). L'objection de temps se traite par la page (durée affichée) et par l'automaton d'email (rappel quotidien). Les objections quipersistent apparaissent dans les notes de contact du CRM : elles deviennent le contenu de ton prochain contenu.",
      exercise: {
        title: 'Traiter trois objections',
        instructions:
          'Pour chaque objection, écris une réponse en trois temps : reconnaître, comprendre, montrer.',
        checklist: [
          'Trois objections réelles recensées',
          'Réponse rédigée pour chacune',
          'Preuve associée à chaque réponse',
        ],
        worksheet: [
          { key: 'objections', label: 'Objections et réponses', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'offre-irresistible',
      title: 'Offre irrésistible',
      short: 'Assembler tous les éléments jusqu’à ce que l’offre se vende toute seule.',
      objectives: [
        'Vérifier la complétude d’une offre',
        'Structurer une page de vente autour de l’offre',
        'Décider quand arrêter et itérer',
      ],
      minutes: 8,
      intro:
        "Une offre irrésistible n'est pas un concept mystique : c'est un ensemble dont chaque objection a déjà une réponse et chaque étape un contenu. Le mot important, c'est ensemble. Une offre parfaite sur un point et faible sur les dix autres ne convertit pas.",
      explain:
        "La checklist d'une offre complète comporte dix points : un nom qui dit le bénéfice, une promesse mesurable, un contenu de trois à sept éléments, une preuve vérifiable, un prix justifié, trois bonus associés à trois objections, une garantie explicite, une réponse à chaque objection, un appel à l'action unique, et une garantie de ne pas devoir réfléchir.\n\nL'appel à l'action unique est souvent négligé : si une page propose « réserver un appel », « acheter » et « s'inscrire à la newsletter », elle ne convertit personne. Un seul CTA principal, répété.\n\nQuant à l'itération : on ne change pas tout d'un coup. On change une variable, on observe, on recommence. Une offre qui n'est pas publiée ne s'améliore jamais ; une offre publiée s'améliore à chaque semaine de données.",
      example:
        "Offre complète : nom « Sprint Offre », promesse « offre claire + page publiée en 7 jours », 4 modules, 3 cas chiffrés, 197 €, 3 bonus, garantie 14 jours, objections traitées, CTA unique « Rejoindre le sprint », et un argument d'urgence réel (42 places, date de clôture).",
      apply:
        "Passe ta checklist et note ce qui manque, par ordre d'impact. Publie dès que les trois éléments bloquants sont résolus : promesse, prix, CTA. Le reste s'affinera avec les données réelles des premières semaines, pas avec des mois de réflexion.",
      nuvra:
        "Dans Nuvra, cette offre devient un produit. La page de vente est une page (Pages) publiée, reliée au produit par un bloc Checkout. Le CTA est le bouton de cette page. Le tunnel qui mène à elle est un funnel (Funnels) : tu pourras mesurer chaque étape et savoir où les gens s'arrêtent.",
      action: {
        action: 'create_page',
        label: 'Créer ma page de vente',
        route: '/dashboard/pages?new=1',
        requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
        completionCheck: 'page_created',
        hint: 'Ta page de vente est une page Nuvra : blocs, CTA et checkout.',
      },
      exercise: {
        title: 'Checklist offre irrésistible',
        instructions: 'Passe chaque point de la checklist et note ce qui manque.',
        checklist: [
          'Nom porteur de bénéfice',
          'Promesse mesurable',
          'Contenu de 3 à 7 éléments',
          'Preuve vérifiable',
          'Prix justifié',
          '3 bonus associés à des objections',
          'Garantie explicite',
          'CTA unique',
          'Urgence réelle',
        ],
        worksheet: [
          { key: 'checklist', label: 'Ta checklist', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'transformer-offre-en-produit',
      title: 'Transformer son offre en produit Nuvra',
      short: 'Préparer la fiche produit avant de créer : ce qu’un acheteur doit voir.',
      objectives: [
        'Préparer titre, description, prix et couverture d’un produit',
        'Choisir le bon type de produit Nuvra',
        'Rédiger une description orientée bénéfice',
      ],
      minutes: 8,
      intro:
        "La fiche produit est le point de contact entre l'offre et l'interface. Une fiche faible transforme en page de vente qui convertit bien. La préparer en amont évite de revenir dessus trois fois.",
      explain:
        "Quatre champs comptent.\n\nLe titre : il doit contenir le bénéfice principal et le mot que la cliente cherche. « Sprint Offre : ta page de vente publiée en 7 jours ».\n\nLa description : elle suit l'ordre promesse, contenu, preuve, prix, garantie. Les deux premières lignes comptent le plus : la plupart des gens ne liront pas la suite si le début est faible.\n\nLe prix : un nombre unique, en devise, aligné sur ta décision de tarification.\n\nLa couverture : une image sobre, contrastée, lisible en vignette. Dans l'esprit Nuvra : fond sombre, typographie blanche, un seul accent bleu, un mot-clé lisible.\n\nLe type (DIGITAL, SERVICE, AUDIO, TEMPLATE) indique comment la livraison fonctionnera et influence ce que le checkout propose.",
      example:
        "Titre : « Sprint Offre — ton offre et ta page de vente publiées en 7 jours ». Description : première ligne = promesse, deuxième = « 4 modules, 3 cas réels, 197 € ». Couverture : fond ink-950, titre en blanc, un trait bleu sous « 7 jours ».",
      apply:
        "Écris les quatre champs sur une fiche avant d'ouvrir l'interface. Tu repéreras immédiatement ce qui manque, et tu n'auras pas à remplir des champs vides sous pression.",
      nuvra:
        "Ouvre Products dans ton espace : le formulaire de création accepte exactement ces champs. Enregistre d'abord en brouillon : tu pourras publier quand la fiche sera complète, et la publication rend le produit immédiatement vendable via le checkout.",
      exercise: {
        title: 'Préparer sa fiche produit',
        instructions: 'Rédige les quatre champs de ta fiche produit avant de la créer dans Nuvra.',
        checklist: [
          'Titre avec bénéfice et mot-clé',
          'Description en 5 blocs',
          'Prix aligné sur ta décision',
          'Idée de couverture décrite',
          'Type de produit choisi',
        ],
        worksheet: [
          { key: 'titre', label: 'Titre', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'prix', label: 'Prix', type: 'text' },
          { key: 'type', label: 'Type', type: 'text' },
        ],
      },
    },
    {
      slug: 'creer-son-premier-produit',
      title: 'Créer son premier produit dans Nuvra',
      short: 'Ouvrir le Product Builder et configurer un produit vendable de bout en bout.',
      objectives: [
        'Créer un produit dans le Product Builder',
        'Configurer titre, description, type et prix',
        'Publier le produit pour le rendre vendable',
      ],
      minutes: 10,
      example:
        "Nora crée « Sprint Offre — 197 € », type DIGITAL, description en cinq blocs, couverture sobre. Elle enregistre en brouillon, vérifie la fiche sur sa page de vente, puis publie. Le produit devient sélectionnable dans le bloc Checkout de sa page et vendable depuis sa boutique le jour même.",
      intro:
        "C'est le moment de vérité du module : l'offre écrite devient un objet vendable dans ton espace. Le produit que tu crées ici est le même que celui que Nuvra encaissera, livrera et comptabilisera dans tes commandes.",
      explain:
        "Le Product Builder de Nuvra réunit cinq champs : nom, type, description, prix, statut. Le reste est optionnel mais utile : couverture et lien de téléchargement.\n\nLe type conditionne la livraison. Un produit DIGITAL sera proposé au checkout comme un accès ou un fichier ; un SERVICE apparaîtra comme une prestation ; un TEMPLATE est un fichier à télécharger.\n\nLe statut DRAFT te permet de travailler sans risque. PUBLISHED rend le produit sélectionnable au checkout et sur les pages. Publie quand tu es prêt : un produit publié n'est pas cher à dépublier, mais un produit publié sans description l'est.\n\nAprès création, ton produit apparaît dans Products, dans ta boutique, et devient sélectionnable dans un bloc Checkout de n'importe quelle page.",
      apply:
        "Crée un premier produit simple et vendable, même si l'offre définitive n'est pas encore prête : un template, un mini-cours, un audit. Le premier produit sert à apprendre le flux complet, pas à générer des revenus.",
      nuvra:
        "Voici le flux réel : ouvre Products, clique sur Nouveau produit, remplis les champs, enregistre. Si tu préfères partir d'une page de vente, tu peux aussi créer le produit depuis le tunnel. Dans les deux cas, l'objet créé est identique et apparaît immédiatement dans ton tableau de bord.",
      action: {
        action: 'create_product',
        label: 'Créer mon premier produit',
        route: '/dashboard/products?new=1',
        requiredEntity: 'Un produit Nuvra avec son prix et son checkout',
        completionCheck: 'product_created',
        hint: 'Ouvre le Product Builder de Nuvra et configure ton produit.',
      },
      exercise: {
        title: 'Créer et publier un produit',
        instructions:
          'Crée un produit dans Nuvra, renseigne tous les champs, puis publie-le.',
        checklist: [
          'Produit créé dans le Product Builder',
          'Type choisi',
          'Description renseignée',
          'Prix configuré',
          'Produit publié',
        ],
        worksheet: [
          { key: 'produit', label: 'Produit créé', type: 'text' },
          { key: 'prix', label: 'Prix défini', type: 'text' },
          { key: 'statut', label: 'Statut', type: 'text' },
        ],
      },
      resources: [
        {
          title: 'Checklist de fiche produit',
          kind: 'CHECKLIST',
          description: 'Les neuf champs à vérifier avant de publier un produit.',
        },
      ],
      video: {
        narration:
          "Ouvre le Product Builder, remplis les champs, publie. Ton offre vient de devenir un objet vendable dans Nuvra. Le module suivant va construire le chemin qui y amène les clientes.",
      },
    },
  ],
};
