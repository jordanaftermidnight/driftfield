// ============================================================================
// DRIFTFIELD — RWS MAJOR ARCANA KNOWLEDGE BASE
// Complete interpretation trees for 22 Major Arcana
// ============================================================================

import type { CardKnowledge } from './types';

export const RWS_MAJOR_ARCANA: CardKnowledge[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // 0 — THE FOOL
  // ════════════════════════════════════════════════════════════════════════════
  {
    cardId: 'major-00',
    cardName: 'The Fool',
    coreMeaning: {
      upright: 'A leap into the unknown with trust in the process. The beginning before the beginning, where potential is infinite and nothing has been decided.',
      reversed: 'Hesitation at the edge, or recklessness disguised as courage. The fear that prevents the leap, or the leap taken without looking.'
    },
    keywords: {
      upright: ['new beginnings', 'innocence', 'spontaneity', 'leap of faith', 'freedom', 'potential'],
      reversed: ['recklessness', 'fear of change', 'naivety', 'poor judgment', 'stagnation', 'holding back']
    },
    domains: {
      love: {
        upright: {
          core: 'A new romantic beginning is unfolding — or the invitation to approach love with fresh eyes. This card asks you to release the weight of past relationships and meet this moment as if it were the first. There is a purity of feeling here that defies calculation.',
          advice: 'Let yourself be surprised. The relationship that matters may not look like what you planned.',
          warning: 'Innocence is not the same as ignorance. Stay open but don\'t ignore what your instincts tell you.',
          affirmation: 'You are free to love without the burden of what came before.'
        },
        reversed: {
          core: 'Fear is blocking a new emotional beginning. You may be so scarred by past heartbreak that you refuse to step forward, or you\'re rushing into something without genuine feeling — using novelty as a distraction from deeper work.',
          advice: 'Ask yourself whether you\'re avoiding vulnerability or avoiding responsibility. The answer determines your next move.',
          warning: 'Impulsive romantic decisions made to escape loneliness tend to create more of it.',
          affirmation: 'Healing doesn\'t require you to be brave all at once. Small openings count.'
        }
      },
      career: {
        upright: {
          core: 'A new professional chapter is beginning. This could be a career change, a first job, a side project that becomes the main thing, or simply a radical shift in how you think about your work. The Fool doesn\'t know what\'s coming — and that\'s the point.',
          advice: 'Don\'t wait until you feel ready. Readiness is a myth the Fool has already abandoned.',
          warning: 'Enthusiasm without a plan can burn bright and fast. Channel the energy; don\'t just ride it.',
          affirmation: 'Your lack of experience in this space is not a weakness. It\'s a kind of vision.'
        },
        reversed: {
          core: 'You\'re either stuck in a role that no longer serves you but afraid to leave, or you\'re about to make a career move based on escapism rather than genuine calling. The reversed Fool asks: are you running toward something or away from something?',
          advice: 'Before you leap, ask what you\'re actually building. Adventure without direction is just wandering.',
          warning: 'Quitting without a foundation is not the same as taking a courageous risk.',
          affirmation: 'It\'s okay to want more. Just make sure "more" isn\'t "different for the sake of different."'
        }
      },
      spiritual: {
        upright: {
          core: 'The spiritual journey is beginning — or beginning again. The Fool is the seeker before any system has claimed them, approaching the mystery with eyes unclouded by doctrine. This is the card of the genuine spiritual experience, unmediated and raw.',
          advice: 'Let go of what you think you know. The deepest truths arrive when you stop trying to frame them.',
          warning: 'Spiritual seeking can become its own form of avoidance if it never grounds into practice.',
          affirmation: 'You don\'t need a teacher, a tradition, or a map. You need to take the first step.'
        },
        reversed: {
          core: 'Spiritual bypassing — using transcendence to avoid dealing with the real, messy, embodied human experience. Or alternatively, a deep fear of surrender that keeps you circling the threshold without ever crossing it.',
          advice: 'Come back to the body. Spirit lives there too.',
          warning: 'The ego loves to dress up as the seeker. Make sure the one asking the questions actually wants answers.',
          affirmation: 'Not knowing is not failing. It\'s the prerequisite for genuine discovery.'
        }
      },
      health: {
        upright: {
          core: 'A fresh start with your health or body. This might mean adopting a new approach to wellness, beginning an exercise practice, or simply shifting your relationship with your physical self. The energy is light and optimistic.',
          advice: 'Start small and stay curious. The body responds to joy more reliably than to discipline.',
          warning: 'New health regimens adopted with too much fervor tend to collapse. Sustainability matters more than intensity.',
          affirmation: 'Your body is not a problem to solve. It\'s a companion on this journey.'
        },
        reversed: {
          core: 'Neglecting health through avoidance or denial. You may be ignoring symptoms, avoiding check-ups, or treating your body carelessly because you\'re focused elsewhere. The reversed Fool\'s recklessness turns inward here.',
          advice: 'Pay attention to what your body is telling you. It\'s been talking; you haven\'t been listening.',
          warning: 'Invincibility is a young person\'s illusion. Address what needs addressing.',
          affirmation: 'Taking care of yourself is not vanity. It\'s the foundation everything else stands on.'
        }
      },
      creative: {
        upright: {
          core: 'Pure creative potential. A blank page, an empty canvas, a silence before the first note. The Fool in the creative domain is the moment before inspiration becomes craft — when anything is possible because nothing has been committed to yet.',
          advice: 'Make something without knowing where it\'s going. Let the process discover the destination.',
          warning: 'Infinite possibility can become infinite paralysis. At some point, you have to pick a direction.',
          affirmation: 'You don\'t need permission to create. The impulse itself is the permission.'
        },
        reversed: {
          core: 'Creative block rooted in fear of judgment, or conversely, producing chaotic work without intention. The reversed Fool either can\'t start or can\'t stop — both are expressions of disconnection from authentic creative impulse.',
          advice: 'If you\'re blocked, make something terrible on purpose. The block isn\'t about quality; it\'s about permission.',
          warning: 'Calling chaos "creativity" doesn\'t make it so. Even improvisation has structure underneath.',
          affirmation: 'Every creator you admire started exactly here: not knowing if they could do it.'
        }
      },
      financial: {
        upright: {
          core: 'A new financial phase. This could mean starting a business, making a first investment, or fundamentally changing your relationship with money. The Fool approaches finances with beginner\'s energy — which can be liberating or dangerous depending on how it\'s channeled.',
          advice: 'Take the calculated risk, not the blind one. The Fool\'s courage works best when paired with just enough planning to survive the fall.',
          warning: 'Optimism about money without financial literacy is expensive naivety.',
          affirmation: 'A fresh start with your finances is always available. Past mistakes don\'t have to define future decisions.'
        },
        reversed: {
          core: 'Financial recklessness or financial paralysis. Either spending without thought, gambling on bad odds, and ignoring the consequences — or being so afraid of financial risk that you miss genuine opportunities.',
          advice: 'Get honest about the numbers. Fear and fantasy are both allergic to spreadsheets.',
          warning: 'The money problems you\'re avoiding right now are growing in the dark.',
          affirmation: 'You can be responsible without being rigid. Financial wisdom and financial freedom coexist.'
        }
      },
      family: {
        upright: {
          core: 'A new chapter in family dynamics. This could be a new family member arriving, a reconciliation, or a decision to break from family patterns and forge your own path. The Fool here represents the courage to be different from where you came from.',
          advice: 'You can love your family and still choose a different life than the one they planned for you.',
          warning: 'Breaking from family patterns requires more than rebellion. It requires building something real in the space you\'ve cleared.',
          affirmation: 'Your family story is not your destiny. You are the author of the next chapter.'
        },
        reversed: {
          core: 'Repeating family patterns unconsciously, or cutting ties impulsively without processing the grief. The reversed Fool in the family domain suggests you\'re either trapped in inherited dysfunction or running from it without understanding it.',
          advice: 'You can\'t outrun what you haven\'t named. Look at the pattern before you try to break it.',
          warning: 'Estrangement is sometimes necessary but should never be reactive. Make it a choice, not a tantrum.',
          affirmation: 'Understanding where you came from doesn\'t mean staying there.'
        }
      },
      self: {
        upright: {
          core: 'You are at the threshold of becoming someone new. Not in a superficial sense — in the deepest sense of identity. The Fool in the self domain is about shedding who you\'ve been in order to discover who you\'re becoming. It requires trust in a process you can\'t fully see.',
          advice: 'Stop trying to figure out who you are. Start noticing who you\'re becoming.',
          warning: 'Identity change that\'s only aesthetic is costume, not transformation.',
          affirmation: 'You are allowed to not know who you are yet. That\'s not confusion — that\'s growth.'
        },
        reversed: {
          core: 'Identity crisis without forward motion. You know the old self doesn\'t fit anymore, but you\'re afraid to step into the unknown of who you might become. Or you\'re cycling through identities without committing to the inner work that makes any of them real.',
          advice: 'The discomfort you\'re feeling is not a sign that something is wrong. It\'s the feeling of outgrowing your shell.',
          warning: 'Reinvention without self-knowledge is just running in circles with better outfits.',
          affirmation: 'You don\'t have to have it figured out. You just have to be willing to keep going.'
        }
      },
      general: {
        upright: {
          core: 'Something is beginning. You stand at the edge of a new experience, and the only thing required is the willingness to step forward. The Fool doesn\'t promise a safe landing — it promises that the fall will teach you to fly.',
          advice: 'Trust the process. Not blindly — but with the kind of trust that comes from knowing you\'ll handle whatever comes.',
          warning: 'Freedom without responsibility is adolescence. Make sure your leap includes a plan for landing.',
          affirmation: 'Every great journey began with a single step into the unknown. This is yours.'
        },
        reversed: {
          core: 'Something is stuck. Either you\'re afraid to begin, or you\'re beginning things impulsively without following through. The reversed Fool is the eternal almost — always about to change, never quite arriving.',
          advice: 'Pick one thing. Start it. Finish it. The Fool\'s energy needs a container to become anything real.',
          warning: 'Procrastination and impulsivity are two sides of the same coin. Both avoid commitment.',
          affirmation: 'It\'s never too late to start. But it is possible to wait too long. Choose now.'
        }
      }
    },
    positions: {
      situation: { positionKey: 'situation', frame: 'You are at a beginning. The current situation is defined by its openness — nothing is decided, everything is possible.', emphasis: 'potential and uncertainty' },
      challenge: { positionKey: 'challenge', frame: 'The challenge is the unknown itself. Fear of what you can\'t predict is the obstacle.', emphasis: 'fear of the leap' },
      advice: { positionKey: 'advice', frame: 'The cards suggest taking the leap. Begin. Start. Act before you feel ready.', emphasis: 'courage and spontaneity' },
      outcome: { positionKey: 'outcome', frame: 'This leads to a new beginning — a fresh chapter that you could not have planned from here.', emphasis: 'transformation through action' },
      hidden: { positionKey: 'hidden', frame: 'What you don\'t see is your own readiness. You are more prepared than you know.', emphasis: 'hidden potential' },
      past: { positionKey: 'past', frame: 'A past beginning set this in motion. Something you started — perhaps without knowing its significance — is the root of the present situation.', emphasis: 'origins and first causes' },
      present: { positionKey: 'present', frame: 'You are in the moment of decision. The cliff edge is here, now.', emphasis: 'the present threshold' },
      future: { positionKey: 'future', frame: 'A new beginning is coming. Something you haven\'t imagined yet will present itself.', emphasis: 'approaching possibility' },
      crossing: { positionKey: 'crossing', frame: 'What crosses you is chaos — the unpredictable element that disrupts your plans and forces improvisation.', emphasis: 'disruption as catalyst' },
      foundation: { positionKey: 'foundation', frame: 'The root of this situation is an original act of trust or recklessness. Something was set in motion without full knowledge of where it would lead.', emphasis: 'the initial leap' },
      hopes_fears: { positionKey: 'hopes_fears', frame: 'You hope for freedom and fear the fall. Or you hope for safety and fear the stagnation it brings.', emphasis: 'the tension between safety and freedom' },
    },
    emotionalModifiers: {
      anxious: {
        toneShift: 'When anxiety is present, The Fool\'s message softens — it becomes less about bold leaps and more about small, brave steps. The unknown doesn\'t require you to be fearless; it requires you to move despite the fear.',
        gentleOpening: 'The anxiety you\'re feeling is not a signal to stop. It\'s the feeling of standing at the edge of something real.'
      },
      hopeful: {
        toneShift: 'Hope amplifies The Fool\'s energy. The card becomes a full-throated endorsement of the new direction — the universe is saying yes.',
        gentleOpening: 'That hopeful feeling in your chest? Trust it. It knows something your mind hasn\'t caught up to yet.'
      },
      grieving: {
        toneShift: 'In grief, The Fool becomes the tender possibility of life after loss. Not a demand to move on, but a whisper that movement is still possible when you\'re ready.',
        gentleOpening: 'This card doesn\'t ask you to be okay. It asks you to believe that one day, you will be — and that the first step toward that day is already beneath your feet.'
      },
      frustrated: {
        toneShift: 'Frustration meets The Fool as restlessness with a purpose. The card validates the impulse to break free and suggests the frustration itself is the fuel for change.',
        gentleOpening: 'That frustration you\'re carrying is not a failure. It\'s energy that hasn\'t found its direction yet.'
      },
      curious: {
        toneShift: 'Curiosity is The Fool\'s native state. The card amplifies the exploratory impulse and rewards the willingness to follow a question without needing the answer first.',
        gentleOpening: 'Your curiosity is leading you exactly where you need to go.'
      },
      neutral: {
        toneShift: 'Without strong emotional charge, The Fool reads as a clean signal: something new is beginning. Pay attention to what presents itself.',
        gentleOpening: 'A new beginning is available to you.'
      },
      excited: {
        toneShift: 'Excitement aligns perfectly with The Fool\'s upright energy. The card reflects the excitement back as confirmation.',
        gentleOpening: 'That excitement is the signal. Follow it.'
      },
      conflicted: {
        toneShift: 'Conflict meets The Fool as the tension between two possible futures. The card doesn\'t resolve the conflict — it asks you to leap and let the conflict resolve itself in motion.',
        gentleOpening: 'You don\'t need to resolve the conflict before you move. Sometimes movement resolves it for you.'
      }
    },
    interactions: [
      { otherCardId: 'major-21', relationship: 'mirrored_by', description: 'The Fool and The World are the beginning and end of the same journey. Together, they suggest a cycle completing and a new one beginning simultaneously.', narrativeBridge: 'What began in innocence has arrived at wholeness — and from wholeness, the next journey begins.' },
      { otherCardId: 'major-16', relationship: 'amplified_by', description: 'The Tower next to The Fool intensifies the leap — the old structure is crumbling and the only option is forward into the unknown.', narrativeBridge: 'The ground behind you is breaking apart. The leap is no longer optional.' },
      { otherCardId: 'major-09', relationship: 'opposed_by', description: 'The Hermit opposes The Fool\'s impulsiveness with a call for reflection. Together, they ask: should you leap, or should you pause and look inward first?', narrativeBridge: 'There is tension between the urge to move and the need to understand. Both are valid.' },
      { otherCardId: 'major-04', relationship: 'opposed_by', description: 'The Emperor demands structure where The Fool demands freedom. Together, they represent the fundamental tension between order and spontaneity.', narrativeBridge: 'Structure and freedom are in dialogue here. Neither alone is sufficient.' },
      { otherCardId: 'major-01', relationship: 'bridges_to', description: 'The Fool becomes The Magician when potential becomes intentional. These two in sequence suggest that the raw energy of beginning is about to be shaped into something deliberate.', narrativeBridge: 'The unformed energy of possibility is crystallizing into focused intention.' },
    ],
    fieldResponses: {
      positiveHigh: 'The field is strongly favorable. This beginning carries unusual momentum — the entropy itself is aligned with forward motion.',
      positiveMild: 'A gentle positive current supports this new beginning. The timing feels right.',
      neutral: 'The field is balanced. This beginning is neither pushed nor pulled by external forces — it\'s entirely yours.',
      negativeMild: 'A slight resistance in the field suggests this beginning may face early obstacles. They are tests, not verdicts.',
      negativeHigh: 'The field carries significant tension. This beginning is happening against a strong current — which may mean it\'s more important, not less.'
    },
    correspondences: {
      element: 'air',
      planet: 'Uranus',
      hebrewLetter: 'Aleph',
      numerology: 0,
      treeOfLifePath: 'Kether to Chokmah',
      birthChartResonance: 'As a Uranus-ruled card, The Fool resonates with the disruptive, liberating energy in your chart. Where Uranus sits natally, The Fool\'s energy is always active — a permanent invitation to break free.'
    }
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 1 — THE MAGICIAN
  // ════════════════════════════════════════════════════════════════════════════
  {
    cardId: 'major-01',
    cardName: 'The Magician',
    coreMeaning: {
      upright: 'You have everything you need. The tools are on the table — willpower, intellect, emotion, and material resource. What\'s required now is the focused intention to use them.',
      reversed: 'Power misdirected, talent wasted, or manipulation. The tools are present but something is blocking their proper use — self-deception, scattered focus, or the temptation to use skill for the wrong ends.'
    },
    keywords: {
      upright: ['manifestation', 'willpower', 'skill', 'concentration', 'resourcefulness', 'action'],
      reversed: ['manipulation', 'trickery', 'wasted talent', 'poor planning', 'untapped potential', 'deception']
    },
    domains: {
      love: {
        upright: {
          core: 'You have the capacity to create the relationship you want. This isn\'t passive hoping — it\'s active, intentional cultivation of connection. The Magician in love says: be deliberate about who you are with the person you love.',
          advice: 'Show up fully. Use your words, your presence, your attention — all four elements of connection at once.',
          warning: 'Charisma without sincerity is manipulation. Make sure you\'re building something real, not performing.',
          affirmation: 'You have everything you need to love well. Now use it.'
        },
        reversed: {
          core: 'Something in the relationship is performative rather than genuine. Someone — you or a partner — may be saying the right things without meaning them, or using charm as a substitute for vulnerability.',
          advice: 'Stop managing the impression and start being honest. Real connection requires the risk of being seen.',
          warning: 'If you feel like you\'re always "on" in this relationship, something foundational is missing.',
          affirmation: 'Dropping the performance is terrifying. It\'s also the only path to being actually known.'
        }
      },
      career: {
        upright: {
          core: 'You are in a position of genuine capability. The skills, the resources, and the opportunity are converging. The Magician says: this is your moment to act with precision and purpose. Execute.',
          advice: 'Stop preparing and start doing. The table is set. Pick up the tools.',
          warning: 'Confidence without follow-through is just bravado. Deliver what you promise.',
          affirmation: 'You are more capable than you give yourself credit for. The evidence is already in your track record.'
        },
        reversed: {
          core: 'Talent is being wasted or misdirected. You may be in a role that doesn\'t use your real skills, working for someone who takes credit for your work, or sabotaging your own potential through scattered focus.',
          advice: 'Identify the one thing you do better than anyone around you. Then build everything else around it.',
          warning: 'Spreading yourself across too many projects is a way of avoiding mastery in any single one.',
          affirmation: 'Your skills are real. The environment may need to change, not you.'
        }
      },
      spiritual: {
        upright: {
          core: 'The capacity for genuine spiritual practice is present. The Magician on the spiritual path represents the practitioner who understands that spiritual power is real and can be developed through disciplined intention.',
          advice: 'Practice. Not theorize, not read about, not discuss — practice. The Magician\'s power comes from doing.',
          warning: 'Spiritual power without ethical grounding is dangerous. As above, so below — and below has consequences.',
          affirmation: 'You are a channel for something larger than yourself. Keep the channel clean.'
        },
        reversed: {
          core: 'Spiritual charlatanism or self-deception. Using spiritual language to manipulate, or believing you\'ve achieved insight you haven\'t actually earned through practice.',
          advice: 'Be honest about where you actually are on the path. Pretending to be further along helps no one.',
          warning: 'The ego\'s favorite disguise is the spiritual teacher.',
          affirmation: 'Authentic practice doesn\'t need to be impressive. It needs to be honest.'
        }
      },
      health: {
        upright: {
          core: 'You have the knowledge and resources to actively improve your health. This is a card of agency — not waiting for someone to fix you, but taking informed, deliberate action.',
          advice: 'Research, plan, and execute. Your health responds to intentional effort.',
          warning: 'Don\'t mistake information for action. Knowing what to do and doing it are different things.',
          affirmation: 'Your body is responsive to your intention. Give it clear direction.'
        },
        reversed: {
          core: 'Health knowledge without application, or misguided approaches to wellness. You might be following advice that doesn\'t suit your body, or knowing exactly what you should do and consistently not doing it.',
          advice: 'Strip away the complexity. What is the one simplest thing you could do for your health today?',
          warning: 'Beware of health advice from people who are selling something.',
          affirmation: 'You don\'t need a perfect plan. You need a first step.'
        }
      },
      creative: {
        upright: {
          core: 'Creative mastery is available. You have the technical skill, the vision, and the raw material — now the work is channeling it into form. The Magician creates not through inspiration alone but through disciplined craft.',
          advice: 'Set the intention, then execute with precision. Let skill serve vision.',
          warning: 'Technique without soul is empty; soul without technique is frustrating. You need both.',
          affirmation: 'You are not waiting for the muse. You are the muse. Sit down and work.'
        },
        reversed: {
          core: 'Creative skill being wasted or misdirected. Making things that don\'t matter to you, or unable to translate inner vision into outer form.',
          advice: 'Reconnect with why you create. The technique will follow the passion, not the other way around.',
          warning: 'If everything you make feels hollow, the problem isn\'t craft — it\'s purpose.',
          affirmation: 'Your creative voice exists. It may be buried under other people\'s expectations. Dig.'
        }
      },
      financial: {
        upright: {
          core: 'You have the skills and resources to improve your financial situation. The Magician in financial matters represents strategic capability — the ability to see opportunities and execute on them with precision.',
          advice: 'Be strategic. Identify your financial leverage point and focus your energy there.',
          warning: 'Clever financial moves without ethical foundation build wealth on unstable ground.',
          affirmation: 'You are resourceful enough to build the financial life you want. Start with what you have.'
        },
        reversed: {
          core: 'Financial manipulation, get-rich-quick thinking, or the inability to manage money despite having enough skill to earn it. The gap between making money and keeping it is the reversed Magician\'s domain.',
          advice: 'If you keep ending up in the same financial position despite earning well, the issue is structural. Build systems.',
          warning: 'If a financial opportunity sounds too good to be true, the Magician reversed is telling you it is.',
          affirmation: 'Financial skill can be learned. What you lack in knowledge, you can build in practice.'
        }
      },
      family: {
        upright: {
          core: 'You have the ability to shape family dynamics intentionally. The Magician here is the family member who can communicate clearly, set boundaries, and create change through deliberate action rather than reactive emotion.',
          advice: 'Be the one who changes the conversation. Someone has to go first.',
          warning: 'Using communication skill to control family members is manipulation, even with good intentions.',
          affirmation: 'Your clarity can be a gift to your family. Offer it without attachment to how it\'s received.'
        },
        reversed: {
          core: 'Manipulation within family dynamics, or feeling powerless despite being capable. A family member using guilt, charm, or information asymmetry to control others.',
          advice: 'Name the dynamic. Manipulation thrives in silence.',
          warning: 'If you recognize the manipulator as yourself, the first step is admitting the pattern.',
          affirmation: 'Authentic family connection doesn\'t require strategy. It requires honesty.'
        }
      },
      self: {
        upright: {
          core: 'You are recognizing your own power. The Magician in the self domain is the moment of realizing that you are not a passive recipient of life\'s circumstances — you are an active force capable of shaping your reality through focused will.',
          advice: 'Own your capability. Not arrogantly, but honestly. You are more powerful than you\'ve been acting.',
          warning: 'Power that doesn\'t serve something beyond itself becomes narcissism.',
          affirmation: 'You have everything you need. The question is not whether you can — it\'s whether you will.'
        },
        reversed: {
          core: 'Self-deception about your own abilities — either inflating them (grandiosity) or denying them (playing small). The reversed Magician is the gap between who you are and who you pretend to be.',
          advice: 'Get honest with yourself about both your strengths and your limitations. Neither exaggeration helps.',
          warning: 'Playing small to make others comfortable is its own form of dishonesty.',
          affirmation: 'You are neither as powerful as your ego claims nor as helpless as your fear insists. The truth is in between — and it\'s enough.'
        }
      },
      general: {
        upright: {
          core: 'The resources and capability are present. This is a card of empowered action — not hope, not luck, but skill applied with intention. What you need is already in your hands.',
          advice: 'Act with clarity and purpose. The time for preparation is over; the time for execution is now.',
          warning: 'Capability without ethics is dangerous. Use your power well.',
          affirmation: 'As above, so below. What you hold in your mind, you can manifest in the world.'
        },
        reversed: {
          core: 'Power is present but misdirected. Something is preventing the clean flow of intention into action — self-doubt, scattered focus, or the misuse of genuine talent.',
          advice: 'Simplify. Focus on one thing. The Magician\'s power comes from concentration, not from doing everything at once.',
          warning: 'Beware of those who use skill to deceive — including yourself.',
          affirmation: 'Your potential is real. The work is learning to channel it with precision and integrity.'
        }
      }
    },
    positions: {
      situation: { positionKey: 'situation', frame: 'You are in a position of capability. The tools are available; the question is how you\'ll use them.', emphasis: 'personal power and agency' },
      challenge: { positionKey: 'challenge', frame: 'The challenge is channeling your energy effectively. Scattered focus dilutes power.', emphasis: 'concentration and direction' },
      advice: { positionKey: 'advice', frame: 'Be intentional. Use every tool at your disposal with deliberate purpose.', emphasis: 'focused action' },
      outcome: { positionKey: 'outcome', frame: 'This leads to manifestation — your intention becoming reality through skill and will.', emphasis: 'successful execution' },
      hidden: { positionKey: 'hidden', frame: 'What you don\'t see is the full extent of your own capability. You are underestimating yourself.', emphasis: 'untapped potential' },
      past: { positionKey: 'past', frame: 'A past act of deliberate creation set this situation in motion. Something you built with intention is now bearing fruit — or consequences.', emphasis: 'past agency' },
      present: { positionKey: 'present', frame: 'Right now, you have everything you need. The table is set.', emphasis: 'present capability' },
      future: { positionKey: 'future', frame: 'A moment of empowered action is approaching. You will soon be in a position to make something real happen.', emphasis: 'approaching agency' },
      crossing: { positionKey: 'crossing', frame: 'What crosses you is your own scattered focus — or someone else\'s manipulation.', emphasis: 'distraction or deception' },
      foundation: { positionKey: 'foundation', frame: 'The foundation of this situation is an act of will. Something was deliberately created.', emphasis: 'intentional origins' },
      hopes_fears: { positionKey: 'hopes_fears', frame: 'You hope you\'re capable enough. You fear you might be a fraud.', emphasis: 'impostor syndrome vs genuine power' },
    },
    emotionalModifiers: {
      anxious: {
        toneShift: 'Anxiety in the presence of The Magician is often impostor syndrome. The card reassures: the capability is real, even when the feelings say otherwise.',
        gentleOpening: 'The anxiety you feel isn\'t evidence of inadequacy. It\'s the feeling of standing in front of real power and wondering if you deserve it. You do.'
      },
      hopeful: {
        toneShift: 'Hope amplifies The Magician into full manifestation energy. The card becomes a strong confirmation that what you\'re hoping for is achievable through direct action.',
        gentleOpening: 'That hope is well-placed. You have the tools. Now pick them up.'
      },
      grieving: {
        toneShift: 'In grief, The Magician gently reminds that even in loss, you retain agency. Not agency over what happened — but agency over what you build next.',
        gentleOpening: 'You are still powerful, even in grief. Not powerful enough to undo what happened — but powerful enough to choose what comes next.'
      },
      frustrated: {
        toneShift: 'Frustration meets The Magician as the gap between what you know you can do and what you\'re currently allowed to do. The card validates the frustration and points toward direct action.',
        gentleOpening: 'You\'re frustrated because you can see the solution and nobody is letting you implement it. The Magician says: stop asking permission.'
      },
      neutral: {
        toneShift: 'In a neutral emotional state, The Magician reads as a clear call to action. No emotional filter needed — just capability meeting opportunity.',
        gentleOpening: 'The tools are on the table. What will you make?'
      },
      conflicted: {
        toneShift: 'Conflict in the presence of The Magician is usually about how to use power. The card asks: which version of yourself do you want to be the agent of?',
        gentleOpening: 'You have the power to go either direction. The question isn\'t which path is available — it\'s which one you can live with.'
      }
    },
    interactions: [
      { otherCardId: 'major-00', relationship: 'bridges_to', description: 'The Fool\'s raw potential becomes The Magician\'s focused intention. Possibility crystallizes into action.', narrativeBridge: 'The energy that was diffuse and open is now concentrated and ready to be directed.' },
      { otherCardId: 'major-02', relationship: 'opposed_by', description: 'The Magician acts; The High Priestess receives. Together, they represent the balance between doing and being, intention and intuition.', narrativeBridge: 'Action and receptivity are both needed here. Neither alone is complete.' },
      { otherCardId: 'major-15', relationship: 'transformed_by', description: 'The Devil corrupts The Magician\'s power into manipulation. Together, they warn about the misuse of genuine capability.', narrativeBridge: 'Power in the wrong hands — or power serving the wrong master — transforms skill into harm.' },
      { otherCardId: 'major-10', relationship: 'amplified_by', description: 'The Wheel of Fortune alongside The Magician suggests that skill meets opportunity. The timing is right for decisive action.', narrativeBridge: 'Fortune favors the prepared. Your preparation is meeting its moment.' },
    ],
    fieldResponses: {
      positiveHigh: 'The field is strongly aligned with intentional action. Whatever you manifest now carries amplified force.',
      positiveMild: 'A supportive current runs beneath your efforts. The execution should flow more smoothly than usual.',
      neutral: 'The field is neutral — neither helping nor hindering. Your success depends entirely on your own skill and focus.',
      negativeMild: 'Slight resistance in the field. Your intentions may face unexpected friction. Double-check your approach.',
      negativeHigh: 'Significant field tension. Forces are working against clean manifestation. Proceed with extra care and verify your assumptions.'
    },
    correspondences: {
      element: 'air',
      planet: 'Mercury',
      hebrewLetter: 'Beth',
      numerology: 1,
      treeOfLifePath: 'Kether to Binah',
      birthChartResonance: 'Mercury in your chart is activated by The Magician. Where Mercury sits natally, your communicative and strategic powers are strongest — and most at risk of being misused.'
    }
  },

];

// Export count for verification
export const MAJOR_ARCANA_COUNT = RWS_MAJOR_ARCANA.length;
