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
    createform : FormGroup;
    router : Router;
    http : HttpClient;
    response: string;

     constructor(router :Router, http : HttpClient
      ) {
       this.router = router,
       this.http = http,
       this.loginform = new FormGroup({
       username: new FormControl(''),
       password: new FormControl(''),
     });this.createform = new FormGroup({
       newusername : new FormControl(""),
       newpassword : new FormControl("")
     })
      }
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

   http_request(newusername : string,newpassword:string,type:string){
     var requestdata = JSON.stringify({"request_type": type,"username": newusername,"password": newpassword})
    return this.http.post("/login",requestdata,{responseType: "text"}).pipe(catchError(this.handleError))
   }


   check_login(response_message : string,username:string){
     console.log(response_message)
     if(response_message=="ログイン成功"){
       alert(`ようこそ${username}さん！`)
       this.router.navigate(["/chat"],{queryParams:{username : `${username}`}})
     }else if(response_message=="パスワードが違います"){
        alert("パスワードが違います")
        this.username = ""
        this.password = ""
     }else{
       alert("入力された名前のユーザーがいません ログインしなおすが、新規に作成してください")
       this.username = ""
       this.password = ""
     }
   }

   create_check(response_message:string){
     if(response_message == "ユーザーが作成されました"){
       alert("新規ユーザが作成されました。ログインしてください！")
     }else if(response_message=="ユーザーがすでにいます"){
       alert("ユーザーがすでにいます。\n別の名前でつくってください")
     }else{
       alert(response_message)
     }
   }

   formcheck(username:string,password:string){
     if(username==""){
       return "名前を入力してください"
     }else if(username.length>=20){
       return "名前が長すぎます"
     }
     else if(password.length>=20){
       return "パスワードが長すぎます"
     }
     else if(password==""){
       return "パスワードを入力してください"
     }else{
       return "OK"
     }
   }

   create_user(data:createuser){
    var formstatus = this.formcheck(data.newusername,data.newpassword)
    if(formstatus=="OK"){
    this.http_request(data.newusername,data.newpassword,"create").subscribe(response => this.create_check(JSON.parse(response).message))
    }else{
    alert(formstatus)
    }
  }

   check_user(data : logininfo){
        var formstatus = this.formcheck(data.username,data.password)
        if(formstatus=="OK"){
          this.http_request(data.username,data.password,"connect").subscribe(response => {this.check_login(JSON.parse(response).message,data.username)})
        }else{
          alert(formstatus)
        }
     }
   }

interface createuser{
  newusername : string;
  newpassword : string;
}

interface logininfo {
    password : string,
    username : string,
    type:string;
}
