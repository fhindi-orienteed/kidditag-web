import type { Tag } from '../../../types';

export interface TagWithChild extends Tag {
  childName: string;
  childAvatar: string;
}

export interface TagColorTheme {
  accent: string;
  bgLight: string;
  borderLight: string;
  text: string;
  gradient: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  glow: string;
}

export function getTagColorTheme(colorName: string): TagColorTheme {
  const c = colorName.toLowerCase();

  if (c.includes('purple')) {
    return {
      accent: '#6320ee',
      bgLight: '#f6f2ff',
      borderLight: '#e4d4ff',
      text: '#5214c9',
      gradient: 'linear-gradient(135deg, #6320ee 0%, #8b5cf6 100%)',
      dotColor: '#7c3aed',
      badgeBg: '#f3e8ff',
      badgeBorder: '#d8b4fe',
      glow: 'rgba(99, 32, 238, 0.18)',
    };
  }

  if (c.includes('teal')) {
    return {
      accent: '#0d9488',
      bgLight: '#f0fdfa',
      borderLight: '#99f6e4',
      text: '#0f766e',
      gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
      dotColor: '#0d9488',
      badgeBg: '#ccfbf1',
      badgeBorder: '#5eead4',
      glow: 'rgba(13, 148, 136, 0.18)',
    };
  }

  if (c.includes('pink') || c.includes('rose')) {
    return {
      accent: '#db2777',
      bgLight: '#fdf2f8',
      borderLight: '#fbcfe8',
      text: '#be185d',
      gradient: 'linear-gradient(135deg, #db2777 0%, #f472b6 100%)',
      dotColor: '#ec4899',
      badgeBg: '#fce7f3',
      badgeBorder: '#f9a8d4',
      glow: 'rgba(219, 39, 119, 0.18)',
    };
  }

  if (c.includes('blue')) {
    return {
      accent: '#2563eb',
      bgLight: '#eff6ff',
      borderLight: '#bfdbfe',
      text: '#1d4ed8',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
      dotColor: '#3b82f6',
      badgeBg: '#dbeafe',
      badgeBorder: '#93c5fd',
      glow: 'rgba(37, 99, 235, 0.18)',
    };
  }

  if (c.includes('yellow') || c.includes('amber')) {
    return {
      accent: '#d97706',
      bgLight: '#fffbeb',
      borderLight: '#fde68a',
      text: '#b45309',
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      dotColor: '#f59e0b',
      badgeBg: '#fef3c7',
      badgeBorder: '#fcd34d',
      glow: 'rgba(217, 119, 6, 0.18)',
    };
  }

  if (c.includes('green')) {
    return {
      accent: '#059669',
      bgLight: '#f0fdf4',
      borderLight: '#bbf7d0',
      text: '#047857',
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      dotColor: '#10b981',
      badgeBg: '#dcfce7',
      badgeBorder: '#86efac',
      glow: 'rgba(5, 150, 105, 0.18)',
    };
  }

  // Default theme
  return {
    accent: '#582be8',
    bgLight: '#f5f3fc',
    borderLight: '#e4d8ff',
    text: '#582be8',
    gradient: 'linear-gradient(135deg, #582be8 0%, #7d4ef7 100%)',
    dotColor: '#582be8',
    badgeBg: '#ede9fe',
    badgeBorder: '#ddd6fe',
    glow: 'rgba(88, 43, 232, 0.18)',
  };
}

export function getTagFormFactorMeta(type: string) {
  const t = type.toLowerCase();

  if (t.includes('wristband')) {
    return {
      category: 'Wrist Wearable',
      material: 'Medical-Grade Silicone',
      attachment: 'Ergonomic secure clasp',
      durability: 'IP68 Submersible (10m)',
      iconKey: 'wristband',
    };
  }

  if (t.includes('backpack') || t.includes('badge')) {
    return {
      category: 'Luggage / Bag',
      material: 'Impact-Resistant Polymer',
      attachment: 'Reinforced clip & loop',
      durability: 'Weatherproof & Shockproof',
      iconKey: 'backpack',
    };
  }

  if (t.includes('shoe')) {
    return {
      category: 'Footwear Tag',
      material: 'Featherlight Flexible Rubber',
      attachment: 'Through-eyelet lock',
      durability: 'Mud, puddle & wash proof',
      iconKey: 'shoe',
    };
  }

  if (t.includes('jacket') || t.includes('clip')) {
    return {
      category: 'Outerwear Clip',
      material: 'High-Tension Polymer Clip',
      attachment: 'Teeth-free fabric grip',
      durability: 'Freezing & wash resistant',
      iconKey: 'clip',
    };
  }

  return {
    category: 'Universal Tag',
    material: 'Durable Waterproof Resin',
    attachment: 'Universal loop',
    durability: 'IP68 Submersible',
    iconKey: 'tag',
  };
}
