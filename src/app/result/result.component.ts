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

	loading = true;

	colorchangePassword: any;
	antPassword: any;
	newPassword: any;
	elems: any;
	instances: any;
	userEmail: any;
	username: any;
	msgListOrders = "";
	listOrders = [];
	auxListOrders = [];
	listStudies = {}
	auxStudies = []
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
		let person = JSON.parse(localStorage.getItem('person'));
		this.userEmail = userInfo.email
		this.username = person.first_name + ' ' + person.middle_name +' '+ person.last_name

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
				this.loading = false
				this.msgListOrders = data.msg

				if (data.success) {
					// Array de posiciones de ordenes repetidas
					let auxOrdersPosition = []
					
					data.listOrders.forEach((value, index) => {

						// busqueda para saber si se repite la orden
						let posOrder = auxOrdersPosition.indexOf(value.order_id)
						
						// Si la encuentra repetida solo agrega el studiosy id a la posicion de la orden
						if (posOrder != -1) {
							
							this.auxStudies[posOrder] = [...this.auxStudies[posOrder], ...{
								name: value.name,
								result_id: value.result_id,
								Results_state: value.Results_state
							}]

						}else{// Se almacenan los datos en un nuevo arreglo cuando es la primera vez que viene la orden

							// Se guarda cada order_id
							auxOrdersPosition.push(value.order_id)
							
							// Se asigna todo el arreglo en uno nuevo
							this.listOrders.push(value)
							this.auxStudies = [...this.auxStudies, ...{
								name: value.name,
								result_id: value.result_id,
								Results_state: value.Results_state
							}]
							
							// Se formatea objeto a array para ser iterados los estudios en el template
							this.auxStudies[this.auxStudies.length -1] = Object.keys(this.auxStudies[this.auxStudies.length -1]).map(i => this.auxStudies[this.auxStudies.length -1])
							// Se quita la primera posicion por quedar duplicada
							this.auxStudies[this.auxStudies.length -1].splice(0,2)
							
						}
						
					})
					this.listStudies = this.auxStudies

					this.backgroundColor = "primary";
					this.colorToggle = "secondary";
					
				}
			});
		
	}
	
	// Funcion encargada de la generacion de resultado y la posterior descarga en Pdf.
	downloadResult(result_id, item, Results_state, name){

		console.log('datos del template')
		console.log(result_id)
		console.log(item)
		let arrayName = item.people_name.split(" ")
		const peopleName = {
			identification: item.identification,
			first_name: arrayName[0],
			middle_name: arrayName[1],
			last_name: arrayName[2],
			last_name_two: arrayName[3],
		}

		const order = {
			calculated_age: "",
			client : {
				name: item.client,
			},
			order_consec: item.order_consec,
		}

		const appointment = {
			attentions: [],
			study: {
				cup: item.cup,
				name: name
			}
		}

		appointment.attentions.push({
			created: item.date_time_ini,
			id: item.attentions_id
		});

		const specialists_id = item.specialists_id
		const summernote = item.result_content
		const gender = item.gender
		let results_state = Results_state;

		this.serviceUser.getInfoResult(item.people_id, specialists_id)
			.subscribe(response => {
				
				let data = JSON.stringify({
					peopleName: peopleName,
					firmSpecialist: response.signature.url,
					order: order,
					appointment: appointment,
					sex: gender,
					specialistSelected: response.specialists,
					summernote: summernote,
					validate: (results_state == '1') ? true : false,
					pre: true,
					picture: response.picture.url
				});
			
				this.serviceUser.printResult(data)
					.subscribe(response => {

					window.open('http://52.183.68.4/xxespejofundacion/back_end/ResultProfiles/downloadPrev/true/' + item.identification, '_blank');
						
				});
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
