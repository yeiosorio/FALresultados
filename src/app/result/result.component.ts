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
	auxListOrders = [];
	listStudies = {}
	auxStudies = {}
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
					// Array de posiciones de ordenes repetidas
					let auxOrdersPosition = []

					data.listOrders.forEach((value, index) => {

						// busqueda para saber si se repite la orden
						let posOrder = auxOrdersPosition.indexOf(value.order_id)
						
						// Si la encuentra repetida solo agrega el studiosy id a la posicion de la orden
						if (posOrder != -1) {
							if(this.auxStudies[0][posOrder] !== undefined){
								this.auxStudies[0][posOrder] = [];
							}
							this.auxStudies[0][posOrder] = [{...this.auxStudies[0][posOrder], [index]:{
								name: value.name,
								result_id: value.result_id}
							}];
							//push();

						}else{// Se almacenan los datos en un nuevo arreglo cuando es la primera vez que viene la orden

							// Se guarda cada order_id
							auxOrdersPosition[index] = value.order_id;
							
							// Se asigna todo el arreglo en uno nuevo
							this.auxListOrders.push(value)
							this.auxStudies = [{...this.auxStudies, [index]:[{
								name: value.name,
								result_id: value.result_id}]
							}];


							// Se formatea objeto a array para ser iterados los estudios en el template
							// this.auxStudies[index] = Object.keys(this.auxStudies[index]).map(i => this.auxStudies[index])
							// // Se quita la primera posicion por quedar duplicada
							// this.auxStudies[index].splice(0,1)

						}

					})


					console.log(this.auxStudies)

					// this.auxListOrders.forEach((value, index) => {
					// 	console.log('index 1')
					// 	console.log(index)
					// 	if (!this.auxStudies[index]) {
					// 		console.log('index 2')
					// 		console.log(index)
					// 		this.listStudies[index] = this.auxStudies[index + 1];
					// 	}
						
					// });

					this.backgroundColor = "primary";
					this.colorToggle = "secondary";
					console.log('listStudies')
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
