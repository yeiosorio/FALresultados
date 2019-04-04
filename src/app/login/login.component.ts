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
	identificationLogin: any;
	identification: any;
	recoveryIdentification: any;
	confirmEmail: any;
	colorSuccess: any;
	colorRecovery: any;

	msgUserValidate = '';
	msgRegister = '';
	msgRecovery = '';

	term = false;
	registerStatus = false;

	constructor(private router: Router, private serviceUser: UserService) {}

	ngOnInit() {
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);

		var elems = document.querySelectorAll('#recoveryPassword');
		var instances = M.Modal.init(elems, {
			dismissible: false
		});

		console.log(instances);
	}

	// funcion que permite realizar la autenticacion del usuario ante el sistema
	userAuthenticate() {
		// this.router.navigate([ '/result' ]);

		let data = JSON.stringify({
			identification: this.identificationLogin,
			password: this.password
		});

		this.serviceUser.userAuthenticate(data).subscribe((data) => {
			console.log('response');
			console.log(data);

			if (data.success) {
				// Se almacena token del lado del cliente para las futuras peticiones
				localStorage.setItem('token', data.data.token);
				delete data.user.password;
				localStorage.setItem('userInfo', JSON.stringify(data.user));

				// Se redirecciona a la pagina de lista de resultados
				this.router.navigate([ '/result' ]);
			} else {
				this.msgUserValidate = data.msg;

				setTimeout(() => {
					this.msgUserValidate = '';
				}, 4000);
			}
		});
	}

	// funcion que permite realizar el registro del usuario en la plataforma
	getEmailRegister() {
		if (this.term) {
			this.serviceUser.getEmailRegister(this.identification).subscribe((data) => {
				if (data.success) {
					// Registro con exito
					this.colorSuccess = true;
					this.msgRegister = data.msg;

					// setTimeout(() => {
					// 	this.msgRegister = ""
					// }, 6000);
				} else {
					this.colorSuccess = false;
					if (!data.noExist) {
						this.registerStatus = true;
						this.msgRegister = data.msg;

						setTimeout(() => {
							this.msgRegister = '';
						}, 6000);
					} else {
						this.msgRegister = data.msg;

						setTimeout(() => {
							this.msgRegister = '';
						}, 6000);
					}
				}
			});
		} else {
			this.colorSuccess = false;
			this.msgRegister = '¡Debe aceptar los terminos y condiciones!.';
		}
	}
	// funcion que permite realizar el registro del usuario en la plataforma
	register() {
		let identification = this.identification;
		let email = this.email;
		let confirmEmail = this.confirmEmail;

		if (email != undefined) {
			if (confirmEmail == email) {
				if (this.term) {
					this.serviceUser.register(identification, email).subscribe((data) => {
						if (data.success) {
							this.colorSuccess = true;
							this.registerStatus = false;
							this.email = undefined;
							this.confirmEmail = undefined;
							this.msgRegister = data.msg;

							setTimeout(() => {
								this.msgRegister = '';
							}, 5000);
						} else {
							this.email = undefined;
							this.confirmEmail = undefined;
							this.msgRegister = data.msg;

							setTimeout(() => {
								this.msgRegister = '';
							}, 5000);
						}
					});
				} else {
					this.colorSuccess = false;
					this.msgRegister = '¡Debe aceptar los terminos y condiciones!.';
				}
			} else {
				this.colorSuccess = false;
				this.msgRegister = '¡No coinciden los correos ingresados!.';
			}
		} else {
			this.colorSuccess = false;
			this.msgRegister = '¡El campo email no puede estar vacio!.';
		}
	}

	recoveryPassword() {
		if (this.recoveryIdentification != undefined) {
			this.serviceUser.recoveryPassword(this.recoveryIdentification).subscribe((data) => {
				this.msgRecovery = data.msg;
				if (data.success) {
					this.recoveryIdentification = undefined;
					this.colorRecovery = true;
				} else {
					this.colorRecovery = false;
				}
			});
		} else {
			this.msgRecovery = '¡El campo de identificación no puede estar vacio!';
		}
	}

	toggleCheck(e) {
		this.term = e.target.checked;
		this.msgRegister = '';
	}
}
