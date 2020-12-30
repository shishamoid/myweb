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
  password : string;
  username : string;
  loginform : FormGroup;
  router : Router;
  query : string;
  http : HttpClient;
  response: string;

  ngOnInit(): void {
  }
   handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: リモート上のロギング基盤にエラーを送信する
      console.error(error); // かわりにconsoleに出力

      // TODO: ユーザーへの開示のためにエラーの変換処理を改善する
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

   postdata(username :string,password:string){
     //var requestdata = JSON.parse(`{"password": ${data.password}, "username": ${data.username}}`)
     var requestdata = JSON.stringify({"username": username,"password" : password})
     console.log("this is requestdata",requestdata)
     //console.log(this.http.post("/login",requestdata).subscribe(responsedata => console.log(responsedata)))
     return this.http.post("/login",requestdata,{responseType: 'text'}).pipe(catchError(this.handleError))

     //return this.http.post("/login",requestdata).subscribe(responsedata => (console.log(responsedata),JSON.stringify(responsedata)))
   }

   checkstatus(message : string){
     console.log(message)
     if(message=="ログイン成功"){
       console.log("success")
       this.router.navigate(["/chat"],{queryParams:{username : `${this.username}`}})
     }else if(message=="パスワードが違います"){
        alert("パスワードが違います")
        this.username = ""
        this.password = ""
     }else{
       alert("ユーザーがいません")
       this.username = ""
       this.password = ""
     }
   }

   accept(){
     var response = ""

     //this.postdata(this.username,this.password).subscribe(_ => {this.response = _,console.log(_),console.log(JSON.parse(this.response).message)})
     this.postdata(this.username,this.password).subscribe(response => {this.checkstatus(JSON.parse(response).message)})
     console.log(this.response)
     console.log(response)
   }

   onSubmit(data : logininfo){
     //this.getdata(data)
     this.username = data.username
     this.password = data.password
     this.accept()
     console.log("onSubmit",this.response)
     //var response = this.getdata(data)
     //this.router.navigate(["/login"],{queryParams:{username : `${data.username}`,password: `${data.password}`}})
   }
   constructor(router :Router, http : HttpClient
    ) {
     this.router = router,
     this.http = http,
     this.loginform = new FormGroup({
     username: new FormControl(''),
     password: new FormControl(''),
   });

    }

}

interface logininfo {
    password : string,
    username : string
}
