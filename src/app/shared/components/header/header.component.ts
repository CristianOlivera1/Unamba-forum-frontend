import { Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../core/services/oauth/token.service';
import { ProfileService } from '../../../core/services/profile/profile.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CareerService } from '../../../core/services/career/career.service';
import { animate, svg, stagger } from 'animejs';
import { NotificationComponent } from './components/notification/notification.component';
import { ShearchComponent } from './components/search/search.component';
import { ModalInfoCompleteService } from '../../../core/services/modal/modalCompleteInfo.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent, ShearchComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userProfile: any = null;
  career: any[] = [];

  constructor(
    private tokenService: TokenService,
    private profileService: ProfileService,
    private router: Router, private careerService: CareerService, @Inject(PLATFORM_ID) private platformId: Object, private modalInfoCompleteService: ModalInfoCompleteService
  ) { }

  ngOnInit(): void {
    this.loadCareers();
    if (typeof window !== 'undefined') {
      this.isLoggedIn = !!this.tokenService.getToken();
      if (this.isLoggedIn) {
        this.loadUserProfile();
      }

      window.addEventListener('storage', () => {
        this.isLoggedIn = !!this.tokenService.getToken();
        if (this.isLoggedIn) {
          this.loadUserProfile();
        } else {
          this.userProfile = null;
        }
      });
    }

    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!this.tokenService.getToken();

      animate(svg.createDrawable('.line'), {
        draw: ['0 0', '0 1', '1 1'],
        ease: 'inOutQuad',
        duration: 3800,
        delay: stagger(150),
        loop: true
      });
    }
  }
  navigateToProfileUser(idUsuario: string) {
    this.router.navigate(['/profile', idUsuario]);
  }

  loadCareers(): void {
    this.careerService.getAllCareer().subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.career = response.data;

        } else {
          console.error('Error al cargar las carreras:', response.listMessage);
          alert('No se pudieron cargar las carreras.');
        }
      },
      error: (error: any) => {
        console.error('Error en la solicitud:', error);
      }
    });
  }

  loadUserProfile(): void {
    const userId = this.tokenService.getUserId();
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

  logOut(): void {
    this.tokenService.logOut();
    this.isLoggedIn = false;
    this.userProfile = null;
    this.router.navigate(['/']);
  }

  navigateToLogin(): void {
    window.location.href = '/login';
  }

  navigateToRegister(): void {
    window.location.href = '/register';
  }

  navigateToCareer(idCarrera: string) {
    this.router.navigate(['/career', idCarrera]);
  }

  navigateToAllCareers() {
    this.router.navigate(['/career/all']);
  }
  navigateToConfiguration() {
    this.router.navigate(['/config']);
  }

  showPopover = false;
  @ViewChild('popoverMenu') popoverMenu!: ElementRef;
  togglePopover(): void {
    this.showPopover = !this.showPopover;
  }

  menuAbierto = false;
  @ViewChild('menuMovil') menuMovil!: ElementRef;
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (this.showPopover && this.popoverMenu && !this.popoverMenu.nativeElement.contains(target)) {
      this.showPopover = false;
    }

    if (this.menuAbierto && this.menuMovil && !this.menuMovil.nativeElement.contains(target)) {
      this.menuAbierto = false;
    }
  }

  navigateToNewPublication() {
    const userId = this.tokenService.getUserId();
    if (userId) {
      this.profileService.getProfileByUserId(userId).subscribe({
        next: (response: any) => {
          if (response.type === 'success') {
            if (!response.data.idCarrera) {
              this.modalInfoCompleteService.showInfoCompleteModal();
            } else {
              this.router.navigate(['/newpublication']);
            }
          } else {
            this.modalInfoCompleteService.showInfoCompleteModal();
          }
        },
        error: () => {
          this.modalInfoCompleteService.showInfoCompleteModal();
        }
      });
    } else {
      this.modalInfoCompleteService.showInfoCompleteModal();
    }
  }

  navigateToIndex() {
    this.router.navigate(['/']);

  }
}
