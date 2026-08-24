export type CardRarity = 'legendary' | 'epic' | 'rare' | 'signature';

export type TeaCategory = 'fresh_milk_tea' | 'pure_tea' | 'fresh_fruit_tea' | 'snow_cap_specialty';

export interface TeaCard {
  id: string;
  name: string;
  chineseName: string;
  pinyin?: string;
  category: TeaCategory;
  categoryName: string;
  teaBase: string;
  aromaProfile: string[];
  rarity: CardRarity;
  description: string;
  topNotes: string;
  cupColor: string;
  accentColor: string;
  patternType: 'jasmine' | 'lotus' | 'dragon' | 'camellia' | 'mountain' | 'osmanthus';
  pointsValue: number;
}

export type GamePhase = 
  | 'idle'       // Ready to redeem or ready to spin if token available
  | 'spinning'   // Carousel spinning fast right to left
  | 'stopping'   // Braking / decelerating reel
  | 'selecting'  // Hand of cards shown, user picking 6 cards
  | 'submitting' // Evaluating combo / brewing reveal
  | 'result';    // Prize display

export interface Prize {
  id: string;
  title: string;
  chineseTitle: string;
  subtitle: string;
  tier: 'grand' | 'royal' | 'master' | 'harmony' | 'consolation';
  badge: string;
  discountType: 'free_item' | 'bogo' | 'percent_off' | 'cash_voucher' | 'points_bonus';
  voucherCode: string;
  validUntil: string;
  terms: string;
  iconName: string;
}

export interface CombinationResult {
  prize: Prize;
  comboName: string;
  synergyTags: string[];
  synergyScore: number;
  matchTier: 'grand' | 'royal' | 'master' | 'harmony';
  matchedRule: string;
  cardCount: number;
}

export interface UserProfile {
  points: number;
  tokens: number;
  vouchers: Prize[];
  gameHistoryCount: number;
  totalWins: number;
  soundEnabled: boolean;
}

export interface SecretTargetRecipe {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  requiredTeaIds?: string[];
  requiredCategories?: { category: TeaCategory; count: number }[];
  requiredAroma?: string;
  rewardTier: 'grand' | 'royal' | 'master';
  hint: string;
}
