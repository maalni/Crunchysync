import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-selected-anime',
  templateUrl: './selected-anime.component.html',
  styleUrls: ['./selected-anime.component.css']
})

export class SelectedAnimeComponent {

	@Input() selectedAnime: any;
	@Output() onComplete = new EventEmitter<any>();

	constructor(private dataService: DataService) {}

	getDate(){
		var date = new Date(this.selectedAnime.most_likely_media.free_available_time);
		var options = { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
		var formattedDate = date.toLocaleDateString(undefined, options);
		return formattedDate.replace(new RegExp(",", 'g'), "");
	}

	openEpisode(){
		window.open(this.selectedAnime.most_likely_media.url);
	}

	openAnime(){
		window.open(this.selectedAnime.series.url);
	}

	closeAnime(){
		(<HTMLElement>document.getElementById("selectedAnime")).hidden = true;
	}

	completeEpisode(){
		this.closeAnime();
		this.dataService.completeEpisode(this.selectedAnime['most_likely_media']['media_id'], this.selectedAnime['most_likely_media']['duration']).subscribe(res => {
			this.onComplete.emit();
		});
	}
}
