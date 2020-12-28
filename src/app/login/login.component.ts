import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {Inject} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';
import { FormGroup, FormControl } from '@angular/forms';
import {ActivatedRoute, Params} from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Subject, Observable, Observer} from 'rxjs/Rx';

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

  constructor(router :Router, private http : HttpClient
   ) {
    this.router = router,
    this.loginform = new FormGroup({
    username: new FormControl(''),
    roomnumber: new FormControl(''),
  });
   }
   getdata(data : logininfo): Observable<Response[]>{
     var requestdata = data.roomnumber + data.username
     return this.http.post<Response[]>("/login",requestdata)
   }

   onSubmit(data : logininfo){
     var response = this.getdata(data)
     console.log("got data",response)
     //this.router.navigate(["/login"],{queryParams:{username : `${data.username}`,roomnumber: `${data.roomnumber}`}})
   }

  ngOnInit(): void {
  }
}

interface logininfo {
    roomnumber : string,
    username : string
}
