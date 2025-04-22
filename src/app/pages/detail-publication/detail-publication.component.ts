import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { CommentComponent } from './components/comment/comment.component';
import { TimeUtils } from '../../Utils/TimeElapsed';

@Component({
  selector: 'app-detail-publication',
  imports: [CommonModule,FormsModule,HeaderComponent,FooterComponent,PhotoSliderComponent,ModalUserCommentPublicationComponent,ModalUserCommentPublicationComponent,ModalUsersByReactionTypeComponent,LoginModalComponent,HoverAvatarComponent,TotalsReactionCommentComponent,ReactionComponent,CompleteInfoRegisterGoogleComponent,CommentComponent],
  templateUrl: './detail-publication.component.html',
  styleUrl: './detail-publication.component.css'
})
export class DetailPublicationComponent implements OnInit{
  publication: any;
  currentUserId: string | null = null;

  isPhotoSliderVisible = false;
  selectedPhotos: { tipo: string; rutaArchivo: string }[] = [];
  selectedPhotoIndex: number = 0;

  isReactionModalVisible: boolean = false;
  reactionUsers: any[] = [];
  reactionType: string = '';

  isHoverModalVisible = false;
  hoverProfileData: any = null;
  hoverPosition = { top: 0, left: 0 };
  isHovering = false;

  isLoginModalVisible$: any;
  isInfoCompleteModalVisible$: any;

  constructor(
    private route: ActivatedRoute,
    private publicationService: PublicationService,
    private tokenService: TokenService,
    private reactionPublicationService: ReactionPublicationService,
    private commentPublicationService: CommentPublicationService,
    private profileService: ProfileService,private router: Router, private modalService: ModalLoginService, private modalInfoCompleteService: ModalInfoCompleteService,@Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.tokenService.getUserId();
    this.isLoginModalVisible$ = this.modalService.isLoginModalVisible$;
    this.isInfoCompleteModalVisible$ = this.modalInfoCompleteService.isInfoCompleteModalVisible$;
    this.loadPublicationById();
    this.loadCommentsByPublication(); 

  }

  loadPublicationById(): void {
    const idPublicacion = this.route.snapshot.paramMap.get('idPublicacion');
    if (idPublicacion) {
      this.publicationService.getPublicationById(idPublicacion).subscribe({
        next: (response: any) => {
          this.publication = response.data;
        },
        error: (err) => {
          console.error('Error al obtener la publicación:', err);
        }
      });
    } else {
      console.error('idPublicacion es null');
    }
  }

  loadCommentsByPublication(): void {
    const idPublicacion = this.route.snapshot.paramMap.get('idPublicacion');
    if (idPublicacion) {
      this.commentPublicationService.getCommentsByPublication(idPublicacion).subscribe({
        next: (response: any) => {
          if (response.type === 'success') {
            this.publication.comments = response.data; // Almacena los comentarios en la publicación
          } else {
            console.error('Error al cargar los comentarios:', response.listMessage);
          }
        },
        error: (err) => {
          console.error('Error al obtener los comentarios:', err);
        }
      });
    } else {
      console.error('idPublicacion es null');
    }
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

  goBack(): void {
    this.router.navigate(['/']);
  }
    getTimeElapsedWrapper(fechaPublicacion: string): string {
      return TimeUtils.getTimeElapsed(fechaPublicacion);
    }
}
