import { IGameTown, Adventure, Hero, AdventureDifficulty, HeroItem, ItemType, HeroStat } from '../interfaces';
import { getTownHeroByUUID, checkHeroLevelUp, giveHeroEXP, giveHeroGold, calculateMaxHeldPotions } from './hero';
import { doCombat, getTownExpMultiplier, getTownGoldMultiplier, canTeamFight } from './combat';
import { doesTownHaveFeature } from './global';
import { take } from 'lodash';

export function calculateMaxActiveAdventures(town: IGameTown): number {
  let base = 1;

  if (doesTownHaveFeature(town, 'Tunnels I'))  { base += 1; }
  if (doesTownHaveFeature(town, 'Tunnels II')) { base += 1; }

  return base;
}

export function calculateMaxPotentialAdventures(town: IGameTown): number {
  let base = 3;

  if (doesTownHaveFeature(town, 'Infestation I'))  { base += 1; }
  if (doesTownHaveFeature(town, 'Infestation II')) { base += 1; }

  return base;
}

export function calculateMaxNumberAdventureEncounters(town: IGameTown): number {
  let base = 3;

  if (doesTownHaveFeature(town, 'Deeper Cave I'))  { base += 2; }
  if (doesTownHaveFeature(town, 'Deeper Cave II')) { base += 2; }

  return base;
}

export function calculateAvailableDifficulties(town: IGameTown): AdventureDifficulty[] {
  return [
    AdventureDifficulty.VeryEasy, AdventureDifficulty.Easy,
    AdventureDifficulty.Normal,
    AdventureDifficulty.Hard, AdventureDifficulty.VeryHard
  ];
}

export function heroBuyItemsBeforeAdventure(town: IGameTown, hero: Hero): HeroItem[] {
  const boughtItems: HeroItem[] = [];

  let totalCost = 0n;

  // buy potions
  const maxPotions = calculateMaxHeldPotions(town, hero);
  if (hero.gear[ItemType.Potion].length < maxPotions) {
    const itemsToBuy = maxPotions - hero.gear[ItemType.Potion].length;
    let boughtPotions = 0;

    town.itemsForSale[ItemType.Potion].forEach(item => {
      if (totalCost + item.cost > hero.currentStats[HeroStat.GOLD] || boughtPotions >= itemsToBuy) { return; }
      totalCost += item.cost;
      boughtItems.push(item);
      boughtPotions++;
    });
  }

  // TODO: buy weapons - only what the job can buy though

  return boughtItems;
}

export function doAdventureEncounter(town: IGameTown, adventure: Adventure): void {
  const chosenHeroes = adventure.activeHeroes.map(uuid => getTownHeroByUUID(town, uuid)).filter(Boolean) as Hero[];
  doCombat(town, chosenHeroes, adventure);
  chosenHeroes.forEach(h => checkHeroLevelUp(h));
}

export function finalizeAdventure(town: IGameTown, adventure: Adventure): boolean {
  const chosenHeroes = adventure.activeHeroes.map(uuid => getTownHeroByUUID(town, uuid)).filter(Boolean) as Hero[];

  const expMult = getTownExpMultiplier(town);
  const goldMult = getTownGoldMultiplier(town);

  const baseReward = adventure.encounterCount * adventure.encounterLevel * adventure.difficulty;
  const expReward = 10 * baseReward * expMult;
  const goldReward = baseReward * goldMult;

  let didSucceed = false;

  chosenHeroes.forEach(h => {
    h.onAdventure = '';
  });

  if (canTeamFight(chosenHeroes)) {
    didSucceed = true;
    chosenHeroes.forEach(h => {
      giveHeroEXP(h, expReward);
      giveHeroGold(h, goldReward);

      checkHeroLevelUp(h);
    });
  }

  return didSucceed;
}
