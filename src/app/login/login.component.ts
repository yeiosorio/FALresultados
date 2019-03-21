import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
	correo: any;
	contrasena: any;
	constructor(private router: Router) {}

	ngOnInit() {}
	// funcion que permite realizar la autenticacion del usuario ante el sistema
	iniciarSesion() {
		this.router.navigate([ '/result' ]);
	}
	// funcion que permite realizar el registro del usuario en la plataforma
	registrar() {}
}
