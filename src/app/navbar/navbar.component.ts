import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { Varstore } from '../varstore';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less'],
	animations: [
		trigger('isSelected', [
			state('false', style({
				color: "var(--text-color)",
        fill: "var(--text-color)"
			})),
			state('true', style({
				color: "var(--accent-color)",
        fill: "var(--accent-color)"    
			})),
			transition('close => open', animate('100ms ease-in')),
			transition('open => close', animate('100ms ease-in')),
		])
	]
})

export class NavbarComponent {

  constructor(public varstore: Varstore){}

	@Input() totalWatching;
	@Input() totalUnseen;
	@Input() totalDone;
	@Input() totalAnimes;

  selectPage(selected: number){
    this.varstore.selectedPage = selected;
  }
}
