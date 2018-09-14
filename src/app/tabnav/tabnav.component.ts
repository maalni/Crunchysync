import { Component, OnInit, Input } from '@angular/core';
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
export class TabnavComponent implements OnInit {

	@Input() totalAnimes;
	currentlyShown: number = 0;
	selected: Array<string> = new Array();
	watchingSelected: string = "false";
	unseenSelected: string = "false";
	doneSelected: string = "false";
	allSelected: string = "false";
	settingsSelected: string = "false";

  ngOnInit() {
		(<HTMLElement>document.getElementById("content").children[0]).hidden = true;
		(<HTMLElement>document.getElementById("content").children[1]).hidden = true;
		(<HTMLElement>document.getElementById("content").children[2]).hidden = true;
		(<HTMLElement>document.getElementById("content").children[3]).hidden = true;
		(<HTMLElement>document.getElementById("content").children[4]).hidden = true;
		this.showSelected(0);
  }

	showSelected(selected: number){
		if(selected >=0 && selected <= 4){
			if((<HTMLElement>document.getElementById("spinner")).hidden && !(<HTMLElement>document.getElementById("refresh")).hidden && selected == 4){
				console.log("settings + loading finished");
				(<HTMLElement>document.getElementById("refresh")).hidden = true;
			}
			if((<HTMLElement>document.getElementById("spinner")).hidden && (<HTMLElement>document.getElementById("refresh")).hidden && selected != 4){
				console.log("not settings + loading finished");
				(<HTMLElement>document.getElementById("refresh")).hidden = false;
			}
			(<HTMLElement>document.getElementById("content").children[this.currentlyShown]).hidden = true;
			this.selected[this.currentlyShown] = "false";
			(<HTMLElement>document.getElementById("content").children[selected]).hidden = false;
			this.selected[selected] = "true";
			this.currentlyShown = selected;
		}
	}
}
