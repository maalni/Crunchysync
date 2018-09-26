import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent  {

	@Input() animes;
	@Input() search;
	@Output() onSelect = new EventEmitter<Array<any>>();
	searchTerm: string = "";

	onSearchChangeEvent(searchTerm: string){
		this.searchTerm = searchTerm;
	}

	onSelectEventHandler(anime: Array<any>){
		this.onSelect.emit(anime);
	}
}
