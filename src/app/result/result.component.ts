import { Component, OnInit } from '@angular/core';
declare var M: any;
@Component({
	selector: 'app-result',
	templateUrl: './result.component.html',
	styleUrls: [ './result.component.css' ]
})
export class ResultComponent implements OnInit {
	constructor() {}
	ngOnInit() {
		// inicia los componentes de materialize
		setTimeout(() => {
			M.AutoInit();
		}, 100);
	}
}
