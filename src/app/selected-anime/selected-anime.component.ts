import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-selected-anime',
  templateUrl: './selected-anime.component.html',
  styleUrls: ['./selected-anime.component.css']
})

export class SelectedAnimeComponent {

	@Input() selectedAnime: any;
	@Input() userIsPremium;
	@Output() onComplete = new EventEmitter<any>();

	constructor(private dataService: DataService) {}

  //Parses the date string to the localy used formatting
	getDate(){
		var date = new Date(this.selectedAnime.most_likely_media.free_available_time);
		var options = { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
		var formattedDate = date.toLocaleDateString(undefined, options);
		return formattedDate.replace(new RegExp(",", 'g'), "");
	}

  //Opens the selected Episode in a new tab
	openEpisode(){
		window.open(this.selectedAnime.most_likely_media.url);
	}

  //Opens the series of the selected anime in a new tab
	openAnime(){
		window.open(this.selectedAnime.series.url);
	}

  //Closes the selected anime
	closeAnime(){
		(<HTMLElement>document.getElementById("selectedAnime")).hidden = true;
	}

  //Completes the selected episode and refreshes the queue
	completeEpisode(){
		this.closeAnime();
		this.dataService.completeEpisode(this.selectedAnime['most_likely_media']['media_id'], this.selectedAnime['most_likely_media']['duration']).subscribe(res => {
			this.onComplete.emit();
		});
	}
}
