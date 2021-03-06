import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { formatNumber } from './helpers';

@Pipe({
  name: 'bignum'
})
export class BignumPipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) {}

  transform(value: bigint | number | null, ...args: unknown[]): string | null {
    if (value === 0) { return '0'; }
    if (!value) { return ''; }
    if (value < 1_000_000n) { return this.decimalPipe.transform(value.toString()); }
    return formatNumber(value);
  }

}
