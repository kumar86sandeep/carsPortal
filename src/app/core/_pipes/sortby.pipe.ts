import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy'
})
export class SortByPipe implements PipeTransform {
  transform(items: any[]): any {

      return items.filter((l) => l.default).map((l) => l);    
  }
}

