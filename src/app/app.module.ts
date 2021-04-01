import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { ChatComponent } from './chat/chat.component';

//以下追記 ルーティング
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

//追加
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule} from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox'
//import {NgxAutoScrollModule} from "ngx-auto-scroll";
import {MatRippleModule} from '@angular/material/core';
import { StopwatchComponent } from './stopwatch/stopwatch.component'

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ChatComponent,
    LoginComponent,
    StopwatchComponent,
    //NgxAutoScrollModule,
  ],
  imports: [
    BrowserModule,
    //以下追記
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatRadioModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatButtonModule,
    CommonModule,
    MatCheckboxModule,
    MatRippleModule
    //RouterModule.forRoot(myRoutes,{useHash:true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
