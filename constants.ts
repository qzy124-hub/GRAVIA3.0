import { MoodType, User, VisualAttributes } from './types';

// Plutchik's Wheel Colors
export const MOOD_COLORS: Record<MoodType, string> = {
  [MoodType.JOY]: '#FFD700',          // Yellow
  [MoodType.TRUST]: '#90EE90',        // Light Green
  [MoodType.FEAR]: '#2F4F4F',         // Dark Slate Gray (Fear/Cold)
  [MoodType.SURPRISE]: '#00BFFF',     // Light Blue
  [MoodType.SADNESS]: '#00008B',      // Dark Blue
  [MoodType.DISGUST]: '#6B8E23',      // Olive Drab (Greenish - as requested)
  [MoodType.ANGER]: '#FF0000',        // Red
  [MoodType.ANTICIPATION]: '#FF8C00', // Orange
};

// Sub-emotions hierarchy
export const MOOD_HIERARCHY: Record<MoodType, string[]> = {
  [MoodType.JOY]: ['Ecstasy', 'Serenity', 'Optimism', 'Love', 'Delight'],
  [MoodType.TRUST]: ['Admiration', 'Acceptance', 'Support', 'Safety', 'Faith'],
  [MoodType.FEAR]: ['Terror', 'Apprehension', 'Anxiety', 'Panic', 'Unease'],
  [MoodType.SURPRISE]: ['Amazement', 'Distraction', 'Shock', 'Wonder', 'Awe'],
  [MoodType.SADNESS]: ['Grief', 'Pensiveness', 'Gloom', 'Loneliness', 'Despair'],
  [MoodType.DISGUST]: ['Loathing', 'Boredom', 'Aversion', 'Revulsion', 'Sick'],
  [MoodType.ANGER]: ['Rage', 'Annoyance', 'Aggressive', 'Frustrated', 'Critical', 'Insulted'],
  [MoodType.ANTICIPATION]: ['Vigilance', 'Interest', 'Excitement', 'Hope', 'Curiosity'],
};

