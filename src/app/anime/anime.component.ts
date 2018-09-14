import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

@Component({
  selector: 'app-anime',
  templateUrl: './anime.component.html',
  styleUrls: ['./anime.component.css'],
	animations: [
		trigger('premiumState', [
			state('false', style({
				visibility: "hidden"
			})),
			state('true', style({
				visibility: "visible"
			})),
			transition('close => open', animate('100ms ease-in')),
			transition('open => close', animate('100ms ease-in')),
		])
	]
})
export class AnimeComponent implements OnInit {

	@Input() anime;
	@Output() onSelect = new EventEmitter<Array<any>>();

	premium: string = "false";

  ngOnInit() {
		if(this.anime.most_likely_media.premium_only){
			this.premium = "true";
		}

		if(this.anime.most_likely_media.playhead === undefined){
			this.anime.most_likely_media.playhead = 0;
		}

		if(this.anime.most_likely_media.episode_number === ""){
			this.anime.most_likely_media.episode_number = "N/A";
		}
  }

	animeSelect(){
		this.onSelect.emit(this.anime);
	}
}
