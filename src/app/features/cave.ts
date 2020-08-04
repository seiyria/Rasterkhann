import { BuildingFeature, BuildingFeatureTime, TownStat } from '../interfaces';

export const CaveFeatures: BuildingFeature[] = [
  {
    name: 'Monster Gold I',
    description: 'Monsters give more gold.',
    cost: 50000n,
    upgradeTime: BuildingFeatureTime.Short,
    requiresLevel: 15
  },
  {
    name: 'Monster Gold II',
    description: 'Monsters give more gold.',
    cost: 150000n,
    upgradeTime: BuildingFeatureTime.Medium,
    requiresLevel: 35,
    requiresFeature: {
      'Monster Gold I': 1
    }
  },
  {
    name: 'Monster Gold III',
    description: 'Monsters give more gold.',
    cost: 350000n,
    upgradeTime: BuildingFeatureTime.Long,
    requiresLevel: 60,
    requiresFeature: {
      'Monster Gold II': 1
    }
  },
  {
    name: 'Monster Experience I',
    description: 'Monsters give more experience.',
    cost: 50000n,
    upgradeTime: BuildingFeatureTime.Short,
    requiresLevel: 30
  },
  {
    name: 'Monster Experience II',
    description: 'Monsters give more experience.',
    cost: 250000n,
    upgradeTime: BuildingFeatureTime.Medium,
    requiresLevel: 50,
    requiresFeature: {
      'Monster Experience I': 1
    }
  },
  {
    name: 'Monster Experience III',
    description: 'Monsters give more experience.',
    cost: 450000n,
    upgradeTime: BuildingFeatureTime.Long,
    requiresLevel: 75,
    requiresFeature: {
      'Monster Experience II': 1
    }
  },
  {
    name: 'Tunnels I',
    description: 'Can be on another adventure simultaneously.',
    cost: 100000n,
    upgradeTime: BuildingFeatureTime.Short,
    requiresLevel: 5
  },
  {
    name: 'Tunnels II',
    description: 'Can be on another adventure simultaneously.',
    cost: 300000n,
    upgradeTime: BuildingFeatureTime.Medium,
    requiresLevel: 25,
    requiresFeature: {
      'Tunnels I': 1
    }
  },
  {
    name: 'Infestation I',
    description: 'More adventure options are present.',
    cost: 300000n,
    upgradeTime: BuildingFeatureTime.Medium,
    requiresLevel: 20
  },
  {
    name: 'Infestation II',
    description: 'More adventure options are present.',
    cost: 500000n,
    upgradeTime: BuildingFeatureTime.Long,
    requiresLevel: 50,
    requiresFeature: {
      'Infestation I': 1
    }
  },
  {
    name: 'Deeper Cave I',
    description: 'More potential encounters in an adventure.',
    cost: 400000n,
    upgradeTime: BuildingFeatureTime.Medium,
    requiresLevel: 30
  },
  {
    name: 'Deeper Cave II',
    description: 'More potential encounters in an adventure.',
    cost: 600000n,
    upgradeTime: BuildingFeatureTime.Long,
    requiresLevel: 60,
    requiresFeature: {
      'Deeper Cave I': 1
    }
  },
  {
    name: 'Teamwork I',
    description: 'Heroes can form a team of two in an adventure.',
    cost: 400000n,
    upgradeTime: BuildingFeatureTime.Medium,
    requiresLevel: 10
  },
  {
    name: 'Teamwork II',
    description: 'Heroes can form a team of three in an adventure.',
    cost: 600000n,
    upgradeTime: BuildingFeatureTime.Long,
    requiresLevel: 40,
    requiresFeature: {
      'Teamwork I': 1
    }
  },
  {
    name: 'Tougher Adventures I',
    description: 'Unlock the "Tough" difficulty for adventures.',
    cost: 10000000n,
    upgradeTime: BuildingFeatureTime.Long,
    requiresTownStat: {
      [TownStat.Retires]: 5
    }
  },
  {
    name: 'Tougher Adventures II',
    description: 'Unlock the "Challenging" difficulty for adventures.',
    cost: 20000000n,
    upgradeTime: BuildingFeatureTime.Long,
    requiresTownStat: {
      [TownStat.Retires]: 25
    }
  },
  {
    name: 'Tougher Adventures III',
    description: 'Unlock the "Extreme" difficulty for adventures.',
    cost: 30000000n,
    upgradeTime: BuildingFeatureTime.Long,
    requiresTownStat: {
      [TownStat.Retires]: 75
    }
  },
];
