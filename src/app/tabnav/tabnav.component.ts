import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

@Component({
  selector: 'app-tabnav',
  templateUrl: './tabnav.component.html',
  styleUrls: ['./tabnav.component.css'],
	animations: [
		trigger('isSelected', [
			state('false', style({
				borderBottom: "none"
			})),
			state('true', style({
				borderBottom: "solid 2px orange"
			})),
			transition('close => open', animate('100ms ease-in')),
			transition('open => close', animate('100ms ease-in')),
		])
	]
})

export class TabnavComponent {

	@Input() totalWatching;
	@Input() totalUnseen;
	@Input() totalDone;
	@Input() totalAnimes;
  @Output() onSelectedEvent = new EventEmitter<number>();
	currentlyShown: number = 0;
	selected: number = 0;

  selectPage(selected: number){
    this.selected = selected;
    this.onSelectedEvent.emit(selected);
  }
}
