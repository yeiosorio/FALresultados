import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../service/user.service';
declare var M: any;
import * as moment from 'moment';
import { log } from 'util';
import { MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
	selector: 'app-result',
	templateUrl: './result.component.html',
	styleUrls: [ './result.component.css' ]
})
export class ResultComponent implements OnInit {
	downloadUrl: string = 'http://52.183.68.4/xxespejofundacion/back_end/ResultProfiles/downloadPrev/true/';
	//	downloadUrl: string = 'https://www.samfundacion.com/back_end/ResultProfiles/downloadPrev/true/';
	loading = true;
	search: string = '';
	colorchangePassword: any;
	antPassword: any;
	newPassword: any;
	instances: any;
	userEmail: any;
	username: any;
	userType: any;
	uid: any;
	msgLimitSearch: string = '';
	changePasswordModal: any;
	instancesPicker: any;
	colorBarra: string = 'back-estudies-sonV';
	rol: string;
	identification: string;
	dateIni: string;
	dateEnd: string;
	msgListOrders = '';
	listOrders = [];
	auxListOrders = [];
	listStudies = {};
	auxStudies = [];
	msgchangePassword = '';
	page: number = 1;
	itemsPerPage: number = 10;

	backgroundColor: any;
	colorToggle: any;
	items$: any[];
	client: string;
	clients: any;
	checkOn: false;
	isDisabled: boolean = false;
	blockedDownload: string = '';
	downloadFlag: boolean = false;

	constructor(private router: Router, private serviceUser: UserService) {
		this.search = '';
		this.client = '';
	}
	
	ngOnInit() {
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);

		let elems = document.querySelectorAll('#forceChangePassword');
		this.instances = M.Modal.init(elems);

		let elems2 = document.querySelectorAll('#changePassword');
		this.changePasswordModal = M.Modal.init(elems2);

		let today = new Date();
		let minDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

		let elemsPicker = document.querySelectorAll('.dateIni');
		this.instancesPicker = M.Datepicker.init(elemsPicker, {
			format: 'yyyy-mm-dd',
			// maxDate: today,
			// minDate: minDate,
			
			onSelect: (value) => {
				
				this.dateIni = moment(value).format('YYYY-MM-DD');
				this.dateEnd = moment(value).add(30, 'd').format('YYYY-MM-DD');
	
				
			},
			i18n: {
				months: [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
				],
				monthsShort: [ 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
				],
				weekdaysShort: [ 'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab' ],
				cancel: 'Cancelar'
			}
		});

