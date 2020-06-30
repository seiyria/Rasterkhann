
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { timer } from 'rxjs';

import { ChooseInfo, GameLoop, SpendGold, UpgradeBuilding, LoadSaveData, OptionToggleUpgradeVisibility, UpgradeBuildingFeature } from './actions';
import { Building, BuildingData, IGameTown, IGameState, BuildingFeature } from './interfaces';
import { doesTownHaveFeature } from './helpers';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private store: Store) {
    this.init();
  }

  private init() {
    this.startGameLoop();
  }

  private startGameLoop() {
    timer(0, 1000).subscribe(() => {
      this.store.dispatch(new GameLoop());
    });
  }

  // ui functions
  public changeInfo(newWindow: string) {
    if (!newWindow) { return; }
    this.store.dispatch(new ChooseInfo(newWindow));
  }

  public loadState(state: IGameState) {
    this.store.dispatch(new LoadSaveData(state));
  }

  public toggleUpgradeVisibility() {
    this.store.dispatch(new OptionToggleUpgradeVisibility());
  }

  // building functions
  public featureByName(building: Building, feature: string): BuildingFeature {
    return BuildingData[building].features.find(x => x.name === feature);
  }

  public doesTownHaveFeature(town: IGameTown, feature: string): boolean {
    return doesTownHaveFeature(town, feature);
  }

  public buildingCost(building: Building, level = 1): bigint {
    return BuildingData[building].levelCost(level);
  }

  public buildingFeatureCost(building: Building, feature: string): bigint {
    return this.featureByName(building, feature).cost;
  }

  public buildingFeatureTime(building: Building, feature: string): number {
    return this.featureByName(building, feature).upgradeTime;
  }

  public nextLevelForBuilding(town: IGameTown, building: Building): number {
    return town.buildings[building] ? town.buildings[building].level + 1 : 1;
  }

  public canUpgradeBuilding(town: IGameTown, building: Building): boolean {
    if (town.buildings[building]) {
      const isConstructing = town.buildings[building].constructionDoneAt;
      if (isConstructing) { return false; }
    }

    const nextLevelCost = this.buildingCost(building, this.nextLevelForBuilding(town, building));
    if (nextLevelCost === 0n) { return false; }

    return town.gold >= nextLevelCost;
  }

  public canUpgradeBuildingFeature(town: IGameTown, building: Building, feature: string): boolean {
    if (town.buildings[building].featureConstruction) {
      const isConstructing = town.buildings[building].featureConstruction[feature];
      if (isConstructing) { return false; }
    }

    const featureRef: BuildingFeature = this.featureByName(building, feature);
    if (!featureRef) { return false; }

    const nextLevelCost = this.buildingFeatureCost(building, feature);
    if (nextLevelCost === 0n) { return false; }

    if (featureRef.requiresFeature) {
      const allPreFeatures = Object.keys(featureRef.requiresFeature)
        .every(feat => town.buildings[building].features && town.buildings[building].features[feat]);
      if (!allPreFeatures) { return false; }
    }

    return town.gold >= nextLevelCost;
  }

  public upgradeBuilding(town: IGameTown, building: Building) {
    if (!this.canUpgradeBuilding(town, building)) { return; }

    this.store.dispatch(new SpendGold(this.buildingCost(building, this.nextLevelForBuilding(town, building))));
    this.store.dispatch(new UpgradeBuilding(building));
  }

  public upgradeBuildingFeature(town: IGameTown, building: Building, feature: string) {
    if (!this.canUpgradeBuildingFeature(town, building, feature)) { return; }

    this.store.dispatch(new SpendGold(this.buildingFeatureCost(building, feature)));
    this.store.dispatch(new UpgradeBuildingFeature(building, feature, this.buildingFeatureTime(building, feature)));
  }

}
