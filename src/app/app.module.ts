import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { ChatComponent } from './chat/chat.component';

//以下追記 ルーティング
import { LoginComponent } from './login/login.component';

//追加
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { StopwatchComponent } from './stopwatch/stopwatch.component';
import { GraphQLModule } from './graphql.module'
import { CookieService } from 'ngx-cookie-service';
import { OthersComponent } from './others/others.component';

import {MatExpansionModule} from '@angular/material/expansion';
import {MatTreeModule} from '@angular/material/tree';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ChatComponent,
    LoginComponent,
    StopwatchComponent,
    OthersComponent,
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
    MatRippleModule,
    GraphQLModule,
    MatExpansionModule,
    MatTreeModule
    //CookieService
    //RouterModule.forRoot(myRoutes,{useHash:true})
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
