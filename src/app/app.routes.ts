import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/oauth/login/login.component';
import { RegisterComponent } from './pages/oauth/register/register.component';
import { CareerComponent } from './pages/career/career.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'home', component: HomeComponent },
    { path: 'carrera/:idCarrera', component: CareerComponent },

    { path: '**', redirectTo: '' }
];
