import { RouterModule, Routes } from '@angular/router';
// importing component...
import { ResultComponent } from './result/result.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './_guards';

//import { AuthGuard } from './_guards';

const app_routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'result', component: ResultComponent, canActivate: [ AuthGuard ] },
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: '**', redirectTo: 'login' }
	// path: '**' -> cualquier otra direccion
];

export const app_routing = RouterModule.forRoot(app_routes, { useHash: true });