		let elemsPicker2 = document.querySelectorAll('.dateEnd');
		this.instancesPicker = M.Datepicker.init(elemsPicker2, {
			format: 'yyyy-mm-dd',
			// maxDate: today,
			// minDate: minDate,
		
			onSelect: (value) => {
				this.dateEnd = moment(value).format('YYYY-MM-DD');
				this.dateIni = moment(value).subtract(30, 'd').format('YYYY-MM-DD');
			},
			i18n: {
				months: [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
				],
				monthsShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'
				],
				weekdaysShort: [ 'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab' ],
				cancel: 'Cancelar'
			}
		});

		

		let userInfo = JSON.parse(localStorage.getItem('userInfo'));
		let person = JSON.parse(localStorage.getItem('person'));
		this.userEmail = userInfo.email;
		this.rol = userInfo.rol;

		this.uid = userInfo.id;
		this.username = person.name;
		// si el usuario es admin
		if (this.rol == '0') {
			this.getClients();
			this.dateIni = moment().subtract(30, 'd').format('YYYY-MM-DD');
			this.dateEnd = moment().format('YYYY-MM-DD');
			this.userType = 'Admin';
		}
		if (this.rol == '1') { // cliente
			this.dateIni = moment().subtract(90, 'd').format('YYYY-MM-DD');
			this.dateEnd = moment().format('YYYY-MM-DD');
			this.userType = 'Entidad';
			this.identification = userInfo.usuario_id;
		} else if (this.rol == '2') { // medico
			this.dateIni = moment().subtract(90, 'd').format('YYYY-MM-DD');
			this.dateEnd = moment().format('YYYY-MM-DD')
			this.identification = userInfo.usuario_id;
			this.userType = 'Medico';
		} else if (this.rol == '3'){
			// paciente
			this.dateIni = moment().format('YYYY-MM-DD');
			this.dateEnd = moment().format('YYYY-MM-DD');
			this.identification = userInfo.identification;
			this.userType = 'Usuario';
		}
		this.forceChangePassword();
		this.getOrdersByRol();
	}
	applyFilter(filterValue: string) {
		this.initializeItems();
		console.log(filterValue.trim().toLowerCase());
		//this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	getItems(searchbar) {
		// Reset items back to all of the items
		this.initializeItems();

		// set q to the value of the searchbar
		let q = searchbar.target.value;
		if (q && q.trim() != '') {
			this.items$ = this.items$.filter((item) => {
				return (
					item.order_consec.toLowerCase().indexOf(q.toLowerCase()) > -1 ||
					item.identification.toLowerCase().indexOf(q.toLowerCase()) > -1 ||
					item.people_name.toLowerCase().indexOf(q.toLowerCase()) > -1
				);
			});
		}
	}

	initializeItems() {
		this.items$ = this.listOrders;
	}

	forceChangePassword() {
		const userInfo = JSON.parse(localStorage.getItem('userInfo'));
		let change_password = userInfo.change_password;

		// Se abre modal para forzar cambio de password
		if (change_password == 0) {
			setTimeout(() => {
				let elems = document.querySelectorAll('#forceChangePassword');
				this.instances = M.Modal.init(elems, {
					dismissible: false,
				});
				this.instances[0].open();
			}, 1000);
		}
	}

	// Se obtienen las ordenes con estudios del dia actual
	getOrdersByRol() {
		this.listOrders = [];
		this.loading = true;
		this.msgListOrders = '';
		this.items$ = [];
		this.msgLimitSearch = '';

	//	let diffDays: any;

		// Se establecen por defecto las fechas con el dia actual
		// if (!this.dateIni || !this.dateEnd) {
		// 	this.dateIni = moment().format('YYYY-MM-DD');
		// 	this.dateEnd = moment().format('YYYY-MM-DD');
		// } else {
		// 	// De lo contrario se verifica que no exeda el mes de anterioridad
			let dateDiffEnd = moment(this.dateEnd);
			let dateDiffIni = moment(this.dateIni);
			let calFechas = dateDiffEnd.diff(dateDiffIni, 'days');

			if (this.rol == '1' || this.rol == '2') {
				// entidad o medico
				if (calFechas > 90) {
					alert('Solo se puede colsultar dos mes');
					this.loading = false;
					return;
				}
			}
			if (this.rol == '0') {
				// admin
			
				if (calFechas > 30) {
					this.loading = false;
					alert('Solo se puede colsultar un mes');
					return;
				}
			}
		

			if (dateDiffEnd == undefined || dateDiffEnd == null) {
				alert('Se debe especificar una Fecha Fin');
				return;
			}
			if (dateDiffIni == undefined || dateDiffIni == null) {
				alert('Se debe especificar una Fecha Inicial');
				return;
			}

			let diffDays = dateDiffEnd.diff(dateDiffIni, 'days'); // 1

			// // Diferencia de 30 dias
			if (diffDays > 30) {
				// Se restan dias resultantes para limitar a 3 meses de anterioridad
				let restDays = diffDays - 30;
				dateDiffIni = dateDiffIni.add(restDays, 'days');
				let dateFinal = moment(dateDiffIni).format('YYYY-MM-DD');
				// Se reasigna a la propiedad de fecha que sera enviada
				this.dateIni = dateFinal;
			}
	//	}
		this.serviceUser
			.getOrdersByRol(this.dateIni, this.dateEnd, this.identification, this.rol, this.client)
			.subscribe((data) => {
				console.log(diffDays);
				if (diffDays > 30) {
					// Propiedad que muestra mensaje indicando que la consulta se limito a solo 3 meses
					this.msgLimitSearch = 'La consulta se ha generado con limite de 1 mes';
				}
				this.loading = false;
				this.msgListOrders = data.msg;

				if (data.success) {
					// Array de posiciones de ordenes repetidas
					let auxOrdersPosition = [];

					data.listOrders.forEach((value, index) => {
						// busqueda para saber si se repite la orden
						// control del color de la barra si cada orden esta bloqueada
						if (value.state_download == 0) {
							this.colorBarra = 'back-estudies-sonG';
						} else {
							this.colorBarra = 'back-estudies-sonV';
						}
						let posOrder = auxOrdersPosition.indexOf(value.order_id);

						// Si la encuentra repetida solo agrega el estudio y el id a la posicion de la orden
						if (posOrder != -1) {
							this.auxStudies[posOrder].push({
								name: value.name,
								result_id: value.result_id,
								Results_state: value.Results_state
							});
						} else {
							// Se almacenan los datos en un nuevo arreglo cuando es la primera vez que viene la orden

							// Se guarda cada order_id
							auxOrdersPosition.push(value.order_id);

							var newOrder = {
								cedula: value.ce
							};
							// Se asigna todo el arreglo en uno nuevo
							this.listOrders.push(value);
							this.auxStudies.push({
								name: value.name,
								result_id: value.result_id,
								Results_state: value.Results_state
							});
							this.initializeItems();

							// Se formatea objeto a array para ser iterados los estudios en el template
							this.auxStudies[this.auxStudies.length - 1] = Object.keys(
								this.auxStudies[this.auxStudies.length - 1]
							).map((i) => this.auxStudies[this.auxStudies.length - 1]);
							// Se quitan las dos primeras posiciones por quedar duplicada al hacer el object.keys()
							this.auxStudies[this.auxStudies.length - 1].splice(0, 2);
						}
					});
					this.listStudies = this.auxStudies;

					this.backgroundColor = 'primary';
					this.colorToggle = 'secondary';
				}
			});
	}

	toogleDisabled(event) {
		console.log('check');
		console.log(event);

		this.isDisabled = false;
	}

	DownloadAllChecked() {
		let element = <HTMLInputElement[]>(<any>document.getElementsByName('checkDownload'));

		for (let index = 0; index < element.length; index++) {
			if (element[index].checked) {
				let posOrderList = element[index].value;
				let item = this.items$[posOrderList];
				this.downloadBlock(item, posOrderList);
			}
		}
	}

	downloadBlock(item, index) {
		if (item.state_download == '1') {
			this.auxStudies[index].forEach((value, index) => {
				if (value.Results_state == '1') {
					this.downloadFlag = true;
					this.downloadResult(value.result_id, item, value.Results_state, value.name);
				}

				// Si no se pudieron descargar los resultados de las ordenes seleccionadas
				// Se ejecuta esto al final del ciclo
				if (this.auxStudies[index].length == index + 1) {
					// Evalua si hubo al menos un resultados que se descargo
					if (!this.downloadFlag) {
						this.blockedDownload =
							'No se pudieron descargar los resultados de algunas ordenes seleccionadas';
						setTimeout(() => {
							this.blockedDownload = '';
							this.downloadFlag = false;
						}, 6000);
					}
				}
			});
		}
	}

	// Funcion encargada de la generacion de resultado y la posterior descarga en Pdf.
	downloadResult(result_id, item, Results_state, name) {
		let arrayName = item.people_name.split(' ');
		const peopleName = {
			identification: item.identification,
			first_name: arrayName[0],
			middle_name: arrayName[1],
			last_name: arrayName[2],
			last_name_two: arrayName[3]
		};

		const order = {
			calculated_age: '',
			client: {
				name: item.client
			},
			order_consec: item.order_consec
		};

		const appointment = {
			attentions: [],
			study: {
				cup: item.cup,
				name: name
			}
		};

		appointment.attentions.push({
			created: item.date_time_ini,
			id: item.attentions_id
		});

		const specialists_id = item.specialists_id;
		const summernote = item.result_content;
		const gender = item.gender;
		let results_state = Results_state;

		// Se obtiene informacion complementaria para generar el pdf del resultado
		this.serviceUser.getInfoResult(item.people_id, specialists_id).subscribe((response) => {
			let data = JSON.stringify({
				peopleName: peopleName,
				firmSpecialist: response.signature.url,
				order: order,
				appointment: appointment,
				sex: gender,
				specialistSelected: response.specialists,
				summernote: summernote,
				validate: results_state == '1' ? true : false,
				pre: true,
				picture: response.picture.url
			});

			this.serviceUser.printResult(data).subscribe((response) => {
				window.open(this.downloadUrl + item.identification, '_blank');
				this.serviceUser
					.addPrintControl(result_id, this.uid, item.attentions_id, this.username)
					.subscribe((response) => {});
			});
		});
	}

	changePassword() {
		let userInfo = JSON.parse(localStorage.getItem('userInfo'));

		console.log(this.antPassword);
		console.log(this.newPassword);

		if (this.antPassword && this.newPassword) {
			if (this.newPassword.length > 5) {
				this.serviceUser
					.changePassword(this.antPassword, this.newPassword, userInfo.identification)
					.subscribe((data) => {
						this.msgchangePassword = data.msg;
						if (data.success) {
							this.antPassword = undefined;
							this.newPassword = undefined;
							this.colorchangePassword = true;
							userInfo.change_password = 1;
							localStorage.setItem('userInfo', JSON.stringify(userInfo));

							setTimeout(() => {
								this.changePasswordModal[0].close();
								this.instances[0].close();
							}, 1000);
						} else {
							this.colorchangePassword = false;
						}
					});
			} else {
				this.msgchangePassword =
					'¡La contraseña debe tener un minimo de 6 digitos o letras!';
			}
		} else {
			this.msgchangePassword = '¡El campo de contraseña no puede estar vacio!';
		}
	}

	closeModal() {
		this.antPassword = undefined;
		this.newPassword = undefined;
		this.msgchangePassword = '';
		this.changePasswordModal[0].close();
	}

	closeModalFilter() {
		let date = document.getElementById('dateIni');

		date.innerHTML = '';
	}

	openChangePassword() {
		this.changePasswordModal[0].open();
	}

	logOut() {
		localStorage.clear();
		this.router.navigate([ '/login' ]);
	}

	// funcion que permite listar los clientes activos state = 1 de la fundacion alejandro londoño
	getClients() {
		this.serviceUser.getClients().subscribe((res) => {
			this.clients = res.listClients;
			// se espera un momento para inicializar los campos select
			setTimeout(() => {
				M.AutoInit();
			}, 100);
		});
	}
	// identifica la seleccion del cliente
	changeClient() {
		this.getOrdersByRol();
	}

	absoluteIndex(indexOnPage: number): number {
		return this.itemsPerPage * (this.page - 1) + indexOnPage;
	}

	selectAllCheck(){
		let checkAll = <HTMLInputElement[]>(<any>document.getElementsByName('checkAll'));

		// Si se selecciono el check principal
		if (checkAll[0].checked) {
			let element = <HTMLInputElement[]>(<any>document.getElementsByName('checkDownload'));
			for (let index = 0; index < element.length; index++) {
				if (!element[index].checked) {
					element[index].checked = true;
				}
			}
		}else{//Se desmarcan todos los checks
			let element = <HTMLInputElement[]>(<any>document.getElementsByName('checkDownload'));
			for (let index = 0; index < element.length; index++) {
				if (element[index].checked) {
					element[index].checked = false;
				}
			}
		}
	}




}
