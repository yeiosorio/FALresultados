import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../service/user.service';
declare var M: any;
import * as moment from "moment"

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
	msgListOrders: any;
	listOrders = [];
	listStudies = {}
	msgchangePassword = "";

	backgroundColor: any
	colorToggle: any

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

		this.getOrdersByRol(userInfo.rol, userInfo.identification);

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

	// Se obtienen las ordenes con estudios del dia actual
	getOrdersByRol(rol, identification){

		let dateIni = moment().format('YYYY-MM-DD');
		let dateEnd = moment().format('YYYY-MM-DD');

		this.serviceUser.getOrdersByRol(dateIni, dateEnd, identification, rol)
			.subscribe(data => {
				if (data.success) {
					
					let auxOrdersPosition = []

					data.listOrders.forEach((value, index) => {

						// busqueda para saber si se repite la orden
						let posOrder = auxOrdersPosition.indexOf(value.order_id)
						
						// Si la encuentra repetida solo agrega el studios a la posicion de la orden
						if (posOrder != -1) {
							
							this.listStudies[posOrder].push(value.name);

						}else{// Se almacenan los datos en un nuevo arreglo cuando es la primera vez que viene la orden
							
							auxOrdersPosition[index] = value.order_id;

							this.listStudies[index] = [value.name];
							this.listOrders.push(value)
						}

						this.backgroundColor = "primary";
					 	this.colorToggle = "secondary";
					 })

					 this.listStudies = Object.keys(this.listStudies).map(i => this.listStudies[i])

					 console.log('***********************')
					 console.log(this.listStudies)

				} else {
					this.msgListOrders = data.msg
					
				}
			});
		
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
