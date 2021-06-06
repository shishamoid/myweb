import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import {gql,Apollo} from 'apollo-angular';
import { CookieService } from 'ngx-cookie-service';

const authuser = gql(
  `query MyQuery($username:ID!,$password:String!,$cookie:String!) {
  getuser(password: $password, username: $username, cookie: $cookie) {
    result
    }
  }
`)

const createuser = gql(
  `mutation MyMutation($username:ID!,$password:String!){
  createuser(password: $password, username: $username) {
    password
    }
  }`
)

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
    requesttype:string='connect';
    how_to_use:boolean= false;
    apollo: Apollo
    cookie:CookieService


     constructor(router :Router, http : HttpClient,apollo:Apollo,cookie:CookieService)
     {
       this.apollo = apollo,
       this.cookie = cookie,
       this.router = router,
       this.http = http,
       this.loginform = new FormGroup({
       username: new FormControl(''),
       password: new FormControl(''),
     });
      }
      ngOnInit(){
      }

   http_request(newusername : String,newpassword:String,type:String){
     if(type=="connect"){
       return this.apollo.query<any>({
         query: authuser,
         variables: {
           username:newusername,
           password:newpassword
        },
       })
     }
     else if(type=="create"){
       return this.apollo.mutate<any>({
         mutation: createuser,
         variables: {
           username:newusername,
           password:newpassword
        },
       })
     }
     else{
       return "TypeError"
     }
   }

   check_login(response_message :any,username:String){
     console.log(response_message)
     if(response_message=="ログイン成功"){
       this.router.navigate(["/chat"],{queryParams:{username : `${username}`}})
     }else if(response_message=="ログイン失敗"){
       alert("名前、パスワードが違います")
     }else{
       alert(response_message)
     }
   }

   create_check(response_message:String){
     if(response_message == "ユーザーが作成されました"){
       alert("新規ユーザが作成されました。\nログインしてください！")
     }else if(response_message=="ユーザーがすでにいます"){
       alert("ユーザーがすでにいます。\n別の名前でつくってください")
     }else{
       alert(response_message)
     }
   }

   formcheck(username:String,password:String){
     if(username==""){
       return "名前を入力してください"
     }
     else if(password==""){
       return "パスワードを入力してください"
     }
     else if(username.length>=20){
       return "名前が長すぎます"
     }
     else if(password.length>=20){
       return "パスワードが長すぎます"
     }
     else if(password.length<=6 && password!=""){
       return "パスワードが短すぎます"
     }
     else if(password.match(/[/^\W+$]/)){ //半角英数+全角英数+アンダーバー
       return "パスワードは英数字とアンダーバーのみ使用可能です"
     }
     else{
       return "OK"
     }
   }

   create_or_login(data:logininfo){
      var formstatus = this.formcheck(data.username,data.password)
      var username = data.username
      var password = data.password
      var requesttype = this.requesttype
      if(formstatus=="OK"){
        if(requesttype=="connect"){
          this.apollo.query<any>({
            query: authuser,
            variables: {
              username:username,
              password:password,
              cookie:this.cookie.get("sessionid")
           },
         }).subscribe(response => {this.router.navigate(["/chat"],{queryParams:{username : `${username}`}})},error => {console.log(error),alert("名前かパスワードが違います")})
        }
        else if(requesttype=="create"){
          this.apollo.mutate<any>({
            mutation: createuser,
            variables: {
              username:username,
              password:password
           }
         }).subscribe(response => {alert("作成できました")},error => {console.log(error),alert("作成できませんでした")})
        }
        //this.http_request(data.username,data.password,this.requesttype)
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
