import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

@Component({
  selector: 'app-anime',
  templateUrl: './anime.component.html',
  styleUrls: ['./anime.component.css'],
})
export class AnimeComponent implements OnInit {

	@Input() anime;
	@Output() onSelect = new EventEmitter<Array<any>>();

  ngOnInit() {
		if(this.anime.most_likely_media.playhead === undefined){
			this.anime.most_likely_media.playhead = 0;
		}

		if(this.anime.most_likely_media.episode_number === ""){
			this.anime.most_likely_media.episode_number = "N/A";
		}
  }

	animeSelect(){
		console.log(this.anime);
		this.onSelect.emit(this.anime);
	}

	openEpisode(){
		window.open(this.anime.most_likely_media.url);
	}
}
