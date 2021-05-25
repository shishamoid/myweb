import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable} from 'rxjs/Rx';
//import {Md5} from 'ts-md5/dist/md5';
import { WebSocketSubject,webSocket } from 'rxjs/webSocket';
import { HttpClient} from '@angular/common/http';
import { of } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { QueryRef,gql,Mutation} from 'apollo-angular';
import { CookieService } from 'ngx-cookie-service';
import { setContext } from '@apollo/client/link/context';
import {split,ApolloClientOptions, InMemoryCache,ApolloLink, ApolloClient} from '@apollo/client/core';
import {HttpHeaders} from '@angular/common/http';
import {Apollo,APOLLO_OPTIONS} from 'apollo-angular';
//import {HttpLink} from 'apollo-link/http';

const subscribechat =
`subscription MySubscription($roomname: String!) {
  oncallCreateMywebChat(roomname: $roomname) {
      result {
        message
        roomname
        timestamp
        username
      }
      roomname
  }
}`

const authroom = gql(
  `query MyQuery($roomname:ID!,$password:String!,$cookie:String!) {
  getroom(password: $password, roomname: $roomname, cookie: $cookie) {
    result
  }
}
`)

//atomの補完が古い?↓
const createchat = gql`mutation createMywebChat($sessionid: ID!,$message: String!,$timestamp: String!)
{
  createMywebChat(sessionid: $sessionid,message: $message,timestamp:$timestamp) {
    result {
      message
      roomname
      timestamp
      username
    }
      roomname
    }
  }
`;

const createroom = gql`mutation createroom($roomname: ID!,$password: String!)
{
  createroom(roomname: $roomname,password: $password) {
    password
    }
  }
`;

