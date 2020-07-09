import { BuildingFeature, HeroJob } from '../interfaces';

const JobFeatures: BuildingFeature[] = [
  {
    name: 'Job: Warrior',
    description: 'Unlock the Warrior job for your heroes.',
    cost: 100000n,
    upgradeTime: 3600,
    requiresLevel: 10,
    unlocks: {
      job: [HeroJob.Warrior]
    }
  },
  {
    name: 'Job: Thief',
    description: 'Unlock the Thief job for your heroes.',
    cost: 100000n,
    upgradeTime: 3600,
    requiresLevel: 20,
    unlocks: {
      job: [HeroJob.Thief]
    }
  },
  {
    name: 'Job: Mage',
    description: 'Unlock the Mage job for your heroes.',
    cost: 100000n,
    upgradeTime: 3600,
    requiresLevel: 30,
    unlocks: {
      job: [HeroJob.Mage]
    }
  },
  {
    name: 'Job: Cleric',
    description: 'Unlock the Cleric job for your heroes.',
    cost: 100000n,
    upgradeTime: 3600,
    requiresLevel: 30,
    unlocks: {
      job: [HeroJob.Cleric]
    }
  },
];

const OtherFeatures: BuildingFeature[] = [
  {
    name: 'Cheaper Training I',
    description: 'Hero training costs go down.',
    cost: 100000n,
    upgradeTime: 3600,
    requiresLevel: 15
  },
  {
    name: 'Cheaper Training II',
    description: 'Hero training costs go down more.',
    cost: 200000n,
    upgradeTime: 3600,
    requiresLevel: 30,
    requiresFeature: {
      'Cheaper Training I': 1
    }
  },
  {
    name: 'Cheaper Training III',
    description: 'Hero training costs go down even more.',
    cost: 300000n,
    upgradeTime: 3600,
    requiresLevel: 45,
    requiresFeature: {
      'Cheaper Training II': 1
    }
  },
  {
    name: 'Cheaper Training IV',
    description: 'Hero training costs go down yet more.',
    cost: 500000n,
    upgradeTime: 3600,
    requiresLevel: 60,
    requiresFeature: {
      'Cheaper Training III': 1
    }
  },
  {
    name: 'Cheaper Training V',
    description: 'Hero training costs go down even yet more.',
    cost: 1000000n,
    upgradeTime: 3600,
    requiresLevel: 90,
    requiresFeature: {
      'Cheaper Training IV': 1
    }
  },
];

export const GuildHallFeatures: BuildingFeature[] = [
  ...JobFeatures,
  ...OtherFeatures
];
