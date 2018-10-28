import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent  {

	@Input() animes;
	@Input() search;
	@Input() userIsPremium;
	@Output() onSelect = new EventEmitter<Array<any>>();
	searchTerm: string = "";

  /*Syncs the searchterm between the <app-search> and <app-anime> component
    Variables:
    String searchTerm = searchterm from <app-search>*/
	onSearchChangeEvent(searchTerm: string){
		this.searchTerm = searchTerm;
	}

  /*Syncs the selected anime between <app-app> and <app-category> component
    Variables:
    Array<any> anime = selected anime from <app-anime>*/
	onSelectEventHandler(anime: Array<any>){
		this.onSelect.emit(anime);
	}
}
