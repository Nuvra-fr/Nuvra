import type { AcademyModuleInput } from './types';

/** Module 3 — Construire son tunnel. */
export const MODULE_3: AcademyModuleInput = {
  slug: 'tunnel',
  title: 'Construire son tunnel',
  description:
    "Un tunnel n'est pas une suite de pages : c'est un chemin par lequel on transforme un visiteur en cliente, et une cliente en cliente fidèle. Ce module construit ce chemin pas à pas, puis l'assemble dans Nuvra.",
  objectives: [
    'Définir ce qu’est un tunnel et à quoi il sert',
    'Construire une landing page qui capte l’attention',
    'Créer une capture de leads et un lead magnet efficace',
    'Écrire une page de vente qui vend',
    'Configurer le checkout, l’order bump, l’upsell et le downsell',
    'Construire la page de remerciement et la livraison',
    'Suivre un client après l’achat',
    'Mesurer les conversions de chaque étape',
    'Construire son premier funnel dans Nuvra',
  ],
  deliverable:
    'Un funnel Nuvra publié, avec landing page, formulaire, page de vente, checkout, upsell et page de remerciement.',
  lab: {
    title: 'Lab — Build your first funnel',
    goal:
      'Assembler un tunnel complet et publiable dans Nuvra, prêt à recevoir du trafic.',
    steps: [
      'Créer un funnel et y relier vos pages dans l’ordre : landing, formulaire, page de vente, checkout, upsell, remerciement',
      'Connecter le produit au bloc de paiement de la page de vente',
      'Configurer l’order bump et l’upsell avec de vrais prix',
      'Publier le funnel et tester le parcours complet depuis la landing',
    ],
    action: {
      action: 'create_funnel',
      label: 'Créer mon premier funnel',
      route: '/dashboard/funnels?new=1',
      requiredEntity: 'Un tunnel Nuvra avec ses étapes',
      completionCheck: 'funnel_created',
      hint: 'Ouvre le Funnel Builder de Nuvra et assemble les étapes.',
    },
  },
  video: {
    title: 'Module 3 — Construire un funnel complet dans Nuvra',
    description:
      'Du premier clic à la livraison : chaque étape du tunnel, et comment la construire dans Nuvra.',
    durationSec: 660,
    script: `00:00 — Accroche
Un tunnel, c'est une suite d'étapes où chacune a une seule mission : accrocher, capter, convaincre, encaisser, livrer, suivre. On ne construit pas six pages, on construit une machine à six étapes avec un indicateur par étape. Dans cette vidéo, on construit cette machine dans Nuvra.

01:10 — Étape 1 : la landing page
Sa mission est de capter l'attention d'une personne qui arrive d'une source cold. Elle contient une promesse claire, une preuve, un formulaire, et rien d'autre. Si elle contient trois liens vers l'extérieur, elle ne convertit personne.

02:40 — Étape 2 : la capture de leads
Le formulaire transforme un visiteur en contact. Chaque envoi crée une fiche dans le CRM, avec la source. Le lead magnet — checklist, modèle, mini-formation — est l'échange : tu donnes un élément utile pour obtenir une adresse.

04:10 — Étape 3 : la page de vente
Elle reprend la promesse, détaille le contenu, affiche la preuve, traite les objections, présente le prix, et invite à acheter. C'est la page la plus longue et la plus importante du tunnel.

05:40 — Étape 4 : le checkout
Le checkout doit être le plus simple possible : peu de champs, prix visible, aucun compte à créer. Chaque champ superflu coûte des ventes. Le paiement validé déclenche immédiatement la livraison et l'automaton de bienvenue.

07:00 — Étape 5 : les offres complémentaires
L'order bump est une offre ajoutée au paiement, acceptée par défaut ou en un clic. L'upsell est une offre présentée après l'achat. Le downsell est une alternative moins chère pour ceux qui refusent. Les trois augmentent le panier moyen sans CAC supplémentaire.

08:30 — Étape 6 : remerciement et livraison
La page de remerciement confirme, rassure et oriente. C'est là que commence l'onboarding : premier email, première action, premier contact. Une page de remerciement inexistante, c'est une cliente perdue après paiement.

10:00 — Mesurer
Chaque étape a un indicateur : vues, leads, ventes, panier moyen. Dans Nuvra, ces chiffres se lisent dans Analytics et dans le CRM. Le module 6 ira plus loin sur l'optimisation.

11:00 — Récapitulatif
Ton tunnel existe, il est publié, il est mesurable. Le module suivant fera la même chose pour un produit plus complexe : la formation.`,
    chapters: [
      { title: 'Ce qu’est un tunnel', time: 0 },
      { title: 'Landing page et capture de leads', time: 70 },
      { title: 'Page de vente et checkout', time: 250 },
      { title: 'Order bump, upsell, downsell', time: 420 },
      { title: 'Remerciement, livraison et suivi', time: 510 },
      { title: 'Mesurer les conversions', time: 600 },
    ],
    transcript:
      "Un tunnel est une suite d'étapes où chacune a une seule mission : accrocher, capter, convaincre, encaisser, livrer, suivre. La landing page capte l'attention et propose un formulaire. La capture de leads transforme un visiteur en contact dans le CRM. La page de vente reprend la promesse, détaille le contenu, affiche la preuve et traite les objections. Le checkout doit être le plus simple possible. L'order bump, l'upsell et le downsell augmentent le panier moyen sans coût d'acquisition supplémentaire. La page de remerciement confirme l'achat et lance l'onboarding. Chaque étape a un indicateur, lisible dans Analytics et dans le CRM.",
    storyboard: [
      {
        time: '00:00',
        visual: 'Chaîne horizontale de six blocs qui s’allument l’un après l’autre.',
        narration: "Un tunnel, c'est une machine à six étapes avec un indicateur par étape.",
        onScreenText: '6 étapes · 6 indicateurs',
      },
      {
        time: '01:10',
        visual: 'Capture d’écran : landing page Nuvra, blocs promesse + formulaire.',
        narration: 'La landing page a une seule mission : capter une attention.',
        onScreenText: 'Étape 1 · Landing',
      },
      {
        time: '02:40',
        visual: 'Fiche contact qui apparaît dans le CRM après soumission du formulaire.',
        narration: 'Chaque envoi de formulaire crée un contact avec sa source.',
        onScreenText: 'Étape 2 · Leads',
      },
      {
        time: '04:10',
        visual: 'Page de vente annotée : promesse, preuve, objections, prix, CTA.',
        narration: 'La page de vente reprend la promesse et traite les objections.',
        onScreenText: 'Étape 3 · Page de vente',
      },
      {
        time: '05:40',
        visual: 'Écran de paiement avec les seuls champs obligatoires mis en évidence.',
        narration: 'Chaque champ superflu coûte des ventes.',
        onScreenText: 'Étape 4 · Checkout',
      },
      {
        time: '07:00',
        visual: 'Trois cartes : order bump, upsell, downsell avec leur rôle.',
        narration: 'Trois leviers de panier moyen, sans coût d’acquisition.',
        onScreenText: 'Étape 5 · Panier moyen',
      },
      {
        time: '08:30',
        visual: 'Page de remerciement, puis premier email d’onboarding.',
        narration: 'La page de remerciement lance l’onboarding.',
        onScreenText: 'Étape 6 · Onboarding',
      },
    ],
  },
  lessons: [
    {
      slug: 'quest-ce-quun-funnel',
      title: "Qu'est-ce qu'un funnel ?",
      short: 'Un chemin étapes par étapes, avec un objectif et un indicateur à chaque étape.',
      objectives: [
        'Définir un tunnel et son rôle',
        'Distinguer un tunnel d’une simple page',
        'Nommer les étapes standards d’un tunnel',
      ],
      minutes: 8,
      intro:
        "Un tunnel de vente est un parcours organisé d'étapes où chacune a un seul objectif. La différence avec une page isolée est structurante : on ne publie pas une page, on publie une machine dont chaque étape est mesurée.",
      explain:
        "Un tunnel comporte typiquement cinq à sept étapes.\n\nL'accroche : une page d'entrée qui capte l'attention et oriente vers l'étape suivante.\n\nLa capture : un échange (email, inscription) contre un contenu de valeur.\n\nLa conversion : une page de vente qui répond aux objections et déclenche l'achat.\n\nL'encaissement : le checkout, le plus simple possible.\n\nLa livraison : l'accès, le fichier, l'inscription, l'envoi.\n\nLe suivi : les emails, les offres, la fidélisation.\n\nChaque étape doit répondre à trois questions : à qui elle s'adresse, quelle action unique elle demande, et comment tu sauras qu'elle a fonctionné. Une étape sans ces trois réponses est une étape décorative.\n\nL'erreur la plus courante est de construire le tunnel avant d'avoir une offre qui convertit. Le tunnel multiplie les étapes d'un message ; il ne répare pas un mauvais message.",
      example:
        "Un tunnel « checklist gratuite » fonctionne ainsi : post LinkedIn → page avec formulaire → email automatique avec la checklist → séquence de 3 emails → page de vente → paiement → onboarding par email. Chaque étape a un taux mesuré, et un même lead traverse les six.",
      apply:
        "Écris ton tunnel sur une feuille, une ligne par étape, avec pour chaque ligne : l'objectif, l'action attendue et l'indicateur. Si tu ne peux pas remplir ces trois colonnes, l'étape n'est pas prête.",
      nuvra:
        "Dans Nuvra, un funnel est un objet réel : tu le crées dans Funnels, tu y lies des pages existantes, et chaque lien définit l'ordre et le type d'étape. Le funnel devient la colonne vertébrale de tes tunnels, et c'est lui qui permet de mesurer l'ensemble du parcours plutôt que des pages isolées.",
      action: {
        action: 'create_funnel',
        label: 'Créer mon premier funnel',
        route: '/dashboard/funnels?new=1',
        requiredEntity: 'Un tunnel Nuvra avec ses étapes',
        completionCheck: 'funnel_created',
        hint: 'Un funnel Nuvra relie des pages dans un ordre précis.',
      },
      exercise: {
        title: 'Schéma de tunnel',
        instructions: 'Écris les étapes de ton tunnel avec objectif, action et indicateur.',
        checklist: [
          'Au moins cinq étapes listées',
          'Objectif indiqué par étape',
          'Indicateur indiqué par étape',
        ],
        worksheet: [
          { key: 'etapes', label: 'Étapes du tunnel', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'le-parcours-client-dans-le-tunnel',
      title: 'Le parcours client dans le tunnel',
      short: 'Où se situe chaque personne, et ce que le tunnel doit lui montrer.',
      objectives: [
        'Situer les étapes du tunnel dans le parcours client',
        'Adapter le message au niveau de conscience',
        'Détecter les fuites entre deux étapes',
      ],
      minutes: 8,
      intro:
        "Le tunnel n'est pas une liste de pages : c'est la traduction technique d'un parcours de décision. Savoir à quelle étape de décision se trouve la personne détermine le contenu qu'elle doit recevoir.",
      explain:
        "Trois intentions dominent le parcours.\n\nL'intention d'information : la personne cherche à comprendre. Elle doit recevoir un contenu de valeur, pas une offre. C'est l'étape de la capture.\n\nL'intention de comparaison : elle connaît le problème, cherche des solutions. Elle a besoin de preuves, de détails, de réponses aux objections. C'est l'étape de la page de vente.\n\nL'intention d'achat : elle a décidé, elle cherche à finaliser. Elle a besoin de simplicité, de garantie, de réassurance. C'est l'étape du checkout et des offres complémentaires.\n\nLa fuite entre deux étapes est presque toujours un problème d'intention : on demande une action trop lourde à quelqu'un qui n'en est pas là. Un formulaire qui demande le nom, l'entreprise et le budget, à l'étape d'information, perd la moitié des visiteurs. Un formulaire qui ne demande que l'email convertit, mais alimente une liste large et non qualifiée.\n\nLe bon compromis se règle en plaçant la qualification après l'intérêt : d'abord l'email, ensuite la question.",
      example:
        "Sur une landing qui annonce « le guide gratuit », un formulaire avec trois champs est acceptable. Sur la même landing, un formulaire qui demande « votre budget annuel » transforme une.page d'information en page de vente, et fait chuter la conversion de moitié.",
      apply:
        "Pour chaque étape de ton tunnel, écris l'intention dominante. Puis vérifie que l'action demandée correspond à cette intention. Un seul écart suffit à provoquer une fuite.",
      nuvra:
        "Nuvra enregistre les contacts avec leur source (landing, page, tunnel). Dans CRM, tu peux donc segmenter par intention : les contacts qui viennent d'un aimant à prospects ne recevront pas le même email que ceux qui viennent de la page de vente. Cette segmentation est automatique dès que les pages sont distinctes.",
      exercise: {
        title: 'Cartographier les intentions',
        instructions: 'Pour chaque étape, note l’intention dominante et vérifie la cohérence de l’action.',
        checklist: [
          'Intention notée pour chaque étape',
          'Action demandée cohérente avec l’intention',
          'Point de fuite probable identifié',
        ],
        worksheet: [
          { key: 'intentions', label: 'Intentions par étape', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'landing-page',
      title: 'Landing page',
      short: 'Une page unique, une promesse, une action.',
      objectives: [
        'Construire une landing page orientée conversion',
        'Choisir les blocs utiles et supprimer les autres',
        'Rendre la promesse immédiatement compréhensible',
      ],
      minutes: 9,
      intro:
        "La landing page est la première impression. Elle n'a pas besoin d'être longue : elle a besoin d'être claire, rapide et orientée vers une seule action. Tout ce qui n'aide pas l'action principale est du bruit.",
      explain:
        "Une landing page efficace contient cinq blocs, dans cet ordre.\n\nLa promesse : ce que la personne obtient, pour qui, et en combien de temps. Elle doit se comprendre en trois secondes.\n\nLa preuve : ce qui rend la promesse crédible. Un chiffre, un cas, un témoignage vrai.\n\nLe contenu : ce que la personne recevra exactement, en liste.\n\nLe formulaire : l'action. Un seul formulaire, généralement l'email seul au premier contact.\n\nL'urgence ou la rareté : si elles sont vraies.\n\nCe qui nuit : la navigation complète du site, les liens sociaux, un second CTA, un texte qui commence par l'histoire de la société. Une landing page qui propose de partir ailleurs est une landing page qui perd.\n\nVitesse : chaque image non optimisée coûte des secondes, et chaque seconde coûte des inscriptions. Les pages Nuvra utilisent des blocs légers pour rester rapides.",
      example:
        "Promesse : « Le générateur de 30 titres de page, gratuit, en 2 minutes ». Preuve : « utilisé par 1 200YB marketers ». Contenu : « une feuille de calcul + une vidéo de 4 minutes ». Formulaire : un champ email. CTA : « Recevoir le générateur ».",
      apply:
        "Écris la promesse en premier, sur une seule ligne. Si tu ne peux pas la faire tenir en douze mots, elle n'est pas claire. Tout le reste de la page découle de cette phrase.",
      nuvra:
        "Dans Nuvra, une landing page se construit par blocs (hero, text, form, cta, faq, social_proof, countdown). Le bloc hero porte la promesse, le bloc form la capture, le bloc cta l'action. Tu peux dupliquer une page existante pour itérer sans casser l'originale, ce qui est la base de tout test A/B sérieux.",
      action: {
        action: 'create_page',
        label: 'Créer ma landing page',
        route: '/dashboard/pages?new=1',
        requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
        completionCheck: 'page_created',
        hint: 'Utilise les blocs hero + form + cta pour une landing efficace.',
      },
      exercise: {
        title: 'Écrire sa promesse',
        instructions:
          'Rédige la promesse en douze mots maximum, puis la preuve qui l’accompagne.',
        checklist: [
          'Promesse en douze mots ou moins',
          'Bénéficiaire nommé',
          'Preuve choisie',
          'Appel à l’action formulé',
        ],
        worksheet: [
          { key: 'promesse', label: 'Promesse', type: 'text' },
          { key: 'preuve', label: 'Preuve', type: 'text' },
          { key: 'cta', label: 'Appel à l’action', type: 'text' },
        ],
      },
    },
    {
      slug: 'lead-capture',
      title: 'Lead capture',
      short: 'Transformer un visiteur en contact identifiable, proprement.',
      objectives: [
        'Choisir le contenu à offrir en échange d’un email',
        'Réduire les frictions du formulaire',
        'Mesurer la qualité des leads, pas seulement leur nombre',
      ],
      minutes: 8,
      intro:
        "La capture de leads est l'échange le plus fundamental du marketing digital : tu donnes une valeur immédiate, tu reçois une adresse. Ce qui semble_simple est souvent mal fait : trop de champs, mauvaise promesse, mauvais suivi.",
      explain:
        "Trois règles gouvernent une capture efficace.\n\nLe contenu offert doit être utile en soi, pas seulement une promesse de contenu plus loin. Une checklist de 12 points est better qu'un « guide complet ».\n\nLe formulaire doit être minimal au premier contact : l'email suffit. Les questions de qualification viennent par email, ou sur une seconde page si l'offre l'exige.\n\nLe suivi doit être immédiat et automatique. Une cliente qui reçoit son contenu dans l'heure a un taux d'ouverture incomparablement meilleur. C'est exactement le rôle d'une automation déclenchée sur la création d'un lead.\n\nCôté mesure, distingue volume et qualité. Mille contacts qui n'ouvrent rien valent moins que cent contacts qui lisent et répondent. Le tag de source permet de comparer les canaux selon la qualité, pas seulement le nombre.",
      example:
        "Formulaire « email seulement » : 1 200 inscriptions. Formulaire « email + nom + entreprise + budget » : 310 inscriptions. Les 890 perdues ne sont pas des non-intéressées : elles ont été perdues par friction, au moment précis où elles étaient le plus réceptives.",
      apply:
        "Testez votre formulaire à sa version minimale. Si votre taux chute lorsque vous retirez un champ, ce champ est nécessaire ; sinon, retirez-le définitivement. Un test simple, reproductible, qui améliore la conversion plus sûrement qu'un nouveau design.",
      nuvra:
        "Dans Nuvra, un formulaire de page crée automatiquement un contact, enregistre la page source et déclenche les automations actives sur l'événement lead.created. C'est le cœur de ton système : un lead, un contact, un tag, une automation, un email — sans aucun outil externe.",
      action: {
        action: 'create_page',
        label: 'Créer ma page de capture',
        route: '/dashboard/pages?new=1',
        requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
        completionCheck: 'page_created',
        hint: 'Formulaire email seul + contenu réellement utile.',
      },
      exercise: {
        title: 'Concevoir sa capture',
        instructions: 'Décris le contenu offert, les champs du formulaire et le premier email envoyé.',
        checklist: [
          'Contenu offert décrit en une phrase',
          'Formulaire minimal défini',
          'Premier email automatique rédigé',
          'Tag de source prévu',
        ],
        worksheet: [
          { key: 'contenu', label: 'Contenu offert', type: 'text' },
          { key: 'champs', label: 'Champs du formulaire', type: 'text' },
          { key: 'email1', label: 'Objet du premier email', type: 'text' },
        ],
      },
    },
    {
      slug: 'lead-magnet',
      title: 'Lead magnet',
      short: 'Le contenu qui mérite qu’on laisse son email.',
      objectives: [
        'Choisir le bon format de lead magnet',
        'Relier le lead magnet à l’offre',
        'Mesurer la conversion d’un aimant à prospects',
      ],
      minutes: 8,
      intro:
        "Un lead magnet n'est pas une gratuité : c'est un produit miniature. S'il n'apporte pas de résultat à lui seul, il ne mérite pas d'être échangé contre une adresse.",
      explain:
        "Quatre formats fonctionnent bien.\n\nLa liste de contrôle : la plus rapide à produire, utile, et facile à livrer. Elle convertit bien, mais ne crée pas de dépendance.\n\nLe modèle ou l'outil : un fichier prêt à l'emploi (tableur, modèle de page). Très attractif pour une audience terrain.\n\nLa mini-formation courte : trois vidéos de cinq minutes. Elle crée une relation et prépare naturellement l'offre principale.\n\nLa ressource d'analyse : un diagnostic que l'utilisateur fait sur lui-même. Très puissant quand il produit un score et une conclusion personnalisée.\n\nLe critère de choix est la proximité avec l'offre. Un aimant à prospects doit être le premier pas vers le produit, pas un contenu sans lien. S'il n'amène nulle part, il amènera ailleurs.\n\nEnfin, la livraison doit être immédiate et lisible sur mobile : c'est souvent le premier contact physique avec ta marque.",
      example:
        "Offre : formation à la rédaction de pages de vente. Lead magnet : « 12 titres de page qui ont converti » (liste de contrôle). La cliente lit les titres, constate que les siens sont faibles, et arrive sur la page de vente avec un besoin clair.",
      apply:
        "Écrivez le lead magnet avant la page de vente. S'il n'est pas utile en soi, il ne sera pas un aimant : il sera une annonce déguisée, et les gens la détectent immédiatement.",
      nuvra:
        "Un lead magnet est un produit Nuvra de prix zéro, ou un contenu envoyé par email. Le premier te donne un suivi des téléchargements dans tes commandes ; le second te donne le taux d'ouverture. Les deux sont utiles, et souvent complémentaires.",
      exercise: {
        title: 'Choisir son lead magnet',
        instructions: 'Choisis un format et vérifie qu’il est proche de ton offre et utile seul.',
        checklist: [
          'Format choisi',
          'Utilité autonome démontrée',
          'Lien avec l’offre explicite',
          'Livraison immédiate prévue',
        ],
        worksheet: [
          { key: 'format', label: 'Format retenu', type: 'text' },
          { key: 'utilite', label: 'Utilité autonome', type: 'textarea' },
          { key: 'lien', label: 'Lien avec l’offre', type: 'text' },
        ],
      },
    },
    {
      slug: 'page-de-vente',
      title: 'Page de vente',
      short: 'La page la plus longue du tunnel, et la plus importante.',
      objectives: [
        'Structurer une page de vente qui vend',
        'Traiter les objections dans le bon ordre',
        'Relier la page à un produit et à un paiement',
      ],
      minutes: 10,
      intro:
        "La page de vente est l'outil de vente le plus efficace dont vous disposez : la personne est déjà là, elle a manifesté son intérêt, et elle lit. La page n'a pas besoin d'être un argumentaire commercial : elle a besoin d'être claire, complète et sans zone grise.",
      explain:
        "La structure classique, dans l'ordre des questions du lecteur.\n\n1. La promesse : le résultat, pour qui, en combien de temps.\n2. Le problème : décrit avec ses mots, pour qu'il se reconnaisse.\n3. La solution : ce que vous apportez, et pourquoi cela marche.\n4. Le contenu : ce qu'il reçoit exactement.\n5. La preuve : cas, chiffres, démonstration, témoignages vérifiables.\n6. Les objections : les trois principales, traitées explicitement.\n7. Le prix : affiché clairement, avec ce qu'il comprend.\n8. La garantie : juste avant le bouton.\n9. L'appel à l'action : répété, identique à chaque occurrence.\n\nLa longueur est une conséquence, pas un objectif. On écrit aussi long que nécessaire pour traiter les objections, et aussi court que possible pour le faire.\n\nLa preuve suit une règle simple : spécifique bat général. « 43 clientes ont utilisé ce générateur, 31 ont publié leur page dans les 7 jours » bat « des centaines de clientes satisfaites ».",
      example:
        "Une page de vente qui convertit à 4 % sur du trafic ciblé n'a pas besoin d'un nouveau design. Elle a souvent besoin d'un bloc de preuve manquant au mauvais endroit, ou d'une objection non traitée entre le prix et le bouton.",
      apply:
        "Écrivez la page dans l'ordre des questions du lecteur, pas dans l'ordre de vos idées. Chaque section doit répondre à une question précise du lecteur ; sinon, supprimez-la.",
      nuvra:
        "Dans Nuvra, ta page de vente est une page composée de blocs. Le bloc Checkout relie la page à ton produit et déclenche le paiement. Une fois la commande payée, le système inscrit automatiquement la cliente (si c'est une formation) ou lui livre l'accès, puis déclenche les automations. C'est un chemin technique complet, pas un formulaire à configurer.",
      action: {
        action: 'create_page',
        label: 'Créer ma page de vente',
        route: '/dashboard/pages?new=1',
        requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
        completionCheck: 'page_created',
        hint: 'Blocs : hero, features, social_proof, faq, checkout, cta.',
      },
      exercise: {
        title: 'Planifier sa page de vente',
        instructions:
          'Écris les neuf sections dans l’ordre, avec le contenu prévu pour chacune.',
        checklist: [
          'Neuf sections listées',
          'Preuve précise prévue',
          'Trois objections traitées',
          'Produit relié au checkout',
        ],
        worksheet: [
          { key: 'sections', label: 'Sections de la page', type: 'textarea' },
          { key: 'objections', label: 'Objections traitées', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'checkout',
      title: 'Checkout',
      short: 'L’étape où l’intention se transforme en argent.',
      objectives: [
        'Réduire la friction du paiement',
        'Comprendre ce qui fait abandonner un panier',
        'Tester un paiement de bout en bout',
      ],
      minutes: 9,
      intro:
        "Le checkout est l'étape la plus courte et la plus décisive. Rien ne se négocie ici : la personne a déjà décidé, elle ne fait plus qu'exécuter. Toute friction restante se paie en ventes perdues, silencieusement.",
      explain:
        "Les causes d'abandon les plus fréquentes.\n\nTrop de champs : chaque champ supplémentaire supprime une part des acheteurs. Le minimum viable est l'email, plus ce que la livraison exige réellement.\n\nCoût révélé tardivement : les frais affichés au dernier moment provoquent un abandon. Affiche le total avant le bouton.\n\nPas de moyen de paiement alternatif : si ta clientele utilise un moyen que tu n'as pas, elle partira.\n\nPas de réassurance : sans mention de sécurité, de politique de remboursement, ou de garantie visible, une partie des abandonne par prudence.\n\nLa bonne pratique est de tester soi-même le paiement complet, avec la vraie carte de test, jusqu'à la page de livraison. Un tunnel jamais testé est un tunnel qui perd de l'argent sans que personne ne le sache.",
      example:
        "Un checkout en trois champs (email, nom, carte) qui affiche le total, la garantie et la mention « sécurisé par Stripe » récupère en moyenne une part importante des paniers abandonnés sur un checkout à sept champs.",
      apply:
        "Teste le tunnel de bout en bout avant chaque mise en production : depuis la landing jusqu'à la réception de l'email de livraison. Note le temps total et chaque friction. Répare d'abord la friction la plus coûteuse, pas la plus visible.",
      nuvra:
        "Le checkout Nuvra crée une commande (order) avec ses lignes, applique les codes de réduction, calcule la part plateforme et déclenche le paiement via Stripe — ou un paiement de test explicitement identifié si Stripe n'est pas configuré. Une commande payée devient une inscription, une livraison et des écritures comptables, sans double saisie.",
      exercise: {
        title: 'Tester son checkout',
        instructions:
          'Effectue un paiement de test complet et note chaque étape, son temps et toute friction.',
        checklist: [
          'Paiement testé de bout en bout',
          'Champs jugés nécessaires supprimés',
          'Total affiché avant le bouton',
          'Réassurance visible',
        ],
        worksheet: [
          { key: 'test', label: 'Résultat du test', type: 'textarea' },
          { key: 'frictions', label: 'Frictions identifiées', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'order-bump',
      title: 'Order bump',
      short: 'Une offre complémentaire proposée au moment du paiement.',
      objectives: [
        'Comprendre le mécanisme de l’order bump',
        'Choisir une offre complémentaire cohérente',
        'Mesurer son effet sur le panier moyen',
      ],
      minutes: 7,
      intro:
        "L'order bump est une offre affichée au moment du paiement, acceptée en un clic. C'est la technique la plus rentable du marketing digital, parce qu'elle ne coûte aucune acquisition supplémentaire : la personne est déjà en train de payer.",
      explain:
        "Le principe : sur la page de paiement, une case pré-cochée propose un article additionnel. La personne peut refuser en un clic.\n\nCe qui fait la différence : la cohérence. L'offre doit compléter l'achat principal, pas le concurrencer. Une formation avec un workbook, un template avec un guide d'usage, un produit avec un service d'installation.\n\nLe prix doit être aligné sur la valeur perçue, généralement entre 20 % et 50 % du produit principal, avec un cadrage de l'économie (« ajoutez le workbook à 27 € au lieu de 39 € séparément »).\n\nL'éthique et la conformité : en Europe, une case pré-cochée doit être explicitement acceptée, pas implicite. Une case pré-cochée sans consentement clair est une pratique commerciale discutable, et dans plusieurs juridictions une infraction. On l'affiche, on l'explique, et le refus doit être aussi simple que l'acceptation.",
      example:
        "Produit principal : formation à 197 €. Order bump : « Templates de 30 pages de vente » à 39 €, acceptables ou refusables en un clic, en dessous du prix séparé (49 €). Panier moyen : 197 € → 236 € sur environ un tiers des commandes.",
      apply:
        "Prépare une seule offre complémentaire, clairement reliée au produit principal, avec un prix et un bénéfice explicites. Mesure ensuite le taux d'ajout et l'effet net sur le panier moyen, pas le chiffre de ventes.",
      nuvra:
        "Dans Nuvra, l'order bump se gère au niveau de la commande : une ligne supplémentaire est attachée à la commande en cours de paiement. Le montant total est recalculé avant validation, et chaque ligne apparaît dans le détail de la commande et dans les statistiques.",
      exercise: {
        title: 'Concevoir un order bump',
        instructions: 'Choisis l’offre complémentaire, son prix et son affichage.',
        checklist: [
          'Offre complémentaire cohérente',
          'Prix inférieur au prix séparé',
          'Bénéfice formulé en une ligne',
          'Acceptation et refus explicites',
        ],
        worksheet: [
          { key: 'bump', label: 'Order bump', type: 'textarea' },
          { key: 'prix', label: 'Prix', type: 'text' },
        ],
      },
    },
    {
      slug: 'upsell',
      title: 'Upsell',
      short: 'Proposer une offre supérieure immédiatement après l’achat.',
      objectives: [
        'Concevoir un upsell pertinent',
        'Définir la fenêtre de présentation',
        'Éviter la saturation de l’offre',
      ],
      minutes: 8,
      intro:
        "L'upsell est une offre présentée après l'achat, plus élevée que le produit initial. Son taux de succès dépend entièrement de la pertinence perçue : mal choisi, il agace et fait fuir ; bien choisi, il double le revenu par cliente.",
      explain:
        "Le moment optimal est la page de remerciement, lorsque l'intention d'achat est encore active. L'upsell est alors une décision prise dans un état favorable, pas une relance à froid.\n\nLa règle de pertinence est stricte : l'upsell doit résoudre un problème que le produit principal a créé ou laissé ouvert. Un produit de base à 27 € qui laisse « il faut ensuite configurer un outil » se vend bien avec un service d'installation à 197 €.\n\nLe format compte : un upsell à 97 € ou 197 € se décide sur une page. Un upsell à 2 000 € demande un appel, pas une page. Ne présentez jamais un montant que la personne ne peut pas absorber sur le moment.\n\nLa saturation est le risque principal : trop d'offres, trop vite, et la relation se dégrade. Une règle pragmatique : une offre complémentaire par achat, avec une promesse claire, puis on attend.",
      example:
        "Formation « 7 jours » à 197 € → upsell « Session de configuration de 45 minutes » à 147 € sur la page de remerciement. Taux typique : 8 à 15 % des acheteurs acceptent.",
      apply:
        "Écris ton upsell en une phrase : « Si vous avez X, voici Y. » Si tu ne trouves pas de X lié à ton produit, tu n'as pas d'upsell. Garde un seul upsell par achat pendant les premières semaines.",
      nuvra:
        "Dans Nuvra, l'upsell est une page de type CUSTOM ou LANDING créée après l'étape de commande du tunnel, ou une offre simplement ajoutée à la commande. Tu peux mesurer sa taux d'acceptation dans tes commandes et dans les statistiques du produit.",
      exercise: {
        title: 'Concevoir un upsell',
        instructions: 'Formule le problème, l’offre et le prix de ton upsell.',
        checklist: [
          'Problème clairement relié au produit',
          'Prix absorbable sur la page de remerciement',
          'Une seule offre complémentaire',
          'Page de remerciement reliée',
        ],
        worksheet: [
          { key: 'upsell', label: 'Upsell', type: 'textarea' },
          { key: 'prix', label: 'Prix', type: 'text' },
        ],
      },
    },
    {
      slug: 'downsell',
      title: 'Downsell',
      short: 'Une alternative accessible pour ceux qui refusent l’offre principale.',
      objectives: [
        'Comprendre la fonction d’un downsell',
        'Éviter l’effet « tunnel sombre »',
        'Choisir entre remboursement et alternative',
      ],
      minutes: 7,
      intro:
        "Le downsell est une alternative moins chère, présentée à la personne qui vient de refuser l'offre principale ou de l'abandonner son panier. Son rôle n'est pas de ruiner la proposition : c'est de transformer un refus en engagement plus petit.",
      explain:
        "Deux usages légitimes.\n\nLe downsell de panier : la personne a déclaré son intention d'achat, mais le prix l'arrête. Proposer un palier inférieur capte la demande au lieu de la laisser filer. La proportion captée est plus faible, mais le coût d'acquisition étant déjà engagé, la rentabilité reste bonne.\n\nLe downsell dBodeguard refus : après un refus explicite, on propose une version allégée. C'est acceptable si l'alternative est honnête.\n\nCe qui rend un downsell destructeur : l'enchaînement de pages de plus en plus agressives, le prix qui baisse de façon artificielle, et l impression de manipulation. Une règle simple : une seule page alternative, avec un lien de sortie visible.\n\nLe timing compte : un downsell doit apparaître immédiatement après le refus, pas trois écrans plus tard. Plus il est tardif, plus il est intrusif.",
      example:
        "Formation à 497 € refusée → page « Session de démarrage de 45 minutes » à 149 €, avec un contenu réellement différent (pas une version alléguée de la même formation), et un lien « Merci, je préfère ne rien acheter » visible.",
      apply:
        "Prépare une seule alternative, avec un contenu réellement distinct. Vérifie qu'une personne peut refuser définitivement en un clic, sans nouvelle page.",
      nuvra:
        "Dans Nuvra, un downsell est une page supplémentaire du tunnel, avec son propre produit (souvent à prix inférieur) et son propre bloc de paiement. Les commandes restent distinctes dans Payments, ce qui permet de comparer les deux offres dans Analytics.",
      exercise: {
        title: 'Préparer son downsell',
        instructions: 'Décris l’alternative, son prix et sa différence de contenu.',
        checklist: [
          'Alternative avec contenu distinct',
          'Prix clairement inférieur',
          'Lien de sortie visible',
          'Une seule page alternative',
        ],
        worksheet: [
          { key: 'downsell', label: 'Downsell', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'thank-you-page',
      title: 'Thank You Page',
      short: 'La page qui transforme une commande en cliente suivie.',
      objectives: [
        'Concevoir une page de remerciement utile',
        'Relier la page à l’onboarding',
        'Éviter les pages de remerciement vides',
      ],
      minutes: 7,
      intro:
        "La page de remerciement est la page la plus sous-utilisée du tunnel. C'est pourtant la seule page que chaque acheteuse voit à 100 % — et c'est celle qui peut déclencher un achat complémentaire, une activation ou un partage.",
      explain:
        "Elle a trois missions.\n\nConfirmer : montrer ce qui vient d'être acheté, avec les informations utiles (accès, facture, prochaine étape). L'incertitude post-achat génère des demandes de support et des demandes de remboursement.\n\nOrienter : dire quoi faire maintenant, dans l'ordre. « Connectez-vous, téléchargez, faites l'étape 1 ».\n\nProlonger : introduire l'upsell, la prochaine étape, ou l'ancien client dans le parcours.\n\nTechniquement, la page de remerciement est le point de bascule : c'est là que le paiement a réussi, que la livraison a été déclenchée, et que l'automaton d'accueil a démarré. Tout ce qui suit se joue en quelques minutes : le taux d'activation de la formation dépend directement de la qualité de cette page.\n\nUne page vide « Merci pour votre achat » gaspille l'instant le plus précieux de la relation.",
      example:
        "Page efficace : « C'est payé. Voici votre accès. Trois étapes pour démarrer : 1) connectez-vous, 2) regardez la leçon 1 (11 min), 3) répondez à l'email de bienvenue. Et si tu veux configurer ton offre avec un expert, voici l'option. »",
      apply:
        "Écrivez votre page de remerciement comme si vous accueilliez une cliente en personne : ce que vous dites, dans quel ordre, et ce que vous lui demandez ensuite.",
      nuvra:
        "Nuvra crée cette page pour vous. Le checkout renvoie vers une page de type THANKYOU que tu peux personnaliser (blocs texte, next steps, upsell). Le déclencheur purchase.completed y déclenche l'automation de bienvenue : premier email, tag client, et inscription automatique si l'achat porte sur une formation.",
      action: {
        action: 'create_page',
        label: 'Créer ma page de remerciement',
        route: '/dashboard/pages?new=1',
        requiredEntity: 'Une page Nuvra enregistrée dans votre espace',
        completionCheck: 'page_created',
        hint: 'Type THANKYOU : confirmation, prochaines étapes, upsell.',
      },
      exercise: {
        title: 'Rédiger sa page de remerciement',
        instructions: 'Écris la confirmation, les prochaines étapes et l’appel à l’action.',
        checklist: [
          'Confirmation immédiate de l’achat',
          'Trois prochaines étapes listées',
          'Appel à l’action unique',
          'Option d’upsell intégrée',
        ],
        worksheet: [
          { key: 'merci', label: 'Contenu de la page de remerciement', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'livraison',
      title: 'Livraison',
      short: 'Faire en sorte que l’achat produise exactement ce qui a été promis.',
      objectives: [
        'Choisir le mode de livraison adapté au produit',
        'Automatiser la livraison au maximum',
        'Contrôler que la livraison fonctionne avant de vendre',
      ],
      minutes: 8,
      intro:
        "La livraison est la promesse tenue. Un tunnel peut être parfait et tout perdre si l'acheteuse ne reçoit pas ce qu'elle attendait dans le bon délai. C'est aussi là que se joue le nombre de demandes de remboursement.",
      explain:
        "Quatre modes de livraison, selon le produit.\n\nAccès immédiat : l'acheteuse reçoit un lien ou un accès dans la minute. C'est le mode le plus valorisant et le plus simple à automatiser.\n\nTéléchargement : lien de fichier envoyé automatiquement. Vérifie que le lien est stable et que le fichier s'ouvre.\n\nInscription à une formation : l'acheteuse est inscrite automatiquement, reçoit ses accès et entre dans l'onboarding.\n\nService humain : un rendez-vous, un audit. C'est le seul mode qui ne s'automatise pas, et c'est normal : tu vends du temps, pas de l'automatisation.\n\nLe contrôle qualité est non négociable : avant de vendre, fais le chemin complet en tant qu'acheteuse. Si un accès ne fonctionne pas, tu vas le découvrir par des remboursements, qui sont toujours plus coûteux qu'une vérification.",
      example:
        "Une formation vendue sans test d'accès génère 8 à 15 % de demandes de support et une part de remboursements qui aurait pu être évitée par un simple test de connexion avant la mise en ligne.",
      apply:
        "Écris la procédure de livraison de chaque produit, puis exécute-la toi-même de bout en bout. Note chaque temps d'attente réel : c'est lui que vous devez promettre au client, pas celui que vous imaginez.",
      nuvra:
        "Dans Nuvra, la livraison est déclenchée par la finalisation de la commande. Un produit numérique est mis à disposition, une formation inscrit automatiquement l'acheteuse, et un service crée une fiche client avec le bon statut. Aucune intervention manuelle n'est nécessaire, et chaque livraison est tracée dans la commande.",
      exercise: {
        title: 'Vérifier sa livraison',
        instructions: 'Simule un achat complet et vérifie chaque élément reçu.',
        checklist: [
          'Accès ou fichier reçu',
          'Délai réel mesuré',
          'Facture ou reçu accessible',
          'Email de livraison reçu',
        ],
        worksheet: [
          { key: 'livraison', label: 'Test de livraison', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'suivi-client',
      title: 'Suivi client',
      short: 'Ce qui se passe après l’achat détermine la deuxième commande.',
      objectives: [
        'Définir les points de contact post-achat',
        'Segmenter les clientes selon leur engagement',
        'Créer un rituel de suivi',
      ],
      minutes: 8,
      intro:
        "La vente ne se termine pas au paiement. Le client satisfaction, la recommandation et la deuxième commande se jouent dans les jours qui suivent, et presque toujours par un système plutôt que par une attention individuelle.",
      explain:
        "Le suivi post-achat répond à trois questions.\n\nA-t-elle reçu ce qu'elle a acheté ? L'email de livraison et un message de satisfaction à J+2 règlent la majorité des dudas.\n\nA-t-elle réussi ? Le premier résultat obtenu. Une cliente qui n'a pas de résultat à J+14 ne recommandera jamais et demandera souvent un remboursement.\n\nA-t-il y a une prochaine étape ? Une offre complémentaire pertinente, une formation suivante, un service.\n\nLa segmentation évite le gaspillage : une cliente qui a terminé et réussi reçoit un upsell ; une cliente inactive reçoit une relance d'activation, pas un upsell. Dans Nuvra, les tags et le statut de contact permettent précisément cette distinction.\n\nLe bon rythme : J0 livraison, J2 satisfaction, J7 première action, J14 résultat, J30 offre. Ce rythme n'est pas magique : il suit simplement le rythme réel d'un être humain qui démarre une nouvelle pratique.",
      example:
        "Séquence type : J0 email de livraison + accès ; J2 « as-tu pu te connecter ? » ; J7 première action guidée ; J14 « quel résultat as-tu obtenu ? » ; J30 offre de coaching pour ceux qui ont terminé. Les clientes qui ont obtenu un résultat à J14 convertissent 3 à 4 fois plus à J30.",
      apply:
        "Écris votre séquence de suivi post-achat avant de vendre. Cinq messages, un par étape, avec un objectif clair chacun. Vous éviterez ainsi de laisser les clientes sans nouvelle après l'achat.",
      nuvra:
        "Nuvra exécute cette séquence pour vous. Un déclencheur purchase.completed lance des automations qui envoient des emails, ajoutent un tag « cliente », et créent une fiche dans Customers. Une séquence email peut être déclenchée par un événement, avec des délais en heures, et chaque étape est mesurée.",
      action: {
        action: 'create_automation',
        label: 'Créer mon automation de suivi',
        route: '/dashboard/automations?new=1',
        requiredEntity: 'Une automatisation Nuvra active',
        completionCheck: 'automation_created',
        hint: 'Déclencheur purchase.completed → email de bienvenue client.',
      },
      exercise: {
        title: 'Planifier le suivi',
        instructions: 'Écris les cinq messages post-achat avec leur objectif.',
        checklist: [
          'Message J0 (livraison)',
          'Message satisfaction',
          'Message première action',
          'Message résultat',
          'Message offre',
        ],
        worksheet: [
          { key: 'sequence', label: 'Séquence de suivi', type: 'textarea' },
        ],
      },
    },
    {
      slug: 'mesurer-les-conversions',
      title: 'Mesurer les conversions',
      short: 'Chaque étape a un indicateur, et l’ensemble a un diagnostic.',
      objectives: [
        'Calculer les taux de conversion par étape',
        'Identifier l’étape qui perd le plus de clients',
        'Décider quoi corriger en priorité',
      ],
      minutes: 9,
      intro:
        "Un tunnel sans chiffres est une opinion. Le but de la mesure n'est pas de produire un rapport, mais de répondre à une seule question : par où les gens partent-ils ?",
      explain:
        "Pour un tunnel de cinq étapes, on calcule un taux par transition.\n\nÉtape A → B : B / A.\n\nÉtape B → C : C / B.\n\nLe taux le plus faible désigne l'étape à corriger — pas nécessairement celle où le nombre absolu est le plus petit. Une page qui perd 90 % sur 10 000 visiteurs est plus grave qu'une page qui perd 30 % sur 50.\n\nTrois ordres de grandeur à connaître pour situer un tunnel de capture email : 30 à 50 % de conversion landing → email est excellent ; 15 à 30 % est correct ; sous 10 % indique un problème de promesse ou de friction.\n\nLa fréquence de mesure compte : sur un trafic faible, les variations naturelles peuvent dépasser ton effet. Ne change qu'une variable à la fois, et attends assez de données pour conclure.",
      example:
        "Diagnostic : 10 000 visites landing, 900 leads (9 %), 90 ventes (10 % des leads). Le premier taux est faible, le second est faible : les deux sont à corriger, mais la landing d'abord, car elle conditionne le volume de tout le reste.",
      apply:
        "Écris le tableau de conversion de ton tunnel avec les chiffres réels des sept derniers jours. Identifie la plus grande fuite absolue, corrige-la, et remesure. Une seule correction par cycle.",
      nuvra:
        "Nuvra enregistre les vues de page, les leads créés par formulaire, les commandes et les contacts. Dans Analytics, tu trouves les volumes par page ; dans Customers, l'historique de chaque contact ; dans Payments, les commandes avec leur source. La mesure est déjà en place : il reste à la regarder chaque semaine.",
      action: {
        action: 'open_analytics',
        label: 'Ouvrir mes statistiques',
        route: '/dashboard/analytics',
        requiredEntity: 'Une lecture du tableau de bord Statistiques',
        completionCheck: 'analytics_consulted',
        hint: 'Regarde les vues, les leads et les commandes de la semaine.',
      },
      exercise: {
        title: 'Calculer ses conversions',
        instructions: 'Remplis le tableau de ton tunnel avec des chiffres réels.',
        checklist: [
          'Nombre de visiteurs en entrée',
          'Nombre de leads',
          'Nombre de commandes',
          'Étape identifiée comme la plus grande fuite',
        ],
        worksheet: [
          { key: 'tableau', label: 'Tableau de conversion', type: 'textarea' },
        ],
      },
      quiz: {
        title: 'Quiz — Mesurer les conversions',
        passingScore: 80,
        questions: [
          {
            question: "Landing : 1 000 visiteurs, 120 leads (12 %). Lead → vente : 6 ventes (5 %). Que corriger en priorité ?",
            options: [
              'Le checkout',
              'La page de vente / le suivi des leads',
              'La landing (12 % est faible)',
              'Le prix',
            ],
            answerIndex: 2,
            explanation:
              "Les deux taux sont faibles, mais la landing conditionne le volume : 12 % de capture indique un problème de promesse ou de friction en amont.",
          },
          {
            question:
              "Sur un tunnel, que mesure le taux de conversion d'une étape à l'autre ?",
            options: [
              'Le nombre de visiteurs venus de Google',
              'La part des visiteurs d\'une étape qui passent à l\'étape suivante',
              'Le prix du produit vendu',
              'La vitesse de chargement de la page',
            ],
            answerIndex: 1,
            explanation:
              "C'est un ratio entre deux étapes du même tunnel : il isole la friction exacte, là où le taux global la mélange avec les autres.",
          },
          {
            question:
              "Pourquoi mesurer chaque étape d'un tunnel séparément ?",
            options: [
              "Pour avoir plus de chiffres à afficher",
              "Pour isoler la friction exacte, au lieu de la noyer dans un taux global",
              "Pour comparer avec la concurrence",
              "Pour réduire le nombre de pages",
            ],
            answerIndex: 1,
            explanation:
              "Un taux global moyenne toutes les frictions. Le taux par étape dit où agir, et donc quoi corriger en premier.",
          },
        ],
      },
    },
    {
      slug: 'construire-son-premier-funnel',
      title: 'Construire son premier funnel dans Nuvra',
      short: 'Assembler, relier et publier un tunnel complet.',
      objectives: [
        'Créer un funnel et ordonner ses étapes',
        'Relier les pages aux produits',
        'Publier et tester le tunnel complet',
      ],
      minutes: 10,
      example:
        "Rachid a une page de vente et une page de remerciement dans Nuvra, mais aucune liaison. Il crée un funnel « Sprint Offre », y rattache ses cinq pages dans l'ordre, choisit les types LANDING, LEAD, SALES, CHECKOUT et THANKYOU, relie son produit au bloc de paiement, publie, puis teste le parcours complet. Les contacts et les commandes apparaissent enfin rattachés au même entonnoir dans Analytics.",
      intro:
        "C'est le lab du module. Les quatorze leçons précédentes deviennent un objet : un tunnel Nuvra, avec des étapes ordonnées, des pages reliées, un produit connecté et un parcours testé.",
      explain:
        "Le travail se fait en quatre temps.\n\nCréer le funnel : donne-lui un nom qui décrit l'objectif (« Sprint Offre — 7 jours »), pas seulement un type.\n\nRelier les pages : chaque étape du tunnel est une page déjà créée. On les rattache dans l'ordre, en indiquant leur type : LANDING, LEAD, SALES, CHECKOUT, UPSELL, DOWNSELL, THANKYOU, DELIVERY.\n\nConnecter le produit : la page de vente doit contenir un bloc de paiement relié à un produit publié, sinon le tunnel ne peut pas encaisser.\n\nPublier et tester : publie, puis parcours le tunnel en entier. Chaque étape doit s'enchaîner sans page blanche, et le paiement doit aboutir.\n\nUn tunnel publié et testé vaut infiniment plus qu'un tunnel dessiné dans un document : c'est le seul qui rapporte, et le seul que tu puisses améliorer avec des données.",
      apply:
        "Construis ce tunnel avec ton offre réelle, pas un exemple. Le temps investi dans un vrai tunnel est du temps d'activité, pas de la théorie.",
      nuvra:
        "Voici le parcours exact : ouvre Funnels, crée un tunnel, ajoute tes pages, ordonne les étapes, publie. Ta page de vente contient le bloc Checkout relié à ton produit. Le tunnel devient ton système de vente, mesurable dans Analytics.",
      action: {
        action: 'create_funnel',
        label: 'Ouvrir le Funnel Builder',
        route: '/dashboard/funnels?new=1',
        requiredEntity: 'Un tunnel Nuvra avec ses étapes',
        completionCheck: 'funnel_created',
        hint: 'Crée ton tunnel et relie tes pages dans l’ordre.',
      },
      exercise: {
        title: 'Construire et publier un tunnel',
        instructions:
          'Assemble un tunnel complet dans Nuvra et teste le parcours de bout en bout.',
        checklist: [
          'Funnel créé',
          'Landing + formulaire reliés',
          'Page de vente reliée au produit',
          'Checkout fonctionnel',
          'Upsell et page de remerciement en place',
          'Tunnel publié et testé',
        ],
        worksheet: [
          { key: 'funnel', label: 'Tunnel créé', type: 'text' },
          { key: 'test', label: 'Résultat du test de bout en bout', type: 'textarea' },
        ],
      },
      resources: [
        {
          title: 'Modèle de tunnel de 6 étapes',
          kind: 'TEMPLATE',
          description: 'La structure complète, avec les indicateurs attendus à chaque étape.',
        },
      ],
      video: {
        narration:
          "On assemble tout : le funnel, ses étapes, la page de vente reliée au produit, le checkout qui aboutit. Le tunnel est publié. Le module suivant fera la même chose avec un produit plus complexe : la formation.",
      },
    },
  ],
};
