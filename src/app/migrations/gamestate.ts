
import { isUndefined } from 'lodash';

import { Building, IGameState, ItemType, TownStat, HeroJob, Version, HeroTrackedStat } from '../interfaces';
import { createBuildingAtLevel, createZeroHeroBigintBlock, getZeroStatBlock, createZeroHallOfFame } from '../helpers';

interface Migration {
  version: Version;
  key: 'gamestate';
  versionKey: 'version';
  migrate: (state: IGameState) => IGameState;
}

export const migrations: Migration[] = [
  {
    version: Version.First,
    key: 'gamestate',
    versionKey: 'version',
    migrate: (state: IGameState) => {
      console.log('Savefile version 1...');

      console.log('Running migrations...');

      console.log('Validating RecentNews...');
      state.towns.Rasterkhann.recentNews = state.towns.Rasterkhann.recentNews || [];

      console.log('Validating Archives/Library...');
      state.towns.Rasterkhann.buildings.archives = state.towns.Rasterkhann.buildings.archives || createBuildingAtLevel(0);
      state.towns.Rasterkhann.buildings.library = state.towns.Rasterkhann.buildings.library || createBuildingAtLevel(0);

      console.log('Setting up Health Potions I...');
      state.towns.Rasterkhann.buildings.alchemist.features['Health Potions I'] = 1;

      console.log('Validating ItemsForSale/NextItemCreation...');
      if (!state.towns.Rasterkhann.itemsForSale) {
        state.towns.Rasterkhann.itemsForSale = {
          Armor: [],
          Weapon: [],
          Potion: [],
        };
      }

      if (!state.towns.Rasterkhann.nextItemCreation) {
        state.towns.Rasterkhann.nextItemCreation = {
          Armor: 0,
          Weapon: 0,
          Potion: 0,
        };
      }

      console.log('Cleaning ItemsForSale/NextItemCreation...');
      Object.keys(ItemType).forEach((itemType: ItemType) => {
        state.towns.Rasterkhann.itemsForSale[itemType] = state.towns.Rasterkhann.itemsForSale[itemType] || [];
        state.towns.Rasterkhann.nextItemCreation[itemType] = state.towns.Rasterkhann.nextItemCreation[itemType] || 0;
      });

      console.log('Setting TownName...');
      Object.keys(state.towns).forEach(townName => {
        if (state.towns[townName].name) { return; }
        state.towns[townName].name = townName;
      });

      console.log('Validating Heroes...');
      state.towns.Rasterkhann.recruitedHeroes.forEach(h => {
        h.gear = h.gear || { Potion: [], Weapon: [], Armor: [] };
        h.gear.Potion = h.gear.Potion || [];
        h.gear.Weapon = h.gear.Weapon || [];
        h.gear.Armor = h.gear.Armor || [];
        if (h.onAdventure && !state.towns.Rasterkhann.activeAdventures.map(a => a.uuid).includes(h.onAdventure)) {
          h.onAdventure = '';
        }
      });

      console.log('Adding combat log support...');
      state.towns.Rasterkhann.combatLogs = state.towns.Rasterkhann.combatLogs || [];

      state.version = Version.TrackedStats;

      return state;
    }
  },
  {
    version: Version.TrackedStats,
    key: 'gamestate',
    versionKey: 'version',
    migrate: (state: IGameState) => {
      console.log('Savefile version 2...');

      console.log('Migrating heroes to have stats...');
      state.towns.Rasterkhann.recruitedHeroes.forEach(h => {
        h.trackedStats = h.trackedStats || {};
      });

      state.towns.Rasterkhann.prospectiveHeroes.forEach(ph => {
        ph.hero.trackedStats = ph.hero.trackedStats || {};
      });

      state.version = Version.Durability;

      return state;
    }
  },
  {
    version: Version.Durability,
    key: 'gamestate',
    versionKey: 'version',
    migrate: (state: IGameState) => {
      console.log('Savefile version 3...');

      console.log('Setting armor/weapon durability to 100/100...');
      state.towns.Rasterkhann.recruitedHeroes.forEach(h => {
        h.gear.Armor.forEach(a => {
          if (!a.curDurability) { a.curDurability = 100; }
          if (!a.maxDurability) { a.maxDurability = 100; }
        });
        h.gear.Weapon.forEach(w => {
          if (!w.curDurability) { w.curDurability = 100; }
          if (!w.maxDurability) { w.maxDurability = 100; }
        });
      });

      state.version = Version.CleanRefs;
      return state;
    }
  },
  {
    version: Version.CleanRefs,
    key: 'gamestate',
    versionKey: 'version',
    migrate: (state: IGameState) => {
      console.log('Savefile version 4...');

      console.log('Fixing buildings with stale worker refs...');
      Object.values(state.towns.Rasterkhann.buildings).forEach(b => {
        if (!b.currentWorkerId) { return; }

        const heroRef = state.towns.Rasterkhann.recruitedHeroes.find(h => h.uuid === b.currentWorkerId);
        if (!heroRef) {
          b.currentWorkerId = null;
        }
      });

      state.version = Version.HeroRetire;

      return state;
    }
  },
  {
    version: Version.HeroRetire,
    key: 'gamestate',
    versionKey: 'version',
    migrate: (state: IGameState) => {
      console.log('Savefile version 5...');

      console.log('Setting heroes default location to the inn...');
      state.towns.Rasterkhann.recruitedHeroes.forEach(h => {
        h.currentlyAtBuilding = h.currentlyAtBuilding || Building.Inn;
      });

      console.log('Setting default town stats records...');
      const defaultStats = {
        [TownStat.Adventures]:    createZeroHeroBigintBlock(),
        [TownStat.Encounters]:    createZeroHeroBigintBlock(),
        [TownStat.Gold]:          createZeroHeroBigintBlock(),
        [TownStat.Levels]:        createZeroHeroBigintBlock(),
        [TownStat.Retires]:       createZeroHeroBigintBlock(),
        [TownStat.CrystalsSpent]: createZeroHeroBigintBlock(),
        [TownStat.Legendary]:     {
          Adventures: 0
        }
      };

      state.towns.Rasterkhann.stats = state.towns.Rasterkhann.stats || {};
      Object.keys(defaultStats).forEach((stat: TownStat) => {
        state.towns.Rasterkhann.stats[stat] = state.towns.Rasterkhann.stats[stat] || defaultStats[stat];
      });

      console.log('Setting stage 2 UI if available...');
      if (Object.values(state.towns.Rasterkhann.stats.retires || {}).some(Boolean)) {
        state.towns.Rasterkhann.showStage2UI = true;
      }

      console.log('Setting new town stat...');
      state.towns.Rasterkhann.stats.crystals = state.towns.Rasterkhann.stats.crystals || createZeroHeroBigintBlock();

      console.log('Setting crystal currency...');
      state.towns.Rasterkhann.crystalCurrency = state.towns.Rasterkhann.crystalCurrency || {};

      console.log('Resetting crystal currency...');
      Object.keys(state.towns.Rasterkhann.stats.retires).forEach((job: HeroJob) => {
        state.towns.Rasterkhann.crystalCurrency[job] = Number(state.towns.Rasterkhann.stats.retires[job]);
      });

      console.log('Fixing buildings with stale worker refs (again)...');
      Object.values(state.towns.Rasterkhann.buildings).forEach(b => {
        if (!b.currentWorkerId) { return; }

        const heroRef = state.towns.Rasterkhann.recruitedHeroes.find(h => h.uuid === b.currentWorkerId);
        if (!heroRef) {
          b.currentWorkerId = null;
        }
      });

      console.log('Creating crystal buffs blob...');
      state.towns.Rasterkhann.crystalBuffs = state.towns.Rasterkhann.crystalBuffs || getZeroStatBlock();

      console.log('Compacting hero gear...');
      state.towns.Rasterkhann.recruitedHeroes.forEach(h => {
        Object.keys(h.gear).forEach((itemType: ItemType) => {
          h.gear[itemType] = h.gear[itemType].filter(Boolean) as any[];
        });
      });

      state.version = Version.SkillBooks;

      return state;
    }
  },
  {
    version: Version.SkillBooks,
    key: 'gamestate',
    versionKey: 'version',
    migrate: (state: IGameState) => {
      console.log('Savefile version 6...');

      console.log('Setting up books arrays on town...');
      state.towns.Rasterkhann.ownedBooks = state.towns.Rasterkhann.ownedBooks || [];
      state.towns.Rasterkhann.potentialBooks = state.towns.Rasterkhann.potentialBooks || [];

      console.log('Setting up book arrays on heroes...');
      state.towns.Rasterkhann.recruitedHeroes.forEach(h => h.learnedSkills = h.learnedSkills || []);
      state.towns.Rasterkhann.prospectiveHeroes.forEach(h => h.hero.learnedSkills = h.hero.learnedSkills || []);

      console.log('Setting confirmation dialog option to default...');
      if (isUndefined(state.options.showConfirmationDialogs)) {
        state.options.showConfirmationDialogs = true;
      }

      console.log('Setting stat tooltip option to default...');
      if (isUndefined(state.options.showStatTooltips)) {
        state.options.showStatTooltips = true;
      }

      console.log('Setting legendary adventures up...');
      state.towns.Rasterkhann.legendaryAdventures = state.towns.Rasterkhann.legendaryAdventures || [];

      console.log('Setting up new town stats...');
      state.towns.Rasterkhann.stats.legendary = state.towns.Rasterkhann.stats.legendary || {};
      state.towns.Rasterkhann.stats.legendary.Adventures = state.towns.Rasterkhann.stats.legendary.Adventures || 0n;

      state.version = Version.Legendary;

      return state;
    }
  },
  {
    version: Version.Legendary,
    key: 'gamestate',
    versionKey: 'version',
    migrate: (state: IGameState) => {
      console.log('Savefile version 7...');

      console.log('Setting stage 2 UI if available...');
      if (Object.values(state.towns.Rasterkhann.stats.retires || {}).some(Boolean)) {
        state.towns.Rasterkhann.showStage2UI = true;
      }

      console.log('Setting up queue properties...');
      state.towns.Rasterkhann.recruitedHeroes.forEach(h => h.queueAdventure = h.queueAdventure || '');
      state.towns.Rasterkhann.prospectiveHeroes.forEach(p => p.queueRecruited = p.queueRecruited || false);

      console.log('Setting up recruited/prospective hero new stats...');
      state.towns.Rasterkhann.recruitedHeroes.forEach(h => {
        h.trackedStats[HeroTrackedStat.DamageDealt] = h.trackedStats[HeroTrackedStat.DamageDealt] || 0;
        h.trackedStats[HeroTrackedStat.DamageTaken] = h.trackedStats[HeroTrackedStat.DamageTaken] || 0;
      });

      state.towns.Rasterkhann.prospectiveHeroes.forEach(p => {
        p.hero.trackedStats[HeroTrackedStat.DamageDealt] = p.hero.trackedStats[HeroTrackedStat.DamageDealt] || 0;
        p.hero.trackedStats[HeroTrackedStat.DamageTaken] = p.hero.trackedStats[HeroTrackedStat.DamageTaken] || 0;
      });

      state.towns.Rasterkhann.hallOfFame = state.towns.Rasterkhann.hallOfFame || createZeroHallOfFame();

      return state;
    }
  }
];
