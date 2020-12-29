import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {Inject} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';
import { FormGroup, FormControl } from '@angular/forms';
import {ActivatedRoute, Params} from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Subject,Observer} from 'rxjs/Rx';
import { catchError, map, tap,retry } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  roomnumber : string;
  username : string;
  loginform : FormGroup;
  router : Router;
  query : string;
  http : HttpClient;

  constructor(router :Router, http : HttpClient
   ) {
    this.router = router,
    this.http = http,
    this.loginform = new FormGroup({
    username: new FormControl(''),
    roomnumber: new FormControl(''),
  });
   }
   handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: リモート上のロギング基盤にエラーを送信する
      console.error(error); // かわりにconsoleに出力

      // TODO: ユーザーへの開示のためにエラーの変換処理を改善する
      console.log(`${operation} failed: ${error.message}`);

      // 空の結果を返して、アプリを持続可能にする
      return of(result as T);
    };
  }

   postdata(data : logininfo){
     //var requestdata = JSON.parse(`{"roomnumber": ${data.roomnumber}, "username": ${data.username}}`)
     var requestdata = JSON.stringify({"roomnumber" : data.roomnumber,"username": data.username})
     console.log("this is requestdata",requestdata)
     console.log(this.http.post("/login",requestdata).subscribe(responsedata => console.log(responsedata)))
     return this.http.post<logininfo>("/login",requestdata).pipe(tap(response => console.log("this is response",response)),catchError(this.handleError))
   }

   onSubmit(data : logininfo){
     //this.getdata(data)
     var response_post = this.postdata(data)
     console.log("post data",response_post)
     //var response = this.getdata(data)
     //this.router.navigate(["/login"],{queryParams:{username : `${data.username}`,roomnumber: `${data.roomnumber}`}})
   }

  ngOnInit(): void {
  }
}

interface logininfo {
    roomnumber : string,
    username : string
}
