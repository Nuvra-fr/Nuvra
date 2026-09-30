import type { AcademyModuleInput } from './types';

/** Module 7 — Automatisation. */
export const MODULE_7: AcademyModuleInput = {
  slug: 'automatisation',
  title: 'Automatisation',
  description:
    "Une activité qui ne tient que par vous plafonne vite. L'automatisation transfère les tâches répétitives au système : vos clients reçoivent, vos contacts se suivent, vos ventes s'enregistrent, et vous gardez uniquement ce qui demande un jugement humain.",
  objectives: [
    'Identifier les tâches à automatiser en priorité',
    'Construire des séquences email déclenchées par des événements',
    'Segmenter avec tags et contacts',
    'Automatiser l’onboarding client et étudiant',
    'Récupérer les paniers abandonnés',
    'Construire son premier workflow dans Nuvra',
  ],
  deliverable:
    'Un workflow actif dans Nuvra : lead → email → tag → séquence → vente → onboarding, avec ses déclenchements et ses actions configurés.',
  lab: {
    title: 'Lab — Lead → Email → Segmentation → Offre → Vente → Onboarding',
    goal:
      'Construire une chaîne d’automatisations qui fonctionne sans intervention manuelle.',
    steps: [
      'Créer une automation « lead.created » qui envoie le contenu et pose un tag',
      'Créer une automation « purchase.completed » qui inscrit, Livrée et lance l’onboarding',
      'Activer une automation « checkout.abandoned » qui relance avec une réponse à l’objection',
      'Tester chaque déclenchement avec un vrai contact et vérifier le journal d’exécution',
    ],
    action: {
      action: 'create_automation',
      label: 'Construire mon premier workflow',
      route: '/dashboard/automations?new=1',
      requiredEntity: 'Une automatisation Nuvra active',
      completionCheck: 'automation_created',
      hint: 'Déclencheur, actions, test, vérification du journal.',
    },
  },
  video: {
    title: 'Module 7 — Automatiser pour récupérer du temps',
    description:
      'Quelle automatiser, dans quel ordre, et comment vérifier qu’elle fonctionne vraiment.',
    durationSec: 600,
    script: `00:00 — Accroche
Une activité digitale ne tient pas dans une journée de travail : elle tient dans un système. Automatiser, ce n'est pas supprimer le humain, c'est supprimer les tâches qui ne requièrent pas de jugement. Dans cette vidéo, on voit quoi automatiser, dans quel ordre, et comment le vérifier.

00:50 — La règle des trois
On automatise quand l'action est répétitive, fréquente, et sans exception. Répondre « voici votre accès » est répétitif, fréquent, et sans exception : c'est un candidat. On n'automatise pas une vente de conseil, parce qu'elle requiert un jugement.

02:10 — Le premier workflow
Le premier workflow n'est pas le plus ambitieux : c'est le plus fiable. Lead créé → email de bienvenue → tag posé. Trois étapes, aucun risque, et il fonctionne le jour même. Une fois maîtrisé, on empile.

03:40 — Les déclencheurs
Un déclencheur, c'est un événement : un contact créé, une commande payée, un cours terminé, un panier abandonné. Le bon déclencheur est celui qui décrit précisément le moment où l'action est utile. Trop large, l'automaton envoie des messages hors sujet ; trop étroit, il ne se déclenche jamais.

05:10 — Les actions
Envoyer un email, ajouter un tag, inscrire à un cours, créer une notification, attendre, appeler une URL. L'ordre compte : attendre avant d'envoyer est souvent plus efficace qu'un message supplémentaire.

06:40 — Segmentation et tags
Sans tag, vous envoyez la même chose à tout le monde. Le tag est ce qui rend laAutomation intelligente : nouveau lead, client, étudiant, client actif. Quatre tags bien posés valent plus que dix emails supplémentaires.

08:10 — Onboarding
C'est l'automatisation qui rapporte le plus : l'accueil après achat, l'accès, la première action, le point d'avancement. Une cliente livrée et activée revient ; une cliente livrée et abandonnée demande un remboursement.

09:40 — Vérifier
Une automatisation non testée est une hypothèse. Créez un contact de test, déclenchez, vérifiez le journal d'exécution, contrôlez l'email reçu. Dix minutes de test évitent dix heures de support.

11:00 — Récapitulatif
Vous avez votre chaîne. Le dernier module portera sur les chiffres qui prouvent qu'elle fonctionne.`,
    chapters: [
      { title: 'Quoi automatiser', time: 0 },
      { title: 'Le premier workflow', time: 50 },
      { title: 'Déclencheurs et actions', time: 170 },
      { title: 'Tags et segmentation', time: 310 },
      { title: 'Onboarding automatisé', time: 400 },
      { title: 'Tester et vérifier', time: 490 },
    ],
    transcript:
      "Une activité qui ne tient que par vous plafonne. On automatise quand l'action est répétitive, fréquente et sans exception. Le premier workflow n'est pas le plus ambitieux : c'est le plus fiable — lead créé, email de bienvenue, tag posé. Un déclencheur décrit un événement : contact créé, commande payée, cours terminé, panier abandonné. Les actions sont l'envoi d'email, le tag, l'inscription à un cours, la notification, l'attente. Sans tag, tout le monde reçoit la même chose. L'onboarding est l'automatisation qui rapporte le plus : accès, première action, point d'avancement. Enfin, une automatisation non testée est une hypothèse : créez un contact de test, déclenchez, vérifiez le journal d'exécution.",
    storyboard: [
      {
        time: '00:00',
        visual: 'Liste de tâches, trois surlignées en bleu.',
        narration: 'Répétitive, fréquente, sans exception : trois critères.',
        onScreenText: 'La règle des trois',
      },
      {
        time: '00:50',
        visual: 'Capture du déclencheur lead.created dans Nuvra.',
        narration: 'Le premier workflow est le plus fiable, pas le plus ambitieux.',
        onScreenText: 'Workflow n°1',
      },
      {
        time: '02:10',
        visual: 'Diagramme : événement → condition → action.',
        narration: 'Un déclencheur décrit le moment où l’action est utile.',
        onScreenText: 'Déclencheur → Action',
      },
      {
        time: '03:40',
        visual: 'Liste des déclencheurs disponibles dans Nuvra.',
        narration: 'Trop large, l’automatisme envoie hors sujet ; trop étroit, il ne part jamais.',
        onScreenText: 'Déclencheurs',
      },
      {
        time: '05:10',
        visual: 'Tags colorées posés sur une fiche contact du CRM.',
        narration: 'Quatre tags bien posés valent plus que dix emails.',
        onScreenText: 'Segmentation',
      },
      {
        time: '06:40',
        visual: 'Séquence d’onboarding : J0, J2, J7, J14.',
        narration: 'L’onboarding est l’automatisation qui rapporte le plus.',
        onScreenText: 'Onboarding',
      },
      {
        time: '08:10',
        visual: 'Journal d’exécution avec statut et horodatage.',
        narration: 'Une automatisation non testée est une hypothèse.',
        onScreenText: 'Vérification',
      },
    ],
  },
  lessons: [
    {
      slug: 'pourquoi-automatiser',
      title: 'Pourquoi automatiser',
      short: 'Récupérer du temps sans perdre la relation client.',
      objectives: [
        'Identifier les tâches répétitives à automatiser',
        'Comprendre les limites de l’automatisation',
        'Choisir sa première automatisation',
      ],
      minutes: 8,
      intro:
        "L'automatisation n'est pas un lujo de grande entreprise. C'est ce qui permet à une personne seule de gérer ce qu'un team de trois personnes ne gérerait pas. Mais automatiser la mauvaise chose coûte plus cher que ne rien automatiser.",
      explain:
        "Trois critères rendent une tâche automatisable.\n\nLa répétition : elle se produit souvent, sans interruption.\n\nLa règle : elle suit toujours la même logique, sans exception à traiter.\n\nLa valeur : l'exécution manuelle coûte du temps ou crée des erreurs.\n\nCe qui ne s'automatise pas : la négociation, la créative, la relation, et tout ce qui demande un jugement sur une situation inhabituelle.\n\nL'erreur classique est d'automatiser dans le désordre. Commencez par ce qui est visible et récurrent — l'email de bienvenue — puis montez en complexité. Une automatisation fiable et simple vaut mieux que cinq automatisations sophISTiquées dont personne ne vérifie le comportement.\n\nLe bénéfice mesurable : le temps récupéré. Notez combien de temps vous passez aujourd'hui sur chaque tâche répétitive ; c'est votre point de comparaison dans trois mois.",
      example:
        "Envoyer manuellement les accès à une formation prend 4 minutes par cliente et se fait 30 fois par mois : deux heures. Automatisé, cela prend 0 minute et ne se fait jamais, même la nuit.",
      apply:
        "Listez cinq tâches que vous faites chaque semaine. Pour chacune, cochez répétition, règle, valeur. Attaquez la première qui coche les trois cases.",
      nuvra:
        "Les automations Nuvra s'exécutent côté serveur, à chaque événement métier : contact créé, commande payée, cours terminé, panier abandonné. Elles ne dépendent pas de votre navigateur ouvert, et leur journal d'exécution vous dit ce qui s'est réellement passé.",
      exercise: {
        title: 'Cartographier ses tâches',
        instructions: 'Cinq tâches répétitives, avec temps passé et critère d’automatisation.',
        checklist: [
          'Cinq tâches listées',
          'Temps passé estimé pour chacune',
          'Trois critères cochés',
          'Première automatisation choisie',
        ],
        worksheet: [
          { key: 'taches', label: 'Vos tâches répétitives', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'leads',
      title: 'Leads',
      short: 'Transformer une adresse en conversation.',
      objectives: [
        'Déclencher un traitement dès la création d’un lead',
        'Personnaliser le premier contact',
        'Mesurer la conversion du lead en client',
      ],
      minutes: 7,
      intro:
        "Le premier contact automatique est le plus important : il décide si l'adresse devient une conversation ou une archive. Il doit arriver vite, apporter ce qui a été promis, et ne rien demander de plus que nécessaire.",
      explain:
        "Le traitement d'un nouveau lead tient en trois actions.\n\nLivrer immédiatement ce qui a été promis : le contenu, l'accès, la ressource. Un lead qui attend deux jours est un lead qui se désabonne.\n\nLe situer : une courte séquence de 3 à 4 emails qui font avancer la conversation, du problème à la solution puis à l'offre.\n\nLe taguer : pour pouvoir le retrouver, le segmenter, et mesurer.\n\nLe premier email n'est pas commercial. Il est utilitaire : il livre, il remercie, il indique la suite. Vendre dans le premier email Header brise la promesse faite dans le formulaire.",
      example:
        "Page « checklist gratuite » → soumission → email immédiat avec la checklist + tag « lead-checklist ». Le taux d'ouverture dépasse 70 %, contre 30 % en moyenne pour un email commercial.",
      apply:
        "Écrivez votre premier email de bienvenue : il livre le contenu, pose le tag, et ne vend rien. Le second message vendra, mais le premier doit tenir sa promesse.",
      nuvra:
        "Dans Nuvra, une automation déclenchée par lead.created peut envoyer l'email, poser le tag et créer une notification. Le contact apparaît immédiatement dans CRM avec sa source, et chaque action laisse une trace dans le journal d'exécution.",
      action: {
        action: 'create_automation',
        label: 'Créer l’automaton de nouveau lead',
        route: '/dashboard/automations?new=1',
        requiredEntity: 'Une automatisation Nuvra active',
      completionCheck: 'automation_created',
        hint: 'Déclencheur lead.created → email + tag.',
      },
      exercise: {
        title: 'Écrire son premier email',
        instructions: 'Email de bienvenue : livraison, remerciement, suite. Aucune vente.',
        checklist: [
          'Contenu promis livré',
          'Objet explicite',
          'Pas de vente directe',
          'Tag prévu au contact',
        ],
        worksheet: [
          { key: 'email', label: 'Votre email de bienvenue', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'sequences-email',
      title: 'Séquences email',
      short: 'Un message, un objectif, un délai.',
      objectives: [
        'Construire une séquence qui a un but',
        'Choisir les délais entre les messages',
        'Mesurer la progression d’une séquence',
      ],
      minutes: 8,
      intro:
        "Une séquence n'est pas une liste d'emails : c'est une progression. Chaque message déplace la personne d'un point à un autre, et l'ensemble conduit à une action précise.",
      explain:
        "Trois composants.\n\nUn objectif unique : la séquence conduit à une action (demander un rendez-vous, acheter, répondre). Sans objectif, la séquence est du bruit.\n\nDes messages distincts : chaque email a un rôle. Le premier livre, le deuxième instruit, le troisième prouve, le quatrième présente l'offre, le cinquième relance.\n\nDes délais : le premier immédiatement, le deuxième à 24 ou 48 heures, le troisième à une semaine, le quatrième à deux semaines. Des délais trop rapprochés fatiguent ; trop espacés, la conversation se refroidit.\n\nLa longueur : trois à cinq messages suffisent dans 80 % des cas. Au-delà, le taux de désinscription augmente.\n\nLa mesure : le taux d'ouverture par message indique où l'intérêt décroît. Le message le plus ouvert n'est pas forcément le plus efficace : ce qui compte est la progression vers l'objectif.",
      example:
        "Séquence de 4 messages : J0 livraison, J2 la méthode en 3 étapes, J5 un cas client, J9 l'offre + rappel, J12 dernière chance. Le message 4 porte généralement 60 % des ventes de la séquence.",
      apply:
        "Écrivez les quatre messages de votre séquence en une seule session, avec l'objectif en haut de chaque message. Relisez la séquence en continu pour vérifier la progression.",
      nuvra:
        "Les séquences Nuvra se déclenchent sur un événement, avec des délais en heures par étape. Chaque envoi est journalisé, et le statut de la séquence apparaît dans le journal d'exécution avec le nombre de destinataires.",
      exercise: {
        title: 'Construire une séquence',
        instructions: 'Quatre messages, un objectif, des délais définis.',
        checklist: [
          'Objectif unique écrit',
          'Quatre messages rédigés',
          'Délais définis',
          'Message de relance prévu',
        ],
        worksheet: [
          { key: 'sequence', label: 'Votre séquence', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'segmentation',
      title: 'Segmentation',
      short: 'Ne pas envoyer la même chose à tout le monde.',
      objectives: [
        'Segmenter par intention et par statut',
        'Utiliser les segments pour les campagnes',
        'Éviter l’envoi massif non ciblé',
      ],
      minutes: 7,
      intro:
        "Une liste non segmentée est une liste qu'oncraie de perdre. La segmentation permet d'envoyer le bon message à la bonne personne, ce qui augmente l'ouverture, la conversion, et réduit les désabonnements.",
      explain:
        "Trois critères de segmentation utiles.\n\nL'intention : a-t-il demandé un contenu, ouvert un email, cliqué ? L'intention se mesure par le comportement, pas par la déclaration.\n\nLe statut : lead, client, étudiant, client actif. Un client n'a pas besoin de l'email qui sert à convaincre un prospect.\n\nLa source : par quel canal il est arrivé. C'est ce qui vous permet derenaître le contenu qui produit des clients.\n\nLe risque du_segmentation excessive : plus les segments sont fins, plus la gestion devient lourde. Trois à cinq segments stables suffisent pour la plupart des activités.\n\nLe bon réflexe : commencez large, resserrez quand un problème apparaît. Pas l'inverse.",
      example:
        "Segment « a cliqué sur le prix mais n'a pas acheté » reçoit un email qui répond à l'objection prix. Les autres reçoivent le contenu. Deux messages, deux résultats, aucune perte de temps.",
      apply:
        "Définissez trois segments à partir des données que vous avez déjà, et écrivez un message différent pour chacun. Mesurez l'ouverture par segment dès le premier envoi.",
      nuvra:
        "Les contacts Nuvra portent un statut (LEAD, CUSTOMER, STUDENT), des tags libres et une source. Les campagnes se ciblent par statut ou par tag, et chaque envoi est mesuré.",
      exercise: {
        title: 'Définir ses segments',
        instructions: 'Trois segments, trois messages prévus.',
        checklist: [
          'Trois segments définis',
          'Message différent par segment',
          'Critère de sortie de segment prévu',
        ],
        worksheet: [
          { key: 'segments', label: 'Vos segments', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'tags',
      title: 'Tags',
      short: 'L’étiquette qui relie un contact à tout son historique.',
      objectives: [
        'Créer une taxonomie de tags simple',
        'Poser les tags automatiquement',
        'Utiliser les tags pour déclencher des actions',
      ],
      minutes: 7,
      intro:
        "Un tag est une étiquette attachée à un contact. C'est peu coûteux à poser et très puissant : il relie un contact à une source, à un produit, à une étape de tunnel, et déclenche des actions spécifiques.",
      explain:
        "Une bonne taxonomie répond à trois questions.\n\nD'où vient cette personne ? (source-contenu, source-formulaire)\n\nQu'a-t-elle fait ? (a-download, a-ouvert-prix, a-abandon)\n\nQue doit-il se passer ensuite ? (a-relancer, a-inviter, a-upsell)\n\nTrois règles.\n\nPassez peu de tags : dix à quinze tags bien nommés valent mieux que cinquante tags improvisés.\n\nNommez de façon constante : minuscules, tirets, pas d'accents.\n\nAutomatisez le posage : un tag posé par une règle survit à l'oubli ; un tag posé à la main finit par manquer.\n\nLes tags sont aussi des déclencheurs : un contact qui porte le tag « a-abandon » peut déclencher une relance automatique 24 heures plus tard.",
      example:
        "Taxonomie simple : source-contenu-1 à 5, a-download, a-ouvert-prix, a-abandon, client, etudiant, actif. Sept tags couvrent 90 % des besoins.",
      apply:
        "Écrivez dix tags pour votre activité, avec pour chacun la règle de pose. Puis posez-les automatiquement dans vos automatisations et campagnes.",
      nuvra:
        "Dans Nuvra, chaque contact accepte plusieurs tags. Ils sont modifiables depuis le CRM, et les automatisations peuvent les ajouter ou les retirer. Les segments de campagne se construisent directement à partir des tags.",
      exercise: {
        title: 'Créer sa taxonomie',
        instructions: 'Dix tags, règle de pose, usage prévu.',
        checklist: [
          'Dix tags nommés',
          'Règle de pose pour chacun',
          'Usage défini (segment ou déclencheur)',
        ],
        worksheet: [
          { key: 'tags', label: 'Votre taxonomie', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'declencheurs',
      title: 'Déclencheurs',
      short: 'Choisir le bon événement pour déclencher la bonne action.',
      objectives: [
        'Connaître les déclencheurs disponibles',
        'Choisir un déclencheur précis',
        'Éviter les déclenchements en cascade incontrôlée',
      ],
      minutes: 7,
      intro:
        "Le déclencheur est le cœur d'une automatisation : il décide quand le système agit. Un mauvais déclencheur produit des messages hors sujet, des inscriptions inutiles, ou des actions qui ne se déclenchent jamais.",
      explain:
        "Les déclencheurs se classent en trois familles.\n\nLes événements d'entrée : création d'un contact, d'une commande payée, d'un panier abandonné, inscription à un cours.\n\nLes événements de progression : cours commencé, leçon terminée, cours terminé.\n\nLes événements de relation : tag ajouté, segment rejointe.\n\nLe bon choix se fait par une question simple : « à quel moment précis cette action est-elle utile ? ». Si la réponse est « dès que quelqu'un entre dans la liste », le déclencheur est lead.created. Si la réponse est « quand il n'a rien fait depuis sept jours », il faut un déclencheur planifié ou un tag de non-activité.\n\nLe risque de cascade : une automatisation qui crée un événement qui en déclenche une autre. Vérifiez toujours qu'un contact ne peut pas entrer dans une boucle.",
      example:
        "Déclencheur « purchase.completed » : inscrit l'élève, envoie l'accès, pose le tag client, lance l'onboarding. Déclencheur « checkout.abandoned » : relance avec une réponse à l'objection. Les deux ne se chevauchent pas.",
      apply:
        "Écrivez la liste de vos déclencheurs nécessaires, avec pour chacun l'action associée. Vérifiez qu'aucun ne peut être impliqué dans une boucle.",
      nuvra:
        "Nuvra expose les déclencheurs métier du système : contact créé, commande payée, panier abandonné, cours commencé, leçon terminée, cours terminé, vente revendeur, vente affilié. Chaque déclenchement exécute les actions dans l'ordre défini.",
      exercise: {
        title: 'Liste des déclencheurs',
        instructions: 'Déclencheur, action associée, vérifications anti-boucle.',
        checklist: [
          'Liste des déclencheurs nécessaires',
          'Action associée pour chacun',
          'Pas de boucle possible',
        ],
        worksheet: [
          { key: 'declencheurs', label: 'Vos déclencheurs', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'workflows',
      title: 'Workflows',
      short: 'Enchaîner plusieurs actions sur un même contact.',
      objectives: [
        'Construire un workflow multi-actions',
        'Contrôler l’ordre et les délais',
        'Suivre l’exécution d’un workflow',
      ],
      minutes: 8,
      intro:
        "Un workflow est une suite d'actions sur un même contact, avec des conditions et des délais. C'est la différence entre un envoi d'email et un parcours client : le workflow pense la séquence, pas le message isolé.",
      explain:
        "Un workflow se compose d'actions ordonnées.\n\nL'action d'attente est la plus sous-utilisée et la plus puissante : attendre 24 heures avant un second message change la perception de l'ensemble. On ne relance pas quelqu'un qui vient de s'inscrire ; on le relance après lui avoir laissé le temps de lire.\n\nLes conditions permettent de bifurquer : si le contact a cliqué, ne pas envoyer l'email de relance ; s'il n'a pas ouvert deux messages, changer d'angle.\n\nLe journal d'exécution est ce qui distingue une automatisation gérée d'une automatisation subie : chaque passage est enregistré, avec son statut et son horodatage. En cas de doute, on regarde le journal avant de modifier quoi que ce soit.\n\nLa règle de nommage : nommez vos workflows par leur objectif (« Onboarding client — J0 à J14 »), pas par leur outil (« Automation 3 »).",
      example:
        "Workflow « Onboarding client » : J0 email d'accès, J2 email de première action, J7 email de point d'avancement, J14 email de résultat, puis tag « client-actif » si le cours est terminé.",
      apply:
        "Écrivez un workflow complet de cinq actions pour un moment clé de votre activité. Ajoutez une condition et une action d'attente. Puis testez-le.",
      nuvra:
        "L'éditeur d'automatisations de Nuvra permet d'ajouter des actions (email, tag, inscription à un cours, notification, attente, webhook) et de les ordonner. Le journal d'exécution indique le nombre de passages, le statut et les erreurs éventuelles.",
      action: {
        action: 'create_automation',
        label: 'Créer un workflow',
        route: '/dashboard/automations?new=1',
        requiredEntity: 'Une automatisation Nuvra active',
      completionCheck: 'automation_created',
        hint: 'Ajoutez des actions ordonnées avec des délais et vérifiez le journal.',
      },
      exercise: {
        title: 'Construire un workflow',
        instructions: 'Cinq actions ordonnées, dont une attente et une condition.',
        checklist: [
          'Cinq actions définies',
          'Une action d’attente',
          'Une condition de branchement',
          'Workflow testé sur un contact réel',
        ],
        worksheet: [
          { key: 'workflow', label: 'Votre workflow', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'emails-transactionnels',
      title: 'Emails transactionnels',
      short: 'Les messages liés à un fait : confirmation, accès, facture.',
      objectives: [
        'Identifier les emails transactionnels essentiels',
        'Rendre ces messages irréprochables',
        'Les relier aux événements du système',
      ],
      minutes: 7,
      intro:
        "Un email transactionnel est lié à un fait : une commande est passée, un accès est ouvert, une facture est disponible. Il n'est pas promotionnel, et c'est précisément pourquoi il est lu.",
      explain:
        "La liste minimale.\n\nConfirmation de commande : ce qui a été acheté, le montant, la prochaine étape.\n\nAccès ou livraison : le lien, l'identifiant, ce qu'il faut faire ensuite.\n\nFacture ou reçu : accessible, téléchargeable, permanent.\n\nRappel d'action : avant un événement daté : session, fin d'accès, échéance.\n\nMise en page : ces emails doivent fonctionner sans image. Beaucoup sont lus en notification mobile, où les images sont bloquées par défaut.\n\nRédaction : sujet factuel (« Votre accès à X est ouvert »), corps court, un lien principal, un contact. Aucune promotion dans un email transactionnel : il est lu par une personne qui attend une information.",
      example:
        "Email de livraison : « Votre accès est ouvert. Voici votre lien. Première action : faites le module 1 en 11 minutes. Besoin d'aide ? Répondez à cet email, une personne répond. »",
      apply:
        "Écrivez les quatre emails transactionnels de votre offre. Vérifiez qu'ils fonctionnent lus en texte seul, sur un téléphone, avec les images bloquées.",
      nuvra:
        "Ces emails sont envoyés par le système à chaque finalisation de commande, et journalisés. L_destinataire, l'objet et le statut sont visibles dans la file d'envoi : un email qui n'est pas parti se voit immédiatement.",
      exercise: {
        title: 'Préparer ses emails transactionnels',
        instructions: 'Confirmation, livraison, facture, rappel : quatre messages rédigés.',
        checklist: [
          'Quatre messages rédigés',
          'Fonctionnement en texte seul',
          'Lien principal unique',
          'Aucune promotion',
        ],
        worksheet: [
          { key: 'transactionnels', label: 'Vos emails transactionnels', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'abandon-de-checkout',
      title: 'Abandon de checkout',
      short: 'Récupérer les ventes qui sont déjà décidées.',
      objectives: [
        'Comprendre les motifs d’abandon',
        'Construire une relance utile et non agressive',
        'Mesurer le taux de récupération',
      ],
      minutes: 8,
      intro:
        "Un panier abandonné est la vente la plus proche d'être conclue. Pourtant, la plupart des activités n'y touchent pas, alors que c'est la source de revenu la plus rapide à installer aujourd'hui.",
      explain:
        "Les motifs d'abandon sont connus : le prix, la friction du paiement, les frais découverts tard, la doubts sur le besoin, l'interruption.\n\nLa relance fonctionne quand elle répond au motif plutôt que de répéter le message.\n\nMessage 1, 30 minutes après : une aide. « Vous avez eu un souci au paiement ? Voici les questions fréquentes. » C'est le message qui convertit le plus, parce qu'il traite la friction.\n\nMessage 2, 24 heures après : la preuve. Un cas client, un extrait, une réponse à l'objection principale.\n\nMessage 3, 72 heures après : la limite. « Je ferme votre panier dans 24 heures. » Vrai seulement.\n\nUn maximum de trois relances. Au-delà, le contact est marqué comme non qualifié et une quatrième relance détruit la relation.\n\nSur le fond : la relance doit respecter le consentement. En Europe, une relance commerciale après un panier est encadrée ; restez factuel, bref, et facile à opto-out.",
      example:
        "Sur 100 paniers abandonnés, 10 à 25 % sont récupérables par une relance bien écrite, sans aucune remise. La remise n'est pas nécessaire : c'est la friction qui a bloqué, pas le prix.",
      apply:
        "Écrivez les trois messages de relance avant d'en avoir besoin. Testez le parcours d'achat jusqu'à l'abandon, et vérifiez que la relance arrive correctement et qu'elle est simple d'opt-out.",
      nuvra:
        "Nuvra déclenche l'événement checkout.abandoned : vous pouvez y associer une séquence de relance, avec un tag « a-abandon » pour les segmenter ensuite. Le contact reste dans le CRM, et la vente récupérée apparaît dans vos commandes comme n'importe quelle autre.",
      exercise: {
        title: 'Écrire les trois relances',
        instructions:
          "Écris les trois messages de relance de panier. Chacun répond à une objection précise, jamais au même message répété.",
        checklist: [
          "Message 1 : traite l'objection du prix",
          "Message 2 : lève le doute sur la livraison ou l'accès",
          'Message 3 : ouvre une dernière fenêtre, avec une vraie échéance',
          'Désactivation automatique après le troisième message',
        ],
        worksheet: [{ key: 'relances', label: 'Vos trois messages de relance', type: 'textarea' }],
      },
      quiz: {
        title: 'Quiz — Abandon de checkout',
        passingScore: 80,
        questions: [
          {
            question: "La première relance après un abandon de panier doit :",
            options: [
              'Offrir une remise immédiate',
              'Traiter la friction et proposer une aide',
              'Rappeler le produit avec des arguments',
              'Insister sur la rareté du produit',
            ],
            answerIndex: 1,
            explanation:
              "La première relance traite la cause la plus fréquente de l'abandon : un problème lors du paiement, pas le prix.",
          },
          {
            question:
              "Une automatisation qui se déclenche trop souvent produit :",
            options: [
              'Plus de ventes, automatiquement',
              "Du bruit, des inscriptions parasites et des clientes qui se désabonnent",
              'Un meilleur référencement',
              'Une page plus rapide',
            ],
            answerIndex: 1,
            explanation:
              "La fréquence sans condition envoie des messages hors contexte : une bonne automatisation se déclenche sur un signal précis, pas par habitude.",
          },
          {
            question: "Quand faut-il arrêter les relances ?",
            options: [
              "Après trois messages, quoi qu'il arrive",
              "Dès que la commande est passée, ou après un maximum d'essais",
              "Jamais",
              "Chaque semaine, sans limite",
            ],
            answerIndex: 1,
            explanation:
              "Relancer quelqu'un qui vient d'acheter, ou insister au-delà du troisième message, détruit la relation. La règle se règle une fois, puis s'applique toute seule.",
          },
        ],
      },
    },
    {
      slug: 'onboarding-client',
      title: 'Onboarding client',
      short: 'Faire utiliser le produit dans les 48 premières heures.',
      objectives: [
        'Définir un parcours d’onboarding efficace',
        'Réduire le délai jusqu’au premier résultat',
        'Mesurer l’activation des clients',
      ],
      minutes: 8,
      intro:
        "Acheter un produit numérique ne suffit pas à l'utiliser. La différence entre une cliente qui obtient un résultat et une cliente qui demande un remboursement tient souvent à un onboarding.",
      explain:
        "Le principe du « premier résultat rapide » : entre l'achat et le premier bénéfice, il doit y avoir moins de 24 heures. Tout ce qui retarde ce bénéfice — attente d'accès, configuration complexe, absence de prochaine étape — transforme une vente en remboursement.\n\nLa séquence d'onboarding tient en cinq messages.\n\nJ0 : accès et première action précise.\n\nJ2 : « avez-vous pu commencer ? », avec l'aide la plus fréquente.\n\nJ7 : point d'avancement, et rappel de ce qui n'a pas été fait.\n\nJ14 : résultat attendu, preuve d'un autre élève.\n\nJ30 : proposition d'étape suivante, segmenté selon l'avancement.\n\nLe bon indicateur n'est pas le taux d'ouverture : c'est le taux d'activation, c'est-à-dire la part des clientes ayant effectué la première action.",
      example:
        "Une formation vendue avec un accès immédiat et une première action de 11 minutes obtient 70 % d'activation. La même formation avec un accès « sous 48 h » et aucune consigne obtient 30 %.",
      apply:
        "Écrivez votre message J0 : il doit contenir l'accès, une première action de moins de 15 minutes, et une réponse possible. Rien d'autre.",
      nuvra:
        "Dans Nuvra, l'événement purchase.completed déclenche l'inscription automatique à la formation, l'envoi de l'accès et le démarrage de la séquence. Le tag « client » et le statut de contact permettent ensuite de segmenter par avancement.",
      action: {
        action: 'create_automation',
        label: 'Créer mon onboarding client',
        route: '/dashboard/automations?new=1',
        requiredEntity: 'Une automatisation Nuvra active',
      completionCheck: 'automation_created',
        hint: 'Déclencheur purchase.completed → accès + séquence J0/J2/J7.',
      },
      exercise: {
        title: 'Écrire son onboarding',
        instructions: 'Cinq messages, du jour 0 au jour 30.',
        checklist: [
          'Message J0 avec première action',
          'Message J2 d’aide',
          'Message J7 d’avancement',
          'Message J14 de résultat',
          'Message J30 segmenté',
        ],
        worksheet: [
          { key: 'onboarding', label: 'Votre onboarding', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'onboarding-etudiant',
      title: 'Onboarding étudiant',
      short: 'Guider un élève dans sa progression jusqu’au résultat.',
      objectives: [
        'Structurer le parcours d’un élève',
        'Accompagner sans être présent',
        'Prévenir les abandons de progression',
      ],
      minutes: 7,
      intro:
        "Un étudiant qui ne progresse pas ne se plaint pas : il disparaît. Le suivi d student's progression est ce qui transforme un achat en parcours terminé, et un parcours terminé en recommandation.",
      explain:
        "Trois signaux d'abandon à surveiller.\n\nAucune leçon terminée dans les 72 heures : c'est le signal le plus fiable d'un abandon.\n\nUne leçon commencée mais jamais terminée : l'élève n'a pas compris la consigne.\n\nLe module 1 terminé, le module 2 jamais commencé : la transition manque, ou le module suivant n'est pas assez attirant.\n\nTrois réponses automatiques.\n\nÀ 72 heures sans activité : un email court qui propose la première étape la plus courte.\n\nÀ 14 jours : un email sur le format, avec un exemple d'un autre élève qui a avancé.\n\nÀ 30 jours : une offre de sortie — une session, un appel, ou un accès prolongé.\n\nLe ton compte : ces emails ne doivent jamais culpabiliser. Ils rappellent une prochaine étape précise, et la rendent facile.",
      example:
        "Un cours de 40 % de complétion médiocre passe à 62 % avec trois emails de relance calibrés sur les signaux ci-dessus, sans aucune modification de contenu.",
      apply:
        "Définissez vos trois seuils d'alerte et écrivez les trois messages correspondants. Programmez-les dans vos automatisations.",
      nuvra:
        "Nuvra suit la progression réelle de chaque élève : leçons terminées, score de quiz, vidéo regardée. Les événements de progression (cours commencé, leçon terminée, cours terminé) permettent de déclencher vos messages au bon moment.",
      exercise: {
        title: 'Prévenir les abandons',
        instructions: 'Trois seuils, trois messages, trois déclencheurs.',
        checklist: [
          'Seuil 72 h défini',
          'Seuil 14 jours défini',
          'Seuil 30 jours défini',
          'Messages rédigés',
        ],
        worksheet: [
          { key: 'abandons', label: 'Vos seuils et messages', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'relance',
      title: 'Relance',
      short: 'Reprendre contact sans forcer.',
      objectives: [
        'Définir quand relancer et quand arrêter',
        'Écrire des relances utiles',
        'Préserver la confiance',
      ],
      minutes: 7,
      intro:
        "Relancer n'est pas insister. Relancer, c'est rappeler une prochaine étape à quelqu'un qui l'a demandée. La différence se voit dans le nombre de messages, et surtout dans leur contenu.",
      explain:
        "La règle du temps.\n\nAprès un achat : relance d'activation, pas commerciale.\n\nAprès un refus : une seule relance de politesse, puis on arrête.\n\nAprès un silence long : une campagne de réactivation, puis une mise en sourdine si rien ne change.\n\nLe contenu d'une relance utile.\n\nElle apporte quelque chose de nouveau : une réponse à une objection, une ressource, un cas.\n\nElle propose une seule action.\n\nElle est facile à refuser : lien de désinscription, et absence de reproche.\n\nLa fréquence : pas plus d'un message par semaine sur une liste active. Une relance par semaine pendant un an épuise une liste mieux que dix campagnes annuelles concentrées.",
      example:
        "Mauvaise relance : « Nous avons une promotion -30 % ! ». Bonne relance : « Trois clientes m'ont écrit la même chose cette semaine : leur page est publiée mais ne reçoit rien. Voici les trois causes les plus fréquentes, et comment les vérifier en 10 minutes. »",
      apply:
        "Écrivez une relance qui apporte une information, pas une promotion. Si elle peut être envoyée à toute votre liste sans la modifier, elle n'est pas ciblée.",
      nuvra:
        "Les campagnes Nuvra se ciblent par statut et par tag, et chaque envoi est mesuré. Utilisez le tag « non-actif » pour cibler une réactivation, et surveillez le taux de désinscription : c'est votre indicateur de fatigue de liste.",
      exercise: {
        title: 'Écrire une relance utile',
        instructions: 'Une relance qui apporte une information et propose une action unique.',
        checklist: [
          'Information nouvelle apportée',
          'Une seule action proposée',
          'Désinscription visible',
          'Pas de reproche',
        ],
        worksheet: [
          { key: 'relance', label: 'Votre relance', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'certification-automatisee',
      title: 'Certification automatisée',
      short: 'Attester la réussite sans travail manuel.',
      objectives: [
        'Déclencher la certification à la fin d’un parcours',
        'Informer l’élève de l’ouverture',
        'Rendre le certificat partageable et vérifiable',
      ],
      minutes: 6,
      intro:
        "La certification est l'étape finale d'un parcours. Automatisée, elle retire un travail manuel récurrent et elle offre à l'élève une preuve qu'il a envie de partager.",
      explain:
        "Le déclenchement est l'événement de fin de parcours : toutes les leçons terminées, ou un score de quiz atteint.\n\nCe que le système fait ensuite.\n\nIl génère le certificat avec un identifiant unique.\n\nIl envoie un message qui le présente, avec le lien de vérification.\n\nIl consigne la date et le nom.\n\nPourquoi c'est important : le message de fin de parcours est le plus ouvert de toute la séquence, parce que l'élève vient de réussir. Il ouvre naturally la conversation sur l'étape suivante, l'affiliation, ou la recommandation.\n\nCôté conformité, un certificat doit refléter des conditions réelles : parcours complété et quiz validé au-dessus du seuil. Un certificat sans condition n'a pas de valeur.",
      example:
        "Message de certification : « Bravo, vous avez terminé. Votre certificat est prêt, il est vérifiable publiquement. Voici la prochaine étape pour ceux qui veulent aller plus loin. »",
      apply:
        "Écrivez le message de certification : il décrit le résultat, le lien de vérification, et une seule prochaine étape.",
      nuvra:
        "Nuvra émet automatiquement un certificat avec un code unique à 100 % du parcours, et la page de vérification publique répond à ce code. Le message part au moment exact de l'obtention.",
      exercise: {
        title: 'Préparer la certification',
        instructions: 'Condition, message, prochaine étape.',
        checklist: [
          'Condition d’obtention définie',
          'Message de certification rédigé',
          'Prochaine étape proposée',
        ],
        worksheet: [
          { key: 'certification', label: 'Votre certification', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'automatisation-commerciale',
      title: 'Automatisation commerciale',
      short: 'Automatiser la relation commerciale sans automatiser la vente.',
      objectives: [
        'Relier les étapes commerciales aux événements',
        'Automatiser le suivi des commandes et des clients',
        'Préserver le contact humain aux moments décisifs',
      ],
      minutes: 8,
      intro:
        "L'automatisation commerciale ne remplace pas la vente : elle libère la vente. Elle gère les confirmations, les relances, les invitations et les suivis, et elle vous laisse les conversations qui demandent votre jugement.",
      explain:
        "Ce qui s'automatise bien : la confirmation de commande, la livraison, la création de fiche client, les relances d'activation, les invitations à un événement, les demandes de témoignage après un résultat, les PSY notifications internes.\n\nCe qui ne s'automatise pas : la négociation, la réponse à une objection inhabituelle, la conversation avec un prospect chaud, la gestion d'un client mécontent.\n\nLa règle du seuil : quand une conversation dépasse trois échanges et devient stratégique, elle redevient humaine. L'automatisation sert à_filters, pas à décider.\n\nCette discipline est ce qui distingue une automatisation qui augmente le chiffre d'affaires d'une automatisation qui augmente le nombre de messages.",
      example:
        "Une commande payée déclenche automatiquement : création de la fiche client, tag, email d'accès, inscription au cours, notification interne. Il ne reste qu'une action : un message personnel si le client est stratégique.",
      apply:
        "Écrivez la liste des tâches commerciales répétitives, et classez-les en « automatique », « semi-automatique » (préparé, envoyé par vous) et « humain ». Commencez par le premier groupe.",
      nuvra:
        "Dans Nuvra, une seule automatisation peut enchaîner plusieurs actions sur la commande : inscription à un cours, tag, email, notification interne. Les commandes, clients et contacts restent liés, ce qui évite toute ressaisie.",
      exercise: {
        title: 'Classer ses tâches commerciales',
        instructions: 'Trois catégories : automatique, semi-automatique, humain.',
        checklist: [
          'Tâches classées',
          'Première automatisation définie',
          'Seuils d’intervention humaine posés',
        ],
        worksheet: [
          { key: 'commercial', label: 'Vos tâches commerciales', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'construire-son-premier-workflow',
      title: 'Construire son premier workflow dans Nuvra',
      short: 'Assembler la chaîne complète et la vérifier dans le journal.',
      objectives: [
        'Construire une chaîne lead → client onboardé',
        'Tester chaque déclencheur',
        'Lire le journal d’exécution',
      ],
      minutes: 12,
      example:
        "Un atelier active cinq automatisations, puis teste chacune avec un contact réel : un lead de test, un panier abandonné, une commande payée, un cours commencé, un cours terminé. Le journal montre 5 passages par automatisation, sans erreur. À la fin de la semaine, une commande de test a parcouru toute la chaîne sans intervention.",
      intro:
        "C'est le lab du module. Vous allez construire la chaîne complète : lead → email → tag → offre → vente → onboarding, et la vérifier dans le journal d'exécution. C'est le système qui fera tourner votre activité quand vous ne serez pas devant l'écran.",
      explain:
        "La chaîne se construit en cinq automatisations.\n\n« lead.created » : email de livraison + tag lead.\n\n« a-abandon / checkout.abandoned » : trois messages de relance.\n\n« purchase.completed » : tag client + inscription à la formation si le produit en est une + email d'accès + notification interne.\n\n« course.started » : message de première action.\n\n« course.completed » : message de résultat + certificat.\n\nChaque automatisation est petite, testée, et nommée par son objectif. Le journal d'exécution montre combien de contacts sont passés, et quelles actions ont réussi.\n\nLa discipline du test : créez un contact de test, déclenchez l'événement, vérifiez l'email reçu et le tag posé. Cette vérification prend dix minutes par automatisation et évite des jours de support.",
      apply:
        "Construisez les cinq automatisations, testez-les une par une, et notez le nombre de passages observés dans le journal. Un système non testé est une hypothèse.",
      nuvra:
        "Le bouton ci-dessous ouvre l'éditeur d'automatisations de Nuvra. Créez vos automatisations, activez-les, et testez avec un contact réel : le journal d'exécution vous montre exactement ce qui s'est passé.",
      action: {
        action: 'create_automation',
        label: 'Construire ma chaîne d’automatisation',
        route: '/dashboard/automations?new=1',
        requiredEntity: 'Une automatisation Nuvra active',
      completionCheck: 'automation_created',
        hint: 'Cinq automatisations, cinq déclencheurs, un journal vérifié.',
      },
      exercise: {
        title: 'Construire et tester sa chaîne',
        instructions:
          'Créez les automatisations de la chaîne et testez-les une par une.',
        checklist: [
          'lead.created : email + tag',
          'checkout.abandoned : trois relances',
          'purchase.completed : client + accès + onboarding',
          'course.started et course.completed',
          'Chaque automatisation testée',
          'Journal d’exécution vérifié',
        ],
        worksheet: [
          { key: 'chaine', label: 'Votre chaîne', type: 'textarea' },
          { key: 'journal', label: 'Résultat des tests', type: 'textarea' },
        ],
      },
      resources: [
        {
          title: 'Bibliothèque de déclencheurs',
          kind: 'TEMPLATE',
          description: 'Les 12 déclencheurs utiles et l’action recommandée pour chacun.',
        },
        {
          title: 'Plan de relance de panier',
          kind: 'WORKBOOK',
          description: 'Les trois messages, leurs objets et leurs conditions d’envoi.',
        },
      ],
      video: {
        narration:
          "Ta chaîne tourne : un lead entre, il est livré et tagué, il achète, il est livré et suit, il termine et obtient son certificat. Tu n'es plus dans la boucle. Le dernier module va te montrer les chiffres qui prouvent que tout cela fonctionne.",
      },
    },
  ],
};
