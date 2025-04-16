import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { PublicationService } from '../../../../core/services/publication/publication.service';
import { CommonModule } from '@angular/common';
import { TimeUtils } from '../../../../Utils/TimeElapsed';
import { ReactionComponent } from '../reaction/reaction.component';
import { Router } from '@angular/router';
import { TokenService } from '../../../../core/services/oauth/token.service';
import { TotalsReactionCommentComponent } from '../totals-reaction-comment/totals-reaction-comment.component';

import { LoginModalComponent } from '../login-modal/login-modal.component';
import { ModalLoginService } from '../../../../core/services/modal/modalLogin.service';
import { ModalInfoCompleteService } from '../../../../core/services/modal/modalCompleteInfo.service';
import { CompleteInfoRegisterGoogleComponent } from '../../../oauth/complete-info-register-google/complete-info-register-google.component';
import { ProfileService } from '../../../../core/services/profile/profile.service';
import { HoverAvatarComponent } from '../hover-avatar/hover-avatar.component';
import { PhotoSliderComponent } from '../photo-slider/photo-slider.component';
import { RolService } from '../../../../core/services/rol/rol.service';

@Component({
  selector: 'app-publication-with-files',
  imports: [CommonModule,ReactionComponent,TotalsReactionCommentComponent,LoginModalComponent, CompleteInfoRegisterGoogleComponent,HoverAvatarComponent,PhotoSliderComponent],
  templateUrl: './publication-with-files.component.html',
  styleUrl: './publication-with-files.component.css'
})
export class PublicationWithFilesComponent implements OnInit {
  publications: any[] = [];
  currentUserId: string | null = null;
  isLoginModalVisible$: any;
  isInfoCompleteModalVisible$:any;

  hoverProfileData: any = null;
  hoverPosition = { top: 0, left: 0 };
  isHoverModalVisible = false;
  isHovering = false;

  isPhotoSliderVisible = false; 
  selectedPhotos: { tipo: string; rutaArchivo: string }[] = [];
  selectedPhotoIndex: number = 0;
  
  constructor(private publicationService: PublicationService,  private tokenService: TokenService,
    private router: Router,private modalService: ModalLoginService,private modalInfoCompleteService:ModalInfoCompleteService ,private profileService: ProfileService,private rolService: RolService ) {}
    
  ngOnInit(): void {
    this.currentUserId = this.tokenService.getUserId();
    this.isLoginModalVisible$ = this.modalService.isLoginModalVisible$;
    this.isInfoCompleteModalVisible$ = this.modalInfoCompleteService.isInfoCompleteModalVisible$;
    this.loadPublications();
  }

 getTimeElapsedWrapper(fechaRegistro: string): string {
    return TimeUtils.getTimeElapsed(fechaRegistro);
  }

  loadPublications(page: number = 0): void {
    this.publicationService.getPublicationsWithFilesPaginated(page).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.publications = response.data;

          // Obtener el rol de cada usuario en las publicaciones
        this.publications.forEach((publication) => {
          this.rolService.getRolByUserId(publication.idUsuario).subscribe({
            next: (rolResponse: any) => {
              if (rolResponse.type === 'success') {
                publication.tipoRol = rolResponse.data.tipo; // Agregar el tipo de rol a la publicación
              }
            },
            error: (error) => {
              console.error('Error al obtener el rol del usuario:', error);
            }
          });
        });
        } else {
          console.error('Error al cargar las publicaciones:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
      }
    });
  }

navigateToDetailPublication(idPublication: string) {
  this.router.navigate(['/publication', idPublication]);
}

navigateToProfileUser(idUsuario: string) {
  this.router.navigate(['/profile', idUsuario]);
}

openPhotoSlider(archivos: { tipo: string; rutaArchivo: string }[], index: number): void {
  this.selectedPhotos = archivos;
  this.selectedPhotoIndex = index; 

  this.isPhotoSliderVisible = true;
}

closePhotoSlider(): void {
  this.isPhotoSliderVisible = false;
  this.selectedPhotos = [];
  this.selectedPhotoIndex = 0; 

}


showHoverModal(userId: string, event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!target) {
    console.error('El elemento objetivo no es un HTMLElement.');
    return;
  }

  const rect = target.getBoundingClientRect();
  this.isHoverModalVisible = true;
  this.isHovering = true; 

  this.hoverPosition = {
    top: rect.top + window.scrollY + rect.height + 5, 
    left: rect.left + window.scrollX + rect.width / 2 - 160 
  };

  this.profileService.getUserProfileHover(userId).subscribe({
    next: (response: any) => {
      if (response.type === 'success') {
        this.hoverProfileData = response.data;
      }
    },
    error: (error) => {
      console.error('Error al cargar la información del perfil:', error);
    }
  });
}

hideHoverModal(): void {
  this.isHovering = false; 
  setTimeout(() => {
    if (!this.isHovering) {
      this.isHoverModalVisible = false;
      this.hoverProfileData = null;
    }
  }, 200);
}

onModalMouseEnter(): void {
  this.isHovering = true;
}

onModalMouseLeave(): void {
  this.isHovering = false;
  setTimeout(() => {
    if (!this.isHovering) {
      this.isHoverModalVisible = false;
      this.hoverProfileData = null;
    }
  }, 200); 
}
  
}
