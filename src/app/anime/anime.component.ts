import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

@Component({
  selector: 'app-anime',
  templateUrl: './anime.component.html',
  styleUrls: ['./anime.component.css'],
})

export class AnimeComponent {

	@Input() anime;
	@Input() userIsPremium;
	@Output() onSelect = new EventEmitter<Array<any>>();

  //Emit an Event once an anime got selected
	animeSelect(){
		this.onSelect.emit(this.anime);
	}

  //Open the Episode in a new tab
	openEpisode(){
		window.open(this.anime.most_likely_media.url);
	}
}
