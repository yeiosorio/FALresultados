import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';

declare var M: any;

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
	email: any;
	password: any;
	emailLogin: any;
	identification: any;
	confirmEmail: any;
	colorSuccess: any;
	msgUserValidate = "";

	term = false;
	msgRegister = "";
	registerStatus = false;

	constructor(private router: Router, private serviceUser: UserService) {

	}

	ngOnInit() {
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);
	}

	// funcion que permite realizar la autenticacion del usuario ante el sistema
	userAuthenticate() {

		let data = JSON.stringify({
			email : this.emailLogin,
			password : this.password
		});

		this.serviceUser.userAuthenticate(data)
			.subscribe(data => {
				if (data.success) {
					// Se almacena token del lado del cliente para las futuras peticiones

					// Se redirecciona a la pagina de lista de resultados
					this.router.navigate([ '/result' ]);

				} else {
					this.msgUserValidate = data.msg
				}
			});
	}

	// funcion que permite realizar el registro del usuario en la plataforma
	getEmailRegister() {
		if(this.term){
			this.serviceUser.getEmailRegister(this.identification) 
			.subscribe(data => {
				if (data.success) {
					// Registro con exito
					this.colorSuccess = true
					this.msgRegister = "¡Felicitaciones su registro ha sido exitoso!. Ha sido enviado un email con la contraseña"
				} else {
					this.colorSuccess = false
					if (!data.noExist) {
						this.registerStatus = true;
						this.msgRegister = data.msg
					}else{
						this.msgRegister = data.msg
					}
				}
			});
		}else{
			this.colorSuccess = false
			this.msgRegister = "Debe aceptar los terminos y condiciones!."
		}
	}
	// funcion que permite realizar el registro del usuario en la plataforma
	register() {
		let identification = this.identification
		let email = this.email
		let confirmEmail = this.confirmEmail

		if(confirmEmail == email){
			if (this.term) {
				this.serviceUser.register(identification, email)
				.subscribe(data => {
					if (data.success) {
						this.colorSuccess = true
						this.registerStatus = false
						this.msgRegister = data.msg
					} else {
						this.msgRegister = data.msg
					}
				});
			}else{
				this.colorSuccess = false
				this.msgRegister = "Debe aceptar los terminos y condiciones!." 
			}
		}else{
			this.colorSuccess = false
			this.msgRegister = "No coinciden los correos ingresados!."
		}
			
			
		
	}

	toggleCheck(e){
		this.term = e.target.checked;
	}


}
