import type { AcademyModuleInput } from './types';

/** Module 4 — Créer sa première formation. */
export const MODULE_4: AcademyModuleInput = {
  slug: 'creer-sa-formation',
  title: 'Créer sa première formation',
  description:
    "Une formation n'est pas une vidéo. C'est un parcours qui transforme quelqu'un, avec une structure, des leçons, des preuves de progression et une expérience qui soutient l'apprentissage. Ce module vous apprend à concevoir, produire et vendre la vôtre.",
  objectives: [
    'Choisir un sujet et une transformation à enseigner',
    'Structurer un programme en modules et leçons',
    'Écrire une leçon pédagogique qui fait progresser',
    'Créer et enregistrer des vidéos exploitables',
    'Construire quiz, ressources et expérience étudiante',
    'Générer un certificat de fin de parcours',
    'Définir le prix et publier une formation',
    'Créer une vraie formation dans Nuvra',
  ],
  deliverable:
    'Une formation Nuvra complète : modules, leçons, vidéo, ressources, quiz, certificat, prix et publication.',
  lab: {
    title: 'Lab — Créer sa première formation avec Nuvra',
    goal:
      'Construire une formation vendable de bout en bout dans le Course Builder de Nuvra.',
    steps: [
      'Créer la formation : titre, description, catégorie, niveau, prix, couverture',
      'Structurer le programme en modules, puis en leçons ordonnées',
      'Ajouter le contenu de la première leçon et une vidéo ou un support',
      'Créer un quiz avec un score minimum, activer le certificat, publier',
    ],
    action: {
      action: 'create_course',
      label: 'Créer ma première formation',
      route: '/dashboard/courses?new=1',
      requiredEntity: 'Une formation Nuvra publiée',
      completionCheck: 'course_created',
      hint: 'Ouvre le vrai Course Builder de Nuvra.',
    },
  },
  video: {
    title: 'Module 4 — Concevoir et vendre sa formation',
    description:
      'De l’idée de sujet au programme publié : la méthode complète, appliquée dans Nuvra.',
    durationSec: 700,
    script: `00:00 — Accroche
Créer une formation, ce n'est pas enregistrer des vidéos. C'est concevoir un chemin par lequel une personne passe d'un état à un autre, avec des étapes assez courtes pour être suivies et des preuves pour savoir qu'elle avance. Dans cette vidéo, on parcourt la méthode complète, puis on la réalise dans Nuvra.

01:20 — Le sujet et la transformation
Un bon sujet répond à une demande existante. On choisit un sujet que l'on peut enseigner avec des exemples vécus, et une transformation formulable : « passer de zéro à sa première page de vente publiée en 7 jours ». Le sujet seul ne vend rien ; la transformation oui.

02:50 — Structurer le programme
On part du résultat final et on remonte : quelles étapes sont nécessaires ? Entre trois et sept modules. Chaque module a un résultat intermédiaire clair. Le programme se lit comme une table des matières d'un bon livre, et chaque leçon a une promesse d'une phrase.

04:20 — Écrire la leçon
Une leçon suit une structure simple : ce que l'on va faire, pourquoi, comment, puis une vérification. On écrit le texte avant d'enregistrer la vidéo : le texte est la pensée, la vidéo n'est que sa présentation. Une leçon qui n'a pas de texte est une vidéo difficile à suivre et impossible à mettre à jour.

05:50 — La vidéo
Une vidéo de leçon dure entre cinq et douze minutes. Au-delà, l'attention décroche. Une règle simple : une idée par vidéo, un exemple à l'écran, et une démonstration si c'est possible. Le son et l'image doivent être clairs même sur un téléphone, parce que c'est là que la moitié de vos élèves apprendront.

07:30 — L'expérience étudiante
Quiz, ressources, progression, certificat. Le quiz ne sert pas à noter : il sert à ancrer. Les ressources servent à l'action : un modèle, une liste de contrôle. La progression visible motive plus que n'importe quelle récompense externe. Le certificat donne une fin au parcours, et il donne à l'élève quelque chose à montrer.

09:10 — Prix et publication
Le prix d'une formation se cale sur le résultat, pas sur la durée. Un parcours qui produit un résultat mesurable se vend entre 97 et 497 € selon l'accompagnement inclus. On publie quand le programme est complet : une formation publiée à moitié se vend mal et entame la réputation.

10:40 — Récapitulatif
Vous avez maintenant un sujet, un programme, des leçons écrites, une vidéo, un quiz et un certificat. Il reste à le construire dans Nuvra : c'est ce que fait le lab.`,
    chapters: [
      { title: 'Sujet et transformation', time: 0 },
      { title: 'Structurer le programme', time: 80 },
      { title: 'Écrire la leçon', time: 170 },
      { title: 'La vidéo de leçon', time: 350 },
      { title: 'Expérience étudiante et certificat', time: 450 },
      { title: 'Prix, publication et lab', time: 560 },
    ],
    transcript:
      "Créer une formation, ce n'est pas enregistrer des vidéos, c'est concevoir un chemin qui transforme quelqu'un. On choisit un sujet et une transformation formulable. On structure le programme en trois à sept modules, chacun avec un résultat intermédiaire clair. On écrit le texte de la leçon avant la vidéo : le texte est la pensée, la vidéo n'en est que la présentation. Une vidéo dure cinq à douze minutes, une idée par vidéo, lisible sur téléphone. L'expérience étudiante repose sur le quiz, les ressources, la progression visible et le certificat. Le prix se cale sur le résultat produit, pas sur la durée. On publie quand le programme est complet.",
    storyboard: [
      {
        time: '00:00',
        visual: 'Titre « Créer sa formation » ; un parcours se dessine en ligne brisée.',
        narration: 'Une formation est un chemin, pas une playlist.',
        onScreenText: 'Créer sa formation',
      },
      {
        time: '01:20',
        visual: 'Deux cartes : « Sujet » et « Transformation », puis un exemple chiffré.',
        narration: 'Le sujet seul ne vend rien ; la transformation oui.',
        onScreenText: 'Sujet → Transformation',
      },
      {
        time: '02:50',
        visual: 'Tableau de matières qui se construit module par module.',
        narration: 'Entre trois et sept modules, chacun avec un résultat clair.',
        onScreenText: '3 à 7 modules',
      },
      {
        time: '04:20',
        visual: 'Document texte à gauche, storyboard vidéo à droite.',
        narration: 'On écrit le texte avant d’enregistrer la vidéo.',
        onScreenText: 'Texte d’abord',
      },
      {
        time: '05:50',
        visual: 'Minuteur de vidéo 5 à 12 minutes, sous-titres et vue mobile.',
        narration: 'Une idée par vidéo, lisible sur téléphone.',
        onScreenText: '5 à 12 min',
      },
      {
        time: '07:30',
        visual: 'Interface étudiante : progression, quiz, ressources, certificat.',
        narration: 'La progression visible motive plus qu’une récompense.',
        onScreenText: 'Expérience étudiante',
      },
      {
        time: '09:10',
        visual: 'Fiche formation : prix, statut publication, aperçu.',
        narration: 'On publie quand le programme est complet.',
        onScreenText: 'Prix & publication',
      },
    ],
  },
  lessons: [
    {
      slug: 'trouver-un-sujet',
      title: 'Trouver un sujet',
      short: 'Un sujet vendable, que vous pouvez enseigner avec autorité.',
      objectives: [
        'Choisir un sujet en fonction de la demande et de votre expérience',
        'Éviter les sujets trop larges ou déjà saturés',
        'Formuler le sujet comme une promesse d’apprentissage',
      ],
      minutes: 8,
      intro:
        "Le sujet d'une formation doit répondre à une demande formulée par quelqu'un, et permettre d'enseigner quelque chose de vérifiable. Trop large, il ne sert personne ; trop étroit, il ne parle à personne. Le bon sujet tient en une phrase que vos futurs élèves pourraient taper dans un moteur de recherche.",
      explain:
        "Trois filtres pour choisir.\n\nLa demande existe : des gens cherchent activement cette solution. Les questions posées en ligne, les discussions, les recherches de mots-clés donnent la mesure.\n\nVous pouvez l'enseigner : vous avez des exemples vécus, des résultats, une expérience. On n'enseigne bien que ce qu'on a fait.\n\nLa promesse est vérifiable : on peut dire ce qu'un élève saura faire à la fin. « Comprendre le marketing digital » n'est pas vérifiable ; « publier une page de vente qui reçoit des demandes de contact » l'est.\n\nUn piège fréquent est le sujet « généraliste + un adjectif ». « Marketing digital pour Experts » n'est pas un sujet, c'est une promesse creuse. La spécificité doit porter sur un problème, un outil ou un résultat — pas sur un niveau.",
      example:
        "« Formation au marketing digital » ne vend pas. « Créer et publier sa première landing page qui capte 100 contacts en 30 jours » vend, parce que c'est une action, un livrable et un délai.",
      apply:
        "Écrivez dix sujets possibles. Pour chacun, notez : la demande (0 à 5), votre crédibilité (0 à 5), et la vérifiabilité de la promesse (0 à 5). Gardez le plus haut total, et vérifiez qu'il existe déjà des personnes qui paient pour quelque chose de proche.",
      nuvra:
        "Le sujet devient le titre de votre formation dans Courses, et son titre est le premier élément de la fiche de vente. Dans Nuvra, un titre de formation qui contient le livrable et le délai convertit nettement mieux qu'un titre descriptif.",
      exercise: {
        title: 'Choisir son sujet',
        instructions: 'Note dix sujets et choisis le meilleur selon les trois critères.',
        checklist: [
          'Dix sujets listés et notés',
          'Sujet retenu avec justification',
          'Promesse formulée avec livrable et délai',
        ],
        worksheet: [
          { key: 'sujets', label: 'Sujets et notes', type: 'textarea' },
          { key: 'retenu', label: 'Sujet retenu', type: 'text' },
        ],
      },
    },
    {
      slug: 'identifier-une-transformation',
      title: 'Identifier une transformation',
      short: 'Ce que l’élève saura faire à la fin, écrit précisément.',
      objectives: [
        'Formuler une transformation d’apprentissage',
        'Décrire l’état initial et l’état final',
        'Vérifier que la transformation est atteignable en un parcours',
      ],
      minutes: 7,
      intro:
        "Une formation vend une transformation. Si vous ne pouvez pas dire en une phrase ce que l'élève sera capable de faire, vous n'avez pas encore de formation : vous avez un ensemble de vidéos sur un thème.",
      explain:
        "Une transformation d'apprentissage se décrit avec trois éléments.\n\nL'état initial observable : « n'a jamais écrit de page de vente ».\n\nL'état final observable : « a une page publiée, testée sur 20 personnes, qui génère des demandes ».\n\nLe chemin : les étapes du parcours. Trois à sept, chacune avec son propre résultat.\n\nLe test de l'atteignable : la transformation doit être réalisable dans le temps de formation annoncé. Si le délai affiché est « en 7 jours », chaque étape doit pouvoir être réalisée en moins d'une journée. Une transformation qui demande trois mois à un débutant n'est pas une formation, c'est unaccompanied programme.\n\nUn critère de qualité : la transformation doit produire quelque chose de visible — une page, un produit, une séquence, une liste. L'élève doit pouvoir montrer le résultat.",
      example:
        "Faible : « Maîtriser le marketing digital ». Fort : « avoir écrit, publié et testé une page de vente qui a généré 3 demandes de contact réelles en 7 jours ».",
      apply:
        "Écrivez la transformation, puis vérifiez le délai étape par étape. Si une étape dépasse une journée, découpez-la : c'est souvent le signe que la leçon est trop grosse.",
      nuvra:
        "La transformation se place dans la description de la formation (Courses) et dans la première leçon. Elle sert aussi de critère de validation : à la fin du parcours, l'élève doit pouvoir produire la preuve décrite.",
      exercise: {
        title: 'Formuler sa transformation',
        instructions: 'Écrivez l’état initial, l’état final et les étapes du chemin.',
        checklist: [
          'État initial décrit',
          'État final observable décrit',
          'Chemin en trois à sept étapes',
          'Délai total réaliste',
        ],
        worksheet: [
          { key: 'transformation', label: 'Votre transformation', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'definir-son-etudiant-ideal',
      title: 'Définir son étudiant idéal',
      short: 'À qui s’adresse la formation, et avec quel niveau de départ.',
      objectives: [
        'Décrire l’élève type en termes de niveau et d’objectif',
        'Adapter la difficulté à son point de départ',
        'Écrire le message qui attire cet élève précis',
      ],
      minutes: 8,
      intro:
        "Une formation n'est pas un manuel : c'est un accompagnement pour une personne précise, avec un niveau de départ donné. Le même contenu ne convient pas à un débutant complet et à un praticien confirmé, sauf à doubler la longueur — ce qui est un mauvais calcul.",
      explain:
        "L'étudiant idéal se décrit par quatre éléments.\n\nSon niveau de départ : ce qu'il sait déjà faire. « Sait écrire un post, ne sait pas structurer une offre. »\n\nSon objectif final : ce qu'il veut accomplir, formulé avec ses mots.\n\nSes contraintes : temps disponible, matériel, niveau technique. Une formation qui suppose six heures par jour exclut la majorité des élèves.\n\nSes objections : ce qui l'empêche de s'inscrire.\n\nÀ partir de là, on choisit le niveau affiché (débutant, intermédiaire, avancé) et le ton. Une formation de niveau intermédiaire qui commence par expliquer le fonctionnement d'un site web perd ses hesitated.\n\nLe message d'accroche doit issus de l'étudiant idéal : il doit pouvoir se dire « c'est pour moi » en moins de cinq secondes.",
      example:
        "Étudiant idéal : Independent de 28 à 45 ans, sait utiliser les réseaux, n'a jamais vendu en ligne, dispose de trois heures par semaine, objection principale « je ne suis pas informaticien ».",
      apply:
        "Écrivez la fiche de votre étudiant idéal et vérifiez que chaque module de votre programme lui parle directement. Si un module s'adresse à quelqu'un d'autre, sortez-le ou créez une autre formation.",
      nuvra:
        "La fiche étudiant idéal oriente les choix techniques : le niveau (level) et la catégorie (category) de la formation dans Courses apparaissent sur la fiche et dans la marketplace. Une fiche correctement renseignée filtrée par les bons élèves.",
      exercise: {
        title: 'Fiche étudiant idéal',
        instructions: 'Décrivez l’élève type et vérifiez l’adéquation de chaque module.',
        checklist: [
          'Niveau de départ écrit',
          'Objectif final écrit',
          'Contraintes listées',
          'Chaque module lui est destiné',
        ],
        worksheet: [
          { key: 'etudiant', label: 'Votre étudiant idéal', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'structurer-son-programme',
      title: 'Structurer son programme',
      short: 'Des modules qui se suivent, chacun avec son résultat.',
      objectives: [
        'Découper un programme en modules cohérents',
        'Donner un résultat à chaque module',
        'Vérifier la progression d’ensemble',
      ],
      minutes: 9,
      intro:
        "Le programme est la promesse faite au contenu. Un programme mal structuré est la première cause d'abandon : l'élève ne voit pas où il va, donc il n'avance pas. Un bon programme se lit comme une progression, pas comme une liste de sujets.",
      explain:
        "La méthode du chemin consiste à partir de la transformation et à la décomposer.\n\nÉtape 1 : quel est le premier résultat vérifiable ? Souvent, c'est une action (« une offre écrite en une page »).\n\nÉtape 2 : quelles sont les compétences nécessaires pour ce résultat ? Elles deviennent vos modules.\n\nÉtape 3 : dans quel ordre ? Du plus essentiel au plus avancé. Chaque module doit pouvoir être appliqué seul, sans dépendre d'un module ultérieur.\n\nÉtape 4 : quel est le module suivant pour l'élève qui a fini ? Il n'est pas dans la formation : c'est votre offre suivante. Une bonne formation se termine sur une porte ouverte, pas sur une fin de parcours.\n\nRègle de nommage : le titre d'un module doit contenir son résultat, pas son sujet. « Construire son offre » est un sujet ; « Votre offre écrite et validée » est un résultat.",
      example:
        "Transformation : une page de vente publiée. Modules : 1) Définir l'offre (résultat : offre d'une page). 2) Écrire la page (résultat : page rédigée). 3) Publier et tester (résultat : page en ligne et testée). 4) Mesurer et améliorer (résultat : taux de conversion mesuré).",
      apply:
        "Écrivez les titres de modules comme des résultats. Relisez la liste : elle doit raconter l'histoire du parcours de l'élève, de l novice à l'utilisateur autonome.",
      nuvra:
        "Dans Nuvra, les modules d'une formation sont ordonnés par position, et chaque module contient ses leçons. C'est exactement cette structure qui sera affichée aux élèves : un sommaire, un état d'avancement, et la possibilité de sauter ou de reprendre n'importe quelle leçon.",
      exercise: {
        title: 'Écrire son programme',
        instructions: 'Décomposez votre transformation en modules, avec un résultat par module.',
        checklist: [
          'Entre trois et sept modules',
          'Un résultat par module',
          'Ordre de progression cohérent',
          'Prochaine étape après la formation identifiée',
        ],
        worksheet: [
          { key: 'programme', label: 'Votre programme', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'construire-ses-modules',
      title: 'Construire ses modules',
      short: 'Découper un module en leçons de cinq à douze minutes.',
      objectives: [
        'Découper un module en leçons cohérentes',
        'Donner un titre de résultat à chaque leçon',
        'Garder des leçons courtes et actionnables',
      ],
      minutes: 8,
      intro:
        "Un module trop long n'est jamais terminé. Le découpage en leçons courtes est ce qui distingue une formation suivie d'une formation téléchargée. La règle : une leçon = une idée = une action.",
      explain:
        "Pour chaque module, écrivez d'abord la liste de ses leçons sous forme de promesses.\n\n« Comprendre le tunnel » est un sujet. « Créer votre première landing page » est une leçon.\n\nChaque leçon doit avoir une durée cible : cinq à douze minutes de vidéo, dix à quinze minutes de lecture. Au-delà, on découpe.\n\nLe découpage suit la logique du résultat : une leçon pour comprendre, une leçon pour faire, une leçon pour corriger. L'élève fait, se trompe, corrige. Ce cycle est le cœur de l'apprentissage.\n\nEnfin, une leçon doit pouvoir être consultée seule. Beaucoup d'élèves reviennent sur un point précis six mois plus tard : si la leçon n'a de sens que dans le flux, elle ne leur servira à rien.",
      example:
        "Module « Créer sa landing page » : leçon 1 « Ce qu'est une landing page (et ce qu'elle n'est pas) », leçon 2 « Écrire la promesse », leçon 3 « Construire la page dans Nuvra », leçon 4 « Tester et corriger ». Quatre leçons, quatre étapes, un résultat.",
      apply:
        "Écrivez les titres de leçons de votre module. Si un titre commence par « Comprendre », remplacez-le par une action. Le titre doit pouvoir être le résultat d'un travail effectué.",
      nuvra:
        "Dans Nuvra, chaque leçon possède un titre, une position, un type (texte, vidéo, fichier, quiz), une durée et un contenu. L'ordre des leçons dans le module détermine le parcours affiché aux élèves et l'ordre de progression mesuré.",
      exercise: {
        title: 'Découper un module',
        instructions: 'Transformez un module de votre programme en leçons titrées par résultat.',
        checklist: [
          'Au moins trois leçons par module',
          'Titres formulés comme des actions',
          'Durée cible indiquée par leçon',
          'Chaque leçon compréhensible seule',
        ],
        worksheet: [
          { key: 'lecons', label: 'Leçons du module', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'construire-ses-lecons',
      title: 'Construire ses leçons',
      short: 'Chaque leçon suit la même structure : comprendre, faire, vérifier.',
      objectives: [
        'Appliquer une structure de leçon constante',
        'Rendre la leçon actionnable',
        'Inclure une vérification de compréhension',
      ],
      minutes: 8,
      intro:
        "Une leçon qui n'oblige à rien n'est jamais terminée. La structure constante — comprendre, faire, vérifier — est ce qui transforme une vidéo Passive en progression mesurable.",
      explain:
        "Trois temps, toujours dans cet ordre.\n\nComprendre : la leçon explique une idée en moins de deux minutes, avec un exemple concret tiré de l'expérience réelle.\n\nFaire : l'élève réalise une action, guidé pas à pas. C'est le cœur de la leçon : la majorité du temps doit y être consacrée.\n\nVérifier : l'élève constate qu'il a réussi — un quiz, une case à cocher, un résultat visible. Sans vérification, il ne saura pas s'il a compris.\n\nLa règle d'écriture : phrases courtes, une idée par paragraphe, verbes d'action. Écrivez comme si vous guidiez quelqu'un à côté de lui, pas comme si vous présentiez un cours magistral.\n\nChaque leçon se termine par une transition : « maintenant que vous avez fait ceci, la leçon suivante montre comment… ». C'est ce qui maintient l'élève dans le parcours.",
      example:
        "Leçon « Écrire votre promesse » : comprendre (une promesse = résultat + délai + audience), faire (écrivez trois promesses avec le modèle), vérifier (lisez-les à voix haute et demandez à un tiers laquelle est la plus claire).",
      apply:
        "Écrivez une leçon complète en suivant la structure. Comptez les mots : si la section « comprendre » dépasse un tiers de la leçon, elle est trop longue.",
      nuvra:
        "Dans Nuvra, le contenu d'une leçon est un champ texte riche, et chaque leçon peut porter un quiz, des ressources et un exercice. C'est la même structure que vous follow dans cette Académie : comprendre, appliquer, valider, passer à la suite.",
      exercise: {
        title: 'Écrire une leçon complète',
        instructions: 'Rédigez une leçon selon la structure comprendre / faire / vérifier.',
        checklist: [
          'Section comprendre courte et/example',
          'Section faire avec étapes',
          'Section vérifier avec critère de réussite',
          'Transition vers la leçon suivante',
        ],
        worksheet: [
          { key: 'lecon', label: 'Votre leçon', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'ecrire-une-lecon-pedagogique',
      title: 'Écrire une leçon pédagogique',
      short: 'Le texte avant la vidéo : c’est là que se joue la clarté.',
      objectives: [
        'Rédiger un texte de leçon clair et actionnable',
        'Utiliser exemples, chiffres et verbatims',
        'Préparer le script d’une vidéo à partir du texte',
      ],
      minutes: 9,
      intro:
        "Beaucoup de créateurs enregistrent d'abord et écrivent ensuite. C'est l'inverse le plus coûteux : le texte est la pensée, la vidéo n'en est que la présentation. Écrire d'abord rend la vidéo plus courte, plus claire, et plus facile à mettre à jour.",
      explain:
        "Un texte de leçon efficace suit quatre règles.\n\nUne idée par section, avec un titre qui l'annonce.\n\nDes exemples réels : chiffres, captures, verbatims. Un exemple abstrait n'aide personne à agir.\n\nDes instructions numérotées pour les parties pratiques.\n\nUn ton direct, à la deuxième personne (« tu écris », « tu cliques »), qui donne l'impression d'être accompagné.\n\nÀ partir de ce texte, la vidéo devient simple : on lit la structure, on montre l'action à l'écran, on ne répète pas tout le texte. Le gains de temps est considérable, et la qualité augmente.\n\nLe texte a un second usage : il devient la transcription et l'ordre du jour de la vidéo. Il reste donc indispensable même après l'enregistrement.",
      example:
        'Texte : « Une promesse répond à trois questions : pour qui, quel résultat, en combien de temps. Exemple : pour les freelances qui vendent des prestations, obtenir 3 clients en 30 jours avec une page publiée. Fais-le : écris la tienne avec le modèle. » Vidéo : 4 minutes, modèle à l’écran, exemple réel, puis l’exercice.',
      apply:
        "Écrivez le texte de trois leçons avant d'enregistrer quoi que ce soit. Vous allez découvrir que deux de ces leçons n'ont pas besoin de vidéo : elles gagnent à être du texte, plus rapide et plus consultable.",
      nuvra:
        "Dans Nuvra, ce texte est le contenu de la leçon. Il est affiché à l'élève, il sert de base à la vidéo, et il reste consultable même sans connexion. C'est aussi ce que les élèves consultent en cas de doute trois mois plus tard.",
      exercise: {
        title: 'Rédiger le texte d’une leçon',
        instructions: 'Rédigez le texte complet d’une leçon avant de thinker à la vidéo.',
        checklist: [
          'Texte structuré en sections',
          'Au moins un exemple réel',
          'Instructions numérotées',
          'Durée estimée indiquée',
        ],
        worksheet: [
          { key: 'texte', label: 'Texte de la leçon', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'creer-ses-videos',
      title: 'Créer ses vidéos',
      short: 'Planifier une vidéo de leçon : format, durée, contenu.',
      objectives: [
        'Choisir le format adapté à chaque leçon',
        'Structurer une vidéo avec un plan simple',
        'Rédiger un storyboard avant de filmer',
      ],
      minutes: 8,
      intro:
        "Une vidéo de formation n'est pas une vidéo de communication. Elle doit faire apprendre. Cela signifie : peu d'introduction, une idée par vidéo, une démonstration à l'écran, et une fin qui renvoie à l'action.",
      explain:
        "Trois formats, trois usages.\n\nLa démonstration à l'écran : montrer l'interface, cliquer, résultat. C'est le format le plus efficace pour tout ce qui est outil. Elle se filme facilement et se comprend sans le son.\n\nL'explication face caméra : installer le contexte, raconter, créer la confiance. Elle est réservée aux transitions et aux concepts.\n\nLe montage mixe : face caméra courte, démonstration longue. C'est le format par défaut d'une bonne formation.\n\nStructure d'une vidéo de cinq minutes : 20 secondes d'accroche (le résultat que l'élève aura), 3 minutes de démonstration commentée, 1 minute d'exercice, 30 secondes de transition.\n\nRègles techniques : son clair avant tout, texte à l'écran pour les points clés, sous-titres obligatoires, et une image stable. Le résultat : la qualité perçue se joue sur la clarté, pas sur la production.",
      example:
        "Vidéo « Créer un produit dans Nuvra » : écran d'enregistrement de l'interface, voix commentée, texte à l'écran pour chaque champ, sous-titres français, fin sur « maintenant, à vous : créez le vôtre ».",
      apply:
        "Écrivez le storyboard de votre prochaine vidéo : pour chaque plan, notez ce qui apparaît à l'écran, ce qui est dit, et le texte affiché. Filmer devient alors une exécution, pas une improvisation.",
      nuvra:
        "Chaque leçon de cette Académie possède un espace vidéo : un script complet, un storyboard plan par plan, un chapitrage et une transcription. C'est exactement le niveau de préparation que vous devez produire pour vos propres leçons avant de filmer.",
      exercise: {
        title: 'Planifier une vidéo',
        instructions: 'Écrivez le storyboard d’une vidéo de leçon de 5 minutes.',
        checklist: [
          'Accroche de 20 secondes écrite',
          'Démonstration divisée en étapes',
          'Exercice final annoncé',
          'Textes à l’écran listés',
        ],
        worksheet: [
          { key: 'storyboard', label: 'Storyboard', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'enregistrer-une-video',
      title: 'Enregistrer une vidéo',
      short: 'Tourner sans stress, avec un résultat professional et constant.',
      objectives: [
        'Préparer un enregistrement simple et reproductible',
        'Obtenir un son et une image clairs',
        'Rester cohérent d’une vidéo à l’autre',
      ],
      minutes: 8,
      intro:
        "La régularité compte plus que la perfection. Un élève qui reçoit douze vidéos au même format, même son, même durée, apprend plus vite qu'avec trois vidéos heterogeneous maisplin superbes. L'objectif est la constance.",
      explain:
        "Préparation : une liste de trois à cinq points à couvrir, un plan de capture d'écran, un test d'enregistrement de 30 secondes.\n\nSon : c'est le premier poste de qualité. Un micro à 20 cm de la bouche, une pièce calme, et un volume constant. Le son mauvais est le motif d'abandon le plus fréquent.\n\nImage : écran à 1920×1080, texte lisible, contraste élevé. Sur mobile, la moitié de vos élèves regardent en portrait : vérifiez que les textes restent lisibles.\n\nRythme : parlez vite mais articulez. Les blancs et les hésitations peuvent être coupés à l'édition, c'est normal et attendu.\n\nCohérence : gardez le même format d'introduction, le même ton, la même formule de fin. L'élève doit reconnaître votre vidéo en une seconde.",
      example:
        "Un créateur, utilisant juste un écran d'enregistrement, un micro correct et deux minutes d'introduction fixe donne un résultat plus professionnel qu'une vidéo montée au prix d'un montage lourd — et cela se refait en vingt minutes par leçon.",
      apply:
        "Enregistrez une vidéo test de 60 secondes et regardez-la. Si le son est difficile à comprendre, changez de configuration avant d'enregistrer toute une formation.",
      nuvra:
        "Les vidéos de cette Académie sont stockées avec leur script, leur storyboard et leur transcription. L'administration peut téléverser le fichier réel à tout moment : l'interface ne présente jamais une vidéo comme disponible si elle ne l'est pas.",
      exercise: {
        title: 'Tester son setup',
        instructions: 'Enregistrez 60 secondes, regardez la vidéo, notez les points à améliorer.',
        checklist: [
          'Audio intelligible',
          'Texte lisible',
          'Introduction cohérente',
          'Durée par leçon définie',
        ],
        worksheet: [
          { key: 'setup', label: 'Résultats du test', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'creer-ses-supports',
      title: 'Créer ses supports',
      short: 'Listes de contrôle, modèles et fichiers qui font gagner du temps.',
      objectives: [
        'Identifier les supports utiles pour chaque module',
        'Créer des supports réutilisables et telemchargeables',
        'Rendre les supports actionnables',
      ],
      minutes: 7,
      intro:
        "Un support n'est pas un bonus : c'est l'outil que l'élève utilise pendant l'action. Une liste de contrôle qu'il coche pendant qu'il construit sa page vaut trois leçons d'explication supplémentaires.",
      explain:
        "Trois types de supports, trois usages.\n\nLa liste de contrôle : pour les processus. « Les 12 étapes de la publication d'une page ». Elle se coche, se imprime, se garde.\n\nLe modèle : pour les livrables. Un modèle de page de vente pré-écrit, un canevas d'offre, un gabarit d'email. L'élève ne part pas d'une page blanche, il part d'une base qu'il adapte.\n\nLa fiche de référence : pour la révision. Un récapitulatif des points clés d'un module, à relire avant une évaluation.\n\nRègle de conception : un support doit se comprendre seul, en moins de deux minutes. S'il nécessite une explication, il appartient au contenu de la leçon.",
      example:
        "Module « Offre » : canevas d'offre (une page, 8 champs), liste de contrôle « 10 vérifications avant de publier », fiche de révision « les 5 éléments d'une promesse ».",
      apply:
        "Pour votre prochain module, créez au moins un support réutilisable. Le meilleur premier support est le canevas : il oblige à faire le travail tout en le fournissant.",
      nuvra:
        "Dans Nuvra, chaque leçon peut porter plusieurs ressources (listes de contrôle, modèles, scripts), directement accessibles depuis la page de la leçon. Les ressources sont des liens internes ou des fichiers que vous référencez — jamais de contenu caché dans un composant.",
      exercise: {
        title: 'Créer un support',
        instructions: 'Concevez un canevas ou une liste de contrôle pour un module de votre programme.',
        checklist: [
          'Support lié à un module précis',
          'Utilisable seul en 2 minutes',
          'Format clair (liste ou canevas)',
        ],
        worksheet: [
          { key: 'support', label: 'Votre support', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'creer-des-quiz',
      title: 'Créer des quiz',
      short: 'Vérifier la compréhension, pas noter les élèves.',
      objectives: [
        'Écrire des questions qui vérifient une compétence',
        'Choisir un score de passage pertinent',
        'Offrir une nouvelle tentative utile',
      ],
      minutes: 8,
      intro:
        "Le quiz n'est pas un examen. C'est une boucle de rétroaction : il indique à l'élève ce qu'il sait faire et ce qu'il doit revoir. Un quiz mal écrit (questions pièges, score élevé, aucune explication) est pire qu'aucun quiz.",
      explain:
        "Trois règles pour un quiz utile.\n\nUne question = une compétence vérifiable. « Quel est le rôle d'une page de remerciement ? » teste une compétence. « Combien de modules doit avoir une formation ? » ne teste rien.\n\nLes distracteurs doivent être plausibles. Trois propositions absurques font deviner la bonne réponse par élimination. Utilisez des erreurs réelles que vos élèves ont déjà commises.\n\nLe score de passage doit être atteignable mais pas trivial : 70 à 80 % est un standard solide. En dessous de 60 %, l'élève abandonne ; au-dessus de 90 %, le quiz ne contrôle rien.\n\nChaque question porte une explication. C'est elle qui fait la valeur pédagogique du quiz : l'élève comprend pourquoi il s'est trompé, et cela vaut plus que la note.\n\nLa nouvelle tentative doit être possible, mais chaque tentative doit resterFFICILE à la satisfaction automatique : on ne mémorise pas un quiz en trois essais si les questions changent d'ordre ou si la correction explique.",
      example:
        "Question : « Votre page de vente a 2 000 visites et 10 ventes. Quelle est la première chose à vérifier ? » Réponses : le prix, la promesse et la cohérence avec l'annonce, la vitesse du site, la couleur du bouton. Explication : le taux de 0,5 % indique d'abord un problème de message.",
      apply:
        "Écrivez un quiz de cinq questions sur un module, avec explication pour chacune. Testez-le sur trois personnes qui n'ont pas suivi la formation : si elles comprennent les questions, le quiz est bon.",
      nuvra:
        "Dans Nuvra, un quiz est attaché à une leçon, avec un score de passage configurable et des tentatives enregistrées. Vous pouvez consulter le taux de réussite dans les statistiques de la formation : c'est votre meilleur indicateur de la clarté du contenu.",
      exercise: {
        title: 'Écrire un quiz de module',
        instructions: 'Cinq questions, quatre options, une explication par question.',
        checklist: [
          'Cinq questions écrites',
          'Distracteurs plausibles',
          'Explication pour chaque question',
          'Score de passage fixé',
        ],
        worksheet: [
          { key: 'quiz', label: 'Votre quiz', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'creer-une-experience-etudiante',
      title: 'Créer une expérience étudiante',
      short: 'Progression, navigation et accompagnement qui font rester.',
      objectives: [
        'Améliorer la navigation et la reprise dans un cours',
        'Rendre la progression visible et motivante',
        'Prévoir un chemin de sortie du parcours',
      ],
      minutes: 8,
      intro:
        "La technique fait livrer le contenu ; l'expérience fait terminer le parcours. Les élèves qui terminent une formation sont ceux qui n'ont jamais été perdus, et qui ont su à chaque instant où ils en étaient.",
      explain:
        "Quatre éléments d'une expérience étudiante réussie.\n\nLa progression visible : un pourcentage global, un état par module, une liste de leçons cochées. La progression est le facteur de complétion le plus fiable.\n\nLa reprise automatique : quand l'élève revient, il doit retrouver immédiatement la leçon en cours, pas choisir parmi quarante. C'est exactement ce que fait cette Académie.\n\nLa navigation complète : voir tout le sommaire en un coup d'œil, aller directement à n'importe quelle leçon, sans perdre sa place.\n\nLa sortie de parcours : une formation doit dire ce qui vient ensuite. Sans cela, le parcours se termine dans le vide, et l'élève ne revient pas.\n\nCes éléments ne sont pas des fonctionnalités décoratives : ils se construisent avec les mêmes objets que le contenu (modules, leçons, progression), et ils se mesurent.",
      example:
        "Un élève qui a terminé 40 % du parcours et revient deux semaines plus tard doit voir « Continue where you left off — Module 3, leçon 5, 64 % ». Toute autre expérience est une occasion de partir.",
      apply:
        "Parcourez votre propre formation comme un élève qui revient après deux semaines. Notez chaque moment de doute. Ces moments sont votre feuille de route d'amélioration.",
      nuvra:
        "Dans Nuvra, l'expérience étudiante est native : sommaire par module, progression par leçon, reprise automatique, et certificat à la fin. Un élève qui achète une formation est inscrit automatiquement et apparaît dans votre liste de clients et d'étudiants.",
      exercise: {
        title: 'Audit d’expérience',
        instructions: 'Testez la reprise et la navigation de votre formation, et notez les frictions.',
        checklist: [
          'Reprise automatique testée',
          'Sommaire visible en un écran',
          'Progression affichée clairement',
          'Chemin de sortie défini',
        ],
        worksheet: [
          { key: 'audit', label: 'Frictions observées', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'creer-un-certificat',
      title: 'Créer un certificat',
      short: 'Une preuve de fin de parcours, vérifiable publiquement.',
      objectives: [
        'Comprendre la valeur d’un certificat',
        'Définir les conditions d’obtention',
        'Rendre le certificat vérifiable',
      ],
      minutes: 7,
      intro:
        "Le certificat a trois fonctions : il marque la fin du parcours, il donne à l'élève quelque chose à montrer, et il renforce la valeur perçue de la formation auprès des acheteurs. Il ne remplace pas l'apprentissage, mais il le clôt.",
      explain:
        "Un certificat utile contient cinq éléments.\n\nLe nom de l'élève et la formation suivie.\n\nLa date d'obtention.\n\nUn identifiant unique, qui rend le certificat vérifiable.\n\nUne page de vérification publique accessible par lien.\n\nLe branding de la plateforme.\n\nLes conditions d'obtention doivent être explicites : généralement un parcours complété à 100 % et un quiz validé au-dessus du score requis. Une formation qui délivre un certificat sans condition perd sa valeur.\n\nCôté pratique, la page de vérification doit rester accessible même après la perte d'accès de l'élève : c'est ce qui donne sa valeur à un certificat partagé sur un CV ou un profil professionnel.",
      example:
        "Un certificat affiché sur le profil LinkedIn d'un élève avec un lien de vérification publique est un argument de vente gratuit pour votre prochaine cohorte.",
      apply:
        "Décrivez les conditions exactes d'obtention de votre certificat et écrivez-les dans la description de la formation. Un élève doit savoir ce qu'il faut faire pour l'obtenir.",
      nuvra:
        "Nuvra génère automatiquement un certificat à 100 % du parcours, avec un code unique et une page de vérification publique. Chaque certificat est rattaché à l'inscription de l'élève, ce qui permet de le révoquer ou de le suspendre en cas de remboursement.",
      exercise: {
        title: 'Paramétrer son certificat',
        instructions:
          "Prépare le certificat de ta formation : titre, texte de citation, critères, durée affichée. Un certificat n'atteste pas une présence, il atteste un résultat.",
        checklist: [
          'Titre exact de la formation repris tel quel',
          'Texte de citation qui décrit un résultat, pas une présence',
          'Critères de délivrance explicites',
          'Durée et nombre de modules affichés',
          'Page de vérification publique testée sur un lien sans session',
        ],
        worksheet: [{ key: 'certificat', label: 'Contenu de votre certificat', type: 'textarea' }],
      },
      quiz: {
        title: 'Quiz — Certificat',
        passingScore: 80,
        questions: [
          {
            question: "Que doit contenir un certificat de formation ?",
            options: [
              'Un logo et une note',
              'Nom, formation, date, identifiant unique et lien de vérification',
              'Le contenu complet du programme',
              'Le prix payé',
            ],
            answerIndex: 1,
            explanation:
              "L'identifiant unique et la page de vérification publique sont ce qui donne sa valeur à un certificat.",
          },
          {
            question:
              "Qu'est-ce qui donne sa valeur à un certificat ?",
            options: [
              "Le design du document",
              "L'identifiant unique et la page de vérification publique",
              'Le nombre de participants',
              "Le format PDF",
            ],
            answerIndex: 1,
            explanation:
              "Un document que personne ne peut vérifier ne prouve rien : l'identifiant unique et la page publique transforment le certificat en preuve.",
          },
        ],
      },
    },
    {
      slug: 'definir-le-prix-dune-formation',
      title: 'Définir le prix d’une formation',
      short: 'Un prix cohérent avec la transformation, l’accompagnement et le marché.',
      objectives: [
        'Fixer un prix cohérent avec la valeur produite',
        'Choisir entre paiement unique et accès limité',
        'Présenter le prix sans discours de vente creux',
      ],
      minutes: 8,
      intro:
        "Le prix d'une formation est le signal le plus fort de sa valeur. Un prix bas attire les curieux, pas les clients ; un prix élevé sans preuve demande une confiance que vous devez construire avant.",
      explain:
        "Trois éléments déterminent le prix.\n\nLa transformation : un parcours qui produit une page publiée et testée justifie un prix supérieur à un parcours purement théorique.\n\nL'accompagnement : l'accès à vie n'a pas le même prix qu'un accès de six semaines ; un coaching inclus justifie un palier supérieur.\n\nLe marché : comparez les formations voisines sur le résultat, pas sur la durée.\n\nSur la durée : l'accès à vie est devenu la norme, et il supprime une objection. L'accès limité crée l'urgence mais doit s’appuyer sur une date réelle.\n\nSur la présentation : ne dites jamais « ça ne vaut que 197 € », dites ce que cela comprend et ce que cela remplace. Un prix n'est pas un montant, c'est un échange.",
      example:
        "Formation de 6 modules, sans accompagnement, à 97 €. La même formation avec 2 sessions de questions de groupe, à 297 €. La différence d'accompagnement justifie l'écart sans argumentaire de vente.",
      apply:
        "Fixez votre prix en fonction de la transformation, puis testez la résistance : demandez à cinq prospects pourquoi ils l’achèteraient ou refuseraient ce prix. Les refus vous en disent plus que les acceptations.",
      nuvra:
        "Dans Nuvra, le prix est défini au niveau de la formation (priceCents) et affiché dans la fiche, sur la page de vente et au checkout. Une formation payante crée une commande, une inscription automatique et un accès immédiat à l'espace étudiant.",
      exercise: {
        title: 'Fixer le prix de sa formation',
        instructions: 'Déterminez le prix selon la transformation et l’accompagnement.',
        checklist: [
          'Prix lié à la transformation',
          'Règle d’accompagnement',
          'Durée d’accès choisie',
          'Justification écrite',
        ],
        worksheet: [
          { key: 'prix', label: 'Prix et justification', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'publier-une-formation',
      title: 'Publier une formation',
      short: 'Les vérifications avant de mettre en ligne.',
      objectives: [
        'Vérifier l’intégrité d’une formation avant publication',
        'Choisir le statut de publication',
        'Préparer la page de vente associée',
      ],
      minutes: 7,
      intro:
        "Publier tôt permet d'apprendre, mais publier quelque chose d'incomplet détruit la confiance. La bonne séquence est : publier dès que le module 1 est utilisable, et compléter avant d'annoncer la formation comme terminée.",
      explain:
        "La checklist de publication.\n\nLe module 1 est complet et testé de bout en bout.\n\nLa page de vente existe et pointe vers la formation.\n\nLe prix est défini et le checkout fonctionne.\n\nL'accueil automatique est prêt : inscription, email de bienvenue, accès.\n\nLa page de remerciement existe et lance l'onboarding.\n\nLe statut published n'est pas définitif : vous pouvez dépublier ou corriger à tout moment. En revanche, une formation publiée et vide est pire qu'une formation en brouillon.\n\nEnfin, la page de vente : elle doit expliquer la transformation, montrer le programme, et rendre la décision facile. Une formation excellente sans page de vente ne se vend pas.",
      example:
        "Ordre réaliste : module 1 + module 2 publiés → première cohorte → correction du module 1 → module 3 → etc. Le programme se construit en vendant, pas avant de vendre.",
      apply:
        "Passez la checklist ligne par ligne. Tant qu'un point vital échoue, restez en brouillon : c'est dix minutes de vérification contre des heures de support.",
      nuvra:
        "Dans Nuvra, le statut de la formation (draft, published, archived) contrôle sa visibilité dans la boutique, la marketplace et le checkout. Publier une formation la rend immédiatement vendable, et chaque achat crée automatiquement une inscription pour l'acheteuse.",
      action: {
        action: 'create_course',
        label: 'Créer ma formation dans Nuvra',
        route: '/dashboard/courses?new=1',
        requiredEntity: 'Une formation Nuvra publiée',
        completionCheck: 'course_created',
        hint: 'Crée ta formation, puis publie-la quand elle est prête.',
      },
      exercise: {
        title: 'Checklist de publication',
        instructions: 'Vérifiez chaque point avant de publier.',
        checklist: [
          'Module 1 complet et testé',
          'Page de vente créée',
          'Prix défini',
          'Checkout testé',
          'Accueil automatique prêt',
          'Page de remerciement prête',
        ],
        worksheet: [
          { key: 'checklist', label: 'Checklist de publication', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'vendre-sa-formation',
      title: 'Vendre sa formation',
      short: 'Transformer une formation publiée en ventes mesurables.',
      objectives: [
        'Préparer le lancement d’une formation',
        'Mesurer le tunnel de vente de la formation',
        'Améliorer la conversion à partir des données',
      ],
      minutes: 8,
      intro:
        "Une formation publiée n'est pas une formation vendue. La vente se joue sur trois leviers : le trafic, la page de vente et le suivi. Aucun ne fonctionne seul, et c'est le même pour tout produit digital.",
      explain:
        "Le trafic : une formation se vend d'abord à son audience existante. Annonce, email, post, démonstration. Vendre à 200 personnes bien ciblées apprend plus que vendre à 2 000 personnes que l'on ne connaît pas.\n\nLa page de vente : elle reprend la transformation, montre le programme, présente l/results, traite les objections et affiche le prix. Un ancien élève réel dans la preuve change tout.\n\nLe suivi : la plupart des ventes arrivent après le premier contact, pas au premier clic. Les emails de pré-lancement, de lancement et de suivi font la différence.\n\nLa mesure : visiteurs sur la page de vente, taux de conversion, panier moyen, taux de complétion. Ces quatre chiffres suffisent à piloter une formation.",
      example:
        "Pré-lancement : 3 emails qui annoncent le sujet et demandent un vote d'intérêt. Lancement : 1 email aux inscrits. Mesure sur 30 jours. Les apprenants de la liste convertissent 3 à 5 fois mieux que le trafic froid.",
      apply:
        "Préparez un plan de lancement simple : une liste d'attente, trois emails, une date. Un lancement improvisé se joue mal, alors qu'un lancement préparé se joue même les mauvais jours.",
      nuvra:
        "Dans Nuvra, la liste d'attente est une page avec un formulaire ; les emails sont des campagnes ciblées par tag ; la page de vente est une page liée à la formation ; le checkout et les commandes sont gérés par la plateforme. Tout le parcours est mesurable dans Analytics.",
      action: {
        action: 'create_email_campaign',
        label: 'Créer ma campagne de lancement',
        route: '/dashboard/emails?new=1',
        requiredEntity: 'Une campagne email Nuvra prête à envoyer',
        completionCheck: 'email_campaign_created',
        hint: 'Prépare les emails qui annoncent et lancent ta formation.',
      },
      exercise: {
        title: 'Planifier un lancement',
        instructions: 'Écrivez le plan de lancement : liste, emails, date, indicateurs.',
        checklist: [
          'Liste d’attente préparée',
          'Trois emails écrits',
          'Date de lancement fixée',
          'Indicateurs de suivi définis',
        ],
        worksheet: [
          { key: 'lancement', label: 'Plan de lancement', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'creer-sa-premiere-formation-avec-nuvra',
      title: 'Créer sa première formation avec Nuvra',
      short: 'Construire une formation complète et vendable dans le Course Builder.',
      objectives: [
        'Créer une formation dans Nuvra',
        'Structurer modules et leçons',
        'Activer quiz, ressources et certificat',
        'Publier la formation',
      ],
      minutes: 12,
      example:
        "Marianne crée « Ma première landing page qui convertit » à 97 €. Module 1 : comprendre la promesse. Module 2 : écrire sa promesse. Module 3 : construire la page dans Nuvra. Module 4 : publier et tester. Elle ajoute un quiz de 5 questions (80 % requis) sur la leçon 3, active le certificat, publie, puis envoie un email à ses 140 contacts. Douze ventes la première semaine.",
      intro:
        "C'est le lab du module. Toutes les leçons précédentes deviennent une formation réelle : une structure, des leçons, des ressources, un quiz, un certificat et un prix. Rien de théorique — une formation que vous pouvez vendre dès la fin de ce lab.",
      explain:
        "Le travail se fait en cinq temps.\n\nCréer la formation : titre, description, catégorie, niveau, prix, couverture. La description contient la transformation : c'est elle qui déclenche l'achat.\n\nStructurer : ajoutez des modules ordonnés, puis des leçons dans chaque module. Donnez à chaque leçon un titre qui décrit son résultat.\n\nContenu : ajoutez le texte de la première leçon. Écrivez-le avec la structure comprendre / faire / vérifier.\n\nQuiz et certificat : attachez un quiz à une leçon avec un score de passage, et activez le certificat pour l'inscription.\n\nPublier : passez la formation en published quand le module 1 est utilisable.\n\nUn élève qui achète cette formation est inscrit automatiquement, apparaît dans votre liste d'étudiants et reçoit ses accès. Le circuit est complet.",
      apply:
        "Construisez une vraie formation sur un sujet que vous maîtrisez. La qualité compte plus que l'ampleur : six leçons excellentes valent mieux que trente dissolution.",
      nuvra:
        "Le Course Builder de Nuvra gère tout : structure, leçons, vidéos, ressources, quiz, progression et certificat. Le bouton ci-dessous ouvre le vrai constructeur de formations. Une fois publiée, votre formation devient vendable depuis n'importe quelle page ou tunnel.",
      action: {
        action: 'create_course',
        label: 'Créer ma première formation',
        route: '/dashboard/courses?new=1',
        requiredEntity: 'Une formation Nuvra publiée',
        completionCheck: 'course_created',
        hint: 'Ouvre le Course Builder de Nuvra et construis ta formation.',
      },
      exercise: {
        title: 'Construire sa formation',
        instructions:
          'Créez une formation complète dans Nuvra, avec modules, leçons, quiz et certificat.',
        checklist: [
          'Formation créée avec titre et description',
          'Prix et niveau définis',
          'Au moins deux modules créés',
          'Première leçon rédigée',
          'Quiz créé avec score de passage',
          'Certificat activé',
          'Formation publiée',
        ],
        worksheet: [
          { key: 'formation', label: 'Formation créée', type: 'text' },
          { key: 'modules', label: 'Modules créés', type: 'textarea' },
        ],
      },
      resources: [
        {
          title: 'Modèle de programme de formation',
          kind: 'TEMPLATE',
          description: 'Structure type en 6 modules avec le résultat attendu pour chacun.',
        },
        {
          title: 'Grille de relecture de leçon',
          kind: 'CHECKLIST',
          description: 'Les 12 points de contrôle avant de publier une leçon.',
        },
      ],
      video: {
        narration:
          "Tu construis maintenant une vraie formation dans Nuvra : structure, leçons, quiz, certificat, prix, publication. C'est exactement ce que tu vendras ensuite. Le module suivant s'occupe de faire venir les gens jusqu'à cette page.",
      },
    },
  ],
};
