import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.css']
})

export class WarningComponent {
  @Input() message: string;
	@Input() type: string = "";
	hidden: boolean = false;

	//Hides the warning, when it gets clicked
	hideWarning(){
		if(this.type === "error"){
			this.hidden = true;
		}
	}
}
