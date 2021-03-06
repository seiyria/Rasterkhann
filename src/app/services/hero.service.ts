import { Injectable } from '@angular/core';

import { sum } from 'lodash';

import { Hero, GameTown, ProspectiveHero, HeroStat,
  Building, HeroJobStatic, Adventure, Trait, TraitValueMultipliers } from '../interfaces';
import { calculateHeroTrainingGoldPerXP, generateHero, generateMonster, getCurrentStat, getZeroStatBlock, getStatBoostFromCrystal } from '../helpers';
import { JobEffects, TraitEffects } from '../static';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  constructor() { }

  generateMonster(town: GameTown, adventure: Adventure): Hero {
    return generateMonster(town, adventure);
  }

  generateHero(town: GameTown): Hero {
    return generateHero(town);
  }

  // trait average value prop multiplier - all bad means the cost goes down, all good means it goes up
  getTraitTotalMultiplier(traits: Trait[]): number {
    return sum(traits.map(t => {
      const trait = TraitEffects[t];
      return TraitValueMultipliers[trait.valueProp];
    })) / traits.length;
  }

  generateProspectiveHero(town: GameTown): ProspectiveHero {

    const guildHallLevel = town.buildings[Building.GuildHall].level || 1;

    const hero = this.generateHero(town);
    const rating = this.getRatingForHero(town, hero);

    let baseCost = rating
                 * hero.stats[HeroStat.LVL]
                 * guildHallLevel
                 * this.getTraitTotalMultiplier(hero.traits)
                 * JobEffects[hero.job].costMultiplier;

    if (baseCost <= 1) { baseCost = 1; }

    return {
      hero,
      cost: BigInt(Math.floor(baseCost)),
      rating,
      queueRecruited: false
    };
  }

  heroTrainCost(town: GameTown, hero: Hero): bigint {
    return BigInt(Math.floor(hero.stats[HeroStat.EXP] - getCurrentStat(hero, HeroStat.EXP))) * calculateHeroTrainingGoldPerXP(town);
  }

  private getRatingForHero(town: GameTown, hero: Hero): number {
    const guildHallLevel = town.buildings[Building.GuildHall].level || 1;

    if (guildHallLevel < 5) { return 0.5; }

    const maxStats: Record<HeroStat, number> = getZeroStatBlock();

    const jobStatic: HeroJobStatic = JobEffects[hero.job];

    // these stats contribute to the star rating
    const contributingStats = [HeroStat.ATK, HeroStat.DEF, HeroStat.HP, HeroStat.SP, HeroStat.STA];

    // calculate the max for each stat
    Object.values(contributingStats).forEach(stat => {
      if (maxStats[stat]) { return; }
      maxStats[stat] = (hero.stats[HeroStat.LVL]
                     * jobStatic.statGrowth[stat](hero.stats[HeroStat.LVL])
                     * jobStatic.statBaseMultiplier[stat])
                     + getStatBoostFromCrystal(town, stat);
    });

    // normalize the stats between 1-5 (if it goes over, that's ok)
    const pctStats: Partial<Record<HeroStat, number>> = {};
    Object.keys(maxStats).forEach((stat: HeroStat) => {
      pctStats[stat] = hero.stats[stat] / maxStats[stat] * 5;
    });

    // average the stat values that are normalized
    const contributingStatTotal = contributingStats.map(x => pctStats[x]);
    const avgStatPct = Math.max(1, sum(contributingStatTotal) / contributingStats.length);

    // normalize the stars to the guild hall level
    const statPctComparedToGuildHallLevel = avgStatPct * (hero.stats[HeroStat.LVL] / guildHallLevel);

    // multiply by trait rating
    const traitAvgMultiplier = sum(hero.traits.map(t => TraitValueMultipliers[TraitEffects[t].valueProp])) / hero.traits.length;

    return statPctComparedToGuildHallLevel * traitAvgMultiplier;
  }
}
