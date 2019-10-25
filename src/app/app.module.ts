import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FilterPipe } from './filter.pipe';
import { Varstore } from './varstore';
import { apiService } from './api.service';

import { AppComponent } from './app.component';
import { AnimeComponent } from './anime/anime.component';
import { SelectedAnimeComponent } from './selected-anime/selected-anime.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SettingsComponent } from './settings/settings.component';
import { CategoryComponent } from './category/category.component';
import { SearchComponent } from './search/search.component';
import { NotificationComponent } from './notification/notification.component';
import { SetupComponent } from './setup/setup.component';


@NgModule({
  declarations: [
    AppComponent,
    AnimeComponent,
		FilterPipe,
		SelectedAnimeComponent,
		SpinnerComponent,
		NavbarComponent,
		SettingsComponent,
		CategoryComponent,
		SearchComponent,
		NotificationComponent,
		SetupComponent
  ],
  imports: [
    BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		FormsModule
  ],
  providers: [
    apiService,
    Varstore
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
