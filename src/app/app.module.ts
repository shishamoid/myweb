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
const myRoutes = [
  //{path:"",component: AppComponent},
  { path: 'main', component: MainComponent },
  { path: './chat', component: ChatComponent},
  { path: './login', component: LoginComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ChatComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    //以下追記
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule
    //RouterModule.forRoot(myRoutes,{useHash:true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
