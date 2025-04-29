import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../../../core/services/oauth/token.service';
import { ProfileService } from '../../../../core/services/profile/profile.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit {

  constructor(
    private tokenService: TokenService,
    private profileService: ProfileService, private router:Router
  ) {}
  isLoggedIn: boolean = false;
  userProfile: any = null;
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.isLoggedIn = !!this.tokenService.getToken();
      if (this.isLoggedIn) {
        this.loadUserProfile();
      }
  
      // Escucha cambios en localStorage
      window.addEventListener('storage', () => {
        this.isLoggedIn = !!this.tokenService.getToken();
        if (this.isLoggedIn) {
          this.loadUserProfile();
        } else {
          this.userProfile = null;
        }
      });
    }
  }

  newPublication():void{
    this.router.navigate(["newpublication"])
  }

  loadUserProfile(): void {
    const userId = this.extractUserIdFromToken();
    if (userId) {
      this.profileService.getProfileByUserId(userId).subscribe(
        (response) => {
          if (response.type === 'success') {
            this.userProfile = response.data;
          } else {
            console.error('Error al obtener el perfil:', response.listMessage);
          }
        },
        (error) => {
          console.error('Error en la solicitud del perfil:', error);
        }
      );
    }
  }

  extractUserIdFromToken(): string | null {
    const token = this.tokenService.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el payload del JWT
      return payload.idUsuario || null;
    }
    return null;
  }
}
