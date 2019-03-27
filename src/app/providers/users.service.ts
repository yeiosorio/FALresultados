import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  URL_API: string;

  constructor(public http: HttpClient) {
    this.URL_API = 'http://52.183.68.4/xxespejofundacion/back_end/';
   }

  //  public register() {

  //     return Observable.create(observer => {
  //       this.http.post(this.URL_API + `WsUsers/register.json`, {identification: 1}).subscribe(
  //           data => {
  //             observer.next(data);
  //             observer.complete();
  //           },
  //           error => {
  //             observer.next(error);
  //             observer.complete();
  //           }
  //         );
  //     });
  //  }
   
  //  public getEmailRegister(identification) {

  //     return Observable.create(observer => {
  //       this.http.post(this.URL_API + `WsUsers/getEmailRegisterister.json`, {identification: identification}).subscribe(
  //           data => {
  //             observer.next(data);
  //             observer.complete();
  //           },
  //           error => {
  //             observer.next(error);
  //             observer.complete();
  //           }
  //         );
  //     });
  //  }
}
