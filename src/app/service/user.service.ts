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

        // let token = localStorage.getItem('token').substring(1, localStorage.getItem('token').length - 1);

        // let headers: HttpHeaders = new HttpHeaders();
        // headers = headers.append('Content-Type', 'application/json');
        // headers = headers.append('authgl', 'glbearer ' + token);

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

   public recoveryPassword(identification) {

        // let token = localStorage.getItem('token').substring(1, localStorage.getItem('token').length - 1);

        // let headers: HttpHeaders = new HttpHeaders();
        // headers = headers.append('Content-Type', 'application/json');
        // headers = headers.append('authgl', 'glbearer ' + token);

        return Observable.create(observer => {
          this.http.post(this.URL_API + `WsUsers/recoveryPassword.json`, {identification:identification}).subscribe(
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
