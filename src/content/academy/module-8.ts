import type { AcademyModuleInput } from './types';

/** Module 8 — Croissance. */
export const MODULE_8: AcademyModuleInput = {
  slug: 'croissance',
  title: 'Croissance',
  description:
    "La croissance n'est pas un coup de chance : c'est un système de pilotage. Des indicateurs clairs, un revenu par client connu, des leviers d'optimisation, et un plan qui tient sur douze mois.",
  objectives: [
    'Définir les indicateurs qui comptent vraiment',
    'Lire ses statistiques sans se tromper',
    'Calculer un coût d’acquisition et une valeur client',
    'Construire des leviers de revenus supplémentaires',
    'Comprendre le rôle de la Marketplace et des affiliations',
    'Construire un plan de croissance sur douze mois',
    'Assembler le système complet dans Nuvra',
  ],
  deliverable:
    'Le Nuvra Growth System : produit, offre, page, tunnel, checkout, email, automation, CRM, analytics, acquisition et suivi, vérifiés de bout en bout.',
  lab: {
    title: 'Lab final — Nuvra Growth System',
    goal:
      'Vérifier que chaque pièce de votre système existe, fonctionne et est mesurée.',
    steps: [
      'Cocher chaque élément du système et ouvrir l’outil correspondant pour le vérifier',
      'Renseigner votre tableau de bord : visiteurs, leads, ventes, panier moyen, taux de conversion',
      'Calculer votre CAC et votre valeur par cliente',
      'Écrire votre plan de croissance sur douze mois et le publier dans vos ressources',
    ],
    action: {
      action: 'open_analytics',
      label: 'Ouvrir mon tableau de bord',
      route: '/dashboard/analytics',
      requiredEntity: 'Une lecture du tableau de bord Statistiques',
      completionCheck: 'analytics_consulted',
      hint: 'Remplis ton tableau d’indicateurs avec des chiffres réels.',
    },
  },
  video: {
    title: 'Module 8 — Piloter et grandir',
    description:
      'Les chiffres qui décident, les leviers qui font grandir, et le plan sur douze mois.',
    durationSec: 620,
    script: `00:00 — Accroche
Grandir, ce n'est pas faire plus. C'est savoir où sont les gonds. Dans ce dernier module, on passe de l'opérateur à l'analyste : on regarde les chiffres, on calcule ce que coûte une cliente, ce qu'elle rapporte, et où se trouve le prochain levier.

01:00 — Les quatre indicateurs
Quatre chiffres suffisent à piloter une activité : le nombre de visiteurs qualifiés, le nombre de leads, le nombre de ventes, et le panier moyen. Tout le reste est un détail. Ces quatre chiffres, mis bout à bout, donnent le taux de conversion global, qui est la seule mesure qui compte à la fin.

02:40 — Lire ses statistiques
Une statistique sans contexte trompe. Ce qui compte, ce sont les tendances sur 30 jours, les comparaisons entre canaux, et les écarts entre ce que vous attendiez et ce qui est arrivé. La question utile n'est jamais « qu'est-ce que mes chiffres ? » mais « qu'est-ce qui a changé, et pourquoi ? ».

04:20 — CAC et LTV
Le CAC, c'est le coût d'acquisition d'une cliente, obtenu par le coût par lead divisé par le taux de conversion lead vers cliente. La LTV, c'est le revenu total qu'une cliente génère sur sa durée de relation. Le ratio qui compte : LTV divisée par CAC. En dessous de 3, le modèle ne tient pas. Au-dessus de 3, il peut être financé par lui-même.

05:50 — Revenus supplémentaires
Augmenter son revenu sans augmenter son coût d'acquisition se fait par trois leviers : l'upsell, la vente additionnelle, et les abonnements. Ces trois leviers utilisent le même trafic, donc ils sont les plus rentables qui soient.

07:20 — Marketplace et affiliation
La Marketplace expose votre formation à une audience qui vous cherche déjà. L'affiliation transforme vos clients satisfaits en prescripteurs. Les deux ajoutent de la demande sans augmenter votre coût de production.

08:50 — Rétention
Le meilleur levier de croissance reste la rétention. Une cliente qui achète trois fois vaut plus que trois clientes qui achètent une fois, sans coût d'acquisition supplémentaire. Le suivi post-achat est l'instrument de cette stratégie.

10:20 — Le plan
Un plan de croissance tient en trois questions : quel levier, quel indicateur, quelle échéance. Un levier par trimestre maximum. L'erreur la plus fréquente est de vouloir activer les quatre en même temps : on n'en active aucun correctement.

11:30 — Le système complet
Vous avez maintenant un produit, une offre, une page, un tunnel, un checkout, des emails, des automations, un CRM, des statistiques et une acquisition. C'est cela que vous allez vérifier dans le lab final, et c'est cela que vous continuerez à faire tourner.`,
    chapters: [
      { title: 'Les quatre indicateurs', time: 0 },
      { title: 'Lire ses statistiques', time: 100 },
      { title: 'CAC et valeur client', time: 260 },
      { title: 'Revenus supplémentaires', time: 350 },
      { title: 'Rétention et affiliations', time: 440 },
      { title: 'Le plan sur douze mois', time: 510 },
    ],
    transcript:
      "Grandir, ce n'est pas faire plus, c'est savoir où sont les gonds. Quatre chiffres suffisent à piloter une activité : visiteurs qualifiés, leads, ventes, panier moyen. Une statistique sans contexte trompe : regardez les tendances sur 30 jours et les écarts entre les canaux. Le CAC est le coût d'acquisition d'une cliente, la LTV le revenu total sur la durée de la relation. Le ratio qui compte est LTV divisé par CAC : en dessous de 3, le modèle ne tient pas. On augmente son revenu sans coût supplémentaire par l'upsell, la vente additionnelle et l'abonnement. La Marketplace expose votre produit à une audience qui vous cherche déjà. La rétention reste le meilleur levier : une cliente qui achète trois fois vaut trois clientes. Un plan de croissance tient en trois questions : quel levier, quel indicateur, quelle échéance. Un levier par trimestre maximum.",
    storyboard: [
      {
        time: '00:00',
        visual: 'Tableau de bord avec quatre indicateurs en grand.',
        narration: 'Quatre chiffres suffisent à piloter une activité.',
        onScreenText: '4 indicateurs',
      },
      {
        time: '01:00',
        visual: 'Les quatre compteurs : visiteurs, leads, ventes, panier moyen.',
        narration: 'Visiteurs, leads, ventes, panier moyen.',
        onScreenText: 'Le tableau de bord',
      },
      {
        time: '02:40',
        visual: 'Courbes sur 30 jours, deux canaux comparés.',
        narration: 'Qu’est-ce qui a changé, et pourquoi ?',
        onScreenText: 'Lire ses statistiques',
      },
      {
        time: '04:20',
        visual: 'Formule CAC puis ratio LTV / CAC avec un curseur.',
        narration: 'En dessous de 3, le modèle ne tient pas.',
        onScreenText: 'CAC & LTV',
      },
      {
        time: '05:50',
        visual: 'Trois leviers : upsell, vente additionnelle, abonnement.',
        narration: 'Le même trafic, trois fois plus de revenu.',
        onScreenText: 'Revenus supplémentaires',
      },
      {
        time: '07:20',
        visual: 'Fiche produit dans la marketplace Nuvra et lien d’affiliation.',
        narration: 'De la demande sans coût de production.',
        onScreenText: 'Marketplace & affiliation',
      },
      {
        time: '10:20',
        visual: 'Calendrier trimestriel avec un levier par trimestre.',
        narration: 'Un levier par trimestre maximum.',
        onScreenText: 'Plan de croissance',
      },
    ],
  },
  lessons: [
    {
      slug: 'kpis',
      title: 'KPIs',
      short: 'Quatre chiffres qui suffisent à piloter.',
      objectives: [
        'Définir les indicateurs suited à son activité',
        'Ne pas confondre activité et résultat',
        'Installer un rituel de lecture hebdomadaire',
      ],
      minutes: 7,
      intro:
        "Un indicateur mal choisi conduit à des décisions mauvaises. La plupart des activités suivent trop d'indicateurs, et se retrouvent à optimiser ce qui est facile à mesurer plutôt que ce qui produit le revenu.",
      explain:
        "Quatre indicateurs suffisent, quel que soit le modèle.\n\nLes visiteurs qualifiés : les personnes réellement susceptibles d'acheter, pas toutes les visites.\n\nLes leads : les contacts identifiés et Segmentables.\n\nLes ventes : le nombre de commandes sur la période.\n\nLe panier moyen : la valeur par commande.\n\nÀ partir de ces quatre chiffres, on déduit le taux de conversion global. Les autres indicateurs — ouvertures, clics, pages vues — sont des diagnostics, pas des objectifs. Ils servent à comprendre pourquoi les quatre premiers ne bougent pas.\n\nLe rituel : une lecture hebdomadaire de 20 minutes, avec trois questions : qu'est-ce qui a monté, qu'est-ce qui a baissé, qu'est-ce que je change la semaine prochaine. Un rituel tenu vaut mieux qu'un tableau parfait consulté une fois.",
      example:
        "Une activité suit 34 indicateurs et ne sait jamais quoi corriger. Une autre suit 4, compare chaque semaine, et corrige un levier à la fois. La seconde croît plus vite avec moins de trafic.",
      apply:
        "Écrivez vos quatre indicateurs sur une feuille, avec la source de chaque donnée dans Nuvra. Puis fixez l'heure de votre lecture hebdomadaire.",
      nuvra:
        "Analytics Nuvra fournit les volumes de vues, de contacts et de commandes, et le revenu par période. Ces données couvrent vos quatre indicateurs sans aucun tableur.",
      exercise: {
        title: 'Définir ses quatre KPI',
        instructions: 'Quatre indicateurs, source de données, rituel de lecture.',
        checklist: [
          'Quatre indicateurs définis',
          'Source de chaque donnée identifiée',
          'Rituel hebdomadaire fixé',
          'Trois questions de lecture écrites',
        ],
        worksheet: [
          { key: 'kpi', label: 'Vos KPI', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'analytics',
      title: 'Analytics',
      short: 'Lire ses données sans se raconter d’histoires.',
      objectives: [
        'Lire un tableau de bord avec méthode',
        'Distinguer tendance et bruit',
        'Transformer une observation en décision',
      ],
      minutes: 8,
      intro:
        "Les statistiques mentent rarement : c'est leur lecture qui ment. Un nombre isolé ne veut rien dire ; seul un écart, dans le temps ou entre deux groupes, produit une décision.",
      explain:
        "Trois règles de lecture.\n\nJamais de nombre isolé : un taux de 2 % sur trois personnes n'est pas un taux, c'est du bruit. Visez au moins cent observations par période.\n\nToujours comparer : à la période précédente, au même moment sur une autre année si vous l'avez, et à un autre canal.\n\nChercher les écarts, pas les niveaux : une hausse de 3 % ne dit rien ; un écart entre deux pages de 40 % dit où chercher.\n\nLe biais principal est le biais du survivant : on regarde ce qui a marché et on répète, sans regarder ce qui a échoué. Consignez aussi les échecs.\n\nLa décision : chaque lecture doit produire une phrase du type « cette semaine, je change X parce que Y ». Une lecture sans décision est une lecture de distraction.",
      example:
        "Cette semaine : les visites montent de 20 %, les ventes baissent de 15 %. Ce n'est pas un problème de trafic : c'est un problème de conversion. Il faut regarder quelle source a changé, pas refaire du contenu.",
      apply:
        "Écrivez chaque semaine trois phrases : ce qui a monté, ce qui a baissé, ce que je change. Relisez-les dans un mois : vous verrez les leviers qui fonctionnent chez vous.",
      nuvra:
        "Analytics Nuvra regroupe les vues par page, les contacts créés, les commandes, les revenus et les commissions. Les mêmes données alimentent aussi vos campagnes et vos tunnels, sans export.",
      action: {
        action: 'open_analytics',
        label: 'Ouvrir mes statistiques',
        route: '/dashboard/analytics',
        requiredEntity: 'Une lecture du tableau de bord Statistiques',
        completionCheck: 'analytics_consulted',
        hint: 'Commencez par les quatre indicateurs de la leçon précédente.',
      },
      exercise: {
        title: 'Première lecture de données',
        instructions: 'Comparez la semaine avec la précédente et notez trois écarts.',
        checklist: [
          'Quatre indicateurs lus',
          'Trois écarts identifiés',
          'Une décision écrite',
        ],
        worksheet: [
          { key: 'lecture', label: 'Votre lecture', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'revenus',
      title: 'Revenus',
      short: 'Comprendre d’où vient chaque euro encaissé.',
      objectives: [
        'Analyser un revenu par produit et par canal',
        'Distinguer revenu brut et revenu net',
        'Repérer les dépendances fragiles',
      ],
      minutes: 7,
      intro:
        "Le chiffre d'affaires flatte, le revenu réel instruit. La première question n'est pas « combien ai-je gagné ? » mais « d'où vient chaque euro, et quelle est la part que je garde ? ",
      explain:
        "Trois décompositions utiles.\n\nPar produit : un produit qui représente 80 % de votre chiffre est un risque, pas un succès. Une offre secondaire crédible réduit cette dépendance.\n\nPar canal : un canal qui représente 70 % de vos leads est un canal à surveiller de près, surtout s'il dépend d'un algorithme.\n\nBrut et net : le brut est ce que l'acheteur paie. Le net est ce qui vous revient après la part plateforme, les frais de paiement et les remboursements. Un produit à fort volume et faible marge peut produire un brut élevé et un net faible.\n\nSur la fréquence de lecture : le revenu se lit mensuellement, pas quotidiennement. Le relevé quotidien est du bruit statistique avec beaucoup d'émotions en plus.",
      example:
        "Mois donné : 4 200 € de brut, dont 3 400 € d'un seul produit vendu par un seul canal. Après commission et frais : 2 980 €. La question utile n'est pas « ai-je gagné 2 980 € ? » mais « que se passe-t-il si ce canal disparaît demain ? ».",
      apply:
        "Établissez un tableau mensuel : brut, frais, part plateforme, remboursements, net. Ajoutez une colonne « dépendance » : quel produit, quel canal, quel client concentre le revenu.",
      nuvra:
        "Dans Nuvra, les commandes portent le montant brut, la part plateforme et le statut. Le registre (ledger) conserve chaque écriture : ventes, commissions, frais, remboursements. Le net est reconstructible à partir de ces écritures, sans approximation.",
      exercise: {
        title: 'Analyser son revenu',
        instructions: 'Tableau mensuel : brut, frais, net, dépendances.',
        checklist: [
          'Chiffre brut du mois',
          'Frais et commissions identifiés',
          'Net calculé',
          'Dépendance principale nommée',
        ],
        worksheet: [
          { key: 'revenus', label: 'Votre analyse de revenu', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'conversion',
      title: 'Conversion',
      short: 'Le ratio qui résume toute votre activité.',
      objectives: [
        'Calculer un taux de conversion global',
        'Comparer un taux à une référence honnête',
        'Décider quoi corriger à partir du taux',
      ],
      minutes: 7,
      intro:
        "Le taux de conversion global — ventes divisées par visiteurs — est le résumé le plus honnête de ce que fait une activité. Il ne se trompe pas : s'il baisse, quelque chose s'est dégradé, quel que soit le discours.",
      explain:
        "Les repères, à manier avec prudence : un tunnel de capture email convertit couramment entre 15 et 40 % des visiteurs en lead ; une landing qui vend directement convertit entre 1 et 3 % des visiteurs en vente ; une page de vente affichée à du trafic déjà qualifié convertit entre 3 et 10 %.\n\nCes repères servent à situer, pas à culpabiliser. Ils varient énormément selon la niche, le prix, la source du trafic et la maturité de l'offre.\n\nLa vraie question n'est jamais « mon taux est-il bon ? » mais « mon taux s'améliore-t-il quand je corrige le point faible que j'ai identifié ? ». C'est cette pente qui mesure votre progression.\n\nEt le piège du trafic non qualifié : triples le trafic, le taux baisse, le chiffre d'affaires stagne. Plus de trafic n'est pas plus de croissance.",
      example:
        "Un tunnel passe de 1,8 % à 2,6 % en deux mois grâce au titre, à la preuve et au checkout. Le taux global augmente, le chiffre d'affaires de 40 %, sans un euro de trafic supplémentaire.",
      apply:
        "Calculez votre taux global chaque semaine. Notez la correction mise en œuvre. À la fin du mois, mesurez la pente : c'est votre progression réelle.",
      nuvra:
        "Analytics Nuvra croise les vues de pages et les commandes sur la même période. C'est exactement la lecture qu'il faut pour calculer ce taux, sans tableur.",
      exercise: {
        title: 'Suivre son taux de conversion',
        instructions: 'Quatre semaines de taux, avec la correction appliquée chaque semaine.',
        checklist: [
          'Taux calculé sur 4 semaines',
          'Une correction par semaine',
          'Pente mesurée',
        ],
        worksheet: [
          { key: 'taux', label: 'Vos taux', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'cac',
      title: 'CAC',
      short: 'Le coût réel d’une cliente, pas celui d’un clic.',
      objectives: [
        'Calculer un CAC correctement',
        'Comparer le CAC à la marge',
        'Décider quand augmenter son budget',
      ],
      minutes: 7,
      intro:
        "Le coût d'acquisition se calcule trop souvent sur la mauvaise base : le coût du clic. La bonne question est : combien ai-je dépensé pour obtenir une cliente, ventes comprises, sur une période donnée ?",
      explain:
        "La formule : CAC = dépenses d'acquisition de la période ÷ nombre de clientes acquises sur cette période.\n\nCe qui entre dans le calcul : publicité, contenus produits pour l'acquisition, outils, temps passé à prospecter si vous le valorisez.\n\nCe qui n'entre pas : le coût de production du produit. Il n'est pas lié à l'acquisition.\n\nLa comparaison juste se fait avec la marge brute par cliente, pas avec le prix. Un produit à 49 € dont la livraison coûte 8 € ne peut pas supporter un CAC de 45 €.\n\nLa règle de décision : on augmente le budget quand le CAC reste stable et que le retour sur investissement est positif sur trente jours. Si le CAC monte quand le budget monte, le canal est saturé et il faut diversifier.",
      example:
        "Dépense : 900 € de publicité. Clientes : 18. CAC : 50 €. Marge par cliente : 110 €. Le canal est rentable et peut recevoir plus de budget, à condition de surveiller le CAC chaque semaine.",
      apply:
        "Calculez votre CAC mensuel, puis votre marge par cliente. Si la marge est inférieure au CAC, ne dépensez pas davantage : corrigez d'abord l'offre ou le tunnel.",
      nuvra:
        "Les commandes Nuvra portent leur canal et leur source, ce qui permet d'attribuer une part de vos dépenses d'acquisition et de calculer un CAC par canal plutôt qu'un CAC global.",
      exercise: {
        title: 'Calculer son CAC',
        instructions: 'Dépenses du mois, clientes acquises, CAC, marge par cliente.',
        checklist: [
          'Dépenses d’acquisition du mois listées',
          'Nombre de clientes acquises',
          'CAC calculé',
          'Marge par cliente comparée',
        ],
        worksheet: [
          { key: 'cac', label: 'Votre CAC', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'ltv',
      title: 'LTV',
      short: 'Ce qu’une cliente vaut vraiment sur la durée.',
      objectives: [
        'Calculer une valeur par cliente',
        'Comparer LTV et CAC',
        'Décider quand investir dans la fidélisation',
      ],
      minutes: 7,
      intro:
        "La valeur par cliente est la seule mesure qui permette de savoir si votre modèle peut se financer lui-même. Une cliente qui achète trois fois est plus rentable qu'un public deux fois plus large qui n'achète qu'une.",
      explain:
        "Trois méthodes de calcul, par ordre de précision.\n\nSimple : prix moyen × nombre d'achats observés.\n\nPragmatique : marge par cliente × durée moyenne de la relation.\n\nCohort : marge par cliente, par mois d'acquisition. La plus fiable, et la plus instructive : elle montre la qualité de chaque vague.\n\nLe ratio décisif est LTV / CAC. En dessous de 3, le modèle consomme du cash pour chaque cliente gagné ; entre 3 et 5, il est confortable ; au-delà, l'acquisition devient un investissement et vous pouvez accélérer.\n\nLa conséquence pratique : avant de chercher plus de clientes, cherchez à vendre davantage à celles que vous avez. C'est moins cher, plus rapide, et cela améliore le ratio immédiatement.",
      example:
        "LTV : 3 achats de 110 € de marge = 330 €. CAC : 50 €. Ratio : 6,6. Le modèle s'autofinance largement, et la priorité devient le contenu qui attire des clientes de qualité, pas le volume de trafic.",
      apply:
        "Calculez votre LTV avec la méthode que vos données permettent. Comparez au CAC. Si le ratio est faible, travaillez la deuxième vente avant la première acquisition.",
      nuvra:
        "Les commandes et contacts Nuvra sont liés : vous pouvez suivre, par cohorte de contacts, le nombre d'achats dans les mois qui suivent. C'est exactement la mesure de la valeur par cliente.",
      exercise: {
        title: 'Calculer sa LTV',
        instructions: 'Marge par cliente, fréquence d’achat, durée de la relation, ratio.',
        checklist: [
          'Marge par cliente calculée',
          'Nombre d’achats moyen mesuré',
          'LTV estimée',
          'Ratio LTV / CAC calculé',
        ],
        worksheet: [
          { key: 'ltv', label: 'Votre LTV', type: 'textarea' },
        ],
      },
      quiz: {
        title: 'Quiz — LTV et CAC',
        passingScore: 80,
        questions: [
          {
            question: "Un ratio LTV / CAC de 2,2 signifie :",
            options: [
              'Le modèle est très rentable',
              'Le modèle est fragile : chaque cliente gagnée coûte presque la moitié de sa valeur',
              'Il faut augmenter le prix',
              'Le trafic est insuffisant',
            ],
            answerIndex: 1,
            explanation:
              "En dessous de 3, l’acquisition consomme une part importante de la valeur générée : il faut travailler la rentabilité ou la fréquence d’achat avant de générer du trafic.",
          },
          {
            question:
              "Quand votre CAC monte en même temps que votre budget, cela signifie :",
            options: [
              'Le canal sature : diversifiez ou optimisez avant d\'investir davantage',
              'Le canal fonctionne mieux que prévu',
              'Il faut augmenter le prix immédiatement',
              'La page de vente doit être rallongée',
            ],
            answerIndex: 0,
            explanation:
              "Un CAC stable quand le budget monte est un bon signal. Un CAC qui monte avec le budget signale un canal saturé, où chaque euro rapporte moins que le précédent.",
          },
        ],
      },
    },
    {
      slug: 'optimisation',
      title: 'Optimisation',
      short: 'Améliorer un levier à la fois, avec mesure avant et après.',
      objectives: [
        'Choisir un levier d’optimisation',
        'Mesurer avant et après',
        'Consigner les tests',
      ],
      minutes: 7,
      intro:
        "Optimiser, c'est améliorer un indicateur sans en dégrader un autre. Le mot « sans » est important : augmenter les ventes en dégradant la satisfaction ne tient pas sur la durée.",
      explain:
        "Un cycle d'optimisation tient en quatre étapes.\n\nChoisir : un levier, un indicateur, une hypothèse écrite.\n\nMesurer l'avant : la référence, sans laquelle aucune amélioration n'est prouvable.\n\nAppliquer : une seule modification.\n\nMesurer l'après : sur une période comparable.\n\nLes leviers les plus rentables, dans l'ordre : le message (titre, promesse, preuve), l'offre, le checkout, la relance, le contenu d'acquisition. Le levier le plus rentable n'est pas celui qui rapporte le plus, c'est celui qui demande le moins de travail.\n\nLa discipline du journal : une ligne par test, avec la date, la variable, le résultat avant et après, et la décision. Ce journal est la seule mémoire fiable d'une activité.",
      example:
        "Test : ajout d'un bloc de preuve sur la page. Avant : 1,9 % de conversion. Après : 2,4 %. Décision : on garde. Coût : vingt minutes.",
      apply:
        "Tenez un journal d'optimisation dès cette semaine, même avec un seul test par semaine. Au bout de trois mois, vous saurez exactement quels leviers fonctionnent chez vous.",
      nuvra:
        "Les pages Nuvra se dupliquent facilement, ce qui permet de tester une variante sans casser l'originale. Analytics compare les vues et les commandes par page sur la même période.",
      exercise: {
        title: 'Premier test d’optimisation',
        instructions: 'Un levier, une référence, une modification, une mesure.',
        checklist: [
          'Levier et hypothèse écrits',
          'Référence mesurée',
          'Modification appliquée',
          'Résultat mesuré et consigné',
        ],
        worksheet: [
          { key: 'test', label: 'Votre test', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'upsells',
      title: 'Upsells',
      short: 'Augmenter le revenu par cliente sans coût supplémentaire.',
      objectives: [
        'Construire une gamme d’offres complémentaires',
        'Choisir le bon moment de présentation',
        'Mesurer le revenu incrémental',
      ],
      minutes: 7,
      intro:
        "L'upsell est le levier de croissance le plus rentable qui existe, parce qu'il ne coûte rien en acquisition : vous vendez davantage à une personne qui a déjà décidé de vous faire confiance.",
      explain:
        "Trois moments :\n\nAvant le paiement : l'order bump, sur la page de paiement.\n\nAprès le paiement : l'upsell immédiat, sur la page de remerciement.\n\nPlus tard : l'offre de progression, quand le client a obtenu son premier résultat.\n\nLa construction d'une gamme suit une logique simple : un produit d'entrée accessible, un produit principal, un produit premium. Chaque niveau sert de tremplin vers le suivant et rend le niveau supérieur naturel.\n\nLa règle de saturation : une offre complémentaire par achat. Trop d'offres transforment la relation en catalogue, et l'effet sur le panier moyen devient négatif.",
      example:
        "Template à 19 €, formation à 197 €, accompagnement à 990 €. Le template attire, la formation monetize, l'accompagnement sélectionne. Le taux de passage de l'un à l'autre augmente avec le temps, pas avec la pression.",
      apply:
        "Écrivez la gamme de votre offre : entrée, cœur, premium. Puis décidez, pour chaque niveau, le moment où il est présenté.",
      nuvra:
        "Chaque produit Nuvra est vendable indépendamment. Une page peut proposer plusieurs produits, et une commande peut porter plusieurs lignes : c'est ainsi que se construit une gamme réelle, mesurée commande par commande.",
      exercise: {
        title: 'Construire sa gamme',
        instructions: 'Trois niveaux, prix, moment de présentation.',
        checklist: [
          'Produit d’entrée défini',
          'Produit cœur défini',
          'Produit premium défini',
          'Moment de présentation de chaque niveau',
        ],
        worksheet: [
          { key: 'gamme', label: 'Votre gamme', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'cross-sells',
      title: 'Cross-sells',
      short: 'Compléter l’achat par un besoin voisin.',
      objectives: [
        'Identifier les besoins complémentaires',
        'Proposer le bon complément au bon moment',
        'Mesurer l’effet sur le panier moyen',
      ],
      minutes: 6,
      intro:
        "Le cross-sell répond à un besoin adjacent : la cliente a acheté une formation sur les pages de vente, elle a besoin de rédaction, d'outils, d'un template. La question est : quel produit complète exactement ce qu'elle vient d'acheter ?",
      explain:
        "Deux temps de présentation.\n\nAu moment de l'achat : produit complémentaire de valeur immédiate — un template associé à une formation, un outil associé à un service.\n\nAprès le résultat obtenu : produit de progression, qui répond à l'étape suivante de son parcours.\n\nLe critère de choix est la cohérence de usage : un produit qui sert dans le même moment de travail que le produit principal se vend facilement. Un produit simplement « cher mais utile » se vend mal.\n\nL'erreur classique est le cross-sell aléatoire : proposer un produit sans lien visible avec l'achat. Il transforme une vente réussie en expérience de catalogue, et fait baisser la confiance.",
      example:
        "Achat : « Formation tunnels ». Cross-sell pertinent : « 40 Pages de vente prêtes à adapter ». Cross-sell hors sujet : « Formation bookkeeping ». Le premier se vend, le second irritant.",
      apply:
        "Pour chaque produit que vous vendez, écrivez deux compléments cohérents et le moment où ils se présentent. Testez pendant un mois, puis gardez celui qui augmente le panier moyen sans augmenter les demandes de support.",
      nuvra:
        "Une commande Nuvra peut porter plusieurs lignes de produits différents. Cela permet d presentations croisées sur une même page, et le détail de la commande reste lisible pour la cliente.",
      exercise: {
        title: 'Trouver ses cross-sells',
        instructions: 'Deux compléments par produit, avec leur moment.',
        checklist: [
          'Deux compléments cohérents par produit',
          'Moment de présentation défini',
          'Compatibilité d’usage vérifiée',
        ],
        worksheet: [
          { key: 'crosssell', label: 'Vos cross-sells', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'affiliations-pour-la-croissance',
      title: 'Affiliations pour la croissance',
      short: 'Transformer des clients satisfaits en canaux d’acquisition.',
      objectives: [
        'Créer un programme d’affiliation rentable',
        'Recruter des affiliés fiables',
        'Mesurer la performance du programme',
      ],
      minutes: 7,
      intro:
        "L'affiliation est un levier de croissance particulièrement adapté aux produits numériques : il ne coûte que sur vente, et la recommandation d'un pair convertit mieux que la publicité.",
      explain:
        "Trois conditions de réussite.\n\nUn produit qui se recommande : livrable seul, avec un résultat visible et partageable.\n\nUne commission alignée sur la marge : elle doit récompenser réellement la vente sans dégrader votre rentabilité.\n\nUn kit d'affilié complet : lien, argumentaire, visuels, réponses aux objections. Un affilié sans support n'en vend pas.\n\nLe recrutement passe par vos propres clients, satisfaits, qui déjà connaissent le produit. C'est la source la plus sous-utilisée : 5 % de clients satisfaits qui rejoignent le programme produisent souvent plus de ventes que 10 000 followers.\n\nLe suivi : chaque affilié a un lien, chaque clic et chaque vente sont attribués. Sans mesure, un programme d'affiliation est une dépense à l'aveugle.",
      example:
        "Formation à 197 €, marge 90 %, commission 30 %. 12 affiliés actifs, 3 ventes par mois en moyenne. Coût réel : uniquement sur ventes réalisées, soit 21 % du revenu.",
      apply:
        "Écrivez le kit d'affilié : une page de présentation, trois arguments, une réponse par objection, et un lien. Proposez-le à cinq clients satisfaits cette semaine.",
      nuvra:
        "Les programmes Nuvra gèrent les liens, les clics, les ventes attribuées et les commissions. Les ventes apparaissent dans vos commandes avec leur code affilié, et la commission est écrite au registre comptable.",
      action: {
        action: 'create_affiliate_program',
        label: 'Créer mon programme d’affiliation',
        route: '/dashboard/affiliates?new=1',
        requiredEntity: 'Un programme d’affiliation Nuvra actif',
        completionCheck: 'affiliate_program_created',
        hint: 'Programme, taux, et kit affilié prêt à envoyer.',
      },
      exercise: {
        title: 'Lancer son programme',
        instructions: 'Produit, taux, kit, cinq affiliés approchés.',
        checklist: [
          'Taux aligné sur la marge',
          'Kit affilié écrit',
          'Cinq affiliés approchés',
          'Suivi des ventes en place',
        ],
        worksheet: [
          { key: 'affiliation', label: 'Votre programme', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'marketplace',
      title: 'Marketplace',
      short: 'Exposer son produit à une audience qui le cherche déjà.',
      objectives: [
        'Publier une formation sur la marketplace',
        'Rédiger une fiche qui convertit',
        'Comprendre la modération',
      ],
      minutes: 7,
      intro:
        "La marketplace Nuvra met votre formation en face d'apprenants qui cherchent déjà une solution. Le trafic y est qualifié, mais la concurrence existe : la fiche doit être meilleure que les autres, pas seulement présente.",
      explain:
        "Ce que la marketplace change : le public n'est pas le vôtre, il est en recherche active. La demande est là, mais l'attention est concurrencée.\n\nCe qui fait la différence sur une fiche.\n\nUn titre qui contient la transformation et l'audience.\n\nUne description courte, orientée résultat, avec le programme visible.\n\nUne couverture lisible en petit format.\n\nUn prix aligné sur ce que propose la concurrence, ni très haut ni sensiblement en dessous.\n\nUn prix sensiblement en dessous est un signal de qualité faible ; sensiblement au-dessus, il exige une preuve visible sur la fiche.\n\nLa modération est réelle : une formation est examinée avant publication, et le contenu doit correspondre à l'annonce.",
      example:
        "Une formation à 49 € sur la marketplace attire peu de trafic mais convertit bien. La même à 197 € avec une preuve claire sur la fiche attire davantage et convertit mieux encore, si le taux de complétion est réel.",
      apply:
        "Rédigez la fiche de marketplace de votre formation comme une page de vente courte : transformation, contenu, preuve, prix. Puis déposez-la pour modération.",
      nuvra:
        "Dans Nuvra, vous soumettez une fiche (titre, description, prix, catégorie, niveau, couverture) depuis Dashboard → Marketplace. Une fois approuvée, votre formation est visible et achetable par les apprenants de la plateforme.",
      action: {
        action: 'open_marketplace',
        label: 'Ouvrir la marketplace',
        route: '/dashboard/marketplace',
        requiredEntity: 'Une fiche Marketplace Nuvra',
        completionCheck: 'marketplace_consulted',
        hint: 'Dépose ta formation pour la marketplace Nuvra.',
      },
      exercise: {
        title: 'Soumettre sa formation',
        instructions: 'Fiche complète, puis dépôt pour modération.',
        checklist: [
          'Titre avec transformation',
          'Description avec programme',
          'Couverture lisible',
          'Prix comparable',
          'Fiche déposée',
        ],
        worksheet: [
          { key: 'marketplace', label: 'Votre fiche', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'scaling',
      title: 'Scaling',
      short: 'Accélérer ce qui fonctionne, sans perdre le contrôle.',
      objectives: [
        'Identifier ce qui est prêt à être amplifié',
        'Choisir un seul levier de croissance par trimestre',
        'Maintenir la qualité pendant l’accroissement',
      ],
      minutes: 7,
      intro:
        "Grandir trop vite casse ce qui fonctionnait. Le seul moyen fiable d'accélérer est d'identifier un levier qui fonctionne, de l'amplifier, et de tout mesurer pendant qu'on le fait.",
      explain:
        "La séquence d'un passage à l'échelle.\n\nValider : le canal ou l'offre produit un résultat positif et répétable sur plusieurs semaines.\n\nDocumenter : ce qui se fait, dans quel ordre, avec quels résultats. Un processus non écrit dépend d'une personne.\n\nAmplifier : augmenter le budget ou la fréquence, pas les deux. Si le CAC monte quand le budget monte, le canal est saturé.\n\nRecruter ou automatiser : la première limite d'une activité qui grandit est le temps.\n\nLe danger spécifique : la qualité se dégrade rarement d'un coup. Elle baisse d'un point à la fois — un délai de réponse plus long, un contenu moins travaillé. Surveillez les signaux de charge : support qui s'allonge, emails non répondus, erreurs d'exécution dans vos automatisations.",
      example:
        "Un contenu génère 60 leads par mois de façon stable depuis trois mois. L'amplifier (un article similar par mois) coûte quelques heures. Le passe à 5 articles par mois sans documenter le processus produit 250 leads et 40 % de réponses non personnalisées — donc des ventes en baisse.",
      apply:
        "Choisissez un seul levier et fixez-lui un trimestre. Notez l'indicateur de contrôle et l'indicateur de garde-fou : le premier pour savoir si ça marche, le second pour savoir si ça se dégrade.",
      nuvra:
        "Vos automatisations portent le poids de la charge : plus de commandes signifie plus d'inscriptions, d'emails et de notifications, sans travail supplémentaire de votre part. Surveillez leur journal d'exécution pour détecter les erreurs.",
      exercise: {
        title: 'Choisir son levier de croissance',
        instructions: 'Un levier, un trimestre, deux indicateurs.',
        checklist: [
          'Levier déjà validé',
          'Processus documenté',
          'Indicateur de contrôle défini',
          'Indicateur de garde-fou défini',
        ],
        worksheet: [
          { key: 'levier', label: 'Votre levier', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'automatisation-en-croissance',
      title: 'Automatisation en croissance',
      short: 'Absorber la charge sans embaucher.',
      objectives: [
        'Identifier le point de rupture à l’échelle',
        'Automatiser la charge avant qu’elle ne coûte',
        'Surveiller les signaux de saturation',
      ],
      minutes: 7,
      intro:
        "La première vraie croissance révèle un goulot : le temps. Avant de recruter, on vérifie que tout ce qui pouvait être automatisé l'a été. Chez la plupart des activités, la moitié du temps gagné vient de trois tâches répétitives.",
      explain:
        "Les trois tâches à automatiser en premier.\n\nLa livraison et l'accès : automatique, sans exception possible.\n\nLa relance et le suivi : automatique, car la régularité compte plus que la personnalisation.\n\nLa qualification : les tags classent les contacts sans intervention.\n\nCe qui ne s'automatise pas : la relation stratégique, la négociation, la réponse aux clients en difficulté. Ces tâches deviennent plus importantes, pas moins, quand l'activité grandit.\n\nLe seuil d'alerte : si une tâche répétitive dépasse deux heures par semaine, elle est candidate. Si le support dépasse dix messages par jour, l'automatisation de l'onboarding est prioritaire sur tout le reste.",
      example:
        "Une activité de 30 commandes par mois gère tout manuellement. À 100 commandes, le même processus demande 15 heures par semaine. Automatiser l'accès, la livraison et la relance ramène ce temps à 4 heures, sans recruter.",
      apply:
        "Chronométrez votre semaine et identifiez les trois tâches qui consomment le plus de temps répétitif. Automatisez la première, cette semaine.",
      nuvra:
        "Les automatisations Nuvra supportent la charge sans intervention : envois, tags, inscriptions, notifications. Le journal d'exécution devient votre outil de surveillance quand l'activité grandit.",
      exercise: {
        title: 'Trouver son goulot',
        instructions: 'Chronomètre d’une semaine, trois tâches cibles, une automatisation.',
        checklist: [
          'Temps mesuré par tâche',
          'Trois tâches répétitives identifiées',
          'Première automatisation créée',
          'Journal surveillé',
        ],
        worksheet: [
          { key: 'goulot', label: 'Votre goulot', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'retention',
      title: 'Rétention',
      short: 'Faire revenir sans déranger.',
      objectives: [
        'Comprendre les signaux de départ',
        'Construire un suivi post-achat durable',
        'Mesurer la fréquence d’achat',
      ],
      minutes: 7,
      intro:
        "La rétention est le levier le plus rentable et le plus négligé. Une cliente qui achète trois fois ne coûte rien en acquisition : elle coûte trois fois la livraison. Toute la croissance se joue là.",
      explain:
        "Pourquoi les clientes partent : elles n'ont pas obtenu de résultat, elles n'ont pas su quoi faire ensuite, ou elles n'ont plus eu de nouvelle.\n\nLes trois leviers.\n\nLe résultat : montrer, mesurer, rappeler. Une cliente qui obtient un résultat en J14 devient une cliente fidèle ; une cliente sans résultat en J14 est un futur remboursement.\n\nLa progression : une prochaine étape visible. Un client qui ne sait pas ce qui vient ne reste pas.\n\nLa relation : un contenu qui a de la valeur, même quand il n'y a rien à vendre. La valeur reçue sans demande crée la loyauté.\n\nLa mesure : le nombre d'achats par cliente sur douze mois. En dessous de 1,2, la rétention est faible. Entre 1,5 et 2, le modèle est solide. Au-dessus, la croissance devient possible sans augmenter l'acquisition.",
      example:
        "Deux offres identiques en contenu. La première a une séquence d'onboarding ; la seconde, non. Après six mois, 38 % de la première a acheté une seconde fois, 9 % de la seconde.",
      apply:
        "Écrivez le plan de rétention sur douze mois : une action par mois, un indicateur, une date. Les clients qui ne reçoivent rien pendant six mois vous oublient.",
      nuvra:
        "Nuvra conserve l'historique complet de chaque contact : commandes, emails, activités. Vous pouvez segmenter par date de dernier achat et lancer une campagne de réactivation ciblée.",
      exercise: {
        title: 'Planifier sa rétention',
        instructions: 'Une action par mois, avec son indicateur.',
        checklist: [
          'Plan sur 12 mois',
          'Une action par mois',
          'Indicateur de rétention choisi',
          'Campagne de réactivation préparée',
        ],
        worksheet: [
          { key: 'retention', label: 'Votre plan de rétention', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'fidelisation',
      title: 'Fidélisation',
      short: 'Faire de vos clientes vos prescripteurs.',
      objectives: [
        'Créer un programme de prescription simple',
        'Transformer la satisfaction en preuve',
        'Récolter des témoignages exploitables',
      ],
      minutes: 7,
      intro:
        "La fidélisation ultime est la recommandation spontanée. Elle ne se demande pas, elle se prépare : en donnant à une cliente satisfaite un moyen simple et rentable de vous recommander.",
      explain:
        "Trois conditions.\n\nUn résultat obtenu : on ne recommande que ce qui a fonctionné.\n\nUn moment favorable : juste après le résultat, quand l'enthousiasme est au maximum.\n\nUn moyen simple : un lien à partager, un lien d'affiliation, ou une question directe.\n\nLa mécanique du témoignage : demandez trois choses précises, un chiffre, le avant et l'après, et une phrase citable. Un témoignage vague n'a aucune valeur ; un témoignage précis est une page de vente à lui seul.\n\nLe programme d'affiliation interne est souvent le meilleur outil de prescription : la cliente reçoit une commission réelle, donc elle a intérêt à recommander, et vous ne payez que sur vente.",
      example:
        "Le jour où sa page de vente génère sa première vente, un email automatique demande : « Un mot en trois lignes ? Combien de demandes avez-vous reçues, et depuis quand ? » Le taux de réponse est élevé, et les réponses sont des preuves réelles.",
      apply:
        "Écrivez l'email de demande de témoignage et le programme d'affiliation client. Les deux sont plus efficaces qu'une campagne publicitaire.",
      nuvra:
        "Les contacts Nuvra peuvent porter un tag « a-obtenu-resultat » posé par vos soins, ce qui déclenche automatiquement l'email de témoignage et l'invitation au programme d'affiliation.",
      exercise: {
        title: 'Activer la prescription',
        instructions: 'Email de témoignage + programme d’affiliation client.',
        checklist: [
          'Email de témoignage rédigé',
          'Moment de la demande défini',
          'Programme d’affiliation client prêt',
        ],
        worksheet: [
          { key: 'prescription', label: 'Votre dispositif', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'plan-de-croissance',
      title: 'Plan de croissance',
      short: 'Un levier, un indicateur, une échéance par trimestre.',
      objectives: [
        'Écrire un plan de croissance sur douze mois',
        'Prioriser les leviers',
        'Fixer des jalons mesurables',
      ],
      minutes: 8,
      intro:
        "Un plan de croissance n'est pas une prévision : c'est un engagement daté. Trois questions par trimestre suffisent, et elles doivent être écrites avant de commencer.",
      explain:
        "La structure.\n\nUn levier par trimestre : l'acquisition, la conversion, la rétention, ou l'offre. Jamais deux en même temps.\n\nUn indicateur de contrôle : le chiffre qui dit si le levier fonctionne.\n\nUn indicateur de garde-fou : le chiffre qui dit si quelque chose se dégrade.\n\nUne échéance : une date, pas « bientôt ».\n\nQuatre trimestres possibles.\n\nT1 : fondations. Le produit, la page, le tunnel qui fonctionne, mesurés.\n\nT2 : acquisition. Le canal qui produit le plus de clients, amplifié.\n\nT3 : revenu par cliente. Gamme, upsell, rétention.\n\nT4 : l'échelle. Répétition, affiliation, marketplace.\n\nUn plan réaliste est un plan que vous tinerez. Le plan ambitieux que vous abandonnez en mars ne vaut rien.",
      example:
        "Un plan sur douze mois : T1, publier le tunnel et mesurer ; T2, doubler le contenu qui convertit ; T3, ajouter un produit complémentaire ; T4, lancer le programme d'affiliation. Un levier par trimestre, un indicateur, une date.",
      apply:
        "Écrivez votre plan maintenant, en une page. Quatre trimestres, un levier chacun, un indicateur chacun. Relisez-le chaque trimestre et ajustez le levier, jamais l'ambition.",
      nuvra:
        "Votre plan se conserve dans vos ressources : publiez-le comme une page, ou gardez-le dans vos documents internes. L'important est qu'il existe et qu'il soit revu chaque trimestre.",
      exercise: {
        title: 'Écrire son plan',
        instructions: 'Quatre trimestres, un levier et un indicateur chacun.',
        checklist: [
          'Quatre trimestres définis',
          'Un levier par trimestre',
          'Un indicateur par trimestre',
          'Une échéance datée par trimestre',
        ],
        worksheet: [
          { key: 'plan', label: 'Votre plan de croissance', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'construire-son-systeme-de-croissance',
      title: 'Construire son système de croissance avec Nuvra',
      short: 'Assembler et vérifier le Nuvra Growth System complet.',
      objectives: [
        'Vérifier chaque pièce du système',
        'Mesurer les indicateurs du systeme',
        'Calculer CAC et valeur par cliente',
        'Écrire son plan de croissance',
      ],
      minutes: 12,
      example:
        "Awa a un produit, un tunnel publié, trois automatisations actives, 240 contacts et 31 commandes. Elle passe la checklist du Growth System : tout est vérifié, sauf l’affiliation, qu’elle n’a jamais mise en place. Elle crée le programme, contacte six clientes satisfaites, et obtient 9 ventes en deux mois sans dépense publicitaire supplémentaire.",
      intro:
        "C'est le dernier lab. Vous ne créez rien de nouveau : vous vérifiez que chaque pièce existe, fonctionne, et est mesurée. C'est la checklist que vous repasserez chaque trimestre.",
      explain:
        "Le système complet.\n\nBusiness : niche, audience, offre.\n\nProduit : fiche complète, prix, page produit.\n\nTunnel : landing, capture, page de vente, checkout, remerciement.\n\nAcquisition : page de capture, contenu, source mesurée.\n\nCRM : contacts, tags, segments.\n\nEmail : campagne et séquence.\n\nAutomatisation : au moins trois chaînes testées.\n\nVente : paiement testé, commande, livraison.\n\nAnalytics : quatre indicateurs suivis.\n\nCroissance : un levier documenté, un plan.\n\nLa règle du lab : ouvrez chaque outil et vérifiez par vous-même. Un élément coché sur la foi d'un souvenir n'est pas un élément vérifié.",
      apply:
        "Parcourez la checklist, ouvrez chaque outil, corrigez ce qui manque, et remplissez vos chiffres. À la fin, votre activité est un système, pas une suite de tâches.",
      nuvra:
        "Chaque élément de la checklist correspond à un module réel de Nuvra : Products, Funnels, Pages, Leads, Customers, Emails, Automations, Payments, Analytics, Marketplace. Le bouton ci-dessous ouvre vos statistiques pour le dernier remplissage.",
      action: {
        action: 'open_analytics',
        label: 'Ouvrir mes statistiques',
        route: '/dashboard/analytics',
        requiredEntity: 'Une lecture du tableau de bord Statistiques',
        completionCheck: 'analytics_consulted',
        hint: 'Remplis ton tableau d’indicateurs final.',
      },
      exercise: {
        title: 'Vérifier le Nuvra Growth System',
        instructions:
          'Vérifie chaque pièce du système dans Nuvra et relève tes chiffres réels.',
        checklist: [
          'Business défini',
          'Produit créé et publié',
          'Tunnel construit et publié',
          'Acquisition active',
          'CRM renseigné et segmenté',
          'Campagne email envoyée',
          'Automatisation active et testée',
          'Première vente enregistrée',
          'Analytics consultés',
          'Plan de croissance écrit',
        ],
        worksheet: [
          { key: 'systeme', label: 'Votre Growth System', type: 'textarea' },
          { key: 'chiffres', label: 'Vos chiffres', type: 'textarea' },
        ],
      },
      resources: [
        {
          title: 'Tableau de bord des 4 indicateurs',
          kind: 'WORKBOOK',
          description: 'Le tableau hebdomadaire à remplir : visiteurs, leads, ventes, panier moyen.',
        },
        {
          title: 'Modèle de plan de croissance',
          kind: 'TEMPLATE',
          description: 'Quatre trimestres, un levier par trimestre, un indicateur chacun.',
        },
        {
          title: 'Checklist du Growth System',
          kind: 'CHECKLIST',
          description: 'Les 11 éléments du système, à revérifier chaque trimestre.',
        },
      ],
      video: {
        narration:
          "Tu as construit ton système complet dans Nuvra : produit, offre, page, tunnel, checkout, emails, automations, CRM, acquisition et statistiques. La formation se termine ici ; ton travail commence maintenant. Vérifie ta checklist, remplis tes chiffres, et fais tourner ce système chaque semaine.",
      },
    },
  ],
};
