import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent {

  @Output() onChange = new EventEmitter<string>();
	searchTerm: string = "";

  //Emit an event when the searchterm changes
	onSearchChangeEvent(){
		this.onChange.emit(this.searchTerm);
	}

  //Clears the searchterm
	clearSearch(){
		this.searchTerm = "";
		this.onSearchChangeEvent();
	}
}
