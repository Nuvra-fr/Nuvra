import type { AcademyModuleInput } from './types';

/** Module 5 — Acquisition. */
export const MODULE_5: AcademyModuleInput = {
  slug: 'acquisition',
  title: 'Acquisition',
  description:
    "Acquérir, ce n'est pas « promotionner » au hasard. C'est construire un flux régulier de personnes qualifiées vers une offre, avec un coût par lead connu et une mesure honnête de ce qui fonctionne.",
  objectives: [
    'Comprendre les canaux d’acquisition et leurs coûts réels',
    'Construire une audience et une présence identifiables',
    'Créer du contenu qui attire l’audience cible',
    'Écrire des accroches et des récits qui retiennent',
    'Transformer une audience en leadsidentified',
    'Comprendre les principes de l’email marketing et du SEO',
    'Développer partenariats et affiliations',
    'Construire son système d’acquisition dans Nuvra',
  ],
  deliverable:
    'Un système d’acquisition actif dans Nuvra : une page, un formulaire, un aimant à prospects, une liste, une campagne email et une séquence automatique.',
  lab: {
    title: 'Lab — Construire son système d’acquisition',
    goal:
      'Relier contenu, capture, liste et séquence email dans un système qui tourne sans votre intervention.',
    steps: [
      'Créer une page avec un aimant à prospects et un formulaire',
      'Vérifier que les contacts arrivent dans le CRM avec leur source',
      'Écrire une séquence de bienvenue de 4 emails',
      'Activer l’automaton lead.created qui déclenche la séquence',
    ],
    action: {
      action: 'create_automation',
      label: 'Créer mon premier moteur d’acquisition',
      route: '/dashboard/automations?new=1',
      requiredEntity: 'Une automatisation Nuvra active',
      completionCheck: 'automation_created',
      hint: 'Déclencheur lead.created → email de bienvenue + tag.',
    },
  },
  video: {
    title: 'Module 5 — Construire son moteur d’acquisition',
    description:
      'Comment transformer une audience en leads, puis en clientes, avec un système mesurable dans Nuvra.',
    durationSec: 640,
    script: `00:00 — Accroche
Acquérir, c'est un mot flou. Concrètement, c'est faire arriver regularly des personnes qui ont le même problème que vos clientes, devant une page qui sait leur convaincre. Ce module construit ce moteur : contenu, capture, liste, séquence, et mesure.

01:00 — Les canaux et leurs coûts
Trois familles. L'organique : contenu et référencement, lent mais cumulatif, coût quasi nul en média. La communauté : recommandation, partenariats, affiliation, coût en relation. La publicité : rapide, payante, et exige un CAC connu. La règle est simple : on ne double pas les budgets tant qu'un canal organique n'a pas été tenu trois mois.

02:30 — Construire une audience
Une audience n'est pas un nombre d'abonnés, c'est un groupe qui reconnaît votre point de vue. Le point de vue se construit en répétant le même message sur le même sujet, pendant des mois. La régularité bat la variété.

04:00 — Le contenu qui attire
Le contenu utile attire, le contenu divertissant occupe, le contenu précis transforme. Trois formats qui fonctionnent : le cas pratique, la démonstration, la comparaison. Chacun répond à une question réelle de l'audience.

05:20 — Hooks et narration
Un contenu ne se découvre pas au milieu. L'accroche se joue sur la première ligne : une tension, une contradiction, un chiffre. La narration donne le contexte : pourquoi vous, pourquoi maintenant. Le CTA dit ce qu'il faut faire maintenant, sans détour.

06:40 — De l'audience aux leads
Un contenu qui attire sans capturer est du trafic décoratif. L'aimant à prospects est le passage : un contenu utile contre une adresse. Le formulaire crée le contact, le tag crée la segmentation, et la séquence transforme l'intérêt en conversation.

08:10 — Email et SEO
L'email est le canal que vous possédez : pas d'algorithme, pas de location. Le SEO apporte un trafic lent et durable sur des intentions précises. Les deux se combinent : le SEO nourrit la liste, la liste nourrit la vente.

09:30 — Partenariats et affiliation
Le partenariat immédiat avec une liste de 1 000 personnes qualifiées vaut mieux que 10 000 personnes non ciblées. L'affiliation transforme des recommandateurs en accessibles directement. Les deux se pilotent avec des codes et des commissions, comme dans Nuvra.

10:50 — Mesurer
Le coût par lead, le taux de conversion lead → client, la valeur du lead. Ces trois chiffres disent si votre acquisition est une dépense ou un investissement. Le module 8 les approfondira.`,
    chapters: [
      { title: 'Canaux et coûts réels', time: 0 },
      { title: 'Construire une audience', time: 90 },
      { title: 'Contenu, hooks, narration', time: 240 },
      { title: 'Transformer l’audience en leads', time: 400 },
      { title: 'Email, SEO, partenariats', time: 490 },
      { title: 'Mesurer l’acquisition', time: 580 },
    ],
    transcript:
      "Acquérir, c'est faire arriver régulièrement des personnes qui ont le même problème que vos clientes, devant une page qui sait les convaincre. Trois familles de canaux : l'organique, la communauté et la publicité. On ne double pas les budgets avant d'avoir tenu un canal organique trois mois. Une audience est un groupe qui reconnaît votre point de vue. Le contenu qui attire est précis : cas pratique, démonstration, comparaison. L'accroche se joue sur la première ligne, la narration donne le contexte, l'appel à l'action dit quoi faire maintenant. L'aimant à prospects transforme l'attention en adresse, le formulaire crée le contact, le tag segmentation, la séquence transforme l'intérêt en conversation. L'email est le canal que vous possédez, le SEO apporte un trafic durable. Mesurez le coût par lead et le taux de conversion en client.",
    storyboard: [
      {
        time: '00:00',
        visual: 'Flux de personnes qui entre par la gauche et ressort contacts à droite.',
        narration: 'Acquérir, c’est un flux régulier de personnes qualifiées.',
        onScreenText: 'Acquisition',
      },
      {
        time: '01:00',
        visual: 'Trois colonnes : organique, communauté, publicité, avec leur coût.',
        narration: 'On ne double pas les budgets avant d’avoir tenu l’organique.',
        onScreenText: '3 familles de canaux',
      },
      {
        time: '02:30',
        visual: 'Un même message répété sur plusieurs publications, dans le temps.',
        narration: 'La régularité bat la variété.',
        onScreenText: 'Construire une audience',
      },
      {
        time: '04:00',
        visual: 'Trois formats de contenu : cas pratique, démonstration, comparaison.',
        narration: 'Le contenu précis transforme, le contenu vague occupe.',
        onScreenText: '3 formats qui fonctionnent',
      },
      {
        time: '05:20',
        visual: 'Première ligne d’un post agrandie, puis le corps, puis le CTA.',
        narration: 'Accroche, narration, appel à l’action.',
        onScreenText: 'Hook · Story · CTA',
      },
      {
        time: '06:40',
        visual: 'Formulaire → contact CRM → tag → séquence de 4 emails.',
        narration: 'L’aimant à prospects est le passage vers la liste.',
        onScreenText: 'Audience → Leads',
      },
      {
        time: '08:10',
        visual: 'Boîte email avec envoi automatique, et moteur de recherche avec.position.',
        narration: 'L’email est le canal que vous possédez.',
        onScreenText: 'Email + SEO',
      },
    ],
  },
  lessons: [
    {
      slug: 'comprendre-lacquisition',
      title: "Comprendre l'acquisition",
      short: 'Les canaux, leur coût réel et la logique de mesure.',
      objectives: [
        'Distinguer acquisition organique, communautaire et payante',
        'Calculer un coût par lead',
        'Choisir un premier canal tenable',
      ],
      minutes: 8,
      intro:
        "Acquérir, c'est faire arriver régulièrement des personnes qui ont le problème que votre offre résout. La difficulté n'est pas d'obtenir du trafic : c'est d'obtenir le bon trafic, à un coût que l'on connaît.",
      explain:
        "Trois familles.\n\nL'organique : contenu, référencement, bouche-à-oreille. Lent, cumulatif, coût média nul. C'est le seul canal qui continue de produire après l'arrêt de l'effort.\n\nLa communauté : partenariats, recommandation, affiliation. Coût en relation, très fort taux de conversion, volume limité par la taille des cercles.\n\nLa publicité : rapide, payante, exige un coût par lead connu et un suivi rigoureuse. Elle amplifie une offre qui convertit, elle ne la répare pas.\n\nLa mesure minimale est le coût par lead : dépense marketing divisée par nombre de contacts créés. Tant que ce chiffre n'est pas connu, aucune décision d'investissement n'est rationnelle.\n\nLe premier canal doit être celui que vous tiendrez dans six mois, pas celui qui rapporte le plus la première semaine.",
      example:
        "Un créateur dépense 300 € de publicité sur une offre qui convertit à 1 % : 100 leads, 1 vente, coût par lead 3 €, coût par vente 300 €. La même offre, vendue à une liste de 2 000 personnes avec 6 % de conversion, rapporte 120 ventes pour 4 heures de travail.",
      apply:
        "Choisissez un canal et engagements écrit : deux publications par semaine pendant trois mois, par exemple. Notez chaque semaine le nombre de contacts obtenus. À la fin du mois, calculez votre coût par lead — même s'il est nul, il doit être mesuré.",
      nuvra:
        "Dans Nuvra, chaque page et chaque formulaire enregistre une source. Vos contacts dans le CRM portent la source de leur inscription, ce qui vous donne le coût par lead par canal sans tableur. Le tableau de bord Analytics regroupe ces contacts par page et par source.",
      exercise: {
        title: "Cartographier ses canaux d'acquisition",
        instructions:
          'Écris les canaux que tu peux réellement tenir dans six semaines, avec le coût horaire réel de chacun. Élimine tout ce que tu ne peux pas mesurer.',
        checklist: [
          'Trois canaux prioritaires écrits',
          'Coût horaire estimé pour chacun',
          'Indicateur de mesure défini par canal',
          'Rôle du contenu : un canal mesurable, pas une distraction',
        ],
        worksheet: [{ key: 'canaux', label: "Vos canaux d'acquisition", type: 'textarea' }],
      },
      quiz: {
        title: 'Quiz — Acquisition',
        passingScore: 80,
        questions: [
          {
            question:
              "Quel indicateur décide vraiment si un canal d'acquisition est rentable ?",
            options: [
              'Le nombre de vues',
              'Le nombre de likes',
              'Le coût pour une cliente, comparé à sa valeur',
              'Le nombre de publications',
            ],
            answerIndex: 2,
            explanation:
              "Une vue gratuite n'est pas une revenue. Seul le coût par cliente comparé à sa valeur permet de décider où mettre l'argent.",
          },
          {
            question: "Le coût par lead se calcule ainsi :",
            options: [
              'Dépense marketing ÷ contacts créés',
              'Ventes ÷ dépenses',
              'Contacts ÷ ventes',
              'Prix ÷ contacts',
            ],
            answerIndex: 0,
            explanation:
              "Le coût par lead mesure l'effort dépensé pour obtenir une adresse, indépendamment de la vente.",
          },
          {
            question:
              "Quel indicateur décide de la rentabilité d'un canal ?",
            options: [
              "Le nombre de vues",
              "Le coût pour une cliente, comparé à sa valeur",
              "Le nombre de likes",
              "La fréquence de publication",
            ],
            answerIndex: 1,
            explanation:
              "Une vue gratuite n'est pas une revenue : seul le coût par cliente comparé à sa valeur permet de décider où va le prochain euro.",
          },
        ],
      },
    },
    {
      slug: 'contenu-organique',
      title: 'Contenu organique',
      short: 'Publier assez pour que l algorithme et les humains comprennent votre sujet.',
      objectives: [
        'Publier régulièrement sur un nombre limité de canaux',
        'Adapter le format au canal',
        'Mesurer la progression d’un contenu',
      ],
      minutes: 8,
      intro:
        "Le contenu organique est le seul canal qui produit des résultats cumulatifs : chaque publication reste en ligne, et une publication peut générer des contacts pendant des mois. Il demande de la régularité, pas de la sporadicité.",
      explain:
        "Trois règles.\n\nChoisir peu de canaux : deux canaux tenus valent mieux que six canaux abandonnés. Un canal principal pour la profondeur, un canal secondaire pour la recycle.\n\nPublier selon un rythme tenable : deux fois par semaine pendant six mois vaut mieux que dix publications la première semaine puis plus rien.\n\nRecycler : un contenu long donne cinq publications courtes, un cas client donne trois accroches, une démonstration vidéo donne un fil de discussion.\n\nSur la mesure : ne comptez pas les vues seules. Un contenu qui génère 3 leads de qualité vaut mieux qu'un contenu à 20 000 vues et zéro contact. Le bon indicateur est le contact, pas l'impression.",
      example:
        "Un expert publie chaque mardi un cas client de 600 mots et chaque vendredi une démonstration de 3 minutes. Après six mois, 48 publications. 6 d'entre elles génèrent 80 % de ses leads. C'est normal : une minorité de contenus porte la majorité du résultat.",
      apply:
        "Écrivez votre calendrier de contenu pour quatre semaines : deux formats, un rythme, trois sujets par semaine. Tenez-le trois mois avant d'ajouter un nouveau canal.",
      nuvra:
        "Le contenu est le amont de Nuvra : chaque contenu publié avec un lien vers ta page devient une source de contacts. Ajoute un tag de source différent par canal, et tu sauras lequel produit des leads vendables dans ton CRM.",
      exercise: {
        title: 'Planifier un mois de contenu',
        instructions: 'Écris ton calendrier : rythme, formats, sujets, appel à l’action.',
        checklist: [
          'Rythme de publication défini',
          'Deux formats seulement',
          'Sujets listés pour quatre semaines',
          'Appel à l’action relié à une page',
        ],
        worksheet: [
          { key: 'calendrier', label: 'Calendrier de contenu', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'personal-branding',
      title: 'Personal branding',
      short: 'Être identifiable sur un point de vue, pas sur un métier.',
      objectives: [
        'Formuler un point de vue clair et défendable',
        'Associer un visage et un message',
        'Transformer son point de vue en actif durable',
      ],
      minutes: 8,
      intro:
        "Une marque personnelle n'est pas une mise en scène. C'est une position : une opinion que l'on tient, fondée sur des résultats, et que l'on répète assez longtemps pour être reconnue.",
      explain:
        "Trois éléments.\n\nLe point de vue : ce que vous pensez que les autres croient faux. « Les freelances n'ont pas un problème de visibilité, ils ont un problème de preuves » est un point de vue. « Je vous aide à grow » n'en est pas un.\n\nLa preuve : ce qui vous autorise à le tenir. Un chiffre, un cas, une expérience. Sans preuve, un point de vue est une opinion.\n\nLa constance : le message répété. Une audience ne se construit pas en changeant de sujet tous les mois, mais en recommençant le même message sous des formes différentes.\n\nUn point de vue n'a pas besoin d'être|Original. Il a besoin d'être précis et tenu. La clarté bat l'originalité.",
      example:
        "« J'aide les artisans à vendre en ligne » : un service. « Les artisans perdent plus de ventes par manque de preuves qu par manque de trafic, et ça se corrige en une page » : un point de vue, avec une hypothèse testable.",
      apply:
        "Écrivez votre point de vue en une phrase, puis accumulation trois contenus qui le défendent. Si les trois peuvent être publiés sans contradiction, votre position est claire.",
      nuvra:
        "Votre profil public Nuvra (votre Nuvra Link) est le point de convergence : biographie, liens, contenu mis en avant. Il est indexé et partageable, et il sert de destination à tous vos contenus.",
      exercise: {
        title: 'Formuler son point de vue',
        instructions: 'Écris le point de vue, sa preuve et trois contenus qui le défendent.',
        checklist: [
          'Point de vue en une phrase',
          'Preuve associée',
          'Trois contenus planifiés',
        ],
        worksheet: [
          { key: 'pointdevue', label: 'Votre point de vue', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'reseaux-sociaux',
      title: 'Réseaux sociaux',
      short: 'Choisir une ou deux plateformes et y publier régulièrement.',
      objectives: [
        'Choisir une plateforme principale',
        'Adapter le message au format',
        'Installer une routine de publication',
      ],
      minutes: 7,
      intro:
        "Les réseaux sociaux sont des canaux de découverte, pas des bases de données. Ils permettent d'atteindre des inconnus ; ils ne permettent pas de les garder sans les’inviter à quelque chose.",
      explain:
        "Choisissez selon votre capacité et votre audience, pas selon la tendance du moment. Le bon canal est celui où se trouvent déjà vos clients.\n\nDeux règles de constance.\n\nLe format avant le canal : vidéo courte, texte long, carousel, démonstration. Un contenu fort dans un mauvais format ne performe pas.\n\nLa routine : un créneau fixe dans la semaine, un nombre limité de publications. La régularité crée une attente.\n\nEnfin, la règle de conversion : chaque contenu doit mener quelque part. Une publication sans lien vers une page, une liste ou un produit transforme de l'attention en rien.",
      example:
        "Un consultant publie trois fois par semaine : une démonstration de 90 secondes, un cas écrit, une réponse à une question posée par un prospect. Chacune se termine par la même invitation : la checklist gratuite.",
      apply:
        "Choisissez un seul réseau principal pour les prochains quatre-vingt-dix jours. Mesurez les contacts générés, pas les interactions.",
      nuvra:
        "Chaque publication peut pointer vers une page Nuvra avec un formulaire. Créez une page par offre plutôt qu'une page par publication, et associez un tag de source par réseau : vous saurez quel réseau produit des leads payants.",
      exercise: {
        title: 'Choisir son canal principal',
        instructions: 'Décrivez le canal choisi, le format et le rythme.',
        checklist: [
          'Canal principal choisi et justifié',
          'Format de contenu défini',
          'Rythme hebdomadaire fixé',
          'Destination de conversion choisie',
        ],
        worksheet: [
          { key: 'canal', label: 'Canal principal', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'construire-une-audience',
      title: 'Construire une audience',
      short: 'Passer d’un compte vide à une communauté identifiable.',
      objectives: [
        'Définir le nombre d’abonnés utile',
        'Installer un rituel de publication',
        'Transformer une audience en communauté',
      ],
      minutes: 7,
      intro:
        "Une audience n'est pas un compteur. C'est un groupe de personnes qui te reconnaissent, qui attendent tes publications, et qui se parlent entre elles. Un millier de personnes ciblées valent mieux que cent mille indifférentes.",
      explain:
        "La croissance réelle se mesure en qualité de relation, pas en nombre. Trois indicateurs honnêtes : le taux d'engagement stable sur tes meilleurs contenus, le nombre de personnes qui reviennent, et le nombre de leads générés par mois.\n\nLe passage à l'action communautés : quand les gens commentent et échangent sous tes publications, une audience est née. À ce moment, une liste de contacts devient un actif : les réseaux te peuvent retirer l'accès à tout moment, une liste t'appartient.\n\nEnfin, la règle du temps : une audience utile se construit en mois, pas en semaines. Les résultats qui apparaissent en trois jours sont presque toujours achetés.",
      example:
        "800 abonnés très engagés qui Purchase 5 % produisent 40 clients par an. 20 000 abonnés sans interaction n'en produisent que 3 : l'audience utile est la première, pas la seconde.",
      apply:
        "Fixez un objectif d'audience réaliste sur six mois, décomptez votre progression chaque semaine, et évaluez sur la qualité des interactions autant que sur le nombre.",
      nuvra:
        "Une page de capture est le pont entre votre audience publique et votre liste privée. Publiez votre page dans votre profil, vos publications et vos emails : chaque point de contact devient une source mesurable.",
      action: {
        action: 'create_page',
        label: 'Créer ma page de capture',
        route: '/dashboard/pages?new=1',
        requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
        completionCheck: 'page_created',
        hint: 'Une page = un aimant à prospects = une adresse.',
      },
      exercise: {
        title: 'Objectif d’audience',
        instructions: 'Fixe ton objectif à six mois et ton rituel de publication.',
        checklist: [
          'Objectif d’audience fixé',
          'Rythme de publication défini',
          'Page de capture créée',
          'Indicateur de qualité choisi',
        ],
        worksheet: [
          { key: 'objectif', label: 'Objectif d’audience', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'creer-du-contenu',
      title: 'Créer du contenu',
      short: 'Trois formats qui transforment, et comment les produire vite.',
      objectives: [
        'Choisir un format de contenu productif',
        'Produire du contenu avec une méthode',
        'Réutiliser un contenu sous plusieurs formes',
      ],
      minutes: 8,
      intro:
        "Le contenu se crée plus vite qu'on ne le croit, à condition d'avoir un format de référence. Un format répété devient une production, là où un format inventé à chaque fois devient un blocage.",
      explain:
        "Trois formats.\n\nLe cas pratique : une situation réelle, ce qui a été fait, le résultat chiffré. C'est le format qui convertit le mieux et qui se recycle le plus.\n\nLa démonstration : montrer l'outil en action, écran à l'écran, 60 à 120 secondes. Elle prouve que ça marche et supprime la peur de la technique.\n\nLa comparaison : « avant / après », « méthode A / méthode B ». Elle donne une raison de choisir.\n\nLa production :’écrivez une fois en long, puis découpez. Un cas de 1 200 mots devient une publication, un carousel de 6 écrans, une vidéo de 2 minutes et trois emails.\n\nLe rôle de l'IA, s'il est disponible, se situe à ce niveau : structurer, reformuler, proposer des variantes. La preuve et l'exemple restent votre travail, et c'est ce que l'audience remarque.",
      example:
        "Un cas « avant : 46 propositions, 3 clients ; après : page publiée + 5 emails, 11 clients en 30 jours » devient : une publication longue, un carousel de 6 écrans, une vidéo de 90 secondes, et deux emails de la séquence.",
      apply:
        "Choisissez un seul format cette semaine et produisez-en trois. Notez le temps réel de production : c'est votre vrai coût, pas celui que vous imaginiez.",
      nuvra:
        "Chaque contenu publié pointe vers une page Nuvra. En créant un tag de source par type de contenu, vous saurez lequel génère des leads — et donc lequel merits d'être produit en plus.",
      exercise: {
        title: 'Recycler un contenu',
        instructions: 'Prends un contenu existant et produis-en cinq déclinaisons.',
        checklist: [
          'Un contenu long écrit',
          'Cinq déclinaisons listées',
          'Un appel à l’action relié à une page',
        ],
        worksheet: [
          { key: 'recycle', label: 'Déclinaisons', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'hooks',
      title: 'Hooks',
      short: 'L’accroche décide si le contenu sera lu.',
      objectives: [
        'Écrire une accroche efficace',
        'Éviter les accroches creuses',
        'Tester plusieurs accroches sur un même contenu',
      ],
      minutes: 7,
      intro:
        "L'accroche est la première ligne, le titre, la première phrase d'une vidéo. Elle décide du taux de lecture. Une accroche faible ne gâche pas tout à fait lidea, elle garantit juste que personne n'ira plus loin.",
      explain:
        "Cinq structures qui fonctionnent.\n\nLe paradoxe : « La plupart des freelances ne perdent pas des ventes, ils perdent des preuves. »\n\nLe chiffre contre-intuitif : « 43 % de vos emails sont lus et jetés sans clic. »\n\nLa tension d'incompréhension : « Pourquoi une page qui convertit à 0,4 % peut devenir votre meilleure page ? »\n\nLa confession : « J'ai perdu 4 000 € avant de comprendre que mon problème n'était pas le prix. »\n\nLa question directe : « Et si vos clients n'achetaient pas parce que vous leur demandez trop tôt ? »\n\nCe qui n fonctionne pas : les accroches génériques (« 5 astuces pour… »), les promesses sans preuve (« la méthode révolutionnaire »), et les questions rhétoriques creuses.",
      example:
        "Version faible : « 5 conseils pour mieux vendre en ligne ». Version forte : « Vos clients ne fuient pas votre page de vente : ils fuient votre promesse. Voici comment le vérifier en 5 minutes. »",
      apply:
        "Écrivez trois accroches différentes pour un même contenu et publiez-les à trois moments différents. Le taux de lecture vous dira laquelle fonctionne, et vous pourrez la réutiliser.",
      nuvra:
        "Dans Nuvra, le bloc hero d'une page fait le même travail : titre et sous-titre. Testez-les comme vous testez une accroche de publication : une variante à la fois, un indicateur à la fois.",
      exercise: {
        title: 'Écrire trois accroches',
        instructions: 'Trois accroches pour un même sujet, avec trois structures différentes.',
        checklist: [
          'Accroche paradoxe',
          'Accroche chiffre',
          'Accroche question ou confession',
        ],
        worksheet: [
          { key: 'accroches', label: 'Vos accroches', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'storytelling',
      title: 'Storytelling',
      short: 'Faire adhérer grâce à une histoire courte et honnête.',
      objectives: [
        'Structurer une histoire en quatre temps',
        'Utiliser le récit dans les pages et les emails',
        'Éviter le récit qui retarde la valeur',
      ],
      minutes: 7,
      intro:
        "Une histoire n'est pas une décoration : c'est le format le plus rapide pour transmettre une expérience. Utilisée au bon endroit, elle remplace dix lignes d'explication.",
      explain:
        "La structure classique tient en quatre temps.\n\nLa situation : qui, où, quel contexte.\n\nLa tension : ce qui ne va pas, ce qui a failli échouer.\n\nLe basculement : ce qui a changé, l'idée ou l'action qui a tout changé.\n\nL'enseignement : ce que le lecteur peut appliquer.\n\nLa règle du temps : l'histoire occupe la première moitié du contenu, l'enseignement la seconde. Un récit de trois paragraphes suivi d'un conseil concret vaut mieux qu'un récit de dix paragraphes.\n\nDans une page de vente, l'histoire répond à une question que personne ne formule à voix haute : « est-ce que quelqu'un comme moi a réussi ? »",
      example:
        "« J'ai publié ma page et pendant deux semaines, rien. J'ai alors remplacé ma promesse — trop vague — par une promesse datée. Trois jours plus tard, ma première demande. Ce que j'ai changé : la fin de l'attente et la formulation de l'accroche. »",
      apply:
        "Écrivez l'histoire la plus courte qui prouve que vous avez fait ce que vous recommandez. Supprimez tout ce qui n'amène pas au basculement.",
      nuvra:
        "Les blocs de page Nuvra permettent d'insérer ce récit : un bloc texte après le titre, ou une section « pourquoi » avant les preuves. Testez sa présence : c'est une variable de page comme une autre.",
      exercise: {
        title: 'Écrire une histoire',
        instructions: 'Écris une histoire en quatre temps liée à ton offre.',
        checklist: [
          'Situation posée',
          'Tension réelle',
          'Basculement identifié',
          'Enseignement applicable',
        ],
        worksheet: [
          { key: 'histoire', label: 'Votre histoire', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'cta',
      title: 'CTA',
      short: 'Un appel à l’action unique, clair, répété.',
      objectives: [
        'Écrire un appel à l’action efficace',
        'Placer les CTA aux bons endroits',
        'Éviter les appels à l’action multiples',
      ],
      minutes: 6,
      intro:
        "L'appel à l'action est le seul élément qui transforme un contenu en action. Sa faiblesse est la cause la plus fréquente des pages qui « collects bien les vues » et ne vendent rien.",
      explain:
        "Quatre caractéristiques d'un CTA efficace.\n\nUn verbe et un bénéfice : « Recevoir la checklist » plutôt que « Soumettre ».\n\nUn objet clair : ce qui arrive après le clic.\n\nUne réduction de risque à proximité : ce qu'il va se passer, combien de temps, si c'est gratuit.\n\nLa répétition identique : le même libellé à chaque occurrence.\n\nOù le placer : après la promesse, après la preuve, à la fin, et après chaque section qui répond à une objection. Pas une fois en haut et jamais plus.\n\nSur la couleur et la taille : un CTA doit être le seul élément fortement contrasté de la section. S'il y a trois boutons, il n'y en a aucun.",
      example:
        "Faible : « En savoir plus ». Fort : « Recevoir gratuitement la checklist des 12 étapes » — placé sous la promesse, sous la preuve, et en fin de page, avec la même formulation.",
      apply:
        "Écrivez trois CTA pour votre offre et testez-les sur une page. Un seul sera conservé : celui qui reçoit le plus de clics, pas celui qui vous plaît le plus.",
      nuvra:
        "Les blocs cta et hero de Nuvra portent vos libellés. Utilisez des liens relatifs vers vos pages et le bloc checkout pour l'achat : le parcours reste dans votre univers et chaque étape est mesurée.",
      exercise: {
        title: 'Écrire ses CTA',
        instructions: 'Trois CTA pour la même action, avec bénéfice explicite.',
        checklist: [
          'Verbe d’action clair',
          'Bénéfice dans le libellé',
          'Réassurance à proximité',
          'Une seule action par page',
        ],
        worksheet: [
          { key: 'cta', label: 'Vos CTA', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'email-marketing',
      title: 'Email marketing',
      short: 'Le canal que vous possédez : règles, structure et fréquence.',
      objectives: [
        'Structurer un email qui obtient des réponses',
        'Choisir la fréquence d’envoi',
        'Mesurer l’engagement d’une liste',
      ],
      minutes: 8,
      intro:
        "L'email est le seul canal où l'audience ne peut pas vous être retirée par un changement d'algorithme. C'est aussi le canal qui convertit le mieux, à condition de respecter la liste : ce à quoi les gens se sont inscrits.",
      explain:
        "Un email qui fonctionne a cinq parties.\n\nL'objet : il décrit la valeur ou crée une curiosité honnête. « La phrase que j'ai mis 3 semaines à trouver ».\n\nL'ouverture : la première phrase doit continuer l'objet, sinon la personne ferme.\n\nLe corps : un seul message, court, avec une idée principale.\n\nLa structure : une idée par paragraphe, des lignes courtes, une liste plutôt qu'un mur de texte.\n\nL'appel à l'action : un seul, clair, répété si le format le justifie.\n\nSur la fréquence : deux à quatre emails par mois pour une liste active ; un email par semaine si le contenu le justifie. Au-delà, les désabonnements progressent plus vite que les ouvertures.\n\nSur la mesure : le taux d'ouverture seul ne dit rien. Regardez les clics, les réponses, et surtout les ventes — c'est le seul signal qui compte.",
      example:
        "Email de vente : objet décrivant un résultat précis, ouverture qui confirme l'objet, trois arguments courts, une preuve, un CTA, une signature. 150 à 250 mots suffisent pour la plupart des emails qui vendent.",
      apply:
        "Écrivez votre prochain email en 200 mots maximum. S'il dépasse, coupez : chaque mot supplémentaire réduit la lecture complète.",
      nuvra:
        "Les campagnes Nuvra sont ciblées par segment (leads, clients, étudiants, tag) et mesurées : envois, ouvertures, clics. Une séquence peut enchaîner plusieurs messages avec des délais définis, et se déclencher automatiquement à l'inscription d'un contact.",
      action: {
        action: 'create_email_campaign',
        label: 'Créer ma première campagne',
        route: '/dashboard/emails?new=1',
        requiredEntity: 'Une campagne email Nuvra prête à envoyer',
        completionCheck: 'email_campaign_created',
        hint: 'Écris et programme ton premier email à ta liste.',
      },
      exercise: {
        title: 'Écrire un email',
        instructions: 'Rédige un email de 200 mots maximum, avec objet, corps et CTA.',
        checklist: [
          'Objet qui décrit la valeur',
          'Ouverture qui continue l’objet',
          'Une seule idée',
          'Un seul appel à l’action',
        ],
        worksheet: [
          { key: 'email', label: 'Votre email', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'seo',
      title: 'SEO',
      short: 'Être trouvé sur des intentions précises.',
      objectives: [
        'Identifier une intention de recherche',
        'Écrire un contenu qui y répond',
        'Comprendre les limites du SEO',
      ],
      minutes: 7,
      intro:
        "Le référencement n'est pas un hack : c'est la production d'un contenu qui répond précisément à une question réellement posée. Il est lent, durable, et il ne dépend d'aucun intermédiaire.",
      explain:
        "L'unité de travail est l'intention de recherche : ce que la personne tape et ce qu'elle cherche en le tapant. Un contenu qui répond mal à l'intention est ignoré, même s'il est excellent.\n\nTrois intentions : navigational (chercher une marque), informationnelle (comprendre), commerciale (acheter ou comparer). Un bon contenu commercial répond à une question d'information en la résolvant entièrement, puis propose la solution.\n\nLa structure : un titre qui contient l'intention, une réponse directe dans les premières lignes, des sections avec des intertitres, une conclusion actionnable.\n\nLes limites : le SEO demande du temps (trois à six mois pour un contenu), de la constance, et ne fonctionne pas pour une offre ultra-niche sans volume de recherche. Utilisez-le pour les sujets que votre audience cherche déjà, pas pour tout.",
      example:
        "Recherche « modèle de page de vente gratuit » : intention informationnelle à forte intention commerciale. Le contenu donne un modèle complet et la méthode, puis propose la formation. Il est utiles seul, et il vend.",
      apply:
        "Listez dix questions que votre audience pose réellement. Choisissez-en trois et écrivez un contenu de qualité pour chacune. Le but n'est pas de se positionner, c'est d'être utile exactement là où la recherche existe.",
      nuvra:
        "Chaque page Nuvra possède des champs SEO (titre et description) et un slug propre. Utilisez-les systématiquement : c'est la base technique sans laquelle aucun contenu ne sera trouvé.",
      exercise: {
        title: 'Choisir trois intentions',
        instructions: 'Trouve trois recherches réelles correspondant à ton offre.',
        checklist: [
          'Trois recherches identifiées',
          'Intention de chacune notée',
          'Idée de contenu pour chacune',
        ],
        worksheet: [
          { key: 'intentions', label: 'Intentions retenues', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'partenariats',
      title: 'Partenariats',
      short: 'Échanger avec des audiences complémentaires.',
      objectives: [
        'Identifier des partenaires complémentaires',
        'Proposer un partenariat gagnant-gagnant',
        'Suivre les résultats d’un partenariat',
      ],
      minutes: 7,
      intro:
        "Le meilleur trafic est celui d'une audience qui vous fait confiance. Les partenariats sont le moyen le plus rapide de l'obtenir, à condition d'être symétriques : chacun apporte quelque chose.",
      explain:
        "Trois formes.\n\nLa co-création : un contenu ou un produit en commun. Partenariat long, très fort, mais lent à monter.\n\nLa recommandation croisée : vous recommandez un partenaire, il vous recommande. Rapide, efficace, à condition que les audiences se complètent sans se concurrencer.\n\nL'événement commun : un webinaire, un atelier. Excellent pour la capture de leads : la présence crée la relation, le contenu crée le contact.\n\nLa règle de sélection : cherchez des partenaires dont l'audience a le même problème que la vôtre, avec une solution différente. Ni concurrents, ni modèles incompatibles.\n\nLe suivi : chaque partenariat doit avoir un lien mesurable. Sans mesure, vous ne saurez jamais lequel retravailler.",
      example:
        "Un consultant en stratégie partage un webinaire avec un specialist e-mail : l'un amène 400 leads, l'autre 600. La promotion est croisée, le contenu est commun, chaque lead est mesuré par un lien différent.",
      apply:
        "Identifiez cinq partenaires potentiels cette semaine et proposez-leur une collaboration précise, avec ce que vous apportez et ce que vous demandez. Une proposition précise obtient une réponse ; une proposition vague obtient un silence.",
      nuvra:
        "Dans Nuvra, chaque partenaire peut disposer d'un lien avec son propre code : les ventes sont attribuées et visibles dans vos statistiques. C'est le principe de l'affiliation, appliqué aux partenariats directs.",
      exercise: {
        title: 'Trouver trois partenaires',
        instructions: 'Trois partenaires, ce que vous apportez, ce que vous demandez.',
        checklist: [
          'Trois partenaires identifiés',
          'Apport de chacun précisé',
          'Demande formulée',
          'Lien de mesure prévu',
        ],
        worksheet: [
          { key: 'partenaires', label: 'Partenaires', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'affilies',
      title: 'Affiliés',
      short: 'Des recommandateurs rémunérés sur ventes réelles.',
      objectives: [
        'Créer un programme d’affiliation',
        'Choisir un taux de commission cohérent',
        'Suivre les ventes attribuées',
      ],
      minutes: 8,
      intro:
        "L'affiliation transforme des clients satisfaits en canaux de vente. Le coût est variable, proportionnel aux ventes : c'est le seul canal d'acquisition qui ne coûte rien s'il ne vend pas.",
      explain:
        "Trois éléments : le produit, la commission, le suivi.\n\nLe produit doit être livrable sans le vendeur : une formation, un produit digital. Vendre un service par affiliation est impossible : il n'y a pas d'utilisateur pour le recommander.\n\nLa commission se règle sur un taux aligné sur la marge. Une commission de 30 % sur un produit à 90 % de marge laisse de la place ; la même sur un produit à 40 % de marge est une perte. Un produit d'entrée peut porter une commission élevée : il sert de produit d'appel, pas de source de revenu.\n\nLe suivi est l'élément que la plupart ignorent : un lien par affilié, un code, des clics visibles. Sans mesure, vous ne savez pas qui vend, et votre programme reste une dépense à l'aveugle.",
      example:
        "Formation à 197 €, marge 90 %, commission 30 % = 59 €. L'affilié reçoit 59 €, il vous reste 118 €. À comparer avec une publicité à 3 € par lead : ici, vous ne payez qu'à la vente, et vous savez laquelle.",
      apply:
        "Choisissez un produit, un taux, et cinq affiliés potentiels qui l'ont déjà utilisé ou.font partie de votre audience. Donnez-leur accès, un lien, et un support : un affilié sans support n'en vend pas.",
      nuvra:
        "Les programmes d'affiliation de Nuvra gèrent les liens, les clics, les ventes attribuées, les commissions et leur statut. Les ventes d'affiliation apparaissent dans vos commandes avec leur code, et les commissions sont écrites au registre comptable — pas estimées.",
      action: {
        action: 'create_affiliate_program',
        label: 'Créer mon programme d’affiliation',
        route: '/dashboard/affiliates?new=1',
        requiredEntity: 'Un programme d’affiliation Nuvra actif',
        completionCheck: 'affiliate_program_created',
        hint: 'Programme, taux de commission et suivi des ventes attribuées.',
      },
      exercise: {
        title: 'Créer son programme',
        instructions: 'Produit, taux, et liste d’affiliés potentiels.',
        checklist: [
          'Produit retenu avec marge connue',
          'Taux de commission calculé sur la marge',
          'Cinq affiliés potentiels identifiés',
        ],
        worksheet: [
          { key: 'affiliation', label: 'Votre programme', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'transformer-son-audience-en-leads',
      title: 'Transformer son audience en leads',
      short: 'Le passage de l’attention publique à la liste privée.',
      objectives: [
        'Concevoir un aimant à prospects lié à l’offre',
        'Connecter formulaire, CRM et séquence',
        'Mesurer la conversion en lead',
      ],
      minutes: 8,
      intro:
        "Une audience publique n'est pas un actif : elle appartient à la plateforme. Votre liste de contacts est un actif, car elle vous suit partout. La conversion d'une à l'autre est la mécanique centrale de l'acquisition.",
      explain:
        "Le chemin se compose de quatre maillons.\n\nLe contenu attire l'attention sur une intention.\n\nL'aimant à prospects donne un contenu utile contre une adresse.\n\nLe formulaire crée le contact, avec la source et le contexte.\n\nLa séquence transforme l'intérêt en conversation : elle livre l'aimant, donne un cas, présente la solution, propose l'offre.\n\nLa santé de ce chemin se mesure au taux de conversion contenu → lead, puis lead → client. Un contenu qui attire beaucoup mais ne capte pas est un contenu mal ciblé ; une liste qui ne convertit pas est une liste mal échauffée.\n\nL'erreur classique : oublier la source. Sans source, on ne sait pas quel contenu produit les clients, et on ne peut pas doubler le bon canal.",
      example:
        "Un post « 5 erreurs qui font perdre des ventes » attire 3 000 personnes. Le formulaire en capture 180 (6 %). La séquence de 4 emails en convertit 12 en ventes. Le tag « source : post-erreurs » permet de reproduire ce contenu trois fois.",
      apply:
        "Écrivez la séquence complète qui suit votre aimant à prospects : quatre emails, quatre objectifs, quatre appels à l'action. C'est cette séquence qui transforme la capture en revenu.",
      nuvra:
        "Dans Nuvra, ce chemin est natif : page avec formulaire, contact créé dans le CRM avec sa source, tag automatique, automation « lead.created » qui envoie la séquence. Vous n'avez rien à synchroniser entre outils.",
      action: {
        action: 'create_automation',
        label: 'Créer l’automaton de bienvenue',
        route: '/dashboard/automations?new=1',
        requiredEntity: 'Une automatisation Nuvra active',
        completionCheck: 'automation_created',
        hint: 'Déclencheur lead.created → séquence de bienvenue automatique.',
      },
      exercise: {
        title: 'Construire le chemin lead',
        instructions: 'Aimant, formulaire, tag, séquence : décris les quatre maillons.',
        checklist: [
          'Aimant à prospects défini',
          'Formulaire créé avec source',
          'Tag de source prévu',
          'Séquence de 4 emails planifiée',
        ],
        worksheet: [
          { key: 'chemin', label: 'Votre chemin lead', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'acquisition-avec-nuvra',
      title: 'Acquisition avec Nuvra',
      short: 'Assembler le système dans ton espace et le faire tourner.',
      objectives: [
        'Créer page, capture, liste et séquence dans Nuvra',
        'Activer l’automaton qui relie le tout',
        'Mesurer les leads par source',
      ],
      minutes: 10,
      example:
        "Sofia publie un post « 5 erreurs qui font perdre des ventes », crée la page « 12 titres de page qui convertissent », active une automation lead.created, et obtient 180 contacts en une semaine. Le tag « source : post-erreurs » lui montre que ce contenu est le plus rentable : elle en refait trois variantes le mois suivant.",
      intro:
        "C'est le lab du module. Vous allez assembler dans Nuvra ce que vous avez appris : une page qui capte, un aimant à prospects, un formulaire qui crée des contacts, une séquence qui les relance, et un rapport qui dit ce qui fonctionne.",
      explain:
        "Le système se construit en cinq étapes.\n\nLa page : une landing avec promesse, formulaire, et rien d'autre.\n\nL'aimant : un contenu réellement utile, préparé avant l'envoi.\n\nLe formulaire : un champ email, une source.\n\nL'automaton : déclenché à la création d'un lead, il envoie immédiatement l'aimant puis la séquence, et ajoute un tag.\n\nLa mesure : contacts créés par source, taux d'ouverture, taux de clic, ventes.\n\nUne fois ce système en place, chaque nouveau contenu n'a plus besoin de nouveau développement : il alimente le même moteur. C'est ce qui distingue une acquisition qui tourne d'une campagne ponctuelle.",
      apply:
        "Construisez ce moteur avec votre offre réelle. Le temps d'installation se rembourse dès le premier lead généré sans effort supplémentaire.",
      nuvra:
        "Le bouton ci-dessous ouvre l'éditeur d'automatisations de Nuvra. Créez une automation avec le déclencheur lead.created et l'action d'envoi d'email, et reliez-la à votre page. Dans Emails, vos campagnes restent mesurables : envois, ouvertures, clics.",
      action: {
        action: 'create_automation',
        label: 'Créer mon moteur d’acquisition',
        route: '/dashboard/automations?new=1',
        requiredEntity: 'Une automatisation Nuvra active',
        completionCheck: 'automation_created',
        hint: 'Déclencheur lead.created → email de bienvenue + tag lead.',
      },
      exercise: {
        title: 'Assembler son système d’acquisition',
        instructions:
          'Créez la page, le formulaire, la séquence et l’automaton, puis testez avec une inscription réelle.',
        checklist: [
          'Landing créée et publiée',
          'Formulaire fonctionnel',
          'Aimant à prospects prêt',
          'Séquence de bienvenue écrite',
          'Automatisme activé',
          'Inscription testée',
        ],
        worksheet: [
          { key: 'systeme', label: 'Votre système', type: 'textarea' },
        ],
      },
      video: {
        narration:
          "Ton moteur d'acquisition tourne maintenant : contenu, capture, tag, séquence, mesure. Le module suivant s'occupe de l'étape suivante : transformer cette attention en ventes.",
      },
    },
  ],
};
