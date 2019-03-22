import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../providers/users.service';

declare var M: any;

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
	email: any;
	password: any;
	identification: any;
	registerStatus = false;

	constructor(private router: Router, private serviceUser: UsersService) {

	}

	ngOnInit() {
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);
	}

	// funcion que permite realizar la autenticacion del usuario ante el sistema
	signin() {
		this.router.navigate([ '/result' ]);
	}

	// // funcion que permite realizar el registro del usuario en la plataforma
	// getEmailRegister() {
	// 		this.serviceUser.getEmailRegister(this.identification)
	// 		.subscribe(data => {
	// 			if (data.success) {
	// 				// Registro con exito
	// 			} else {
	// 				this.registerStatus = true;
	// 			}
	// 		});
	// }
	// // funcion que permite realizar el registro del usuario en la plataforma
	// register() {
	// 		this.serviceUser.getEmailRegister(this.identification)
	// 		.subscribe(data => {
	// 			if (data.success) {
				
	// 			} else {
	// 				// Sin datos
	// 				this.register();
	// 			}
	// 		});
	// }


}
