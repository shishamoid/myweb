import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable} from 'rxjs/Rx';
//import {Md5} from 'ts-md5/dist/md5';
import { WebSocketSubject,webSocket } from 'rxjs/webSocket';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map, tap, retry } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo, QueryRef,gql,Mutation} from 'apollo-angular';
import { CookieService } from 'ngx-cookie-service';
//import { Subscription } from 'rxjs/Subscription';
import {GraphQLModule} from '../graphql.module';

//import gql from 'graphql-tag'
import {AfterViewInit, ElementRef, ViewChild} from '@angular/core';
//import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';

const subscribechat = gql`subscription mysubscription {
  oncallCreateMywebChat {
    message
    timestamp
  }
}
`

//atomの補完が古い?↓
const createchat = gql`mutation createMywebChat($sessionid: ID!,$message: String!,$timestamp: String!)
{
  createMywebChat(sessionid: $sessionid,message: $message,timestamp:$timestamp) {
    message
    timestamp
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
  //@ViewChild("test") test: ElementRef
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

    this.apollo.subscribe({
      query:subscribechat,
    }).subscribe((data:any)=>this.receive_message(data),(error:any)=>console.log("error",error))


    this.gqlSocket = webSocket({
     url: 'wss://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-realtime-api.ap-northeast-1.amazonaws.com/graphql',
     protocol: 'graphql-ws',
   })
    //this.gqlSocket.subscribe(response=>console.log("response",response))

    /*var ss = this.apollo.watchQuery<any>({
      query:querychat,
      variables: {
        sessionid: this.cookie.get("sessionid")
      }
    }).valueChanges.subscribe().subscribe((data:any)=>this.receive_message(data),(error:any)=>console.log("error",error))*/
    //this.subscchat.subscribe()
    /*this.commentsQuery = this.apollo.watchQuery<any>({
      query: subscribechat
    })
    this.commentsQuery.subscribeToMore({
      document: subscribechat,
      updateQuery: ()=>{
        console.log("subsub")
      }
    })
    */;
    //this.chatSubscription.subscribeTomore
  }
  sub(){
    this.gqlSocket.next({
      payload: {
        query: subscribechat
      }
    })
  }

  subscchat(){
    console.log("サブスクライバ")
    return this.apollo.subscribe({
      query: subscribechat
    })
  }

  sendchat(sessionid:string,message:string,timestamp:string){
    this.apollo.mutate<any>({
      mutation: createchat,
      variables: {
        sessionid:sessionid,
        message: message,
        timestamp: timestamp
      },
    }).subscribe()
    this.apollo.subscribe({
      query:subscribechat
    }).subscribe((data:any)=>this.receive_message(data),(error:any)=>console.log("error",error))
    console.log("asdfsdfasdfasdffds",this.apollo.subscribe({
      query:subscribechat
    }).subscribe((data:any)=>this.receive_message(data),(error:any)=>console.log("error",error)).closed)
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  createObservableSocket() {
    return new Observable(observer => {
      this.ws.onmessage = (e) => {
        var object:[] = JSON.parse(e.data)
        observer.next(object)
      }
      this.ws.onerror = (event) => observer.error(event)
      this.ws.onclose = () => observer.complete()
    }
    );
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
    /*if (this.ws.readyState === WebSocket.OPEN) {
      //roomunum調整する必要あり
      var moji = `{"username": "${this.username}","roomname": "${this.roomname}","message": "${data.chatmessage}","time": "${time}"}`
      this.message = JSON.stringify(JSON.parse(moji))
      console.log("send",this.message)
      return this.ws.send(this.message)
    }//https://bugsdb.com/_ja/debug/19204bfe6dfe10f00bd2c0ae346f666f

  */
  return ""}

  roomrequest(roomname: string, password: string, request_type: string) {
    //websocket接続要求
    console.log(roomname, password, request_type,this.username)
    var requestdata = JSON.stringify({ "request_type": request_type, "password": password, "roomname": roomname})
    console.log("this is request", requestdata)
    return this.http.post("/chat", requestdata, { responseType: 'text' }).pipe(catchError(this.handleError))
  }

  startchat(roomname:string) {

    //var tmpport = 12345

    //this.ws = new WebSocket(`ws://localhost:${tmpport}`);//this.chatarray.push([msg.message,msg.time,msg.username])
    //this.createObservableSocket().subscribe((message :any) => this.receive_message(message))

    //this.sendchat()
  }

  receive_message(message:any){
    console.log("メッセージ",message)
    if(message.username!=this.username){
      var date = new Date(message.timestamp)
      var time = this.lender_time(date)
      this.chatarray.push([message.username,message.message,time])
    }
  }

  connectchat(data: any, request_type: string) {
    //request_type = create or connect
    console.log("clicked",data.password,data.roomname)
    var formstatus = this.formcheck(data.roomname,data.password,request_type)

    if(formstatus=="OK"){
      switch(request_type){
        case "create":
          this.roomrequest(data.roomname, data.password, request_type).subscribe(response => {
            alert(response) //roomの作成に成功しました or roomの作成に失敗しました
          })
          break

        case "connect":
            this.roomrequest(data.roomname, data.password, request_type).subscribe(response => {
            if (response == "roomを作成してください"){
              alert(response)
            }else{
              this.connectstatus = true
              this.init_chat(data,response)
              }
            })
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
      else if(roomname==""){
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

  init_chat(data:any,response:any){
    try {
      //var roomname=;
      this.roomname = data.roomname
      this.chatarray = this.lender_chat(response)
      this.connectstatus = true
      //スクロール

    }
    catch{
      console.log("初めて")
    }
    //this.startchat(roomname)
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
    this.scroll()
  }
  ngAfterViewChecked(){
  }
}
