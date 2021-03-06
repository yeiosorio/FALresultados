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
		//this.URL_API = 'https://samfundacion.com/back_end/';
	}

	public register(identification, email) {
		let data = JSON.stringify({ identification: identification, email: email });
		return Observable.create((observer) => {
			this.http.post(this.URL_API + `WsUsers/register.json`, data).subscribe(
				(data) => {
					observer.next(data);
					observer.complete();
				},
				(error) => {
					observer.next(error);
					observer.complete();
				}
			);
		});
	}

	public getEmailRegister(identification) {
		let data = JSON.stringify({ identification: identification });

		return Observable.create((observer) => {
			this.http.post(this.URL_API + `WsUsers/getEmailRegister.json`, data).subscribe(
				(data) => {
					observer.next(data);
					observer.complete();
				},
				(error) => {
					observer.next(error);
					observer.complete();
				}
			);
		});
	}

	public userAuthenticate(data) {
		return Observable.create((observer) => {
			this.http.post(this.URL_API + `WsUsers/userAuthenticate.json`, data).subscribe(
				(data) => {
					observer.next(data);
					observer.complete();
				},
				(error) => {
					observer.next(error);
					observer.complete();
				}
			);
		});
	}

	public recoveryPassword(identification) {
		let data = JSON.stringify({ identification: identification });
		return Observable.create((observer) => {
			this.http.post(this.URL_API + `WsUsers/recoveryPassword.json`, data).subscribe(
				(data) => {
					observer.next(data);
					observer.complete();
				},
				(error) => {
					observer.next(error);
					observer.complete();
				}
			);
		});
	}

	// Cambio de contraseña
	public changePassword(antPassword, newPassword, identification) {
		let data = JSON.stringify({
			antPassword: antPassword,
			newPassword: newPassword,
			identification: identification
		});
		return Observable.create((observer) => {
			this.http.post(this.URL_API + `WsUsers/changePassword.json`, data).subscribe(
				(data) => {
					observer.next(data);
					observer.complete();
				},
				(error) => {
					observer.next(error);
					observer.complete();
				}
			);
		});
	}

	public getOrdersByRol(dateIni, dateEnd, identification, rol, client) {
		// let token = localStorage.getItem('token').substring(1, localStorage.getItem('token').length - 1);

		// let headers: HttpHeaders = new HttpHeaders();
		// headers = headers.append('Content-Type', 'application/json');
		// headers = headers.append('authgl', 'glbearer ' + token);
		let data = JSON.stringify({
			dateIni: dateIni,
			dateEnd: dateEnd,
			identification: identification,
			rol: rol,
			client: client
		});

		return Observable.create((observer) => {
			this.http.post(this.URL_API + `WsUsers/getOrdersByRol.json`, data).subscribe(
				(data) => {
					observer.next(data);
					observer.complete();
				},
				(error) => {
					observer.next(error);
					observer.complete();
				}
			);
		});
	}

	public getInfoResult(people_id, specialist_id) {
		let data = JSON.stringify({ people_id: people_id, id: specialist_id });

		return Observable.create((observer) => {
			this.http.post(this.URL_API + `WsUsers/getInfoResult.json`, data).subscribe(
				(data) => {
					observer.next(data);
					observer.complete();
				},
				(error) => {
					observer.next(error);
					observer.complete();
				}
			);
		});
	}

	public printResult(data) {
		return Observable.create((observer) => {
			this.http.post(this.URL_API + `resultProfiles/preResultProfile.json`, data).subscribe(
				(data) => {
					observer.next(data);
					observer.complete();
				},
				(error) => {
					observer.next(error);
					observer.complete();
				}
			);
		});
	}

	public addPrintControl(result_id, uid, attention_id, people) {
		let data = JSON.stringify({
			results_id: result_id,
			users_id: uid,
			attention_id: attention_id,
			people: people
		});

		return Observable.create((observer) => {
			this.http.post(this.URL_API + `WsUsers/addPrintControl.json`, data).subscribe(
				(data) => {
					observer.next(data);
					observer.complete();
				},
				(error) => {
					observer.next(error);
					observer.complete();
				}
			);
		});
	}

	public getClients() {
		return Observable.create((observer) => {
			this.http.get(this.URL_API + `WsUsers/getClients.json`).subscribe(
				(data) => {
					observer.next(data);
					observer.complete();
				},
				(error) => {
					observer.next(error);
					observer.complete();
				}
			);
		});
	}
}
