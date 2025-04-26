import { Component, HostListener, Inject, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { PublicationService } from '../../../../core/services/publication/publication.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { ModalUsersByReactionTypeComponent } from '../modal-users-by-reaction-type/modal-users-by-reaction-type.component';
import { ReactionPublicationService } from '../../../../core/services/reaction/reaction-publication.service';
import { CommentPublicationService } from '../../../../core/services/commentPublication/comment-publication.service';
import { ModalUserCommentPublicationComponent } from '../modal-user-comment-publication/modal-user-comment-publication.component';
import { Publication } from '../../../../core/interfaces/publication';
import { debounceTime, fromEvent } from 'rxjs';

@Component({
  selector: 'app-publication-with-files',
  imports: [CommonModule, ReactionComponent, TotalsReactionCommentComponent, LoginModalComponent, CompleteInfoRegisterGoogleComponent, HoverAvatarComponent, ModalUsersByReactionTypeComponent, ModalUserCommentPublicationComponent],
  templateUrl: './publication-with-files.component.html',
  styleUrl: './publication-with-files.component.css'
})
export class PublicationWithFilesComponent implements OnInit {
  publications: Publication[] = [];
  currentUserId: string | null = null;
  currentPublicationId: string | null = null;

  isLoginModalVisible$: any;
  isInfoCompleteModalVisible$: any;

  hoverProfileData: any = null;
  hoverPosition = { top: 0, left: 0 };
  isHoverModalVisible = false;
  isHovering = false;

  isReactionModalVisible: boolean = false;
  reactionUsers: any[] = [];
  reactionType: string = '';

  currentPage: number = 0;
  isLoading: boolean = false;
  hasMorePublications: boolean = true;

  constructor(private publicationService: PublicationService, private tokenService: TokenService, private commentPublicationService: CommentPublicationService,
    private router: Router, private modalService: ModalLoginService, private modalInfoCompleteService: ModalInfoCompleteService, private profileService: ProfileService, private rolService: RolService, private reactionPublicationService: ReactionPublicationService,@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    this.currentUserId = this.tokenService.getUserId();
    this.isLoginModalVisible$ = this.modalService.isLoginModalVisible$;
    this.isInfoCompleteModalVisible$ = this.modalInfoCompleteService.isInfoCompleteModalVisible$;
    if (isPlatformBrowser(this.platformId)) {
      fromEvent(window, 'scroll')
        .pipe(debounceTime(300))
        .subscribe(() => this.onScroll());
    }
    this.loadPublications();
  }
  
  getTimeElapsedWrapper(fechaRegistro: string): string {
    return TimeUtils.getTimeElapsed(fechaRegistro);
  }

  loadPublications(page: number = 0): void {
    if (this.isLoading || !this.hasMorePublications) {
      return; 
    }
  
    this.isLoading = true;
  
    this.publicationService.getPublicationsWithFilesPaginated(page).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          const newPublications: Publication[] = response.data.map((publication: any) => ({
            ...publication,
            isReactionModalVisible: false,
            reactionUsers: [],
            reactionType: '',
            hoverPosition: { top: 0, left: 0 }
          }));
  
          if (newPublications.length === 0) {
            this.hasMorePublications = false;
          } else {
            this.publications = [...this.publications, ...newPublications];
            this.currentPage++;
          }
  
          // Obtener el rol de cada usuario en las publicaciones
          newPublications.forEach((publication: Publication) => {
            this.rolService.getRolByUserId(publication.idUsuario).subscribe({
              next: (rolResponse: any) => {
                if (rolResponse.type === 'success') {
                  publication.tipoRol = rolResponse.data.tipo;
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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
        this.isLoading = false;
      }
    });
  }
  
  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 250;
  
    if (scrollPosition >= threshold) {
      this.loadPublications(this.currentPage);
    }
  }

  navigateToDetailPublication(idPublication: string) {
    this.router.navigate(['/publication', idPublication]);
  }

  navigateToProfileUser(idUsuario: string) {
    this.router.navigate(['/profile', idUsuario]);
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
      top: rect.top + window.scrollY + rect.height - 40,
      left: rect.left + window.scrollX + rect.width / 2 +30
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

  openReactionHover(data: { event: MouseEvent; tipo: string }, publication: any): void {
    const target = data.event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    publication.reactionType = data.tipo;
    publication.isReactionModalVisible = true;

    publication.hoverPosition = {
      top: rect.top + window.scrollY - 5,
      left: rect.left + window.scrollX + rect.width / 2 + 20
    };

    // Cargar los usuarios que reaccionaron
    this.reactionPublicationService.getUsersByReactionType(publication.idPublicacion, data.tipo).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          publication.reactionUsers = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar los usuarios por tipo de reacción:', error);
      }
    });
  }

  closeReactionHover(publication: any): void {
    setTimeout(() => {
      if (!this.isHovering) {
        publication.isReactionModalVisible = false;
        publication.reactionUsers = [];
        publication.reactionType = '';
      }
    }, 200);
  }
  openCommentHover(data: { event: MouseEvent }, publication: any): void {
    const target = data.event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const modalWidth = 200;
    const screenWidth = window.innerWidth;
    const fitsOnRight = rect.left + rect.width / 2 + modalWidth / 2 <= screenWidth;

    publication.isCommentModalVisible = true;
    publication.commentHoverPosition = {
      top: rect.top + window.scrollY + rect.height + 5,
      left: fitsOnRight
        ? rect.left + window.scrollX + rect.width / 2 - modalWidth / 2
        : rect.left + window.scrollX - modalWidth / 2
    };

    this.commentPublicationService.getUsersWhoCommented(publication.idPublicacion).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          publication.usersComment = response.data;
        } else {
          console.error('API response error:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error al cargar los usuarios que comentaron:', error);
      }
    });
  }

  closeCommentHover(publication: any): void {
    setTimeout(() => {
      if (!this.isHovering) {
        publication.isCommentModalVisible = false;
        publication.usersComment = [];
      }
    }, 200);
  }

  onModalMouseLeaveComment(publication: any): void {
    this.isHovering = false;
    this.closeCommentHover(publication);
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

  onModalMouseLeaveReaction(publication: any): void {
    this.isHovering = false;
    this.closeReactionHover(publication);
  }
}
