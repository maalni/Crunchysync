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
}
