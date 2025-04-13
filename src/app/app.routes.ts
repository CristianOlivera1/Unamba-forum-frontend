import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/oauth/login/login.component';
import { RegisterComponent } from './pages/oauth/register/register.component';
import { CareerComponent } from './pages/career/career.component';
import { DetailPublicationComponent } from './pages/detail-publication/detail-publication.component';
import { LoginModalComponent } from './pages/home/components/login-modal/login-modal.component';
import { CompleteInfoRegisterGoogleComponent } from './pages/oauth/complete-info-register-google/complete-info-register-google.component';
import { HoverAvatarComponent } from './pages/home/components/hover-avatar/hover-avatar.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'home', component: HomeComponent },
    { path: 'carrera/:idCarrera', component: CareerComponent },
    { path: 'publication/:idPublicacion', component: DetailPublicationComponent },
    { path: 'profile/:idUsuario', component: ProfileComponent },
    { path: 'login2', component: LoginModalComponent },
    { path: 'completeinfo', component: CompleteInfoRegisterGoogleComponent },
    { path: 'avatar', component: HoverAvatarComponent },
    { path: 'profile', component: ProfileComponent },

    { path: '**', redirectTo: '' }
];