// Realistic Content Database
const MOCK_CONTENT_DB = {
  zh: {
    [MoodType.JOY]: [
      "今天终于完成了那个拖了很久的项目，如释重负！",
      "在街角遇到了一只非常亲人的流浪猫，心情瞬间变好。",
      "久违地和老朋友通了电话，感觉什么都没变。",
      "早起的阳光洒在阳台上，咖啡很香，活着真好。",
      "收到了一份意想不到的礼物，被人记住的感觉真好。",
      "哪怕只是微小的进步，也值得庆祝一下。",
      "去看了海，听着海浪声，内心无比平静喜悦。",
      "路边的花开了，春天真的来了。",
      "吃到了一顿特别好吃的晚餐，满足感爆棚。",
      "帮助了一个陌生人，对方的笑容很治愈。"
    ],
    [MoodType.SADNESS]: [
      "即使身处人群中，那种孤独感还是会突然袭来。",
      "翻到了以前的照片，想念那些再也回不去的日子。",
      "由于沟通的误会，失去了一个重要的机会，很失落。",
      "窗外在下雨，心情也跟着变得灰暗起来。",
      "努力了很久的事情结果并不如意，感到深深的无力。",
      "告别总是那么难，即使知道是为了更好的重逢。",
      "深夜总是容易胡思乱想，眼泪止不住。",
      "听到一首老歌，突然想起了那个已经离开的人。",
      "生病的时候一个人去医院，真的很委屈。",
      "看着镜子里的自己，感觉好陌生，好疲惫。"
    ],
    [MoodType.ANGER]: [
      "完全无法理解为什么会有人提出这么无理的要求！",
      "被误解的感觉真的太糟糕了，甚至懒得解释。",
      "堵车堵了整整两个小时，浪费生命，非常烦躁。",
      "无论说了多少次，对方还是在犯同样的错误。",
      "看到不公正的事情发生，却无能为力，感到愤怒。",
      "对自己没有控制好情绪感到生气，陷入内耗。",
      "明明不是我的错，为什么要我承担后果？",
      "被信任的人背叛，这种感觉真的让人火大。"
    ],
    [MoodType.FEAR]: [
      "对未来的不确定性感到深深的恐慌。",
      "马上就要上台演讲了，心跳快得要跳出嗓子眼。",
      "梦见了一些不好的事情，醒来后依然心有余悸。",
      "害怕自己辜负了家人的期望。",
      "在这个陌生的城市，突然感到一种不安全的战栗。",
      "担心现在的选择是错的，害怕以后会后悔。",
      "听到那个坏消息的时候，手都在发抖。"
    ],
    [MoodType.TRUST]: [
      "即使不用说话，也能感觉到我们之间的默契。",
      "把后背交给队友的感觉，真的很踏实。",
      "不论发生什么，我知道家人永远会支持我。",
      "因为信任，所以愿意展现自己脆弱的一面。",
      "虽然是第一次合作，但对方的专业让我很放心。",
      "这种被人无条件相信的感觉，真的很有力量。",
      "只要他在身边，我就觉得很有安全感。"
    ],
    [MoodType.ANTICIPATION]: [
      "已经在期待下周的旅行了，攻略做了一遍又一遍。",
      "马上就要见到喜欢的人了，心里的蝴蝶在飞。",
      "等待录取通知书的日子，既焦急又充满希望。",
      "不知道明天的会议会带来什么样的转机。",
      "新买的书到了，迫不及待想要拆开阅读。",
      "种下的种子发芽了，期待它开花的那一天。",
      "即将开始新的生活，充满了憧憬。"
    ],
    [MoodType.SURPRISE]: [
      "完全没想到结局会是这样，太震撼了！",
      "在旧大衣口袋里翻出了去年丢的钱，小确幸。",
      "生活中总是充满这种意料之外的转折。",
      "他居然记得我随口说过的一句话。",
      "这个味道简直打开了新世界的大门。",
      "本来以为没戏了，结果峰回路转。",
      "这真的是我见过的最美的风景，太不可思议了。"
    ],
    [MoodType.DISGUST]: [
      "对于这种虚伪的社交感到生理性厌恶。",
      "看到了一些不干净的东西，整个人都不好了。",
      "这种价值观我真的无法苟同。",
      "再也不想去那家餐厅了，体验极差。",
      "对自己现在的颓废状态感到有些厌弃。",
      "听到那种下流的笑话，真的觉得很恶心。",
      "这种为了利益不择手段的做法，让人作呕。"
    ]
  },
  en: {
    [MoodType.JOY]: [
      "Finally finished the project I've been dragging on. Such a relief!",
      "Met a super friendly stray cat on the corner. Made my day.",
      "Had a long call with an old friend. Feels like nothing changed.",
      "Morning sun on the balcony, good coffee. It's good to be alive.",
      "Received an unexpected gift. Feels great to be remembered.",
      "Even small progress is worth celebrating.",
      "Went to the sea. The sound of waves brings such calm joy."
    ],
    [MoodType.SADNESS]: [
      "Even in a crowd, that loneliness just hits you suddenly.",
      "Found old photos. Missing days that will never return.",
      "Lost a big opportunity due to a misunderstanding. Crushed.",
      "Raining outside, and my mood is turning gray too.",
      "Tried so hard but the result wasn't what I hoped. Feeling helpless.",
      "Goodbyes are always hard, even if for a better reunion.",
      "Late nights always lead to overthinking and tears."
    ],
    [MoodType.ANGER]: [
      "Can't understand how someone can make such unreasonable demands!",
      "Being misunderstood is the worst. Don't even want to explain.",
      "Stuck in traffic for two hours. Wasting life. So annoyed.",
      "No matter how many times I say it, they make the same mistake.",
      "Seeing injustice and feeling powerless makes me furious.",
      "Angry at myself for losing my temper. Internal conflict."
    ],
    [MoodType.FEAR]: [
      "Feeling a deep panic about the uncertainty of the future.",
      "About to go on stage. Heart beating out of my chest.",
      "Had a nightmare and woke up still feeling the dread.",
      "Scared that I might let my family down.",
      "In this strange city, suddenly felt a shiver of insecurity."
    ],
    [MoodType.TRUST]: [
      "We don't even need to speak to understand each other.",
      "Feels so safe to have teammates I can rely on.",
      "No matter what, I know my family supports me.",
      "Because of trust, I'm willing to show my vulnerability.",
      "First time working together, but their professionalism puts me at ease."
    ],
    [MoodType.ANTICIPATION]: [
      "Already looking forward to next week's trip. Checked the plans again.",
      "About to meet my crush. Butterflies in my stomach.",
      "Waiting for the acceptance letter. Anxious but hopeful.",
      "Wondering what changes tomorrow's meeting will bring.",
      "New books arrived. Can't wait to unwrap and read."
    ],
    [MoodType.SURPRISE]: [
      "Totally didn't expect that ending. Mind blown!",
      "Found money in my old coat pocket. Small luck.",
      "Life is full of these unexpected twists.",
      "He actually remembered something I mentioned casually.",
      "This flavor just opened a door to a new world."
    ],
    [MoodType.DISGUST]: [
      "Physically repulsed by this fake socializing.",
      "Saw something gross. Ruined my appetite.",
      "I really cannot agree with these values.",
      "Never going to that restaurant again. Terrible experience.",
      "Feeling a bit disgusted with my own procrastination."
    ]
  }
};

