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

   Create_or_Login(data:logininfo){
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
