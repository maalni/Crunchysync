import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent	 {
  @Output() onChange = new EventEmitter<string>();
	searchTerm: string = "";

	onSearchChangeEvent(){
		this.onChange.emit(this.searchTerm);
	}

	clearSearch(){
		this.searchTerm = "";
		this.onChange.emit(this.searchTerm);
	}
}
