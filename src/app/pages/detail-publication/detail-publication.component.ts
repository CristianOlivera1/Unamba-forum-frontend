import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PublicationService } from '../../core/services/publication/publication.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommentPublicationService } from '../../core/services/commentPublication/comment-publication.service';
import { TokenService } from '../../core/services/oauth/token.service';
import { ProfileService } from '../../core/services/profile/profile.service';
import { ReactionPublicationService } from '../../core/services/reaction/reaction-publication.service';
import { PhotoSliderComponent } from '../home/components/photo-slider/photo-slider.component';
import { ModalInfoCompleteService } from '../../core/services/modal/modalCompleteInfo.service';
import { ModalUserCommentPublicationComponent } from '../home/components/modal-user-comment-publication/modal-user-comment-publication.component';
import { ModalUsersByReactionTypeComponent } from '../home/components/modal-users-by-reaction-type/modal-users-by-reaction-type.component';
import { LoginModalComponent } from '../home/components/login-modal/login-modal.component';
import { HoverAvatarComponent } from '../home/components/hover-avatar/hover-avatar.component';
import { Router } from '@angular/router';
import { TotalsReactionCommentComponent } from '../home/components/totals-reaction-comment/totals-reaction-comment.component';
import { ReactionComponent } from '../home/components/reaction/reaction.component';
import { CompleteInfoRegisterGoogleComponent } from '../oauth/complete-info-register-google/complete-info-register-google.component';
import { ModalLoginService } from '../../core/services/modal/modalLogin.service';
import { Inject, PLATFORM_ID } from '@angular/core';
import { CommentComponent } from './components/comment/comment.component';
import { TimeUtils } from '../../Utils/TimeElapsed';
import { RelatedComponent } from './components/related/related.component';
import { Publication } from '../../core/interfaces/publication';
import { RolService } from '../../core/services/rol/rol.service';

@Component({
  selector: 'app-detail-publication',
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, PhotoSliderComponent, ModalUserCommentPublicationComponent, ModalUserCommentPublicationComponent, ModalUsersByReactionTypeComponent, LoginModalComponent, HoverAvatarComponent, TotalsReactionCommentComponent, ReactionComponent, CompleteInfoRegisterGoogleComponent, CommentComponent, RelatedComponent],
  templateUrl: './detail-publication.component.html',
  styleUrl: './detail-publication.component.css'
})
export class DetailPublicationComponent implements OnInit {
  comments: any[] = [];
  @ViewChild(CommentComponent) commentComponent!: CommentComponent;
  publication: any = {};
  currentUserId: string | null = null;
  publications: Publication[] = [];
  isPhotoSliderVisible = false;
  selectedPhotos: { tipo: string; rutaArchivo: string }[] = [];
  selectedPhotoIndex: number = 0;
  isCurrentUserAdmin: boolean = false;

  isReactionModalVisible: boolean = false;
  reactionUsers: any[] = [];
  reactionType: string = '';

  isHoverModalVisible = false;
  hoverProfileData: any = null;
  hoverPosition = { top: 0, left: 0 };
  isHovering = false;

  isLoginModalVisible$: any;
  isInfoCompleteModalVisible$: any;

  publicationRelated: any[] = [];
  isDeleteModalVisible: boolean = false;
  publicationToDelete: Publication | null = null;
  alert: { type: string; message: string } | null = null;

