import { Component, Input } from '@angular/core';
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
		]),
		trigger('showTotal', [
			state('false', style({
				display: "none"
			})),
			state('true', style({
				display: "inline"
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
	currentlyShown: number = 0;
	selected: Array<string> = new Array("true", "false", "false", "false", "false");

  /*Changes the visibility of the tabs
    Variables:
    Number selected = Number of the selected tab*/
	showSelected(selected: number){
		if(selected >=0 && selected <= 4){
			if((<HTMLElement>document.getElementById("spinner")).hidden && !(<HTMLElement>document.getElementById("refreshbtn")).hidden && selected == 4){
				(<HTMLElement>document.getElementById("refreshbtn")).hidden = true;
			}
			if((<HTMLElement>document.getElementById("spinner")).hidden && (<HTMLElement>document.getElementById("refreshbtn")).hidden && selected != 4){
				(<HTMLElement>document.getElementById("refreshbtn")).hidden = false;
			}
			(<HTMLElement>document.getElementById("content").children[this.currentlyShown]).hidden = true;
			this.selected[this.currentlyShown] = "false";
			(<HTMLElement>document.getElementById("content").children[selected]).hidden = false;
			this.selected[selected] = "true";
			this.currentlyShown = selected;
		}
	}
}
