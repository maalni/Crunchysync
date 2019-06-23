import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.less']
})

export class NotificationComponent {
  @Input() message: string;
	@Input() type: string = "";
  @Input() url: string = "";
	hidden: boolean = false;

	openUrl(){
		if(this.url != "" && this.url != undefined){
			window.open(this.url);
		}
	}

  hide(){
    if(this.type != "error"){
      this.hidden = !this.hidden;
    }
  }
}
