import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  URL_API: string;

  constructor(public http: HttpClient) {
    this.URL_API = 'http://52.183.68.4/xxespejofundacion/back_end/';
   }

   public register(identification, email) {

      let data = JSON.stringify({identification: identification, email: email});
      return Observable.create(observer => {
        this.http.post(this.URL_API + `WsUsers/register.json`, data).subscribe(
            data => {
              observer.next(data);
              observer.complete();
            },
            error => {
              observer.next(error);
              observer.complete();
            }
          );
      });
   }
   
   public getEmailRegister(identification) {
     let data = JSON.stringify({identification: identification});

      return Observable.create(observer => {
        this.http.post(this.URL_API + `WsUsers/getEmailRegister.json`, data).subscribe(
            data => {
              observer.next(data);
              observer.complete();
            },
            error => {
              observer.next(error);
              observer.complete();
            }
          );
      });
   }
   public userAuthenticate(data) {

      return Observable.create(observer => {
        this.http.post(this.URL_API + `WsUsers/userAuthenticate.json`, data).subscribe(
            data => {
              observer.next(data);
              observer.complete();
            },
            error => {
              observer.next(error);
              observer.complete();
            }
          );
      });
   }

}
