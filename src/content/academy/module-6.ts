import type { AcademyModuleInput } from './types';

/** Module 6 — Conversion. */
export const MODULE_6: AcademyModuleInput = {
  slug: 'conversion',
  title: 'Conversion',
  description:
    "Convertir, c'est faire passer une personne de l'intention à l'action. Ce module travaille la page qui porte la vente : le message, la preuve, les objections, le paiement, et l'optimisation fondée sur des données.",
  objectives: [
    'Écrire un titre qui vend',
    'Formuler une proposition de valeur claire',
    'Utiliser la preuve sociale sans en inventer',
    'Traiter les objections de manière crédible',
    'Construire un checkout qui ne perd pas de ventes',
    'Créer un A/B test et interpréter son résultat',
    'Optimiser un tunnel à partir de données réelles',
  ],
  deliverable:
    'Une page de vente optimisée dans Nuvra, avec produit relié au checkout, CTA unique, objections traitées et premier résultat mesuré.',
  lab: {
    title: 'Lab — Optimiser sa page de vente',
    goal:
      'Transformer une page existante en page qui vend, puis mesurer sa conversion.',
    steps: [
      'Réécrire le titre et le sous-titre selon la structure promesse / audience / délai',
      'Ajouter un bloc de preuve et un bloc FAQ qui traite les trois objections principales',
      'Relier le produit au checkout et vérifier le parcours complet',
      'Mesurer le taux de conversion sur sept jours et consigner le résultat',
    ],
    action: {
      action: 'create_page',
      label: 'Ouvrir l’éditeur de page',
      route: '/dashboard/pages?new=1',
      requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
      completionCheck: 'page_created',
      hint: 'Optimise une page de vente réelle et teste le parcours.',
    },
  },
  video: {
    title: 'Module 6 — Optimiser la conversion',
    description:
      'Le travail au niveau du message : titre, preuve, objections, checkout, et test.',
    durationSec: 600,
    script: `00:00 — Accroche
La conversion se joue sur une page, avec un titre, une preuve, un prix et un bouton. Tout le reste est de la décoration. Dans cette vidéo, on travaille ces quatre éléments dans l'ordre, puis on mesure.

00:50 — Le titre
Un titre efficace contient trois choses : le résultat, la personne concernée, le délai. « La méthode qui fait publier votre première page de vente en 7 jours, pour les freelances qui vendent en ligne. » Ce titre n'est pas négatif, il est précis : il dit à qui, quoi, et en combien de temps.

02:00 — La proposition de valeur
La proposition de valeur est la phrase qui survit à tout le reste de la page. Si elle n'est pas claire après la première lecture, rien ne marchera : le visiteur ne lira pas la suite. Testez-la en la donnant à lire à cinq personnes de votre audience.

03:10 — La preuve
La preuve la plus efficace est spécifique : un chiffre, un cas, une capture. La preuve sociale générique (« des centaines de clients ») est ignorée. Et surtout : n'inventez jamais. Une preuve inventée se détecte en trois questions et détruit la confiance pour toujours.

04:20 — Les objections
Trois objections couvrent 80 % des refus.Traitez-les dans l'ordre où elles apparaissent : le prix, la confiance, le temps. Chaque objection reçoit une réponse en trois temps : reconnaître, comprendre, montrer.

05:30 — Le checkout
Le paiement est un lieu de perte, pas de gain. Moins de champs, total visible, moyens de paiement affichés, réassurance proche du bouton. Testez le parcours vous-même, avec une vraie transaction de test.

06:40 — Tester et itérer
Un A/B test se fait sur une seule variable, avec un seuil de significativité. Tester trois choses à la fois ne produit aucune information exploitable. Le test n'a de valeur que s'il est suivi d'une décision : garder A, garder B, ou revenir à l'original.

07:50 — Mesurer
Taux de conversion de la page, panier moyen, taux d'ajout de l'order bump. Trois chiffres suffisent pour piloter une page. Le reste est de la superstition.

09:00 — Récapitulatif
Titre, promesse, preuve, objections, checkout, test. Six travail, six leviers. Le module suivant fera le même travail sur le temps : automatiser pour que l'activité tourne sans vous.`,
    chapters: [
      { title: 'Le titre', time: 0 },
      { title: 'La proposition de valeur', time: 50 },
      { title: 'La preuve', time: 130 },
      { title: 'Les objections', time: 190 },
      { title: 'Le checkout', time: 260 },
      { title: 'Tester et mesurer', time: 330 },
    ],
    transcript:
      "La conversion se joue sur une page : un titre, une preuve, un prix, un bouton. Un titre efficace contient le résultat, la personne concernée et le délai. La proposition de valeur est la phrase qui survit à la lecture ; si elle n'est pas claire, rien ne marchera. La preuve la plus efficace est spécifique, et elle ne s'invente jamais. Trois objections couvrent la majorité des refus : le prix, la confiance, le temps. Le checkout doit réduire les champs, afficher le total, et montrer la réassurance. Un test A/B se fait sur une seule variable, avec un seuil de significativité. Trois chiffres suffisent pour piloter une page : taux de conversion, panier moyen, taux d'ajout.",
    storyboard: [
      {
        time: '00:00',
        visual: 'Une page dans un navigateur, quatre zones mises en évidence.',
        narration: 'Quatre zones : titre, preuve, prix, bouton.',
        onScreenText: 'Conversion',
      },
      {
        time: '00:50',
        visual: 'Titre avec trois surlignages : résultat, audience, délai.',
        narration: 'Résultat, personne, délai.',
        onScreenText: 'Titre efficace',
      },
      {
        time: '02:00',
        visual: 'Phrase de proposition de valeur isolée, lisible en deux secondes.',
        narration: 'La proposition de valeur doit survivre à la première lecture.',
        onScreenText: 'Proposition de valeur',
      },
      {
        time: '03:10',
        visual: 'Bloc de preuve avec un chiffre et une capture réelle.',
        narration: 'La preuve spécifique bat la preuve générique — et elle ne s’invente jamais.',
        onScreenText: 'Preuve',
      },
      {
        time: '04:20',
        visual: 'Trois objections et leurs réponses, une par une.',
        narration: 'Reconnaître, comprendre, montrer.',
        onScreenText: 'Objections',
      },
      {
        time: '05:30',
        visual: 'Écran de paiement épuré, total visible, réassurance sous le bouton.',
        narration: 'Le checkout est un lieu de perte s’il est frictionnel.',
        onScreenText: 'Checkout',
      },
      {
        time: '06:40',
        visual: 'Deux variantes A/B côte à côte, puis un verdict.',
        narration: 'Une variable, un seuil, une décision.',
        onScreenText: 'A/B test',
      },
    ],
  },
  lessons: [
    {
      slug: 'comprendre-la-conversion',
      title: 'Comprendre la conversion',
      short: 'Ce qui sépare une visite d’une commande.',
      objectives: [
        'Définir un taux de conversion par étape',
        'Identifier le maillon faible d’un tunnel',
        'Choisir la première action d’optimisation',
      ],
      minutes: 8,
      intro:
        "Convertir, c'est faire passer une personne d'une intention à une action précise. Le taux de conversion n'est pas une note : c'est un ratio entre deux étapes, qui indique où se trouve le problème.",
      explain:
        "Trois taux à surveiller sur un tunnel de vente.\n\nPage → visiteuse engagée : le temps passé et la profondeur de scroll indiquent si le message est lu.\n\nVisiteuse → lead ou commande : c'est le taux de conversion principal de la page.\n\nCommande → panier moyen : c'est le taux d'ajout des offres complémentaires.\n\nLe diagnostic consiste à toujours remonter au maillon le plus faible en volume absolu. Une page qui perd 95 % de ses visiteurs mais n'en reçoit que 50 ne mérite pas d'attention tant que la page en amont continue d'en perdre 5 000.\n\nEt surtout : un seul changement à la fois. Deux changements simultanés produisent un résultat ininterprétable, et vous ne saurez jamais ce qui a fonctionné.",
      example:
        "1 000 visiteurs, 40 ventes (4 %) : si le tunnel perd 900 visiteurs en amont,.work sur l'amont. Si les 1 000 arrivent et lisent la page, alors le message est en cause.",
      apply:
        "Calculez vos trois taux cette semaine. Écrivez une seule action corrective pour le taux le plus faible, appliquez-la, et mesurez sept jours plus tard.",
      nuvra:
        "Analytics Nuvra regroupe les vues de pages, les contacts créés et les commandes. Cette matière suffit à calculer vos taux : le module suivant vous montre où cliquer pour les améliorer.",
      exercise: {
        title: 'Calculer ses taux',
        instructions: 'Calculez les trois taux de votre tunnel sur sept jours.',
        checklist: [
          'Visiteurs mesurés',
          'Leads ou commandes mesurés',
          'Trois taux calculés',
          'Une action corrective choisie',
        ],
        worksheet: [
          { key: 'taux', label: 'Vos taux', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'copywriting',
      title: 'Copywriting',
      short: 'Écrire pour une décision, pas pour l’élégance.',
      objectives: [
        'Écrire pour une intention de lecture précise',
        'Utiliser les mots de l’audience',
        'Structurer un texte qui conduit à l’action',
      ],
      minutes: 8,
      intro:
        "Le copywriting n'est pas l'art d'écrire joliment. C'est l'art de rendre une décision facile à prendre pour une personne précise. Un texte élégant qui ne fait pas décider ne vaut rien.",
      explain:
        "Quatre règles.\n\nUne intention par texte : que doit comprendre la personne à la fin ? Si la réponse n'est pas unique, le texte est confus.\n\nLes mots de l'audience : le lexique de la cliente réelle vaut mieux que celui du marketing. Reprenez ses formulations dans vos titres.\n\nUne structure visible : l/interêt monte par vagues courtes, une idée par paragraphe, un espace entre chaque idée. Le cerveau lit en diagonale : votre structure doit fonctionner en diagonale.\n\nUn seul appel à l'action : si le texte est efficace, il n'a besoin que d'une sortie.\n\nLe test final : votre texte doit pouvoir être résumé en une phrase par n'importe qui. Si personne n'y arrive, il n'est pas clair.",
      example:
        "Version faible : « Nous proposons une solution innovante de gestion commerciale adaptée aux professionnels. » Version forte : « Vous envoyez 46 propositions par mois et n'en signez que 3 ? Voici la page qui change ce ratio en 7 jours. »",
      apply:
        "Écrivez un paragraphe, puis supprimez la moitié des mots. Relisez à voix haute : à chaque fois que vous manquez de souffle, le paragraphe est trop long.",
      nuvra:
        "Les blocs de page Nuvra contiennent les textes que vous écrivez. Testez vos variantes directement dans la page : dupliquez, modifiez le titre, publiez, comparez les taux dans Analytics.",
      exercise: {
        title: 'Réécrire un paragraphe',
        instructions: 'Réécris un texte commercial flou en version claire et courte.',
        checklist: [
          'Texte raccourci de moitié',
          'Mots de l’audience utilisés',
          'Une seule idée par paragraphe',
          'Appel à l’action unique',
        ],
        worksheet: [
          { key: 'texte', label: 'Votre réécriture', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'headline',
      title: 'Headline',
      short: 'Le titre qui décide si la page sera lue.',
      objectives: [
        'Construire un titre efficace',
        'Éviter les titres génériques',
        'Tester plusieurs variantes de titre',
      ],
      minutes: 7,
      intro:
        "Le titre est l'élément le plus lu et le plus determinant de toute page. Un bon titre ne dit pas ce que vous faites : il dit ce que la personne va obtenir, et pourquoi elle doit y croire.",
      explain:
        "Quatre éléments d'un titre fort.\n\nLe résultat : ce que la personne aura après.\n\nL'audience : pour qui c'est, formulé comme elle se décrit elle-même.\n\nLe mécanisme ou le délai : la manière dont le résultat arrive, et en combien de temps.\n\nLa tension : une difficulté reconnaissable, ou une contradiction qui force la lecture.\n\nLes titres à éviter : les titres purement descriptifs (« Formation à la vente »), les titres de vanité (« La méthode qui a changé ma vie »), et les titres sans audience (« 10 conseils »).\n\nMéthode : écrivez cinq titres, gardez le plus précis, et testez-le. La précision gagne presque toujours.",
      example:
        "Faible : « Formation vente en ligne ». Fort : « Vos 46 propositions par mois, 3 ventes : le système qui change ce ratio en 7 jours. »",
      apply:
        "Écrivez cinq titres pour votre page de vente, puis demandez à trois personnes de vous dire, pour chacun, à qui il s'adresse et ce qu'il promet. Gardez celui qui reçoit trois réponses identiques.",
      nuvra:
        "Le bloc hero de Nuvra porte le titre et le sous-titre. Modifiez le titre d'une page publiée, observez sept jours, comparez le taux de conversion dans Analytics. C'est un test A/B sans outil supplémentaire : dupliquez la page pour garder la variante d'origine.",
      exercise: {
        title: 'Écrire et tester cinq titres',
        instructions:
          'Écris cinq titres pour la même page, avec un angle différent à chaque fois, puis note lequel est le plus immédiatement compréhensible en trois secondes.',
        checklist: [
          'Cinq titres écrits, angles différents',
          'Un titre orienté bénéfice',
          'Un titre orienté problème',
          'Un titre orienté preuve',
          'Critère de choix du titre retenu écrit',
        ],
        worksheet: [
          { key: 'titres', label: 'Vos cinq titres', type: 'textarea' },
          { key: 'choix', label: 'Le titre retenu et pourquoi', type: 'textarea' },
        ],
      },
      quiz: {
        title: 'Quiz — Headline',
        passingScore: 80,
        questions: [
          {
            question: "Quel titre est le plus efficace ?",
            options: [
              'Formation à la vente en ligne',
              'La méthode révolutionnaire',
              '10 conseils pour mieux vendre',
              'Vos 46 propositions par mois, 3 ventes : le système qui change ce ratio en 7 jours',
            ],
            answerIndex: 3,
            explanation:
              "Il nomme la situation, le résultat et le délai : la lectrice se reconnaît immédiatement.",
          },
          {
            question:
              "Qu'est-ce qui compte le plus dans les trois premières secondes d'une page de vente ?",
            options: [
              'La longueur du texte',
              'Le titre et la promesse, comprises immédiatement',
              'Le nombre de couleurs',
              "La vitesse de chargement",
            ],
            answerIndex: 1,
            explanation:
              "Un texte plus long ne rattrape jamais une promesse illisible : si le titre ne dit pas le résultat en trois secondes, personne ne lit la suite.",
          },
          {
            question:
              "Un titre de page de vente doit d'abord dire :",
            options: [
              "Le nom du produit",
              "Le résultat obtenu par le lecteur",
              "Les qualités de l'auteur",
              "Le prix",
            ],
            answerIndex: 1,
            explanation:
              "Le lecteur cherche son résultat, pas votre produit. Le nom vient ensuite, et le prix ensuite encore.",
          },
        ],
      },
    },
    {
      slug: 'proposition-de-valeur-sur-page',
      title: 'Proposition de valeur sur la page',
      short: 'La phrase que la page doit rendre évidente.',
      objectives: [
        'Placer la proposition de valeur au bon endroit',
        'La rendre compréhensible en diagonale',
        'Vérifier sa cohérence avec le reste de la page',
      ],
      minutes: 7,
      intro:
        "La proposition de valeur est l'idée centrale d'une page. Si elle n'est pas comprise en quelques secondes, tout le reste de la page est du travail perdu.",
      explain:
        "Où la placer.\n\nDans le titre : la version courte, avec le résultat et l'audience.\n\nDans le sous-titre : la version complète, avec le mécanisme et le délai.\n\nAu-dessus du premier CTA : la version confirmée, en une phrase.\n\nRègle de lisibilité en diagonale : la personne lit le titre, parcourt les sous-titres, regarde les images, lit le prix, cherche le bouton. Votre structure doit fonctionner dans cet ordre, sans lecture linéaire.\n\nCohérence : si le titre promet une page publiée en 7 jours, chaque section doit rapporter ce délai. Un titre et un contenu qui ne racontent pas la même chose détruisent la confiance plus sûrement qu'un titre faible.",
      example:
        "Titre : « Votre page de vente publiée en 7 jours ». Sous-titre : « La méthode en 4 étapes utilisée par 240 freelances, avec les modèles de page et de relance. » Puis, avant le bouton : « Tout ce qu'il vous faut, 197 €, une fois. »",
      apply:
        "Écrivez votre proposition de valeur en trois versions de longueur croissante. Placez la courte dans le titre, la moyenne dans le sous-titre, la longue au-dessus du bouton.",
      nuvra:
        "Les blocs hero et cta de Nuvra portent ces trois versions. Structurez-les dans cet ordre et votre page sera lisible en diagonale, comme le veut une vraie page de vente.",
      exercise: {
        title: 'Écrire ses trois versions',
        instructions: 'Trois versions de ta proposition de valeur, du plus court au plus long.',
        checklist: [
          'Version courte pour le titre',
          'Version moyenne pour le sous-titre',
          'Version longue avant le CTA',
          'Cohérence vérifiée',
        ],
        worksheet: [
          { key: 'pv', label: 'Vos trois versions', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'preuve-sociale',
      title: 'Preuve sociale',
      short: 'Utiliser des preuves vraies, spécifiques et vérifiables.',
      objectives: [
        'Choisir une preuve adaptée à l’objection',
        'Transformer un témoignage en preuve de résultat',
        'Éviter toute preuve inventée',
      ],
      minutes: 7,
      intro:
        "Les gens ne croient pas les promesses, ils croient les autres. La preuve sociale est le mécanisme qui  transfère la confiance vers votre offre vers votre offre — à condition d'être vraie.",
      explain:
        "Quatre formes de preuve, par ordre de force.\n\nLe cas chiffré : « 47 freelances, 7 jours, résultat moyen X ». La plus forte, si elle est vraie.\n\nLe témoignage détaillé : une personne nommée ou identifiable, avec son point de départ et son résultat. Le détail crée la crédibilité.\n\nLa démonstration : une capture, un extrait de livrable, une vidéo. Prouve que ça existe.\n\nLe volume : « 1 200 utilisateurs ». Faible, et parfois contre-productif s'il semble exagéré.\n\nLa règle absolue : jamais de preuve inventée. Un avis fabriqué se découvre, et la découverte d'une preuve inventée détruit rétroactivement la confiance dans toutes les autres.",
      example:
        "Faible : « Nos clients adorent la formation ★★★★★ ». Fort : « Claire, consultante : “J'ai publié ma page le mardi, première demande le jeudi, 3 clients en trois semaines.” »",
      apply:
        "Pour chaque objection, choisissez la forme de preuve qui y répond : la doubt sur le prix répond à un cas de valeur, le doute sur le temps répond à une démonstration, le doute sur la compétence répond à un témoignage détaillé.",
      nuvra:
        "Les blocs social_proof, testimonials et logos de Nuvra portent ces éléments. N'y placez que du contenu que vous pouvez documenter : la crédibilité d'une page se construit autant par ce qu'elle ne montre pas.",
      exercise: {
        title: 'Collecter des preuves',
        instructions: 'Rassemble trois preuves réelles et associez-les à trois objections.',
        checklist: [
          'Un cas chiffré',
          'Un témoignage détaillé',
          'Une démonstration',
          'Chaque preuve associée à une objection',
        ],
        worksheet: [
          { key: 'preuves', label: 'Vos preuves', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'objections-et-reponses',
      title: 'Objections et réponses',
      short: 'Traiter les trois refus qui tuent la majorité des ventes.',
      objectives: [
        'Identifier les trois objections principales',
        'Rédiger des réponses crédibles',
        'Placer les réponses au bon endroit',
      ],
      minutes: 7,
      intro:
        "Une objection non traitée est une vente perdue en silence. Le traitement ne consiste pas à convaincre à tout prix, mais à donner l'information qui manque à la décision.",
      explain:
        "Les trois objections couvrent presque tout.\n\n« C'est trop cher » : réponse par la valeur, la comparaison et les facilités de paiement. Ne jamais répondre en justifiant le prix.\n\n« Je ne pense pas que ce soit pour moi » : réponse par la précision. Plus l'offre est ciblée, plus cette objection disparaît. C'est souvent la page qu'il faut refaire, pas la réponse.\n\n« Je n'ai pas le temps » : réponse par la durée affichée, la complexité réelle et l'accompagnement.\n\nOù les placer : sur la page, sous forme de FAQ, juste avant le prix pour le prix, et juste avant le bouton pour le temps. Une objection traitée trop tôt n'est pas traitée du tout.\n\nEnfin, la FAQ est le meilleur endroit pour les objections longues : elles y trouvent leur place sans alourdir le parcours.",
      example:
        "« C'est cher » → « 197 € c'est plus cher qu'un dîner en famille. C'est aussi 5 % du prix d'une agence pour une page qui peut rapporter 1 200 € par mois. Voici trois studs qui l'ont fait en trois semaines. »",
      apply:
        "Écrivez vos trois objections et leurs réponses, puis placez-les aux trois endroits indiqués sur votre page. Ne les inventez pas : reprenez les questions que vos prospects posent vraiment.",
      nuvra:
        "Le bloc faq de Nuvra est conçu pour cela. Une FAQ de six questions bien traitées vaut mieux qu'un paragraphe de trente lignes dans le corps de la page.",
      exercise: {
        title: 'Traiter trois objections',
        instructions: 'Trois objections, trois réponses placées sur la page.',
        checklist: [
          'Objection prix traitée',
          'Objection « pas pour moi » traitée',
          'Objection temps traitée',
          'FAQ créée',
        ],
        worksheet: [
          { key: 'objections', label: 'Objections et réponses', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'cta-de-vente',
      title: 'CTA de vente',
      short: 'Le bouton qui transforme l’intention en commande.',
      objectives: [
        'Écrire un libellé de bouton efficace',
        'Répéter le même CTA sur toute la page',
        'Placer le CTA aux moments de décision',
      ],
      minutes: 6,
      intro:
        "Le CTA est le point de contact physique entre l'intention et l'action. Sa formulation, sa visibilité et sa répétition comptent autant que le reste de la page.",
      explain:
        "Un bouton efficace cumule quatre qualités.\n\nUn libellé qui décrit l'action et son bénéfice : « Recevoir la formation » plutôt que « Valider ».\n\nUn contraste visuel unique : c'est le seul élément fortement contrasté de la section.\n\nUn contexte immédiat sous le bouton : ce qui arrive ensuite, le prix, la garantie.\n\nUne répétition identique : sous la promesse, après la preuve, après chaque objection majeure, et à la fin.\n\nLe nombre d'occurrences pratiqué se situe entre trois et cinq sur une page de vente longue. Au-delà, le CTA perd son effet de signal.",
      example:
        "Faible : « Soumettre ». Fort : « Rejoindre le Sprint Offre — 197 € » avec, juste en dessous : « Accès immédiat · Garantie 14 jours · Une seule fois ».",
      apply:
        "Écrivez un libellé de bouton, et écrivez la phrase qui l'accompagne. Placez le couple aux quatre endroits stratégiques et vérifiez qu'il est identique partout.",
      nuvra:
        "Les blocs cta et checkout de Nuvra portent ces éléments. Reliez toujours votre CTA à une page ou à un produit réel : un bouton sans destination est une fausse promesse.",
      exercise: {
        title: 'Écrire son CTA',
        instructions: 'Un libellé, une phrase d’accompagnement, quatre emplacements.',
        checklist: [
          'Libellé avec bénéfice',
          'Phrase d’accompagnement',
          'Quatre emplacements identifiés',
          'Libellé identique partout',
        ],
        worksheet: [
          { key: 'cta', label: 'Votre CTA', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'page-de-vente-conversion',
      title: 'Page de vente qui convertit',
      short: 'Assembler les éléments dans le bon ordre.',
      objectives: [
        'Construire une page de vente complète',
        'Alterner preuve et objection',
        'Supprimer ce qui ne vend pas',
      ],
      minutes: 8,
      intro:
        "La page de vente n'est pas une brochure. C'est une progression d'arguments qui répond, dans l'ordre, aux questions que la lectrice se pose. Chaque section supprime une raison de ne pas acheter.",
      explain:
        "L'ordre qui fonctionne suit la chronologie du doute.\n\nPromesse (pour qui, quoi, en combien de temps).\n\nProblème (décrit avec ses mots).\n\nDéplacement (pourquoi c'est possible).\n\nContenu (ce qu'il reçoit).\n\nPreuve (cas, démonstration).\n\nRisque percé (garantie).\n\nPrix (clair, avec ce qu'il comprend).\n\nObjections restantes (FAQ).\n\nCTA (unique, répété).\n\nLa suppression est aussi importante que l'ajout : toute section qui n'enlève pas une objection est une section qui fatigue. Testez la suppression : retirez une section, mesurez, décidez.",
      example:
        "Une page de 9 sections sur 3 000 mots convertit mieux qu'une page de 14 sections sur 5 000 mots : la longueur perçue n'augmente pas les ventes, elle dilue les arguments.",
      apply:
        "Écrivez la structure de votre page en 10 lignes. Pour chaque ligne, indiquez l'objection qu'elle supprime. Toute ligne où vous ne pouvez pas répondre, supprimez-la.",
      nuvra:
        "Nuvra vous permet de construire cette page bloc par bloc, de la dupliquer pour tester, et de mesurer la conversion dans Analytics. Le bloc checkout relie la page à un produit publié : sans cela, la page ne vend rien.",
      action: {
        action: 'create_page',
        label: 'Ouvrir l’éditeur de page',
        route: '/dashboard/pages?new=1',
        requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
        completionCheck: 'page_created',
        hint: 'Construis la structure complète de ta page de vente.',
      },
      exercise: {
        title: 'Structurer sa page',
        instructions: 'Dix sections, une objection supprimée par section.',
        checklist: [
          'Dix sections listées',
          'Objection associée par section',
          'Sections inutiles supprimées',
          'Produit relié au checkout',
        ],
        worksheet: [
          { key: 'structure', label: 'Structure de la page', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'checkout-de-conversion',
      title: 'Checkout de conversion',
      short: 'Le paiement comme dernière barrière, pas comme un formulaire.',
      objectives: [
        'Réduire les champs du paiement',
        'Afficher prix et réassurance au bon endroit',
        'Tester le parcours de paiement',
      ],
      minutes: 7,
      intro:
        "Le checkout est l'endroit où une décision déjà prise peut encore se perdre. Sa fonction est d'être le plus court chemin possible entre l'intention et la confirmation.",
      explain:
        "Quatre règles.\n\nLe minimum de champs : ce que la livraison exige réellement. L'email suffit presque toujours.\n\nLe total visible avant le bouton, frais compris. Les frais surprise sont la première cause d'abandon.\n\nLes moyens de paiement affichés de manière lisible, avec les symboles attendus.\n\nLa réassurance sous le bouton : sécurité, politique de remboursement, garantie.\n\nLe test : effectuez une transaction complète, depuis la page, avec le moyen de paiement que vous utiliserez. Notez chaque étape et chaque attente. Un tunnel jamais testé perd de l'argent chaque jour, silencieusement.",
      example:
        "Un checkout à 3 champs récupère en moyenne 10 à 20 % de ventes en plus qu'un checkout à 8 champs, à page et traffic identiques.",
      apply:
        "Réduisez votre checkout d'un champ, testez, mesurez. Répétez jusqu'à ce que la suppression d'un champ commence à dégrader la livraison.",
      nuvra:
        "Le checkout Nuvra est lié au produit choisi, applique les codes, calcule la part plateforme et enregistre la commande. Une commande payée déclenche automatiquement l'inscription, la livraison et les emails associés.",
      exercise: {
        title: 'Passer le checkout au crible',
        instructions:
          "Fais réellement le checkout, sur mobile, jusqu'au paiement. Note chaque friction, chaque étape inutile, chaque doute.",
        checklist: [
          'Checkout testé sur mobile et sur ordinateur',
          "Nombre d'étapes mesuré",
          'Tous les champs nécessaires remplis sans erreur',
          'Coût total affiché avant validation',
          'Une friction supprimée immédiatement',
        ],
        worksheet: [{ key: 'checkout', label: 'Frictions relevées', type: 'textarea' }],
      },
      quiz: {
        title: 'Quiz — Checkout',
        passingScore: 80,
        questions: [
          {
            question: "Quelle modification améliore le plus la conversion d’un checkout ?",
            options: [
              'Ajouter une animation de chargement',
              'Supprimer un champ inutile',
              'Ajouter un logo plus grand',
              'Changer la couleur du fond',
            ],
            answerIndex: 1,
            explanation:
              "Chaque champ supplémentaire est une friction : les supprimer augmente réellement le taux de paiement.",
          },
          {
            question: "Quel est le rôle du checkout ?",
            options: [
              "Faire la page de vente plus longue",
              "Encaisser sans perdre la commande en cours de route",
              "Remplacer la page de vente",
              "Envoyer la facture automatiquement",
            ],
            answerIndex: 1,
            explanation:
              "Le checkout est le dernier kilomètre : chaque champ inutile, chaque erreur de paiement et chaque rupture de connexion y coûte une vente déjà conquise.",
          },
        ],
      },
    },
    {
      slug: 'order-bump-en-vente',
      title: 'Order bump en vente',
      short: 'Augmenter le panier moyen sans coût d’acquisition.',
      objectives: [
        'Placer un order bump au bon moment',
        'Fixer un prix cohérent',
        'Mesurer son effet réel',
      ],
      minutes: 6,
      intro:
        "L'order bump est la technique au meilleur rendement du marketing digital, précisément parce qu'elle ne coûte rien : la personne paie déjà. Sa réussite dépend entièrement de la cohérence de l'offre.",
      explain:
        "Le moment : pendant le paiement, jamais avant. L'offre doit apparaître au moment où la décision est prise, en ajout d'une ligne.\n\nLa cohérence : l'offre complète le produit principal. Une formation avec un workbook, un template avec un guide d'usage.\n\nLe prix : aligné sur la valeur perçue, généralement entre 20 et et 50 % du produit principal, avec un cadrage honnête.\n\nLe consentement : l'offre doit être explicitement acceptée, et le refus aussi simple que l'acceptation. Une case cochée d'office avec un retrait impossible est une pratique commerciale discutable, et interdite dans plusieurs juridictions européennes.\n\nLa mesure : l'indicateur utile est le panier moyen après ajout, pas le nombre de ventes.",
      example:
        "Formation à 197 €, workbook à 29 € (39 € séparément). Taux d'ajout : 30 %. Panier moyen : de 197 € à 236 €.",
      apply:
        "Préparez une seule offre complémentaire, testez-la sur un mois, et comparez le panier moyen avant et après. Si l'effet est inférieur à 5 %, retirez-la : la complexité a un coût.",
      nuvra:
        "Dans Nuvra, l'order bump est une ligne supplémentaire sur la commande, avec son propre prix et son propre produit. Le détail de la commande montre exactement ce qui a été acheté, et les statistiques mesurent le panier moyen par période.",
      exercise: {
        title: 'Préparer son order bump',
        instructions: 'Offre, prix, affichage, mesure prévue.',
        checklist: [
          'Offre cohérente avec le produit',
          'Prix inférieur au prix séparé',
          'Consentement explicite',
          'Panier moyen mesuré avant/après',
        ],
        worksheet: [
          { key: 'bump', label: 'Votre order bump', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'upsell-en-conversion',
      title: 'Upsell en conversion',
      short: 'Une seconde vente au moment où la confiance est maximale.',
      objectives: [
        'Concevoir un upsell cohérent',
        'Le présenter au bon moment',
        'En mesurer l’acceptation',
      ],
      minutes: 7,
      intro:
        "Après l'achat, la confiance est au maximum. C'est le meilleur moment pour proposer une seconde offre, à condition qu'elle réponde à un besoin que le premier achat a créé.",
      explain:
        "La règle de cohérence. L'upsell doit résoudre un problème laissé ouvert par le produit principal. Un produit de base qui laisse « il faut maintenant configurer l'outil » appelle naturellement un service de configuration.\n\nLe moment : la page de remerciement, immédiatement après paiement. C'est le seul moment où la décision est prise dans un état favorable.\n\nLe format : un prix absorbable sur une page. Un upsell à plus de 500 € demande un appel, pas un bouton.\n\nLa mesure : le taux d'acceptation par achat, et son effet sur la valeur par client. Un upsell à 15 % d'acceptation sur 147 € double la marge sans coût d'acquisition — mais il fatigue si on le répète à chaque achat.\n\nLa règle de temps : un upsell par achat, puis on laisse la relation respirer.",
      example:
        "Formation 7 jours à 197 € → upsell « Session de configuration » à 147 € sur la page de remerciement. Acceptation : 12 %.",
      apply:
        "Écrivez votre upsell en une phrase : « Si vous avez [X], voici [Y]. » Sans X, pas d'upsell.",
      nuvra:
        "Dans Nuvra, l'upsell est une page supplémentaire du tunnel, ou une ligne ajoutée à la commande. Vous mesurez son taux d'acceptation dans les commandes, et sa contribution dans vos revenus par période.",
      exercise: {
        title: 'Concevoir son upsell',
        instructions: 'Problème, offre, prix, emplacement.',
        checklist: [
          'Problème lié au produit principal',
          'Prix absorbable sur page',
          'Placé sur la page de remerciement',
          'Un seul upsell',
        ],
        worksheet: [
          { key: 'upsell', label: 'Votre upsell', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'ab-testing',
      title: 'A/B testing',
      short: 'Tester une variable, lire un résultat, prendre une décision.',
      objectives: [
        'Concevoir un test valide',
        'Déterminer la taille nécessaire',
        'Interpréter un résultat sans se tromper',
      ],
      minutes: 8,
      intro:
        "L'intuition est un mauvais juge de page. Le test A/B est la méthode la plus simple pour remplacer une opinion par une mesure — à condition de ne pas se tromper de méthode.",
      explain:
        "Trois règles.\n\nUne seule variable : un titre, ou une image, ou un prix. Jamais deux à la fois.\n\nUne taille suffisante : sur un trafic faible, la différence observée est souvent du hasard. En dessous de cent conversions par variante, un écart de 10 % n'a pas de signification. Le bon réflexe : si le trafic est faible, improves la page sur des principes solides plutôt que tester.\n\nUne décision à la fin : le test n'existe que s'il produit une décision. « On garde A », « on garde B », « on revient à l'original ».\n\nLe piège classique : tester trop longtemps et arrêter au moment où l'écart est le plus flatteur. Fixez la durée à l'avance.",
      example:
        "Deux titres testés pendant dix jours : 312 ventes contre 341, soit 3,4 % d'écart, avec 500 conversions par variante. L'écart est réel mais faible : on garde le titre B, on ne change rien d'autre, et on arrête.",
      apply:
        "Dupliquez une page, changez un élément, publiez les deux, et comparez sur une durée fixée à l'avance. Notez le résultat dans Analytics, et écrivez la décision prise.",
      nuvra:
        "Dans Nuvra, dupliquer une page est immédiat. Chaque page enregistre ses vues dans Analytics, ce qui permet de comparer deux versions sur la même période et avec la même source de trafic.",
      exercise: {
        title: 'Concevoir un test',
        instructions: 'Une variable, une durée, un seuil de décision.',
        checklist: [
          'Une seule variable modifiée',
          'Durée fixée à l’avance',
          'Seuil de conversions défini',
          'Décision prévue',
        ],
        worksheet: [
          { key: 'test', label: 'Votre test', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'optimisation-du-funnel',
      title: 'Optimisation du funnel',
      short: 'Corriger le maillon faible, mesurer, recommencer.',
      objectives: [
        'Diagnostiquer un tunnel par ses données',
        'Prioriser les corrections par impact',
        'Installer une boucle d’amélioration continue',
      ],
      minutes: 8,
      intro:
        "L'optimisation n'est pas une liste d'idées : c'est un cycle. Mesurer, identifier le maillon le plus faible, corriger une seule chose, remesurer. Toute autre approche est du bricolage.",
      explain:
        "Le cycle, en quatre temps.\n\nMesurer : chaque étape a un taux, chaque semaine.\n\nDiagnostiquer : le maillon avec le plus de perte absolue, pas le plus faible en pourcentage.\n\nCorriger : une seule modification, choisie parmi quatre familles — le message, l'offre, le prix, l'expérience de paiement.\n\nRemesurer : sept jours minimum, ou assez de conversions pour conclure.\n\nLes quatre leviers, par ordre de fréquence d'impact : le message (titre, promesse), l'offre (ce qui est vendu), le prix (montant, forme, paiement), l'expérience (vitesse, nombre de champs).\n\nUn tunnel s'optimise pendant des mois, pas des semaines. Mais la discipline du cycle, elle, est immédiate.",
      example:
        "Diagnostic : 5 000 visites, 250 leads (5 %), 12 ventes (4,8 % des leads). Le maillon le plus faible est la conversion lead → vente : la page de vente et le suivi. Corriger la landing n'augmenterait que des leads qui n'achèteront pas non plus.",
      apply:
        "Choisissez un levier, appliquez-le, mesurez sept jours. Notez tout dans un journal : même les tests sans résultat vous apprennent quelque chose sur votre audience.",
      nuvra:
        "Analytics Nuvra affiche les vues par page, les contacts créés, les commandes et les revenus par période. Assez pour tenir le cycle complet, sans tableur.",
      action: {
        action: 'open_analytics',
        label: 'Ouvrir mes statistiques',
        route: '/dashboard/analytics',
        requiredEntity: 'Une lecture du tableau de bord Statistiques',
        completionCheck: 'analytics_consulted',
        hint: 'Trouve ton maillon faible dans les données réelles.',
      },
      exercise: {
        title: 'Diagnostiquer son tunnel',
        instructions: 'Quatre étapes : mesurer, diagnostiquer, corriger, remesurer.',
        checklist: [
          'Taux mesurés sur 7 jours',
          'Maillon faible identifié',
          'Un levier choisi',
          'Date de remesure fixée',
        ],
        worksheet: [
          { key: 'diagnostic', label: 'Votre diagnostic', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'transformer-un-visiteur-en-client',
      title: 'Transformer un visiteur en client',
      short: 'Le parcours complet, du clic à la relation durable.',
      objectives: [
        'Décrire le parcours réel d’une conversion',
        'Repérer les cinq points de rupture',
        'Installer une boucle de deuxième achat',
      ],
      minutes: 8,
      intro:
        "Une conversion n'est pas un événement, c'est le début d'une relation. La personne qui achète aujourd'hui peut devenir la source de trois clients demain, si le suivi qui suit l'achat est fait correctement.",
      explain:
        "Le parcours complet : découverte, capture, warming, décision, paiement, livraison, activation, deuxième achat, recommandation.\n\nLes cinq ruptures les plus fréquentes.\n\nL'attente entre la capture et le premier contact : si le premier email arrive le lendemain, le taux d'ouverture chute.\n\nL'absence de suivi après l'achat : la cliente ne sait pas quoi faire, et abandonne.\n\nL'absence de preuve avant le paiement : la page n'a pas répondu à une objection.\n\nLe paiement frictionnel : champs inutiles, frais surprise.\n\nL'absence de deuxième moment : aucune proposition entre le premier et le deuxième achat.\n\nCorriger ces cinq points suffit souvent à doubler le chiffre d'affaires sans un seul nouveau lead.",
      example:
        "Deux offres identiques. La première n'a pas d'email de bienvenue : 22 ventes. La seconde en a un, avec accès immédiat et première action : 41 ventes. Le trafic était identique.",
      apply:
        "Passez votre parcours client complet sur papier, du premier clic à la recommandation. Marquez chaque étape où le client doit agir sans savoir quoi faire : ce sont vos ruptures.",
      nuvra:
        "Dans Nuvra, ce parcours est mesuré de bout en bout : pageviews, contacts, commandes, livraisons, emails envoyés, ouvertures, ventes. Les automatisations couvrent chaque transition, et le CRM conserve l'historique de chaque contact.",
      exercise: {
        title: 'Cartographier son parcours',
        instructions: 'Liste des étapes, avec le point de rupture éventuel.',
        checklist: [
          'Parcours listé étape par étape',
          'Délai de premier contact mesuré',
          'Suivi post-achat identifié',
          'Moment de deuxième achat prévu',
        ],
        worksheet: [
          { key: 'parcours', label: 'Votre parcours', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'optimiser-ses-pages-dans-nuvra',
      title: 'Optimiser ses pages dans Nuvra',
      short: 'Appliquer la méthode sur une vraie page, avec de vraies données.',
      objectives: [
        'Modifier une page publiée sans la casser',
        'Tester une variante et mesurer',
        'Tenir un journal d’optimisation',
      ],
      minutes: 10,
      example:
        "Nora avait une page de 2 400 mots avec quatre CTA et aucune preuve. Elle réécrit le titre (« Vos 46 propositions, 3 ventes : changez ce ratio en 7 jours »), ajoute un cas chiffré, supprime trois sections, et passe à un seul bouton. Le taux de conversion passe de 1,1 % à 2,3 % en huit jours, sans nouveau trafic.",
      intro:
        "C'est le lab du module. Vous allez prendre une page réelle, corriger son titre, sa preuve et son CTA, vérifier le checkout, puis mesurer. Ce que vous faites ici est exactement ce que vous referez chaque mois ensuite.",
      explain:
        "Le travail se fait en cinq temps.\n\nDiagnostic : ouvrez la page et lisez-la comme une inconnue. Notez la première question à laquelle elle ne répond pas.\n\nCorrection du message : réécrivez le titre avec résultat, audience et délai. Testez la nouvelle formulation auprès de trois personnes avant de publier.\n\nAjout de la preuve : insérez un cas réel ou une démonstration. Pas de promesse non documentée.\n\nCorrection du CTA : un seul bouton, répété, avec la réassurance juste en dessous.\n\nVérification du parcours : testez le paiement complet avant de publier, puis publiez.\n\nEnfin, le journal : une ligne par test, avec la date, la variable, le résultat et la décision. C'est ce journal qui vous empêche de refaire les mêmes erreurs.",
      apply:
        "Tenez ce journal même après le module. La plupart des activités numériques n'ont pas de problème d'idées : elles ont un problème de mémoire.",
      nuvra:
        "Le bouton ci-dessous ouvre l'éditeur de pages de Nuvra. Modifiez, dupliquez pour tester, publiez, et mesurez dans Analytics. Chaque page publiée est un actif que vous pouvez améliorer indéfiniment.",
      action: {
        action: 'create_page',
        label: 'Optimiser ma page de vente',
        route: '/dashboard/pages?new=1',
        requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
        completionCheck: 'page_created',
        hint: 'Corrige le titre, la preuve et le CTA, puis teste le paiement.',
      },
      exercise: {
        title: 'Optimiser et mesurer',
        instructions: 'Corrige une page, teste le parcours, mesure sept jours.',
        checklist: [
          'Titre réécrit avec résultat, audience, délai',
          'Bloc de preuve ajouté',
          'CTA unique et répété',
          'Paiement testé de bout en bout',
          'Page publiée et mesurée',
          'Résultat consigné dans un journal',
        ],
        worksheet: [
          { key: 'avant', label: 'Taux avant', type: 'text' },
          { key: 'apres', label: 'Taux après', type: 'text' },
          { key: 'journal', label: 'Journal du test', type: 'textarea' },
        ],
      },
      resources: [
        {
          title: 'Grille d’audit de page de vente',
          kind: 'CHECKLIST',
          description: 'Les 24 points de contrôle, classés par levier d’impact.',
        },
        {
          title: 'Journal d’optimisation',
          kind: 'WORKBOOK',
          description: 'Une ligne par test : date, variable, résultat, décision.',
        },
      ],
      video: {
        narration:
          "Tu optimises maintenant une vraie page : titre, preuve, objections, CTA, checkout. Puis tu mesures. Ce cycle, tu le reproduis chaque mois sur toutes tes pages. Le module suivant porte sur le temps que tu vas récupérer.",
      },
    },
  ],
};