// Default Visual Attributes Generator
export const getVisualAttributes = (mood: MoodType): VisualAttributes => {
  switch (mood) {
    case MoodType.ANGER:
      return { primaryColor: '#FF0000', secondaryColor: '#8B0000', shape: 'spiky', roughness: 0.2, metalness: 0.8, speed: 3.0 }; // Fast, spiky
    case MoodType.JOY:
      return { primaryColor: '#FFD700', secondaryColor: '#FFA500', shape: 'smooth', roughness: 0.1, metalness: 0.3, speed: 0.5 }; // Smooth, calm
    case MoodType.DISGUST:
      return { primaryColor: '#6B8E23', secondaryColor: '#556B2F', shape: 'distorted', roughness: 0.6, metalness: 0.1, speed: 0.2 }; // Slow, distorted
    case MoodType.FEAR:
      return { primaryColor: '#2F4F4F', secondaryColor: '#000000', shape: 'spiky', roughness: 0.9, metalness: 0.2, speed: 2.0 }; // Fast, spiky
    case MoodType.TRUST:
      return { primaryColor: '#90EE90', secondaryColor: '#00FF00', shape: 'cloud', roughness: 0.8, metalness: 0.0, speed: 0.3 }; // Soft, cloud
    case MoodType.SADNESS:
      return { primaryColor: '#00008B', secondaryColor: '#191970', shape: 'distorted', roughness: 0.4, metalness: 0.6, speed: 0.1 }; // Slow, distorted
    case MoodType.SURPRISE:
      return { primaryColor: '#00BFFF', secondaryColor: '#E0FFFF', shape: 'spiky', roughness: 0.1, metalness: 0.9, speed: 1.5 }; // Fast, spiky
    case MoodType.ANTICIPATION:
      return { primaryColor: '#FF8C00', secondaryColor: '#FFFF00', shape: 'smooth', roughness: 0.3, metalness: 0.4, speed: 0.8 }; // Smooth, moderate
    default:
      return { primaryColor: '#FFFFFF', secondaryColor: '#CCCCCC', shape: 'smooth', roughness: 0.5, metalness: 0.5, speed: 1.0 };
  }
};

export const SAMPLE_TOPICS = [
  "Work", "Family", "Friend", "Life"
];

// Aesthetic Unsplash Images
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80", // Landscape
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80", // Dark Nature
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80", // Greenery
  "https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=800&q=80", // Moody
  "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&q=80", // Photography
  "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80", // Atmosphere
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80", // Rain
];

