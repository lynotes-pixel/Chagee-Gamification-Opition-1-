import { Prize } from '../types';

export const PRIZES: Prize[] = [
  {
    id: 'prize-grand-free-year',
    title: 'Grand Royal 1-For-1 Boya Juexian (L)',
    chineseTitle: '至尊大奖 · 伯牙绝弦买一送一券',
    subtitle: 'Free Large Signature Boya Juexian with Any Purchase + 50 Bonus Tea Points',
    tier: 'grand',
    badge: 'GRAND ROYAL PRIZE',
    discountType: 'bogo',
    voucherCode: 'CHAGEE-GRAND-BOYA99',
    validUntil: 'Valid for 30 days',
    terms: 'Redeemable at all CHAGEE outlets or via the mobile mini-app. Valid for hot or iced (L) size.',
    iconName: 'Crown',
  },
  {
    id: 'prize-royal-free-cup',
    title: 'Free Signature Fresh Milk Tea (L)',
    chineseTitle: '御品茶礼 · 任意大杯鲜奶茶免单券',
    subtitle: '100% Free Large Cup of your choice across the Fresh Milk Tea Series',
    tier: 'royal',
    badge: 'ROYAL MASTER PRIZE',
    discountType: 'free_item',
    voucherCode: 'CHAGEE-FREE-MILKTEA',
    validUntil: 'Valid for 14 days',
    terms: 'Valid for any Fresh Milk Tea on the menu. No minimum spend required.',
    iconName: 'Gift',
  },
  {
    id: 'prize-master-fifty-off',
    title: '50% Off Any Beverage Voucher',
    chineseTitle: '绝弦品鉴 · 全场饮品五折特惠券',
    subtitle: 'Half-price discount on any drink including Snow Cap Specialty series',
    tier: 'master',
    badge: 'SPECIALTY MASTER PRIZE',
    discountType: 'percent_off',
    voucherCode: 'CHAGEE-50-OFF-TEA',
    validUntil: 'Valid for 14 days',
    terms: 'Valid on single beverage item. Stackable with member points accrual.',
    iconName: 'Sparkles',
  },
  {
    id: 'prize-harmony-two-dollar',
    title: '$2 Cash Off & 30 Bonus Points',
    chineseTitle: '清和茶韵 · 2元立减立享金',
    subtitle: '$2 discount voucher with immediate 30 Tea Points credited to your account',
    tier: 'harmony',
    badge: 'TEA LOVER PRIZE',
    discountType: 'cash_voucher',
    voucherCode: 'CHAGEE-2OFF-BONUS30',
    validUntil: 'Valid for 7 days',
    terms: 'Valid on orders over $5. Points automatically added to your member account.',
    iconName: 'Coins',
  },
  {
    id: 'prize-consolation-bonus-points',
    title: '18 Bonus Tea Points + 20% Off Coupon',
    chineseTitle: '初露新茗 · 18茶点回馈券',
    subtitle: 'Earn 18 bonus points (enough for 2 free game tokens!) and 20% off',
    tier: 'consolation',
    badge: 'LUCKY DRAW PRIZE',
    discountType: 'points_bonus',
    voucherCode: 'CHAGEE-POINT-REFUND18',
    validUntil: 'Valid for 7 days',
    terms: 'Points credited immediately for replaying the gamification machine.',
    iconName: 'Flame',
  }
];

export function evaluateCombination(selectedCards: any[]): {
  prize: Prize;
  comboName: string;
  synergyTags: string[];
  synergyScore: number;
  matchTier: 'grand' | 'royal' | 'master' | 'harmony';
  matchedRule: string;
} {
  const jasmineCount = selectedCards.filter(c => c.name.includes('Jasmine') || c.chineseName.includes('茉莉') || c.chineseName.includes('伯牙')).length;
  const oolongCount = selectedCards.filter(c => c.teaBase.includes('Oolong') || c.chineseName.includes('乌龙') || c.chineseName.includes('铁观音') || c.chineseName.includes('观音') || c.chineseName.includes('山茶')).length;
  const snowCapCount = selectedCards.filter(c => c.category === 'snow_cap_specialty' || c.chineseName.includes('桃桃') || c.chineseName.includes('雪山')).length;
  const legendaryCount = selectedCards.filter(c => c.rarity === 'legendary').length;

  const totalPoints = selectedCards.reduce((acc, c) => acc + (c.pointsValue || 80), 0);

  // Check 4-card formula tiers
  if (jasmineCount >= 1 && (oolongCount >= 1 || snowCapCount >= 1) && (legendaryCount >= 1 || totalPoints >= 340)) {
    return {
      prize: PRIZES[0], // Grand prize
      comboName: 'Imperial Grandmaster Harmony (伯牙至尊皇庭配)',
      synergyTags: ['Top Seller Synergy', 'Jasmine Boost', 'Specialty Royalty', 'Golden Rock Echo'],
      synergyScore: totalPoints + 150,
      matchTier: 'grand',
      matchedRule: 'Matched Grand Master Secret Pairing: Jasmine Key + Tea Balance + Royal Specialty!'
    };
  }

  if (legendaryCount >= 1 || (jasmineCount >= 1 && oolongCount >= 1)) {
    return {
      prize: PRIZES[1], // Royal prize
      comboName: 'Four Fragrances Master Blend (四海群芳天香酿)',
      synergyTags: ['Floral Symphony', 'Legendary Tea Base', 'Smooth Milk Cream'],
      synergyScore: totalPoints + 100,
      matchTier: 'royal',
      matchedRule: 'Matched Royal Master Blend: Legendary Card / Exquisite Floral Balance!'
    };
  }

  if (selectedCards.length === 4) {
    if (totalPoints >= 320 || snowCapCount >= 1 || jasmineCount >= 2) {
      return {
        prize: PRIZES[2], // Master prize
        comboName: 'Noble Mountain & Valley Infusion (崇山幽谷雅致配)',
        synergyTags: ['Alpine Notes', 'High Point Synergy', 'Golden Orchid'],
        synergyScore: totalPoints + 60,
        matchTier: 'master',
        matchedRule: 'Matched Specialty Connoisseur Formula with rich alpine tea depth!'
      };
    }

    return {
      prize: PRIZES[3], // Harmony prize
      comboName: 'Serene Tea Garden Harmony (清风和韵四方饮)',
      synergyTags: ['Balanced Palette', 'Fresh Milk Infusion'],
      synergyScore: totalPoints + 30,
      matchTier: 'harmony',
      matchedRule: 'Perfect 4-Card Balance completed!'
    };
  }

  return {
    prize: PRIZES[4],
    comboName: 'Fragrant Tea Breeze (清雅茗香配)',
    synergyTags: ['Fresh Tea Extract'],
    synergyScore: totalPoints,
    matchTier: 'harmony',
    matchedRule: 'Standard 4-Card Blend Submitted'
  };
}
