import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { apiService } from '../api.service';
import { Varstore } from '../varstore';

@Component({
  selector: 'app-selected-anime',
  templateUrl: './selected-anime.component.html',
  styleUrls: ['./selected-anime.component.less']
})

export class SelectedAnimeComponent{

	@Output() onComplete = new EventEmitter<any>();

	constructor(public varstore: Varstore,private apiService: apiService) {}

  //Parses the date string to the localy used formatting
	getDate(){
    if(this.varstore.selectedAnime['most_likely_media']['free_available_time'] != "9998-11-30T00:00:00-08:00" && this.varstore.selectedAnime['most_likely_media']['premium_only'] != true){
  		var date = new Date(this.varstore.selectedAnime['most_likely_media']['free_available_time']);
  		var options = { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  		var formattedDate = date.toLocaleDateString(undefined, options);
  		return formattedDate.replace(new RegExp(",", 'g'), "");
    }else{
      return "Not available";
    }
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
		this.apiService.completeEpisode(this.varstore.selectedAnime['most_likely_media']['media_id'], this.varstore.selectedAnime['most_likely_media']['duration']).subscribe(res => {
      this.varstore.selectedAnime = {};
			this.onComplete.emit();
		});
	}

  //Open anime overview and show all episodes
  openOverview(){
    console.log(this.varstore.selectedAnime);
    this.apiService.getCollections(this.varstore.settings['sessionid'], true, this.varstore.selectedAnime['series']['series_id']).subscribe(res => {
      console.log(res);
    });
    this.apiService.getEpisodes(this.varstore.settings['sessionid'], true, "24557").subscribe(res => {
      console.log(res);
    });
  }
}
