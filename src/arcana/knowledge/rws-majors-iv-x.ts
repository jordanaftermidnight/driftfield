// ============================================================================
// DRIFTFIELD — RWS MAJOR ARCANA IV–X
// Full interpretation trees: Emperor, Hierophant, Lovers, Chariot,
// Strength, Hermit, Wheel of Fortune
// ============================================================================

import type { CardKnowledge, DomainInterpretation } from './types';

function d(upCore: string, upAdv: string, upWarn: string, upAff: string,
           revCore: string, revAdv: string, revWarn: string, revAff: string): DomainInterpretation {
  return {
    upright: { core: upCore, advice: upAdv, warning: upWarn, affirmation: upAff },
    reversed: { core: revCore, advice: revAdv, warning: revWarn, affirmation: revAff }
  };
}

export const RWS_MAJORS_IV_X: CardKnowledge[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // IV — THE EMPEROR
  // ════════════════════════════════════════════════════════════════════════════
  {
    cardId: 'major-04', cardName: 'The Emperor',
    coreMeaning: {
      upright: 'Structure, authority, and the power that comes from having built something real. The Emperor has turned raw vision into concrete form through discipline and will.',
      reversed: 'Rigidity, domination, or the collapse of structure. Authority exercised without wisdom becomes tyranny; structure without flexibility becomes a prison.',
    },
    keywords: { upright: ['authority', 'structure', 'stability', 'discipline', 'leadership', 'father'], reversed: ['tyranny', 'rigidity', 'domination', 'inflexibility', 'power struggle', 'chaos'] },
    domains: {
      love: d(
        'A relationship grounded in stability and commitment. The Emperor brings structure to love — not passion, but the framework that allows passion to endure. This may also indicate a partner with strong paternal or protective energy.',
        'Build the container for love. Romance without structure dissipates; structure gives it a place to grow.',
        'Stability can calcify into control. Make sure protection hasn\'t become possession.',
        'You deserve a love that is both strong and safe.',
        'Control dynamics are poisoning the relationship. One partner is dominating — setting rules, restricting freedom, confusing authority with care. Alternatively, the relationship lacks any structure at all and is drifting.',
        'Examine where power sits in this relationship. If it\'s all on one side, something needs to shift.',
        'Mistaking jealousy for love or control for protection is a dangerous pattern.',
        'You can be strong without being controlling. Real strength makes space for others.'
      ),
      career: d(
        'You are building something with real foundations — or you should be. The Emperor in career says: establish structure, create systems, lead with clarity. This is not the time for improvisation; it\'s the time for planning and execution.',
        'Create the plan. Define the roles. Set the deadlines. The Emperor succeeds through organization, not inspiration.',
        'Don\'t confuse being the boss with being right. Leadership requires listening.',
        'You have the capacity to build something that lasts.',
        'Rigid management or authoritarian leadership is causing problems. Systems have become bureaucratic rather than functional. Alternatively, you\'re in a career with no structure at all — no clear path, no accountability, no growth framework.',
        'Ask whether your systems serve people or whether people serve your systems.',
        'Micromanagement destroys the very competence you\'re trying to ensure.',
        'Sometimes the strongest thing a leader can do is let go of control.'
      ),
      spiritual: d(
        'Spiritual discipline and practice. The Emperor in the spiritual domain points to the value of structure in spiritual life — regular practice, committed study, the container that holds the ecstatic experience so it can be integrated rather than lost.',
        'Build a practice, not just a collection of peak experiences. Daily discipline transforms more than occasional insight.',
        'Spiritual authority should always be questioned. The Emperor can become the dogmatist.',
        'Your spiritual practice has real foundations. Trust the structure you\'ve built.',
        'Spiritual rigidity — following rules instead of spirit, confusing the map for the territory. Religious authoritarianism or spiritual bypassing through rigid structure.',
        'Loosen the grip. The divine doesn\'t fit neatly into any system, including yours.',
        'When spiritual practice becomes performance or obligation, it has lost its purpose.',
        'You don\'t need permission from any authority to have your own experience of the sacred.'
      ),
      health: d(
        'Disciplined approach to health. Regular routines, consistent habits, and the kind of health management that comes from treating your body as something worth governing well.',
        'Structure your health like you structure your work. Consistent small actions outperform heroic occasional efforts.',
        'Rigidity in health routines can become obsessive. Discipline should serve vitality, not control.',
        'Your body responds to consistent care. The structure you build will hold.',
        'Health routines have become rigid or have collapsed entirely. Either you\'re over-controlling your diet/exercise to the point of harm, or you\'ve abandoned all structure and your health is reflecting it.',
        'Find the middle ground between military precision and total chaos.',
        'Orthorexia and excessive exercise discipline can be forms of the reversed Emperor. Health should feel freeing, not punishing.',
        'You can rebuild structure without returning to rigidity. Start with one good habit.'
      ),
      creative: d(
        'Creative work benefits from structure right now. Set the boundaries, create the framework, and let creativity fill the container. This is the editing phase, the organizing phase — giving form to raw material.',
        'Impose structure on the creative chaos. Outline the book. Plan the album. Set the deadlines.',
        'Too much structure kills creative spontaneity. Use the frame to support the work, not cage it.',
        'Your creative vision is strong enough to survive the discipline of execution.',
        'Creative block caused by too much structure, or creative chaos caused by none. The work is either over-planned and lifeless or formless and never finished.',
        'If you\'re stuck, break one rule. If you\'re scattered, create one constraint.',
        'Perfectionism is the Emperor reversed in creative clothing. Done beats perfect.',
        'The creative process has its own authority. Trust it more than your plans.'
      ),
      financial: d(
        'Financial stability through discipline and planning. Budgets, savings plans, investment strategies — the Emperor builds wealth through consistent, structured action.',
        'Build the financial foundation. Budget. Save. Plan. The Emperor doesn\'t gamble; he builds.',
        'Financial control can become financial anxiety if taken too far. Money is a tool, not a measure of worth.',
        'You have the discipline to build genuine financial security.',
        'Financial systems have broken down, or financial control has become obsessive. Overspending without structure, or hoarding money out of fear rather than wisdom.',
        'Rebuild the budget from scratch. Know what comes in, what goes out, and where the gaps are.',
        'Financial control that extends to controlling others\' spending is a power issue, not a money issue.',
        'Financial recovery starts with one honest look at the numbers.'
      ),
      family: d(
        'The father figure, or the principle of paternal authority in the family. Structure, rules, and boundaries that create safety. A family that functions well because roles are clear and expectations are fair.',
        'Provide the structure your family needs. Clear boundaries are an act of love.',
        'Authority without warmth creates distance. The Emperor must also be the protector, not just the rule-maker.',
        'Your family is stronger for the structure you provide.',
        'Authoritarian family dynamics — controlling parent, rigid rules, power imbalances. Or the opposite: a family with no structure, no boundaries, where chaos reigns.',
        'Examine inherited power dynamics. Are you repeating patterns from your own upbringing?',
        'Children raised under tyranny either submit or rebel. Neither is thriving.',
        'You can provide structure without becoming the authority figure you feared.'
      ),
      self: d(
        'Self-discipline and personal authority. You are becoming someone who can govern their own life — making decisions from a place of clarity rather than reaction.',
        'Take command of your own life. Nobody else is going to structure your days, your goals, or your boundaries for you.',
        'Self-discipline that becomes self-punishment has crossed a line. Govern yourself with the same compassion you\'d want from a leader.',
        'You are your own highest authority.',
        'Loss of personal agency, or self-tyranny. Either you\'ve surrendered control of your life to others, or you\'re so rigidly self-controlled that there\'s no room for spontaneity, pleasure, or genuine feeling.',
        'Where have you given away your power? Where have you wielded it too harshly against yourself?',
        'Self-control that leaves no room for self-compassion is just another form of violence.',
        'You can reclaim your authority without becoming rigid. Strength is flexible.'
      ),
      general: d(
        'Structure, authority, and the establishment of order. Something in your life needs to be organized, led, or built with intention. The Emperor arrives when the situation calls for decisive, structured action.',
        'Take charge. Make the plan. Execute with discipline.',
        'Authority without empathy creates compliance, not loyalty.',
        'You have the ability to build something lasting and real.',
        'Power struggles, rigidity, or structural collapse. Authority is being misused, or structure has been lost entirely.',
        'Examine where the power lies and whether it\'s being exercised wisely.',
        'The structures you\'ve built may need to evolve. Rigidity breaks; flexibility endures.',
        'Rebuilding is not failure. It\'s the Emperor\'s most important skill.'
      ),
    },
    positions: {
      situation: { positionKey: 'situation', frame: 'The situation is defined by structure — or the need for it. Authority and order are the central themes.', emphasis: 'structure and power' },
      challenge: { positionKey: 'challenge', frame: 'The challenge is maintaining authority without rigidity, or building structure where none exists.', emphasis: 'balance of power' },
      advice: { positionKey: 'advice', frame: 'Take a structured approach. Plan, organize, lead.', emphasis: 'discipline and planning' },
      outcome: { positionKey: 'outcome', frame: 'This leads to stability and established order — but only if authority is exercised wisely.', emphasis: 'lasting structure' },
      hidden: { positionKey: 'hidden', frame: 'Hidden power dynamics are at work. Someone or something is exerting control behind the scenes.', emphasis: 'invisible authority' },
      past: { positionKey: 'past', frame: 'Past structures — perhaps a father figure, an institution, or a rigid system — have shaped the current situation.', emphasis: 'inherited structure' },
      crossing: { positionKey: 'crossing', frame: 'What crosses you is rigidity — either your own or someone else\'s. Inflexibility is the obstacle.', emphasis: 'the cost of control' },
    },
    emotionalModifiers: {
      anxious: { toneShift: 'Anxiety often stems from feeling out of control. The Emperor suggests that building structure — even small structures — can ground you.', gentleOpening: 'When everything feels chaotic, creating one small structure can be an anchor.' },
      frustrated: { toneShift: 'Frustration with authority or systems that don\'t work. The Emperor asks whether you\'re fighting the structure or rebuilding it.', gentleOpening: 'The systems aren\'t working. But rage at the system changes nothing. What can you actually build?' },
      hopeful: { toneShift: 'Hope paired with the Emperor is powerful. You have both the vision and the discipline to manifest it.', gentleOpening: 'Your optimism has a foundation. The plan you\'re building can hold the weight of your ambition.' },
    },
    interactions: [
      { otherCardId: 'major-03', relationship: 'mirrored_by', description: 'Emperor and Empress: masculine and feminine creative principles. Structure meets abundance.', narrativeBridge: 'The balance between discipline and nurture is at the heart of this reading.' },
      { otherCardId: 'major-16', relationship: 'opposed_by', description: 'The Tower destroys what the Emperor builds. When these appear together, structures are being tested or broken.', narrativeBridge: 'Something you\'ve built is under pressure. The question is whether it was built to last.' },
      { otherCardId: 'major-00', relationship: 'opposed_by', description: 'The Fool leaps; the Emperor plans. Freedom versus structure.', narrativeBridge: 'The tension between spontaneity and discipline defines this moment.' },
    ],
    fieldResponses: {
      positiveHigh: 'The field is strongly structured. Your plans have extra gravitational pull right now — ideas that would normally scatter are holding together.',
      positiveMild: 'Mild positive field supports organization. A good day for planning and building.',
      neutral: 'The field is balanced. Structures will hold if they\'re well-built; weak foundations will show.',
      negativeMild: 'Mild negative field introduces instability. Double-check your plans; a flaw may be hiding.',
      negativeHigh: 'The field pushes against rigidity. Structures that lack flexibility are at risk of breaking. Adaptability is required.',
    },
    correspondences: {
      element: 'fire', zodiac: 'Aries', hebrewLetter: 'He',
      treeOfLifePath: '15 (Chokmah to Tiphareth)',
      numerology: 4,
      birthChartResonance: 'As an Aries, The Emperor speaks to your core nature — the builder, the initiator, the one who imposes order on chaos. This card is deeply personal for you.',
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // V — THE HIEROPHANT
  // ════════════════════════════════════════════════════════════════════════════
  {
    cardId: 'major-05', cardName: 'The Hierophant',
    coreMeaning: {
      upright: 'Tradition, established wisdom, and the transmission of knowledge through structure. The teacher, the institution, the system that has endured because it carries real value.',
      reversed: 'Dogma, hypocrisy, or the need to break from a tradition that no longer serves. The institution has become the message, rather than the vessel for it.',
    },
    keywords: { upright: ['tradition', 'conformity', 'education', 'institutions', 'mentorship', 'wisdom'], reversed: ['dogma', 'rebellion', 'hypocrisy', 'non-conformity', 'personal belief', 'breaking free'] },
    domains: {
      love: d(
        'Commitment through established forms — marriage, formal partnership, or a relationship that follows conventional structures. This may also indicate a shared belief system or value set that unites the couple.',
        'Honor the traditions that give your relationship meaning. Rituals of connection matter.',
        'Convention for its own sake can suffocate. Make sure the forms serve the feeling.',
        'There is deep wisdom in the commitments you\'ve made.',
        'The relationship is constrained by convention, external expectations, or inherited beliefs about what relationships should look like. Someone is following rules instead of following their heart.',
        'Question the unexamined rules governing your relationship. Whose expectations are you actually meeting?',
        'Staying in a relationship because you\'re "supposed to" is a disservice to both people.',
        'Your love life doesn\'t need to fit anyone else\'s template.'
      ),
      career: d(
        'Working within established systems — corporate structure, academic institutions, traditional career paths. The Hierophant succeeds by mastering the existing rules before attempting to change them.',
        'Learn the system. Mentorship and formal education are worth the investment right now.',
        'Playing the game too well can make you forget why you started playing.',
        'The expertise you\'re building within this structure has real, lasting value.',
        'Institutional dysfunction, office politics, or a career path that requires conformity at the expense of authenticity. You may need to forge your own path outside the traditional system.',
        'Sometimes you have to leave the institution to save what the institution was supposed to protect.',
        'Blind obedience to corporate culture corrodes integrity.',
        'Your unconventional path is not a failure. It\'s a different kind of education.'
      ),
      spiritual: d(
        'Organized spiritual practice, religious community, or the guidance of a spiritual teacher. The Hierophant in the spiritual domain represents wisdom transmitted through lineage.',
        'A teacher or tradition has something to offer you. Be a genuine student before you try to be a teacher.',
        'Devotion to a teacher can become dependency. Learn, but keep your own inner authority intact.',
        'The spiritual tradition you follow carries genuine transmission. Trust it.',
        'Religious dogma, spiritual authoritarianism, or disillusionment with organized belief systems. The institution has failed its own teachings.',
        'Separate the teaching from the institution. The truth may outlive the vessel that carried it.',
        'Spiritual leaders who demand obedience rather than inspire devotion are false hierophants.',
        'Your direct experience of the sacred is valid, with or without institutional approval.'
      ),
      health: d(
        'Conventional medicine, established treatment protocols, or seeking guidance from medical professionals. Trust the system here; it exists for a reason.',
        'Consult the experts. This is not the time for alternative approaches without professional guidance.',
        'Blind faith in any system — medical or alternative — without your own research is abdication, not trust.',
        'Established medical wisdom has your best interests at heart.',
        'Dissatisfaction with conventional medical approaches, or a sense that the healthcare system isn\'t serving you. You may need a second opinion or an integrative approach.',
        'Advocate for yourself within the system. If something feels wrong, speak up.',
        'Dismissing conventional medicine entirely in favor of unproven alternatives carries real risk.',
        'You have the right to question your treatment plan and seek answers that satisfy you.'
      ),
      creative: d(
        'Learning craft through tradition — studying the masters, apprenticing, working within established forms before innovating. The Hierophant says: learn the rules before you break them.',
        'Study your craft\'s traditions. Originality built on mastery is more durable than novelty alone.',
        'Becoming too attached to traditional forms can prevent evolution.',
        'The foundation you\'re building through discipline will support everything that follows.',
        'Creative conformity — making work that follows trends rather than vision. The creative institution (gallery, publisher, label) is dictating the work rather than serving it.',
        'Make the work that\'s yours, not the work that\'s expected.',
        'Chasing validation from gatekeepers can hollow out the creative impulse.',
        'The most important creative traditions started as heresies.'
      ),
      financial: d(
        'Conservative, established financial approaches — savings, index funds, proven investment strategies. The Hierophant advises against innovation in finance right now.',
        'Follow established financial wisdom. This is not the moment for speculative ventures.',
        'Even conventional wisdom needs periodic review. Don\'t let tradition substitute for thinking.',
        'The boring, disciplined financial approach is the one that works.',
        'Financial advice from trusted institutions may be self-serving. Banks and advisors have their own interests.',
        'Question who profits from the financial advice you\'re following.',
        'Conventional financial planning doesn\'t account for everyone\'s reality. Adapt the principles.',
        'Financial independence sometimes means building something the traditional path doesn\'t offer.'
      ),
      family: d(
        'Family traditions, cultural inheritance, and the wisdom passed down through generations. The values your family taught you are relevant to the current situation.',
        'Honor your family\'s traditions. They carry more wisdom than you might recognize.',
        'Tradition without examination can perpetuate harmful patterns. Keep what serves; release what doesn\'t.',
        'The best of what your family gave you is still alive in how you move through the world.',
        'Family expectations that don\'t fit who you are. Pressure to conform to traditional roles — marriage, career, religion — that don\'t align with your authentic self.',
        'You can love your family without living their expectations.',
        'Guilt about not conforming to family tradition often carries the weight of generations. It\'s heavy, but it\'s not yours to carry.',
        'Breaking a family pattern is one of the bravest things a person can do.'
      ),
      self: d(
        'Learning from established wisdom. You\'re in a phase of absorbing knowledge from those who came before — teachers, books, traditions, mentors.',
        'Be a student right now. Mastery comes later; humility comes first.',
        'Don\'t surrender your personal authority entirely to any teacher or system.',
        'There is genuine wisdom in what you\'re learning. Trust the process.',
        'Over-reliance on external authority or belief systems. You\'re seeking answers from others instead of developing your own understanding.',
        'You\'ve learned enough from others. It\'s time to form your own views.',
        'A perpetual student avoids the responsibility of their own knowledge.',
        'Your own wisdom is ready to be trusted. You don\'t need another guru.'
      ),
      general: d(
        'Tradition, teaching, and established systems. The situation involves conventional approaches, institutional frameworks, or the guidance of those with experience.',
        'Work within the system. The established path has value here.',
        'Convention that doesn\'t serve truth is just bureaucracy.',
        'The traditions you follow carry genuine wisdom.',
        'Rebellion against empty convention, or bondage to tradition that no longer serves.',
        'Distinguish between traditions that carry truth and those that carry only habit.',
        'Non-conformity for its own sake is just as mindless as conformity for its own sake.',
        'Sometimes the most radical act is to think for yourself.'
      ),
    },
    positions: {
      situation: { positionKey: 'situation', frame: 'The situation involves established systems, traditions, or institutional authority.', emphasis: 'convention and structure' },
      challenge: { positionKey: 'challenge', frame: 'The challenge is navigating between tradition and personal truth.', emphasis: 'conformity vs. authenticity' },
      advice: { positionKey: 'advice', frame: 'Seek guidance from established wisdom or experienced mentors.', emphasis: 'traditional wisdom' },
      outcome: { positionKey: 'outcome', frame: 'This leads toward deeper understanding through established channels — or away from them, if the tradition has failed.', emphasis: 'wisdom or liberation' },
      hidden: { positionKey: 'hidden', frame: 'Unexamined beliefs or inherited assumptions are shaping the situation invisibly.', emphasis: 'inherited beliefs' },
    },
    emotionalModifiers: {
      conflicted: { toneShift: 'The conflict between what you believe and what you were taught to believe is the central tension.', gentleOpening: 'It\'s okay to outgrow a belief system. Growth isn\'t betrayal.' },
      curious: { toneShift: 'Your curiosity is leading you toward deeper study. The Hierophant rewards genuine inquiry.', gentleOpening: 'The questions you\'re asking are the right ones. Keep following them.' },
    },
    interactions: [
      { otherCardId: 'major-02', relationship: 'mirrored_by', description: 'High Priestess and Hierophant: esoteric vs. exoteric wisdom. Inner knowing vs. transmitted teaching.', narrativeBridge: 'The tension between what you know intuitively and what you\'ve been taught defines this moment.' },
      { otherCardId: 'major-16', relationship: 'opposed_by', description: 'The Tower destroys the Hierophant\'s institution. Revolutionary destruction of established order.', narrativeBridge: 'The structures you trusted are being challenged. Not everything that falls deserved to stand.' },
    ],
    fieldResponses: {
      positiveHigh: 'The field supports tradition and structure. Conventional approaches carry extra weight right now.',
      positiveMild: 'Mild positive field favors working within established systems.',
      neutral: 'The field is neutral — neither favoring convention nor rebellion. The choice is entirely yours.',
      negativeMild: 'The field introduces gentle friction with convention. Question what you\'ve accepted without examination.',
      negativeHigh: 'The field pushes hard against dogma. Institutions that lack genuine wisdom are exposed.',
    },
    correspondences: { element: 'earth', zodiac: 'Taurus', hebrewLetter: 'Vav', treeOfLifePath: '16 (Chokmah to Chesed)', numerology: 5, birthChartResonance: 'As a Taurus, The Hierophant speaks to your deep connection with tradition, stability, and the values you hold sacred.' },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // VI — THE LOVERS
  // ════════════════════════════════════════════════════════════════════════════
  {
    cardId: 'major-06', cardName: 'The Lovers',
    coreMeaning: {
      upright: 'Choice, alignment, and the union that comes from choosing authentically. Not just romantic love — the deeper choice to align your actions with your values.',
      reversed: 'Misalignment, disharmony, or avoidance of a necessary choice. What appears to be a relationship problem is often a values problem.',
    },
    keywords: { upright: ['choice', 'love', 'union', 'alignment', 'harmony', 'values'], reversed: ['disharmony', 'imbalance', 'misalignment', 'avoidance', 'temptation', 'poor choices'] },
    domains: {
      love: d(
        'Deep authentic connection — or the choice that makes such connection possible. This is the card of genuine partnership where both people choose each other with full awareness. The angel above the lovers in the RWS image represents the higher purpose that the union serves.',
        'Choose this person — or choose to be fully present with them. Half-commitments create half-relationships.',
        'The Lovers is a choice card, not a destiny card. Love without conscious choosing becomes complacency.',
        'What you have — or what is coming — is worth the vulnerability it requires.',
        'The relationship is out of alignment. You may be staying out of obligation, fear, or convenience rather than genuine choosing. Or a choice between two paths (or two people) is being avoided.',
        'Make the choice you\'ve been avoiding. Indecision is its own kind of cruelty — to yourself and to others.',
        'Choosing nobody because you can\'t choose between two options is still a choice, and it\'s the worst one.',
        'You deserve a love you would choose again every morning.'
      ),
      career: d(
        'A career choice that must align with your values, not just your ambitions. The Lovers in career asks: does this work reflect who you actually are? The right career decision feels like coming home.',
        'Choose the path that aligns with your values, even if it\'s harder. Alignment is more sustainable than advancement.',
        'Money and values don\'t always align. Be clear about which one you\'re optimizing for.',
        'The career path that reflects your authentic self will sustain you longer than the one that merely impresses.',
        'Career misalignment — doing work that contradicts your values, or facing a professional choice you keep deferring.',
        'If your work makes you uncomfortable in ways you can\'t resolve, the discomfort is information.',
        'Selling out feels fine until it doesn\'t. And by then, the cost of change has compounded.',
        'It is not too late to choose a path that feels true.'
      ),
      spiritual: d(
        'The integration of opposites — masculine and feminine, conscious and unconscious, human and divine. The Lovers in the spiritual domain represents the sacred marriage within the self.',
        'Align your outer life with your inner truth. The spiritual path is not separate from the lived path.',
        'Spiritual duality — the tendency to split the world into sacred and profane — is the trap. Everything is one thing.',
        'Your inner and outer worlds are moving into alignment.',
        'Spiritual division — living one way while believing another. The gap between your professed values and your actual behavior is the source of suffering.',
        'Close the gap between what you believe and how you live. Even one step toward alignment changes everything.',
        'Spiritual hypocrisy isn\'t always obvious. Sometimes it looks like reading about enlightenment while avoiding your own shadow.',
        'Integration is not perfection. It\'s the willingness to bring all of yourself to the path.'
      ),
      health: d(
        'Choosing health as an act of self-love rather than self-punishment. The body and mind in harmony. This may also point to a health choice that needs to be made.',
        'Approach your health with love, not warfare. Your body is not the enemy.',
        'Health choices made from shame or fear don\'t last. Choose from love.',
        'Your body deserves the same tenderness you give to the people you love.',
        'Mind-body disconnect. Health choices that come from self-punishment rather than self-care, or avoidance of a health decision.',
        'Stop punishing your body for not being what you want it to be. Start treating it as what it is: the only home you\'ll ever have.',
        'Ignoring a health choice doesn\'t make it go away. It makes it louder.',
        'You can make a different choice about your health starting now. Right now.'
      ),
      creative: d(
        'Creative work that is authentically yours — not derivative, not performative, but genuinely aligned with who you are. The Lovers blesses creative partnerships and collaborations.',
        'Make the work that feels true, not the work that feels safe. Authentic creation requires vulnerability.',
        'Creative partnerships need clear communication about values and vision, not just enthusiasm.',
        'The creative work you\'re doing — or about to do — is an expression of something real.',
        'Creative inauthenticity — making work to please others instead of expressing truth. Creative partnerships in misalignment.',
        'If the work doesn\'t feel like yours anymore, trace back to where you lost it.',
        'A creative partnership without shared values will produce technically competent work that means nothing.',
        'Return to what made you want to create in the first place.'
      ),
      financial: d(
        'A financial choice that needs to align with your values. This might mean choosing a lower-paying job that matches your principles, or making a financial decision in partnership.',
        'Make financial decisions based on values, not just returns. What good is profit that costs you yourself?',
        'Joint financial decisions require genuine alignment, not just compromise.',
        'Financial choices made from integrity build a different kind of wealth.',
        'Financial decisions made from misaligned values — spending to impress, earning in ways that contradict your beliefs, or financial conflict in a partnership.',
        'Get clear on what you actually value before making this financial decision.',
        'Money conflicts in relationships are almost never about money.',
        'Financial integrity is worth more than financial optimization.'
      ),
      family: d(
        'Family harmony through genuine choosing — staying connected not out of obligation but out of authentic love. Major family choices (marriage, moving, merging families) are highlighted.',
        'Choose your family role consciously, not habitually.',
        'Family harmony that requires one person to suppress their truth isn\'t harmony; it\'s sacrifice.',
        'The family you\'re building — or maintaining — reflects a genuine choice to love.',
        'Family disharmony rooted in misaligned values or avoided choices. The family gathering where nobody says what they actually mean.',
        'Address the thing nobody in the family is willing to name.',
        'Keeping peace at the expense of truth teaches everyone that truth is dangerous.',
        'A family can survive honesty. It cannot survive permanent pretense.'
      ),
      self: d(
        'Self-integration. The Lovers in the self domain represents the choice to be whole — to stop splitting yourself into acceptable and unacceptable parts.',
        'Choose yourself. All of yourself. The parts you show the world and the parts you hide.',
        'Self-acceptance is not self-indulgence. Accepting a flaw is different from excusing a pattern.',
        'You are ready to stop pretending to be less — or different — than what you are.',
        'Internal conflict. You\'re at war with yourself — different parts of you wanting different things, unable to integrate.',
        'Identify the two selves that are fighting. What does each one want? Is there a choice that honors both?',
        'Living as a fraction of yourself because the whole is inconvenient is a slow kind of death.',
        'You don\'t have to resolve every contradiction. You just have to stop pretending the contradictions aren\'t there.'
      ),
      general: d(
        'A significant choice must be made — one that aligns action with values. This is not a trivial decision; it defines direction.',
        'Choose with your whole self. Head and heart in agreement.',
        'Avoiding the choice is itself a choice, and usually the worst one available.',
        'The choice before you is an opportunity to align your life with your truth.',
        'Misalignment or an avoided choice. What needs to be decided is being deferred.',
        'Make the choice you\'ve been avoiding. The delay is costing more than the decision would.',
        'Disharmony often stems from trying to have it both ways when a clear choice is needed.',
        'Clarity of choice creates clarity of path.'
      ),
    },
    positions: {
      situation: { positionKey: 'situation', frame: 'The situation centers on a choice or the quality of alignment in a relationship or commitment.', emphasis: 'choice and alignment' },
      challenge: { positionKey: 'challenge', frame: 'The challenge is making a genuine choice rather than drifting or compromising.', emphasis: 'authentic choosing' },
      advice: { positionKey: 'advice', frame: 'Align your actions with your values. Choose authentically.', emphasis: 'values-based action' },
      outcome: { positionKey: 'outcome', frame: 'This leads to harmony if the choice is genuine, or ongoing tension if it\'s avoided.', emphasis: 'alignment or dissonance' },
      hidden: { positionKey: 'hidden', frame: 'An unacknowledged choice or misalignment is operating beneath the surface.', emphasis: 'hidden disharmony' },
    },
    emotionalModifiers: {
      conflicted: { toneShift: 'The conflict IS the message. The Lovers doesn\'t resolve the conflict — it insists you make a choice.', gentleOpening: 'The inner war you\'re fighting has an end. But it requires a decision, not a compromise.' },
      hopeful: { toneShift: 'Hope and The Lovers together suggest genuine alignment is possible and close at hand.', gentleOpening: 'What you\'re hoping for is available. The only requirement is that you choose it fully.' },
      grieving: { toneShift: 'Grief for a love lost or a choice unmade. The Lovers acknowledges that real love involves real loss.', gentleOpening: 'The love was real. The loss is real. Both things are true.' },
    },
    interactions: [
      { otherCardId: 'major-15', relationship: 'opposed_by', description: 'The Devil is the Lovers\' shadow — bondage where there should be choice, addiction where there should be love.', narrativeBridge: 'The line between devotion and dependency is the central question.' },
      { otherCardId: 'major-14', relationship: 'amplified_by', description: 'Temperance and The Lovers together: harmony, balance, and integration at the highest level.', narrativeBridge: 'What you\'re building has the potential for genuine, sustained harmony.' },
    ],
    fieldResponses: {
      positiveHigh: 'The field is deeply harmonious. Choices made now carry alignment energy — they stick, they feel right, they integrate.',
      positiveMild: 'Mild positive field supports authentic connection and clear-eyed choosing.',
      neutral: 'The field is balanced. The choice is entirely yours — no external push in either direction.',
      negativeMild: 'Mild negative field introduces doubt. But doubt before a major choice is healthy, not paralyzing.',
      negativeHigh: 'The field disrupts harmony. Misalignment is being exposed. This is uncomfortable but necessary.',
    },
    correspondences: { element: 'air', zodiac: 'Gemini', hebrewLetter: 'Zayin', treeOfLifePath: '17 (Binah to Tiphareth)', numerology: 6, birthChartResonance: 'As a Gemini, The Lovers speaks directly to your nature — the duality, the choosing, the integration of multiple selves into one authentic whole.' },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // VII — THE CHARIOT
  // ════════════════════════════════════════════════════════════════════════════
  {
    cardId: 'major-07', cardName: 'The Chariot',
    coreMeaning: {
      upright: 'Victory through willpower and focused direction. Opposing forces harnessed toward a single goal. The triumph is earned, not given.',
      reversed: 'Loss of direction or control. The forces you\'re trying to harness are pulling in different directions, and willpower alone isn\'t enough.',
    },
    keywords: { upright: ['determination', 'willpower', 'triumph', 'control', 'direction', 'momentum'], reversed: ['loss of control', 'scattered energy', 'aggression', 'obstacles', 'defeat', 'directionless'] },
    domains: {
      love: d('Forward momentum in a relationship — overcoming obstacles together, moving toward a shared goal. The Chariot in love is commitment as a verb: active, directed, effortful.', 'Drive the relationship forward. Passive love stagnates; active love builds.', 'Forcing a relationship to move at your pace ignores the other person\'s rhythm.', 'The effort you\'re putting into this relationship is building something real.',
              'Relationship moving too fast, or opposing desires pulling the partnership apart. One person is driving while the other is being dragged.', 'Slow down enough to check that you\'re both going the same direction.', 'A relationship where one person is always steering is not a partnership; it\'s a vehicle.', 'You can redirect without starting over. Pause is not the same as stop.'),
      career: d('Career momentum — promotions, project completion, overcoming professional obstacles through sheer will. This is the card of the ambitious achiever.', 'Push through. The obstacles are real but your will is stronger.', 'Ambition without rest creates burnout. Winning the battle while losing yourself is a hollow victory.', 'You are closer to the goal than it feels. Keep moving.',
              'Career stalling out, scattered professional energy, or ambition without clear direction. Working hard but going nowhere.', 'Stop pushing and reassess the direction. Effort in the wrong direction is wasted.', 'Confusing busyness with progress is the most common professional trap.', 'Recalibration is not retreat. Sometimes the bravest thing is to change course.'),
      spiritual: d('Spiritual discipline applied with fierce determination. The warrior-monk energy — will directed toward transcendence.', 'Apply the same fierce focus to your spiritual life that you apply to your worldly goals.', 'Spiritual attainment cannot be forced. The will opens the door; grace walks through it.', 'Your spiritual determination is a rare and powerful force.',
              'Spiritual ego — trying to conquer enlightenment like a territory. The will has become the obstacle.', 'Surrender is not defeat. The spiritual path requires both strength and softness.', 'You cannot arrive at peace through force. That\'s the paradox.', 'Let go of achieving and simply be present. That\'s the destination.'),
      health: d('Active health management, physical discipline, and the determination to overcome health challenges. Recovery through willpower.', 'Channel your determination toward your health. This is a fight you can win.', 'Pushing through pain without listening to it can cause more damage.', 'Your body responds to your will more than you think.',
              'Pushing too hard physically or ignoring the body\'s need for rest. Health recovery stalling because you\'re forcing rather than flowing.', 'Rest is not weakness. Your body needs recovery as much as it needs effort.', 'Overtraining injuries are the Chariot reversed in physical form.', 'Healing has its own timeline. Respect it.'),
      creative: d('Creative momentum — the project that is moving, the work that has found its direction and is being driven to completion.', 'Drive the work home. You have momentum; use it before it dissipates.', 'Rushing to finish can compromise the work. Speed without craft is just velocity.', 'The creative force moving through you right now is powerful. Trust it.',
              'Creative projects stalling or pulled in too many directions at once. The energy is scattered.', 'Pick one direction and commit to it. Multidirectional effort produces nothing.', 'Creative ambition that exceeds current capacity leads to abandoned projects.', 'One finished project is worth twenty abandoned ones.'),
      financial: d('Financial gains through determined effort. Aggressive but controlled financial strategy paying off.', 'Push toward the financial goal. The momentum is with you.', 'Financial aggression without discipline is just gambling with more confidence.', 'Your financial discipline is about to pay off.',
              'Financial losses from overextension or loss of control over spending. Money moving too fast in the wrong direction.', 'Pull back, reassess, and regain control of the financial vehicle.', 'Momentum in the wrong financial direction gets worse, not better.', 'Financial recovery starts with honest accounting of where you are.'),
      family: d('Family progress — moving toward a shared goal, overcoming family obstacles through unified effort.', 'Lead the family through this challenge. Your determination sets the tone.', 'Driving the family at your pace without checking in with others creates resentment.', 'Your family is stronger together than any obstacle you face.',
              'Family members pulling in different directions. Conflicting agendas that prevent forward movement.', 'The family needs a shared direction before it can move. Alignment first, action second.', 'A family where one person makes all the decisions is not unified; it\'s subjugated.', 'Finding common ground is more productive than finding a winner.'),
      self: d('Personal determination and the mastery of internal opposing forces. You are becoming someone who can direct their own energy with precision.', 'Harness the contradictions within you. They are not weaknesses — they are horses pulling your chariot.', 'The ego loves the Chariot because it looks like individual triumph. Check that your will is serving something larger than yourself.', 'You are capable of more than you have been doing.',
              'Internal chaos. Conflicting desires, scattered attention, inability to choose a direction and commit.', 'Identify the two forces pulling you apart and find the one goal they can both serve.', 'Willpower without direction is just restlessness.', 'You are not broken for feeling pulled in different directions. You are human.'),
      general: d('Victory through determined effort. Obstacles can be overcome with focused will.', 'Apply your full force to this situation. Half-measures won\'t cut it.', 'Determination that ignores context becomes stubbornness.', 'You have what it takes to push through this.',
              'Loss of direction or momentum. Forces working against you or pulling you apart.', 'Reassess your direction before spending more energy.', 'Pushing harder in the wrong direction only makes you more lost.', 'Pausing to recalibrate is strength, not surrender.'),
    },
    positions: {
      situation: { positionKey: 'situation', frame: 'The situation is defined by momentum and competing forces that need direction.', emphasis: 'will and direction' },
      challenge: { positionKey: 'challenge', frame: 'The challenge is maintaining direction while opposing forces pull at you.', emphasis: 'focus under pressure' },
      advice: { positionKey: 'advice', frame: 'Apply your will with precision. Drive forward with focused intent.', emphasis: 'determined action' },
      outcome: { positionKey: 'outcome', frame: 'Victory through perseverance — but only if the direction is right.', emphasis: 'earned triumph' },
      hidden: { positionKey: 'hidden', frame: 'Hidden forces are either propelling you forward or holding you back. Identify them.', emphasis: 'unseen momentum or drag' },
    },
    emotionalModifiers: {
      frustrated: { toneShift: 'Frustration is the Chariot\'s fuel when properly directed. Channel the anger into action.', gentleOpening: 'The frustration you feel is energy. It\'s asking to be aimed at something.' },
      excited: { toneShift: 'Excitement and the Chariot together: unstoppable forward energy. Just keep it on the road.', gentleOpening: 'Your energy right now is a force. Point it well.' },
    },
    interactions: [
      { otherCardId: 'major-08', relationship: 'mirrored_by', description: 'Chariot is external will; Strength is internal will. Force vs. patience.', narrativeBridge: 'The question is whether this moment needs force or patience.' },
      { otherCardId: 'major-10', relationship: 'amplified_by', description: 'The Chariot drives toward the Wheel\'s turning. Personal will meets cosmic timing.', narrativeBridge: 'Your effort aligns with a larger shift already in motion.' },
    ],
    fieldResponses: {
      positiveHigh: 'The field is surging forward. Your momentum has cosmic backup. Push hard; the timing is with you.',
      positiveMild: 'Mild positive field supports directed action. A good day for decisive moves.',
      neutral: 'The field is quiet. Momentum comes entirely from your own will right now.',
      negativeMild: 'Mild headwind. The field introduces resistance — not enough to stop you, but enough to test your direction.',
      negativeHigh: 'The field is actively opposing forward motion. This is either a sign to recalibrate or a test of genuine will.',
    },
    correspondences: { element: 'water', zodiac: 'Cancer', hebrewLetter: 'Cheth', treeOfLifePath: '18 (Binah to Geburah)', numerology: 7, birthChartResonance: 'As a Cancer, The Chariot reveals the fierce protective drive beneath your sensitive exterior. Your determination is stronger than others realize.' },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // VIII — STRENGTH
  // ════════════════════════════════════════════════════════════════════════════
  {
    cardId: 'major-08', cardName: 'Strength',
    coreMeaning: {
      upright: 'Power through patience, compassion, and inner fortitude. The strength to endure, to persuade rather than force, to tame the inner beast through gentleness rather than suppression.',
      reversed: 'Self-doubt, weakness of will, or raw instinct overpowering reason. The inner beast has slipped the leash, or the spirit has lost the will to hold it.',
    },
    keywords: { upright: ['courage', 'patience', 'compassion', 'inner strength', 'gentleness', 'influence'], reversed: ['self-doubt', 'weakness', 'raw emotion', 'loss of nerve', 'insecurity', 'overwhelm'] },
    domains: {
      love: d('Love sustained through patience, compassion, and quiet courage. This is not the dramatic love of The Lovers — this is the love that endures: gentle, strong, and unafraid of the other person\'s darkness.', 'Lead with patience. The relationship needs gentleness right now, not force.', 'Patience is not the same as tolerating the intolerable. Know the difference.', 'The love you offer — patient, strong, unafraid — is rare.',
              'Emotional overwhelm in the relationship, or loss of emotional control. You may be tolerating too much, or your own unprocessed emotions are causing harm.', 'Acknowledge what you\'re feeling before it speaks for you in ways you can\'t control.', 'Suppressing emotion until it erupts is not strength. It\'s a pressure cooker.', 'You are allowed to feel everything you\'re feeling. The question is what you do with it.'),
      career: d('Quiet professional strength — influence through competence and patience rather than dominance. The kind of authority that doesn\'t need to raise its voice.', 'Use soft power. Influence, persuade, demonstrate rather than demand.', 'Being patient with incompetence is not a virtue; it\'s enabling.', 'Your quiet strength is noticed by the people who matter.',
              'Professional self-doubt, imposter syndrome, or loss of confidence. Or alternatively, burning out because you\'ve been the strong one for too long.', 'Address the self-doubt directly. Name it. It loses power when seen.', 'Being everyone else\'s rock while your own foundation crumbles is unsustainable.', 'You don\'t have to be strong all the time to be strong.'),
      spiritual: d('The spiritual path of compassion and inner mastery. Taming the ego not through war but through love — the tantric approach, the way of integration rather than denial.', 'Befriend what frightens you in yourself. The shadow is tamed through inclusion, not exile.', 'Spiritual strength that performs its own gentleness is still a performance.', 'Your inner life has a fierceness that serves your growth. Don\'t domesticate it.',
              'Spiritual crisis of faith or inner conflict between instinct and aspiration.', 'Let the doubt speak. It may carry information your certainty was blocking.', 'Spiritual strength doesn\'t mean never being afraid. It means continuing in the presence of fear.', 'Even masters have dark nights. This is yours. It passes.'),
      health: d('Health through patient, sustained effort rather than dramatic intervention. Recovery that takes time but is genuine.', 'Be patient with your body\'s timeline. Healing is not linear and it rewards gentleness.', 'Pushing through illness or injury with willpower alone can cause more harm.', 'Your body is stronger than you\'re giving it credit for.',
              'Health suffering from neglected emotional needs. The body is speaking what the mind won\'t acknowledge.', 'Listen to what the body is saying. Fatigue, tension, and recurring illness often have emotional roots.', 'The body keeps the score. What are you asking it to hold?', 'Taking care of your emotional health IS taking care of your physical health.'),
      creative: d('Creative endurance — the strength to keep going when the work is difficult. The long project sustained by genuine passion rather than deadline pressure.', 'Trust the slow work. Some creative projects need time to ferment. This one is worth your patience.', 'Not every creative challenge responds to force. Sometimes the work needs space.', 'The creative stamina you\'re showing is the rarest and most valuable kind.',
              'Creative paralysis from self-doubt, or forcing creative work that needs gentleness.', 'Stop forcing. The muse comes to the patient, not the demanding.', 'Creative self-criticism that prevents creation is the opposite of strength.', 'The work wants to exist. Your job is to get out of its way.'),
      financial: d('Financial patience — the long game rather than the quick win. Compound growth, steady saving, delayed gratification.', 'Play the long game. Financial strength is built daily, not dramatically.', 'Patience with investments shouldn\'t become inaction. Review periodically.', 'Your financial discipline is an act of self-respect.',
              'Financial fear or loss of confidence in your ability to manage money.', 'Start small. Financial confidence rebuilds one good decision at a time.', 'Panic selling and emotional financial decisions are the reversed Strength in action.', 'You can regain financial footing. It starts with looking at the numbers honestly.'),
      family: d('Being the steady presence in the family — the one who holds space for others\' difficulties without absorbing them.', 'Be the calm center. Your family needs your steadiness more than your solutions.', 'Being the strong one in the family can become an identity trap. You need support too.', 'Your presence is a gift to the people around you.',
              'Family burnout from always being the strong one, or family conflict where emotions have overwhelmed patience.', 'Ask for help. You\'ve been carrying more than your share.', 'A family that relies on one person\'s strength is fragile, not strong.', 'You are allowed to need others. Needing isn\'t weakness.'),
      self: d('Inner fortitude, self-compassion, and the courage to face your own inner landscape. Strength turned inward is the most transformative force there is.', 'Treat yourself the way you\'d treat someone you love — with patience, honesty, and compassion.', 'Inner strength that becomes inner rigidity misses the point. Be strong AND soft.', 'You are braver than you think. The evidence is in what you\'ve already survived.',
              'Self-doubt so deep it\'s become a worldview. You\'ve internalized a story about your own weakness that isn\'t true.', 'Challenge the inner narrative of "not enough." When did you start believing it? Is it actually true?', 'Self-criticism that claims to be motivation is just disguised cruelty.', 'You have survived every worst day so far. That is strength.'),
      general: d('Quiet strength, patience, and inner resolve. This situation calls for courage expressed as composure, not force.', 'Be patient and persistent. Force is not required; fortitude is.', 'Patience has limits. Know when gentle persistence has become passive acceptance.', 'You are stronger than this situation requires. You will endure.',
              'Loss of confidence or emotional overwhelm. The situation feels beyond your capacity.', 'You are not as fragile as you feel right now. Take one small step.', 'Acknowledging that you\'re struggling is the first act of genuine strength.', 'This feeling is temporary. Your strength is not.'),
    },
    positions: {
      situation: { positionKey: 'situation', frame: 'The situation calls for patience, compassion, and quiet courage.', emphasis: 'endurance and grace' },
      challenge: { positionKey: 'challenge', frame: 'The challenge is maintaining composure and inner strength under pressure.', emphasis: 'patience under fire' },
      advice: { positionKey: 'advice', frame: 'Lead with patience and compassion. Gentleness is more effective than force here.', emphasis: 'soft power' },
      outcome: { positionKey: 'outcome', frame: 'This resolves through endurance and inner strength, not dramatic action.', emphasis: 'quiet triumph' },
      hidden: { positionKey: 'hidden', frame: 'Hidden reserves of strength you haven\'t yet recognized in yourself.', emphasis: 'untapped resilience' },
    },
    emotionalModifiers: {
      anxious: { toneShift: 'Anxiety tests strength. Strength here means holding steady while afraid.', gentleOpening: 'You\'re afraid, and that\'s okay. Courage isn\'t the absence of fear.' },
      grieving: { toneShift: 'Strength in grief means allowing the grief rather than fighting it. The bravest act is to feel what needs to be felt.', gentleOpening: 'The strongest thing you can do right now is let yourself feel this.' },
    },
    interactions: [
      { otherCardId: 'major-07', relationship: 'mirrored_by', description: 'Chariot is external force; Strength is internal mastery. Together, they suggest the complete warrior.', narrativeBridge: 'Both inner and outer strength are being called upon.' },
      { otherCardId: 'major-15', relationship: 'opposed_by', description: 'Strength overcomes what the Devil binds. Gentle will vs. compulsion.', narrativeBridge: 'The question is whether you master the instinct or it masters you.' },
    ],
    fieldResponses: {
      positiveHigh: 'The field rewards patience. Gentle approaches carry disproportionate power right now.',
      positiveMild: 'Mild positive supports quiet perseverance.',
      neutral: 'The field is balanced. Your inner state determines the outcome.',
      negativeMild: 'Mild challenge to your resolve. The test is real but manageable.',
      negativeHigh: 'The field tests your endurance. This is the moment that reveals what your strength is actually made of.',
    },
    correspondences: { element: 'fire', zodiac: 'Leo', hebrewLetter: 'Teth', treeOfLifePath: '19 (Chesed to Geburah)', numerology: 8, birthChartResonance: 'As a Leo, Strength is your native card — the lionheart, the one who leads through warmth and courage rather than dominance.' },
  },

  // Remaining cards IX and X use compact format to fit file size

  // IX — THE HERMIT
  {
    cardId: 'major-09', cardName: 'The Hermit',
    coreMeaning: {
      upright: 'Solitary seeking, inner wisdom, and the lantern that illuminates only the next step. The Hermit has withdrawn not from life but into the depths of it.',
      reversed: 'Isolation that has become avoidance, or a refusal to seek guidance when it\'s needed. Loneliness masquerading as independence.',
    },
    keywords: { upright: ['solitude', 'wisdom', 'introspection', 'guidance', 'inner light', 'contemplation'], reversed: ['isolation', 'loneliness', 'withdrawal', 'avoidance', 'paranoia', 'anti-social'] },
    domains: {
      love: d('A need for solitude within or from relationships. Time alone to understand what you want from love before committing to it.', 'Take the space you need. A relationship that can\'t survive your solitude can\'t survive at all.', 'Solitude as a permanent strategy in love is avoidance with a philosophy attached.', 'The time you spend alone is preparing you for deeper connection.',
              'Isolation in or from love. Pushing people away, emotional unavailability, or loneliness that you won\'t admit to.', 'Ask whether your solitude serves wisdom or fear.', 'There\'s a difference between being alone and being lonely. Be honest about which one this is.', 'You don\'t have to emerge from solitude until you\'re ready. But when you\'re ready, emerge.'),
      career: d('Working alone, specialized expertise, or a period of withdrawal to develop deep skill. The consultant, the researcher, the solo practitioner.', 'Go deep rather than wide. This is the time for expertise, not networking.', 'Isolation from colleagues can become a career blind spot.', 'The knowledge you\'re developing in solitude is genuinely valuable.',
              'Professional isolation, inability to collaborate, or hoarding knowledge.', 'Reconnect with peers. Even the Hermit eventually comes down from the mountain.', 'Expertise without the ability to share it is knowledge trapped in a cave.', 'You can share what you know without losing what makes it yours.'),
      spiritual: d('The contemplative path at its purest. Deep meditation, solitary retreat, the inner journey undertaken with a single candle and an honest heart.', 'Go inward. The answers you seek are not in the next book, workshop, or conversation. They\'re in the silence.', 'Spiritual solitude that avoids the world indefinitely is spiritual bypassing with better aesthetics.', 'Your inner light is real. Follow it.',
              'Spiritual isolation that has become despair, or spiritual seeking that avoids embodiment.', 'Come back to the world. Enlightenment that can\'t survive contact with others isn\'t enlightenment.', 'A spiritual practice that makes you less human is doing it wrong.', 'The light you carry was always meant to be shared. When you\'re ready.'),
      health: d('Rest, recovery, and listening to what the body needs in quiet. Health through slowing down rather than speeding up.', 'Rest is a health strategy, not a luxury.', 'Isolation from health support (doctors, trainers, accountability partners) can lead to neglect.', 'Your body heals best when you listen to it in stillness.',
              'Neglecting health through withdrawal, avoiding medical appointments, or isolating when you need support.', 'Reach out. Healing in complete isolation is slower and harder than it needs to be.', 'Pride that prevents asking for help with health issues is expensive pride.', 'You don\'t have to handle this alone.'),
      creative: d('Solitary creative work — the deep dive, the retreat, the uninterrupted focus that produces breakthrough work.', 'Create in solitude. The world can wait while you do the deep work.', 'Perfectionism disguised as "not ready to share" can keep work in the cave forever.', 'What you\'re creating in solitude has real depth.',
              'Creative isolation that has become stagnation. The work needs an audience, a collaborator, or just fresh air.', 'Show someone what you\'ve been making. The feedback will be less painful than the silence.', 'Art made in total isolation often forgets who it\'s for.', 'Sharing unfinished work is an act of courage the Hermit needs to learn.'),
      financial: d('Conservative, solitary financial management. Personal research before financial decisions. Not following the crowd.', 'Do your own research. The Hermit\'s financial decisions are informed, independent, and patient.', 'Financial decisions made in complete isolation lack perspective.', 'Your independent financial thinking is an asset.',
              'Financial isolation — not seeking advice, not disclosing problems, handling money issues alone.', 'A financial advisor or trusted peer can see what you can\'t from inside the situation.', 'Money problems kept secret tend to compound.', 'Asking for financial advice is wisdom, not weakness.'),
      family: d('Needing space from family to find yourself. Healthy boundaries expressed as temporary withdrawal.', 'Take the space. Your family will still be there when you return, and you\'ll return as a fuller person.', 'Family members may not understand your need for solitude. Communicate it rather than just disappearing.', 'The boundary you\'re setting is an act of love — for yourself and for them.',
              'Family estrangement or emotional withdrawal that has gone too far.', 'Consider whether the wall you\'ve built is still protecting you or just keeping everyone out.', 'Isolation from family that started as protection can calcify into permanent disconnection.', 'You can reconnect at your own pace. One conversation at a time.'),
      self: d('The journey inward. Deep self-knowledge sought through contemplation, solitude, and honest self-examination.', 'Turn the lantern inward. What you find may surprise you, but it won\'t destroy you.', 'Self-examination without self-compassion is just another form of self-punishment.', 'You are ready to know yourself more deeply. The light is in your hands.',
              'Withdrawal from life that has become avoidance. Self-examination that has become self-obsession.', 'You\'ve been inside long enough. It\'s time to bring what you\'ve learned back to the world.', 'Endless introspection without action is just a more sophisticated form of stalling.', 'The self you\'re seeking is not hidden. It\'s the one that shows up every day.'),
      general: d('A period of solitary seeking and inner guidance. The answer is found in stillness, not action.', 'Withdraw, reflect, and listen to the inner voice.', 'Solitude has a shelf life. Know when it\'s time to return.', 'The wisdom you seek is already within you.',
              'Isolation, withdrawal, or refusal to seek guidance when it\'s needed.', 'Come back to the world. Or if you\'re still inside, at least open a window.', 'Wisdom that never leaves the mountain helps nobody — including the wise.', 'You are allowed to need others. Seeking help is its own form of wisdom.'),
    },
    positions: {
      situation: { positionKey: 'situation', frame: 'The situation calls for introspection and solitary reflection.', emphasis: 'inner seeking' },
      challenge: { positionKey: 'challenge', frame: 'The challenge is knowing when solitude serves wisdom and when it serves avoidance.', emphasis: 'productive vs. destructive solitude' },
      advice: { positionKey: 'advice', frame: 'Go inward. Seek the answer in stillness.', emphasis: 'contemplation' },
      outcome: { positionKey: 'outcome', frame: 'Wisdom emerges from the period of reflection.', emphasis: 'earned insight' },
      hidden: { positionKey: 'hidden', frame: 'An inner knowing that hasn\'t been listened to yet.', emphasis: 'ignored wisdom' },
    },
    emotionalModifiers: {
      grieving: { toneShift: 'Grief and the Hermit together: the sacred solitude of mourning. This is not avoidance; it\'s the necessary cave.', gentleOpening: 'This time alone with your grief is holy. Don\'t let anyone rush you out of it.' },
      curious: { toneShift: 'Curiosity directed inward is the Hermit\'s natural state. Follow the questions into the silence.', gentleOpening: 'What you\'re curious about lives in the quiet. Make space to find it.' },
    },
    interactions: [
      { otherCardId: 'major-00', relationship: 'bridges_to', description: 'The Hermit finds what the Fool seeks. Wisdom earned through the journey.', narrativeBridge: 'What began as a leap of faith has matured into genuine understanding.' },
      { otherCardId: 'major-19', relationship: 'opposed_by', description: 'The Sun illuminates externally; the Hermit illuminates internally. Outward joy vs. inward wisdom.', narrativeBridge: 'The tension between public engagement and private reflection is asking to be resolved.' },
    ],
    fieldResponses: {
      positiveHigh: 'The field supports inward focus. Insights gained in solitude now carry extra clarity.',
      positiveMild: 'Mild positive energy favors quiet reflection.',
      neutral: 'The field is still. Perfect for listening.',
      negativeMild: 'Mild restlessness challenges the solitude. Use it as fuel for deeper questioning.',
      negativeHigh: 'The field disrupts peace. Your solitude is being tested — perhaps it\'s time to return.',
    },
    correspondences: { element: 'earth', zodiac: 'Virgo', hebrewLetter: 'Yod', treeOfLifePath: '20 (Chesed to Tiphareth)', numerology: 9, birthChartResonance: 'As a Virgo, The Hermit is your soul card — the analyst, the discerner, the one who seeks truth through careful, solitary examination.' },
  },

  // X — WHEEL OF FORTUNE
  {
    cardId: 'major-10', cardName: 'Wheel of Fortune',
    coreMeaning: {
      upright: 'The turning of cycles, fate in motion, and the reminder that everything changes. What goes up comes down; what\'s down comes up. The Wheel doesn\'t take sides.',
      reversed: 'Resisting inevitable change, bad luck that is actually delayed consequence, or feeling trapped in a cycle you can\'t escape.',
    },
    keywords: { upright: ['cycles', 'change', 'fate', 'luck', 'turning point', 'destiny'], reversed: ['bad luck', 'resistance', 'stuck in a cycle', 'setbacks', 'no control', 'stagnation'] },
    domains: {
      love: d('A turning point in your love life. The Wheel brings change — a new relationship, a shift in an existing one, or the ending of a cycle that has run its course.', 'Accept the turn. Love has seasons, and the season is changing.', 'The Wheel turns whether you\'re ready or not. Resistance doesn\'t stop it; it just makes it hurt more.', 'What is coming is better suited to who you\'re becoming.',
              'Feeling trapped in a relationship cycle — repeating the same patterns with different people, or stuck in a dynamic that feels inescapable.', 'Name the cycle. You can\'t break what you can\'t see.', 'Choosing the same type of partner while expecting different results is the relationship Wheel reversed.', 'You can step off this cycle. The first step is seeing it.'),
      career: d('Career change, a lucky break, or the natural cycle of professional development reaching a turning point.', 'Be ready for the shift. Opportunity favors the prepared.', 'Luck is timing plus readiness. If you\'re not prepared, the opportunity passes.', 'The professional cycle is turning in your favor.',
              'Career setbacks, bad timing, or feeling stuck in a professional rut that won\'t break.', 'Sometimes the Wheel needs a push. What one action could change the cycle?', 'Blaming bad luck for what is actually poor planning is comfortable but unproductive.', 'This phase is temporary. Cycles turn.'),
      spiritual: d('The karmic wheel — what you have sown is coming to harvest. Spiritual cycles completing, new ones beginning.', 'Observe the cycles in your life with awareness rather than reaction.', 'Not everything that happens is "meant to be." Some of it is just the Wheel turning mechanically.', 'You are exactly where you need to be in the cycle.',
              'Feeling spiritually trapped in a pattern — the same lessons appearing again and again.', 'The lesson keeps repeating because something hasn\'t been integrated. What haven\'t you learned yet?', 'Karma is not punishment. It\'s education.', 'The cycle breaks when the lesson lands. And you\'re closer than you think.'),
      health: d('Health cycles turning — recovery, improvement, or the natural rhythms of the body changing.', 'Work with your body\'s cycles rather than against them.', 'Ignoring the cyclical nature of health (energy levels, immune function, hormonal cycles) leads to frustration.', 'Your body knows how to heal. The cycle is turning toward wellness.',
              'Health setbacks or feeling stuck in a chronic condition cycle.', 'Cycles of illness and recovery have patterns. Track them; the pattern holds the information.', 'Chronic frustration with health cycles is understandable but not productive. Adapt the strategy.', 'Bad health phases end. The Wheel turns.'),
      creative: d('A creative turning point — breakthrough, new inspiration, or the completion of one creative cycle and the beginning of another.', 'Let the old project finish and the new one begin. Creative seasons change.', 'Clinging to a creative phase that has ended prevents the next one from arriving.', 'The creative energy shifting right now is opening new possibilities.',
              'Creative stagnation or feeling like you\'re repeating yourself.', 'If you\'re stuck in a loop, change one variable. A new medium, a new constraint, a new collaborator.', 'Creative repetition is comfortable but eventually suffocating.', 'The rut has an exit. You just haven\'t found it yet.'),
      financial: d('Financial fortune turning — an upturn, a windfall, or a shift in the economic cycle that affects you positively.', 'Be positioned to catch the upswing. The Wheel favors those who are already in motion.', 'What the Wheel gives, the Wheel takes. Don\'t treat good fortune as permanent.', 'The financial tide is turning in your favor.',
              'Financial downturn, unexpected expenses, or feeling trapped in a cycle of financial difficulty.', 'Downturns end. Use this phase to build better financial foundations for the next upturn.', 'Financial panic makes bad decisions. Breathe.', 'This is a phase, not a life sentence. The Wheel turns.'),
      family: d('Family dynamics shifting — a new member, a changed role, the natural evolution of family relationships.', 'Embrace the change in family structure. Growth requires adaptation.', 'Not all family change is welcome, but all of it is navigable.', 'Your family is evolving. That\'s healthy.',
              'Family stuck in dysfunctional cycles — the same arguments, the same roles, the same holidays.', 'Someone has to break the family pattern. It might need to be you.', 'Family cycles that persist across generations don\'t break easily. But they do break.', 'You are not destined to repeat your parents\' patterns.'),
      self: d('Personal transformation driven by forces larger than individual will. You are at a turning point in your own development.', 'Accept the change that\'s coming. Fighting the Wheel is exhausting and futile.', 'Fatalism is not the same as acceptance. You still have choices within the turning.', 'Who you are becoming is shaped by how you ride this turn.',
              'Feeling stuck in personal patterns, unable to change despite wanting to.', 'The pattern has a structure. Find the structure and you find the exit.', 'The most common trap is thinking you\'re stuck when you\'re actually choosing.', 'You are not your patterns. You are the one who can see them.'),
      general: d('Change is coming — or already here. A turning point in the situation. The Wheel says: this too shall change.', 'Accept and adapt. Rigidity breaks against the Wheel.', 'Good fortune doesn\'t last forever, and neither does bad fortune. Act accordingly.', 'The change that\'s happening is exactly what\'s needed.',
              'Stagnation, bad luck, or resistance to necessary change.', 'Stop fighting the current and start navigating it.', 'What feels like bad luck may be the natural consequence of previous choices.', 'This will pass. Everything does.'),
    },
    positions: {
      situation: { positionKey: 'situation', frame: 'The situation is defined by change, cycles, and forces beyond individual control.', emphasis: 'inevitable change' },
      challenge: { positionKey: 'challenge', frame: 'The challenge is accepting change you can\'t control.', emphasis: 'surrender without passivity' },
      advice: { positionKey: 'advice', frame: 'Adapt to the turning. Position yourself for what\'s coming.', emphasis: 'preparation and flexibility' },
      outcome: { positionKey: 'outcome', frame: 'The cycle completes. What was up may go down; what was down rises.', emphasis: 'the turn' },
      hidden: { positionKey: 'hidden', frame: 'A cycle you haven\'t recognized is driving events behind the scenes.', emphasis: 'unseen patterns' },
    },
    emotionalModifiers: {
      anxious: { toneShift: 'Anxiety about change is natural. The Wheel says the change is coming regardless; your peace lies in adaptation.', gentleOpening: 'The uncertainty is uncomfortable. But the Wheel is already turning, and what comes next may surprise you positively.' },
      hopeful: { toneShift: 'Hope and the Wheel together: your optimism aligns with the natural turning. Good things are cycling in.', gentleOpening: 'Your hope isn\'t naive. It\'s aligned with what\'s actually coming.' },
    },
    interactions: [
      { otherCardId: 'major-21', relationship: 'amplified_by', description: 'Wheel of Fortune and The World: a complete cycle reaching its grand conclusion.', narrativeBridge: 'A major life cycle is completing. What began long ago is reaching its natural end.' },
      { otherCardId: 'major-13', relationship: 'amplified_by', description: 'The Wheel turns; Death transforms. Together, an irreversible change.', narrativeBridge: 'The change happening is not just a turn — it\'s a transformation. There is no going back.' },
    ],
    fieldResponses: {
      positiveHigh: 'The field amplifies the turn. The Wheel is spinning fast and in your favor. Ride it.',
      positiveMild: 'Mild positive suggests a gentle, favorable turn of events.',
      neutral: 'The field is still. The Wheel turns on its own axis, independent of the field.',
      negativeMild: 'The turn may be uncomfortable. It\'s still necessary.',
      negativeHigh: 'The field and the Wheel are both churning. Major change under pressure. Hold on and adapt.',
    },
    correspondences: { element: 'fire', planet: 'Jupiter', hebrewLetter: 'Kaph', treeOfLifePath: '21 (Chesed to Netzach)', numerology: 10, birthChartResonance: 'Jupiter governs the Wheel, and its placement in your chart shapes how you experience luck, expansion, and the great cycles of fortune.' },
  },

];
