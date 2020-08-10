import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

import { GameTown, SkillBook, HeroActionOpts, Hero } from '../../../interfaces';
import { GameService } from '../../../services/game.service';
import { skillBookOptsPoints } from '../../../helpers';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookComponent implements OnInit {

  @Input() town: GameTown;
  @Input() hero?: Hero;
  @Input() book: SkillBook;
  @Input() showBuy?: boolean;
  @Input() showCost?: boolean;
  @Input() showLearn?: boolean;
  @Input() showForget?: boolean;
  @Input() showDestroy?: boolean;
  @Input() buttonDisabled?: boolean;

  public statNames: Record<keyof HeroActionOpts, string> = {
    staCost: 'STA',
    spCost: 'SP',
    pct: 'DMG%',
    gold: 'GOLD',
    defMultiplier: 'DEFMOD%',
    atkMultiplier: 'ATKMOD%',
    targets: '#TARGETS',
    times: '#TIMES'
  };

  constructor(public game: GameService) { }

  ngOnInit(): void {}

  getStatName(name: keyof HeroActionOpts): string {
    return this.statNames[name];
  }

  getActionOpts(book: SkillBook): any {
    return book.actionOpts;
  }

  calculateBookLP(book: SkillBook): number {
    return skillBookOptsPoints(book.actionOpts);
  }

  showStat(stat: { key: keyof HeroActionOpts, value: number }): boolean {
    if (stat.value === 0)                           { return false; }
    if (stat.key === 'targets' && stat.value === 1) { return false; }
    if (stat.key === 'times' && stat.value === 1)   { return false; }

    return true;
  }

  statValue(stat: { key: keyof HeroActionOpts, value: number }): number {
    if (stat.key === 'atkMultiplier' || stat.key === 'defMultiplier') { return Math.floor(stat.value * 100); }
    return stat.value;
  }

  async buyBook(): Promise<void> {
    const finalize = () => {
      this.game.buyBook(this.town, this.book);
    };

    this.game.doSimpleConfirmation({
      header: 'Buy Book',
      message: `Are you sure you want to buy this book of ${this.book.name}?`,
      confirmText: 'Yes, Buy'
    }, finalize);
  }

  async destroyBook(): Promise<void> {
    const finalize = () => {
      this.game.destroySkill(this.book);
    };

    this.game.doSimpleConfirmation({
      header: 'Destroy Book',
      message: `Are you sure you want to destroy this book of ${this.book.name}? You will never get it back!`,
      confirmText: 'Yes, Destroy'
    }, finalize);
  }

  async learnSkill(): Promise<void> {
    const hero = this.hero;
    if (!hero) { return; }

    const finalize = () => {
      this.game.learnSkill(hero, this.book);
    };

    this.game.doSimpleConfirmation({
      header: 'Learn Skill From Book',
      message: `Are you sure you want to teach ${this.book.name} to ${hero.name}? This is not reversible!`,
      confirmText: 'Yes, Teach'
    }, finalize);
  }

  async forgetSkill(): Promise<void> {
    const hero = this.hero;
    if (!hero) { return; }

    const finalize = () => {
      this.game.forgetSkill(hero, this.book);
    };

    this.game.doSimpleConfirmation({
      header: 'Forget Skill',
      message: `Are you sure you want to make ${hero.name} forget ${this.book.name}? This is not reversible!`,
      confirmText: 'Yes, Forget'
    }, finalize);
  }
}
