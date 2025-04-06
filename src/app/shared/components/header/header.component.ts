import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../core/services/oauth/token.service';
import { ProfileService } from '../../../core/services/profile/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userProfile: any = null;

  constructor(
    private tokenService: TokenService,
    private profileService: ProfileService,
    private router: Router
  ) {}

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

  logOut(): void {
    this.tokenService.logOut();
    this.isLoggedIn = false;
    this.userProfile = null;
    this.router.navigate(['/']);
  }
  navigateToLogin(): void {
    // Add your navigation logic here
    window.location.href = '/login';
  }
  navigateToRegister(): void {
    // Add your navigation logic here
    window.location.href = '/register';
  }


  menuAbierto = false;

  @ViewChild('menuMovil') menuMovil!: ElementRef;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // Detecta clics fuera del menú móvil
  @HostListener('document:click', ['$event'])
  detectarClickFuera(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.menuAbierto && this.menuMovil && !this.menuMovil.nativeElement.contains(target)) {
      this.menuAbierto = false;
    }
  }
}
