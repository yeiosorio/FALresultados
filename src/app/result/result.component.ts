import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../service/user.service';
declare var M: any;

@Component({
	selector: 'app-result',
	templateUrl: './result.component.html',
	styleUrls: [ './result.component.css' ]
})
export class ResultComponent implements OnInit {

	colorchangePassword: any;
	antPassword: any;
	newPassword: any;
	elems: any;
	instances: any;
	userEmail: any;
	msgchangePassword = "";

	constructor(private router: Router, private serviceUser: UserService) {}

	ngOnInit() {
		
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);

		this.elems = document.querySelectorAll('#forceChangePassword');
		this.instances = M.Modal.init(this.elems);

		this.forceChangePassword();

		let userInfo = JSON.parse(localStorage.getItem('userInfo'));
		this.userEmail = userInfo.email

		

	}

	forceChangePassword(){
		const userInfo = JSON.parse(localStorage.getItem('userInfo'));
		let change_password = userInfo.change_password

		// Se abre modal para forzar cambio de password
		if (change_password == 0) {
			setTimeout(() => {
				this.instances[0].open();
			}, 100);
		}
	}

	changePassword(){

		let userInfo = JSON.parse(localStorage.getItem('userInfo'));

		if (this.antPassword != undefined || this.newPassword != undefined) {
			this.serviceUser.changePassword(this.antPassword, this.newPassword, userInfo.identification)
				.subscribe(data => {
					this.msgchangePassword = data.msg
					if (data.success) {
						this.antPassword = undefined
						this.newPassword = undefined
						this.colorchangePassword = true;
						userInfo.change_password = 1
						localStorage.setItem('userInfo', JSON.stringify(userInfo));
						setTimeout(() => {
							this.instances[0].close();
						}, 4000);
					} else {
						this.colorchangePassword = false;
					}
				});
			
		}else{
			this.msgchangePassword = "¡El campo de contraseña no puede estar vacio!"
		}
	}

}
