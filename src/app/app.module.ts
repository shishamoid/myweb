import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { ChatComponent } from './chat/chat.component';

//以下追記 ルーティング
import { RouterModule, Routes } from '@angular/router';
const myRoutes = [
  //{path:"",component: AppComponent},
  { path: 'main', component: MainComponent },
  { path: 'chat', component: ChatComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    //以下追記
    AppRoutingModule,
    //RouterModule.forRoot(myRoutes,{useHash:true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
