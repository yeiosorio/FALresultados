import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule} from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { app_routing } from './app.routes';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ResultComponent } from './result/result.component';

import { MatButtonModule, MatCheckboxModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MzNavbarModule } from 'ngx-materialize';

import { AuthGuard } from './_guards';
import {
	MatPaginatorModule,
	MatTableModule,
	MatSortModule,
	MatAutocompleteModule,
	MatBadgeModule,
	MatBottomSheetModule,
	MatButtonToggleModule,
	MatCardModule,
	MatChipsModule,
	MatDatepickerModule,
	MatDialogModule,
	MatDividerModule,
	MatExpansionModule,
	MatGridListModule,
	MatIconModule,
	MatInputModule,
	MatListModule,
	MatMenuModule,
	MatNativeDateModule,
	MatProgressBarModule,
	MatProgressSpinnerModule,
	MatRadioModule,
	MatRippleModule,
	MatSelectModule,
	MatSidenavModule,
	MatSliderModule,
	MatSlideToggleModule,
	MatSnackBarModule,
	MatStepperModule,
	MatTabsModule,
	MatToolbarModule,
	MatTooltipModule,
	MatTreeModule
} from '@angular/material';

@NgModule({
	declarations: [ AppComponent, LoginComponent, ResultComponent ],
	imports: [
		MzNavbarModule,
		FormsModule,
		ReactiveFormsModule,
		BrowserModule,
		AppRoutingModule,
		app_routing,
		MatButtonModule,
		MatCheckboxModule,
		MatPaginatorModule,
		MatTableModule,
		MatSortModule,
		MatAutocompleteModule,
		MatBadgeModule,
		MatBottomSheetModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatCardModule,
		MatCheckboxModule,
		MatChipsModule,
		MatStepperModule,
		MatDatepickerModule,
		MatDialogModule,
		MatDividerModule,
		MatExpansionModule,
		MatGridListModule,
		MatIconModule,
		MatInputModule,
		MatListModule,
		MatMenuModule,
		MatNativeDateModule,
		MatPaginatorModule,
		MatProgressBarModule,
		MatProgressSpinnerModule,
		MatRadioModule,
		MatRippleModule,
		MatSelectModule,
		MatSidenavModule,
		MatSliderModule,
		MatSlideToggleModule,
		MatSnackBarModule,
		MatSortModule,
		MatTableModule,
		MatTabsModule,
		MatToolbarModule,
		MatTooltipModule,
		MatTreeModule,
		HttpClientModule
	],
	providers: [ AuthGuard ],
	bootstrap: [ AppComponent ]
})
export class AppModule {}