const querychat = gql`
query MyQuery ($sessionid: ID!){
  getChatHistory(sessionid: $sessionid){
    username
    roomname
    message
    timestamp
  }
}
`


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  roomname: string;
  username: string;
  subject: WebSocketSubject<MessageEvent>
  response: string;
  roomnameform: FormGroup;
  chatform: FormGroup;
  createnewroom: FormGroup;
  message: string;
  ws: WebSocket;
  chatarray :string[][] =[]
  connectstatus : boolean = false;
  requesttype:string ="connect";
  room_password : string;
  how_to_use:boolean =false;

  chatSubscription:any;
  commentsQuery: QueryRef<any>;
  gqlSocket: WebSocketSubject<any>
  lastchat :HTMLElement

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router:Router,
    private apollo:Apollo,
    private cookie:CookieService
  ) {
    this.router = router,
    //this.apollo = apollo,
    this.roomnameform = new FormGroup({
      roomname: new FormControl(""),
      password: new FormControl(""),
    });
    this.chatform = new FormGroup({
      chatmessage: new FormControl("")
    })
  }

  ngOnInit(){
    this.route.queryParams.subscribe(query => {
      this.username = query['username'];
    })
    this.apollo.subscribe({
      query:querychat,
      variables:{
        sessionid:this.cookie.get("sessionid")
      }
    }).subscribe((data:any)=>this.init_chat(data.data.getChatHistory[0],data.data.getChatHistory),(error:any)=>console.log("error",error))

  }

  sendchat(sessionid:string,message:string,timestamp:string){
    var header = new HttpHeaders().set('sessionid2', sessionid)
    header = header.set("sessionid",sessionid)
    header = header.set("x-api-key","da2-puirc5dyvrhzjljjhcdyglhvya")

    this.apollo.mutate<any>({
      mutation: createchat,
      variables: {
        sessionid:sessionid,
        message: message,
        timestamp: timestamp
      },
      context:{
        "headers":header,
      },
    }).subscribe(data=>console.log("result",data))
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  split_message(message:string){
    //var message_list:[] = message
    var result = ""
    for(var i=0; i<message.length;i++){
      result += message.charAt(i);
      if(i%25==0 && i!=0){
        result+='\n'
      }
    }
    return result
  }

  lender_time(time:Date){
    return time.getHours().toString() + ":" + (0 + time.getMinutes().toString()).slice(-2)
  }

  sendmessage(data: any) {
    if(data.message==""){
       return "";
    }
    var date = new Date()
    var time = date.getFullYear()
      + '/' + ('0' + (date.getMonth() + 1)).slice(-2)
      + '/' + ('0' + date.getDate()).slice(-2)
      + ' ' + ('0' + date.getHours()).slice(-2)
      + ':' + ('0' + date.getMinutes()).slice(-2)
      + ':' + ('0' + date.getSeconds()).slice(-2)
    //console.log(date.getTime())
    var last_index:number= this.chatarray.length
    this.chatarray[last_index]= []
    this.chatarray[last_index][0] = "mymessage"
    this.chatarray[last_index][1] = data.chatmessage
    this.chatarray[last_index][2] = this.lender_time(date)
    this.sendchat(this.cookie.get("sessionid"),data.chatmessage,time)
  return ""
}

  startchat(roomname:String) {
    var encode_apikey =btoa(JSON.stringify({"host":"mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-api.ap-northeast-1.amazonaws.com","x-api-key":"da2-puirc5dyvrhzjljjhcdyglhvya"}))
    var encode_json = btoa(JSON.stringify({}))
    var url = `wss://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-realtime-api.ap-northeast-1.amazonaws.com/graphql?header=${encode_apikey}&payload=${encode_json}`
    this.gqlSocket = webSocket({
     url: url,
     protocol: 'graphql-ws',
     //header:"",
     //openObserver:{next:()=>this.gqlSocket.next({"header":{"x-api-key":"da2-puirc5dyvrhzjljjhcdyglhvya"},"type": "connection_init", "payload": {} })}
   })
   this.gqlSocket.subscribe(message=>this.receive_message(message))
   this.gqlSocket.next({"header":{"x-api-key":"da2-puirc5dyvrhzjljjhcdyglhvya"},"type": "connection_init", "payload": {} })
   console.log("roomname",roomname)
   this.gqlSocket.next({
    "id": "1234",
    "payload": {
      "data": JSON.stringify({"query": subscribechat,"variables":{"roomname":roomname}}),
      "extensions": {
        "authorization": {
          "host": "mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-api.ap-northeast-1.amazonaws.com",
          "x-api-key":"da2-puirc5dyvrhzjljjhcdyglhvya",
          "sessionid":this.cookie.get("sessionid"),
        },
        "headers":{
          "roomname":roomname
        }
      }
    },
    "type": "start"
  })
  }

  receive_message(message:any){
    console.log("メッセージ",message)
    if(message.type=="data"){
      console.log("新着",newmessage)
      var newmessage = message.payload.data.oncallCreateMywebChat.result
      if(newmessage.username!=this.username){
        var date = new Date(newmessage.timestamp)
        var time = this.lender_time(date)
        this.chatarray.push([newmessage.username,newmessage.message,time])
      }
    }

  }


  connectchat(data: any, request_type: string) {
    //request_type = create or connect
    var formstatus = this.formcheck(data.roomname,data.password,request_type)
    var roomname = data.roomname
    var password = data.password

    if(formstatus=="OK"){
      switch(request_type){
        case "create":
        this.apollo.mutate<any>({
            mutation: createroom,
            variables: {
              roomname:roomname,
              password:password
            },
          }).subscribe(response => {
            alert("roomが作成されました") //roomの作成に成功しました or roomの作成に失敗しました
          },error => {alert("roomの作成に失敗しました"),console.log("error",error)})
          break

        case "connect":
        console.log("authroom",roomname,password)
        this.apollo.query<any>({
            query: authroom,
            variables: {
              cookie:this.cookie.get("sessionid"),
              roomname:roomname,
              password:password
            },
          }).subscribe(response => {
            this.apollo.subscribe({
              query:querychat,
              variables:{
                sessionid:this.cookie.get("sessionid")
              }
            }).subscribe((data:any)=>{
              //this.init_chat(data.data.getChatHistory[0],data.data.getChatHistory),
              console.log("pokemon",data)
              console.log("pokemon2",data.data.getChatHistory)
              this.roomname = roomname,
              this.chatarray = this.lender_chat(data.data.getChatHistory),
              this.connectstatus = true,
              this.startchat(roomname)}
              ,(error:any)=>console.log("error",error))
          },error => {alert("roomの認証に失敗しました"),console.log("error",error)})

        }
      }
    else{
      alert(formstatus)
    }
  }

    formcheck(roomname:string,password:string,request_type:string){
      if(this.roomname==roomname){
        return "接続中です"
      }
      if(roomname==""){
        return "グループ名を入力してください"
      }
      else if(password==""){
        return "パスワードを入力してください"
      }
      else if(roomname.length>=20){
        return "グループ名は20文字未満です"
      }
      else if(password.length>=20){
        return "パスワードは20文字未満です"
      }
      else if(password.length<=6 && password!=""){
        return "パスワードは6文字以上です"
      }
      else if(password.match(/[/^\W+$]/)){ //半角英数+全角英数+アンダーバー
        return "英数字とアンダーバーのみ使用可能です"
      }
      else{
        return "OK"
      }
    }

  init_chat(data:any,response:[]){
    console.log("dataです",data)
    //console.log("response",response)

    try {
      this.roomname = data.roomname
      this.chatarray = this.lender_chat(response)
      this.connectstatus = true
      this.startchat(this.roomname)
      //this.scroll()
    }
    catch{
      console.log("初めて")
    }
  }

  lender_chat(messages:[]) {
    var result_array :string[][] =[]
    for(var i = 0;i<messages.length;i++){
      var response_1 = JSON.parse(JSON.stringify(messages[i]))
      var message_content:string = this.split_message(response_1.message)
      var date = new Date(response_1.timestamp)
      var flag:string = (this.username == response_1.username)?"mymessage":response_1.username
      var message_time = this.lender_time(date)
      var unit = [flag,message_content,message_time]

      //日が違ったら処理
      var date_unit = ['_',"date",(date.getMonth()+1).toString()+ "月" + date.getDate().toString() + "日"]
      if (i==0){
        result_array.push(date_unit)
      }
      else{
        var date_recent = new Date(JSON.parse(JSON.stringify(messages[i-1])).timestamp)
        if((date.getDate()!=date_recent.getDate()) || (date.getMonth() !=date_recent.getMonth())){
          result_array.push(date_unit)
            }
          }
      result_array.push(unit)
        }
    return result_array
  }
  scroll(){
    let target  = document.getElementById("lastchat")
    //let target = this.lastchat;
    console.log("target",target)
    if(target){
      target.scrollTop = target.scrollHeight;
      //target.scrollIntoView(false)
    }
    console.log("Kk")
  }

  ngAfterViewInit(){
  }
  ngAfterViewChecked(){
  }
}