// Re-generating mock users with new structure
export const generateMockUsers = (count: number, lang: 'zh' | 'en' = 'zh'): User[] => {
  const users: User[] = [];
  const moods = Object.values(MoodType);

  for (let i = 0; i < count; i++) {
    const lat = (Math.random() * 160) - 80; 
    const lng = (Math.random() * 360) - 180;
    
    // SIGNIFICANTLY INCREASED ENTRY COUNT per user
    const numEntries = Math.floor(Math.random() * 100) + 200;
    const userEntries = [];
    const userMoods = [];

    for (let k = 0; k < numEntries; k++) {
        const mood = moods[Math.floor(Math.random() * moods.length)];
        userMoods.push(mood);
        const textOptions = MOCK_CONTENT_DB[lang][mood];
        const content = textOptions ? textOptions[Math.floor(Math.random() * textOptions.length)] : "Emotional resonance...";
        const visuals = getVisualAttributes(mood);
        
        const isRecent = Math.random() < 0.05;
        const timeOffset = isRecent 
            ? Math.random() * 24 * 60 * 60 * 1000 
            : Math.random() * 90 * 24 * 60 * 60 * 1000;

        const isPublic = Math.random() > 0.2; // 80% public
        
        // Randomly assign image to 20% of entries
        const hasImage = Math.random() < 0.2;
        const imageUrl = hasImage ? MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)] : undefined;

        userEntries.push({
            id: `u${i}-e${k}`,
            content: content,
            timestamp: new Date(Date.now() - timeOffset), 
            moods: [mood],
            subMoods: [MOOD_HIERARCHY[mood][0]],
            isPublic: isPublic,
            topics: ["Life"],
            visuals: visuals,
            imageUrl: imageUrl,
            nebulaLocation: {
                lat: (Math.random() * 180) - 90,
                lng: (Math.random() * 360) - 180
            }
        });
    }

    userEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const primaryMood = userEntries[0].moods[0];

    users.push({
      id: `user-${i}`,
      name: `Nebula Dreamer ${42 + i}`,
      location: { lat, lng },
      currentMoods: [...new Set(userMoods)],
      color: MOOD_COLORS[primaryMood],
      friends: [],
      entries: userEntries
    });
  }
  return users;
};

// Generate historical data for the current user gallery
export const generateHistory = (lang: 'zh' | 'en' = 'zh'): any[] => {
  const history = [];
  const moods = Object.values(MoodType);
  const now = new Date();
  
  const categories = ["Work", "Family", "Friend", "Life"];

  for (let i = 1; i <= 300; i++) {
    const daysAgo = i * (Math.random() * 0.4 + 0.1); 
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const numMoods = Math.floor(Math.random() * 3) + 1;
    const entryMoods = [];
    for(let j=0; j<numMoods; j++) {
        entryMoods.push(moods[Math.floor(Math.random() * moods.length)]);
    }
    const primary = entryMoods[0];
    
    const textOptions = MOCK_CONTENT_DB[lang][primary];
    const content = textOptions ? textOptions[Math.floor(Math.random() * textOptions.length)] : "Reflection...";

    const availableSubMoods = MOOD_HIERARCHY[primary];
    const subMoods = [
        availableSubMoods[Math.floor(Math.random() * availableSubMoods.length)],
    ];
    
    const topic = categories[Math.floor(Math.random() * categories.length)];

    const hasImage = Math.random() < 0.2;
    const imageUrl = hasImage ? MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)] : undefined;

    history.push({
        id: `history-${i}`,
        content: content,
        timestamp: date,
        moods: entryMoods, 
        subMoods: [...new Set(subMoods)],
        isPublic: false, 
        topics: [topic], 
        visuals: getVisualAttributes(primary),
        imageUrl: imageUrl,
        nebulaLocation: {
             lat: (Math.random() * 180) - 90,
             lng: (Math.random() * 360) - 180
        }
    });
  }
  return history;
};