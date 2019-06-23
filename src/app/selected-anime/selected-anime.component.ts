import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';
import { Varstore } from '../varstore';

@Component({
  selector: 'app-selected-anime',
  templateUrl: './selected-anime.component.html',
  styleUrls: ['./selected-anime.component.less']
})

export class SelectedAnimeComponent{

	@Output() onComplete = new EventEmitter<any>();

	constructor(public varstore: Varstore,private dataService: DataService) {}

  //Parses the date string to the localy used formatting
	getDate(){
		var date = new Date(this.varstore.selectedAnime['most_likely_media']['free_available_time']);
		var options = { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
		var formattedDate = date.toLocaleDateString(undefined, options);
		return formattedDate.replace(new RegExp(",", 'g'), "");
	}

  //Opens the selected Episode in a new tab
	openEpisode(){
		window.open(this.varstore.selectedAnime['most_likely_media']['url']);
	}

  //Opens the series of the selected anime in a new tab
	openAnime(){
		window.open(this.varstore.selectedAnime['series']['url']);
	}

  //Completes the selected episode and refreshes the queue
	completeEpisode(){
		this.dataService.completeEpisode(this.varstore.selectedAnime['most_likely_media']['media_id'], this.varstore.selectedAnime['most_likely_media']['duration']).subscribe(res => {
      this.varstore.selectedAnime = {};
			this.onComplete.emit();
		});
	}

  //Open anime overview and show all episodes
  openOverview(){

  }
}
