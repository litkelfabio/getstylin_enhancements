import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cityState'
})
export class CityStatePipe implements PipeTransform {

  transform(value: any, ...args) {
    console.log(value);
    return value.toLowerCase();
  }

}
