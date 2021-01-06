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
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';


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
    logincheck: string;
    createuser:any;
    requesttype:string;


     constructor(router :Router, http : HttpClient
      ) {
       this.router = router,
       this.http = http,
       this.loginform = new FormGroup({
       username: new FormControl(''),
       password: new FormControl(''),
     });
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
     }else if(response_message=="ログイン失敗"){
        alert("名前、パスワードが違います")
     }else{
       alert(response_message)
     }
   }

   create_check(response_message:string){
     if(response_message == "ユーザーが作成されました"){
       alert("新規ユーザが作成されました。\nログインしてください！")
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

   create_or_login(data:logininfo){
      var formstatus = this.formcheck(data.username,data.password)
      if(formstatus=="OK"){
        console.log(this.requesttype)
        this.http_request(data.username,data.password,this.requesttype).subscribe(response => {this.check_login(JSON.parse(response).message,data.username)})

      }else{
        alert(formstatus)
    }
  }
   }

interface logininfo {
    password : string,
    username : string,
    type:string;
}