  constructor(
    private route: ActivatedRoute,
    private publicationService: PublicationService,
    private tokenService: TokenService,
    private reactionPublicationService: ReactionPublicationService,
    private commentPublicationService: CommentPublicationService,
    private profileService: ProfileService, private router: Router, private modalService: ModalLoginService, private modalInfoCompleteService: ModalInfoCompleteService, @Inject(PLATFORM_ID) private platformId: Object, private location: Location, private rolService: RolService,
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.tokenService.getUserId();
    this.isLoginModalVisible$ = this.modalService.isLoginModalVisible$;
    this.isInfoCompleteModalVisible$ = this.modalInfoCompleteService.isInfoCompleteModalVisible$;

    this.rolService.getRolByUserId(this.currentUserId!).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.isCurrentUserAdmin = response.data.tipo === 'ADMINISTRADOR';
        }
      },
      error: (error) => {
        console.error('Error al verificar el rol del usuario actual:', error);
      }
    });

    this.route.params.subscribe((params) => {
      const idPublicacion = params['idPublicacion'];
      if (idPublicacion) {

        this.loadPublicationById(idPublicacion);
        this.loadReactionSummary(idPublicacion);
        this.loadCommentsByPublication(idPublicacion);
        this.loadPublicationRelated(idPublicacion);
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params['focusComment']) {
        this.focusCommentTextarea();

      }
    });
  }

  toggleFixPublication(publication: Publication): void {
    const dtoFixPublication = {
      idPublicacion: publication.idPublicacion,
      fijada: !publication.fijada // Cambiar el estado actual
    };

    this.publicationService.fixPublication(dtoFixPublication).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          publication.fijada = !publication.fijada; // Actualizar el estado en el frontend
          this.showAlert('success', `Publicación ${publication.fijada ? 'fijada' : 'desfijada'} con éxito.`);
        } else {
          this.showAlert('error', 'Error al fijar/desfijar la publicación');
          console.error('Error al fijar/desfijar la publicación:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de fijar/desfijar:', error);
        this.showAlert('error', 'Ocurrió un error al intentar fijar/desfijar la publicación.');
      }
    });
  }

  loadPublicationRelated(idPublicacion: string): void {
    if (idPublicacion) {
      this.publicationService.getRelatedPublications(idPublicacion, 0, 6).subscribe({
        next: (response: any) => {
          if (response.type === 'success') {
            this.publicationRelated = response.data.map((related: any) => ({
              ...related,
              archivos: related.archivos || []
            }));
          } else {
            console.error('Error al cargar las publicaciones relacionadas:', response.listMessage);
          }
        },
        error: (err) => {
          console.error('Error en la solicitud de publicaciones relacionadas:', err);
        }
      });
    }
  }

  loadPublicationById(idPublicacion: string): void {
    this.publicationService.getPublicationById(idPublicacion).subscribe({
      next: (response: any) => {
        this.publication = response.data;
      },
      error: (err) => {
        console.error('Error al obtener la publicación:', err);
      }
    });
  }

  loadReactionSummary(idPublicacion: string): void {
    this.reactionPublicationService.getReactionAndCommentSummary(idPublicacion).subscribe({
      next: (response) => {
        if (response.type === 'success') {
          this.publication.reacciones = response.data.reacciones;
          this.publication.totalComentarios = response.data.totalComentarios;
        } else {
          console.error('Error al obtener el resumen de reacciones:', response.listMessage);
        }
      },
      error: (err) => {
        console.error('Error en la solicitud:', err);
      }
    });
  }

  loadCommentsByPublication(idPublicacion: string): void {
    this.commentPublicationService.getCommentsByPublication(idPublicacion).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.comments = response.data;
        } else {
          console.error('Error al cargar los comentarios:', response.listMessage);
        }
      },
      error: (err) => {
        console.error('Error en la solicitud de comentarios:', err);
      }
    });
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

  openReactionHover(data: { event: MouseEvent; tipo: string }, publication: any): void {
    const target = data.event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    publication.reactionType = data.tipo;
    publication.isReactionModalVisible = true;

    publication.hoverPosition = {
      top: rect.top + window.scrollY - 5,
      left: rect.left + window.scrollX + rect.width / 2 + 20
    };

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

  screenIsSmUp(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth >= 640;
    }
    return false;
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

  showHoverModal(userId: string, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.isHoverModalVisible = true;
    this.isHovering = true;

    this.hoverPosition = {
      top: rect.top + window.scrollY + rect.height - 40,
      left: rect.left + window.scrollX + rect.width / 2 + 30
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

  toggleDropdown(publication: Publication): void {
    // Alternar la visibilidad del dropdown
    publication.isDropdownVisible = !publication.isDropdownVisible;
  }

  openDeleteModal(publication: Publication): void {
    this.isDeleteModalVisible = true;
    this.publicationToDelete = publication;
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.publicationToDelete = null;
  }

  confirmDelete(): void {
    if (this.publicationToDelete) {
      this.publicationService.deletePublication(this.publicationToDelete.idPublicacion).subscribe({
        next: () => {
          this.publications = this.publications.filter(p => p.idPublicacion !== this.publicationToDelete?.idPublicacion);
          this.closeDeleteModal();
          this.showAlert('success', 'Publicación eliminada con éxito.');
        },
        error: (error) => {
          console.error('Error al eliminar la publicación:', error);
          this.showAlert('error', 'Ocurrió un error al eliminar la publicación.');
        }
      });
    }
  }


  goBack(): void {
    this.location.back();
  }
  getTimeElapsedWrapper(fechaRegistro: string): string {
    return TimeUtils.getTimeElapsed(fechaRegistro);
  }
  focusCommentTextarea(): void {
    setTimeout(() => {
      this.commentComponent?.focusTextarea();
    }, 0);
  }
  navigateToProfileUser(idUsuario: string) {
    this.router.navigate(['/profile', idUsuario]);
  }

  showAlert(type: string, message: string): void {
    this.alert = { type, message };
    setTimeout(() => {
      this.alert = null;
    }, 5000);
  }

  navigateToEditPublication(idPublicacion: string) {
    this.router.navigate(['/editpublication', idPublicacion]);
  }
}
