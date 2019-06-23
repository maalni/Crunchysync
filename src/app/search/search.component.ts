import { Component, Output, EventEmitter } from '@angular/core';
import { Varstore } from '../varstore';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less']
})

export class SearchComponent {

  constructor(public varstore: Varstore){}

	searchString: string = "";
}
