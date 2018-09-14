import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if(!items) return [];
    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( it => {
    	if(it.series.name.toLowerCase().includes(searchText))return it.series.name.toLowerCase().includes(searchText);
			if(it.most_likely_media.name.toLowerCase().includes(searchText)) return it.most_likely_media.name.toLowerCase().includes(searchText);
    });
  }
}
