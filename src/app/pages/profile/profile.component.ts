import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SuggestionComponent } from './components/suggestion/suggestion.component';
import { DetailComponent } from './components/detail/detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../core/services/profile/profile.service';
import { PublicationService } from '../../core/services/publication/publication.service';
import { CommonModule } from '@angular/common';
import { TimeUtils } from '../../Utils/TimeElapsed';
import { HoverAvatarComponent } from '../home/components/hover-avatar/hover-avatar.component';
import { LoginModalComponent } from '../home/components/login-modal/login-modal.component';
import { TotalsReactionCommentComponent } from '../home/components/totals-reaction-comment/totals-reaction-comment.component';
import { CompleteInfoRegisterGoogleComponent } from '../oauth/complete-info-register-google/complete-info-register-google.component';
import { TokenService } from '../../core/services/oauth/token.service';
import { ModalLoginService } from '../../core/services/modal/modalLogin.service';
import { ReactionComponent } from '../home/components/reaction/reaction.component';
import { ModalInfoCompleteService } from '../../core/services/modal/modalCompleteInfo.service';
import { UserService } from '../../core/services/user/user.service';
import { PhotoSliderComponent } from '../home/components/photo-slider/photo-slider.component';
import { EditPhotoProfileComponent } from './components/edit-photo-profile/edit-photo-profile.component';
import { EditFrontPageComponent } from './components/edit-front-page/edit-front-page.component';
import { FollowService } from '../../core/services/follow/follow.service';
import { ModalFollowerComponent } from './components/modal-follower/modal-follower.component';
import { ModalFollowingComponent } from './components/modal-following/modal-following.component';

@Component({
  selector: 'app-profile',
  imports: [HeaderComponent, FooterComponent, HeaderComponent, SuggestionComponent, DetailComponent, CommonModule, TotalsReactionCommentComponent, LoginModalComponent, CompleteInfoRegisterGoogleComponent, HoverAvatarComponent, ReactionComponent, PhotoSliderComponent,EditPhotoProfileComponent,EditFrontPageComponent,ModalFollowerComponent,ModalFollowingComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit {
  userProfile: any = null;
  userDetails: any = null;
  userPublications: any[] = [];
  currentUserId: string | null = null;
  isLoginModalVisible$: any;
  isInfoCompleteModalVisible$: any;
  suggestedUsers: any[] = [];
  userId: string = '';

  hoverProfileData: any = null;
  hoverPosition = { top: 0, left: 0 };
  isHoverModalVisible = false;
  isHovering = false;

  isPhotoSliderVisible = false;
  selectedPhotos: { tipo: string; rutaArchivo: string }[] = [];
  selectedPhotoIndex: number = 0;

  isEditPhotoModalVisible: boolean = false;
  isEditPhotoFrontPageModalVisible: boolean = false;

  isFollowerModalVisible: boolean = false;
  followers: any[] = []; 

  isFollowingModalVisible: boolean = false;
  followings: any[] = []; 

  alert: { type: string; message: string } | null = null;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService, private followService: FollowService,
    private publicationService: PublicationService, private router: Router, private tokenService: TokenService, private modalService: ModalLoginService, private modalInfoCompleteService: ModalInfoCompleteService, private userService: UserService,

  ) { }

  ngOnInit(): void {
    this.currentUserId = this.tokenService.getUserId();
    this.isLoginModalVisible$ = this.modalService.isLoginModalVisible$;
    this.isInfoCompleteModalVisible$ = this.modalInfoCompleteService.isInfoCompleteModalVisible$;


    const idUsuario = this.route.snapshot.paramMap.get('idUsuario');
    if (idUsuario) {
      this.userId = idUsuario;
      this.loadProfileData();
    }

    this.route.params.subscribe(params => {
      const newUserId = params['idUsuario'];
      if (newUserId && newUserId !== this.userId) {
        this.userId = newUserId;
        this.loadProfileData();
      }
    });
  }

  loadProfileData(): void {
    this.loadSuggestedUsers();
    this.loadUserProfile(this.userId);
    this.loadUserDetails(this.userId);
    this.loadUserPublications(this.userId);
  }
  showAlert(type: string, message: string): void {
    this.alert = { type, message };
    setTimeout(() => {
      this.alert = null;
    }, 5000);
  }

  // Método para manejar el evento de éxito del modal
  handlePhotoUpdateSuccess(message: string): void {
    this.showAlert('success', message);
  }
  
  loadSuggestedUsers(): void {
    this.userService.getSuggestedUsers(this.userId).subscribe(response => {
      if (response.type === 'success') {
        this.suggestedUsers = response.data;
      } else {
        console.error('Error al cargar las sugerencias:', response.listMessage);
      }
    });
  }

  loadUserProfile(userId: string): void {
    this.profileService.getUserProfileHover(userId).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.userProfile = response.data;
        } else {
          console.error('Error al cargar el perfil:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud del perfil:', error);
      }
    });
  }

  loadUserDetails(userId: string): void {
    this.profileService.getUserProfileDetail(userId).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.userDetails = response.data;
        } else {
          console.error('Error al cargar los detalles:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de los detalles:', error);
      }
    });
  }

  loadUserPublications(userId: string): void {
    this.publicationService.getPublicationUser(userId).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.userPublications = response.data;
        } else {
          console.error('Error al cargar las publicaciones:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de publicaciones:', error);
      }
    });
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

  openFollowerModal(): void {
    if (!this.userId) return;

    this.followService.getFollowersByUserId(this.userId).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.followers = response.data;
          this.isFollowerModalVisible = true;
        } else {
          console.error('Error al cargar los seguidores:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de seguidores:', error);
      }
    });
  }

  closeFollowerModal(): void {
    this.isFollowerModalVisible = false;
    this.followers = []; 
  }

  
  openFollowingModal(): void {
    if (!this.userId) return;

    this.followService.getFollowingsByUserId(this.userId).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.followings = response.data;
          this.isFollowingModalVisible = true;
        } else {
          console.error('Error al cargar los seguidores:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de seguidores:', error);
      }
    });
  }

  closeFollowingModal(): void {
    this.isFollowingModalVisible = false;
    this.followings = []; 
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

  openEditPhotoModal(): void {
    this.isEditPhotoModalVisible = true; 
  }

  closeEditPhotoModal(): void {
    this.isEditPhotoModalVisible = false; 
  }

  openEditPhotoFrontPageModal(): void {
    this.isEditPhotoFrontPageModalVisible = true; 
  }

  closeEditPhotoFrontPageModal(): void {
    this.isEditPhotoFrontPageModalVisible = false; 
  }

  getTimeElapsedWrapper(fechaRegistro: string): string {
    return TimeUtils.getTimeElapsed(fechaRegistro);
  }

  navigateToDetailPublication(idPublication: string) {
    this.router.navigate(['/publication', idPublication]);
  }

  navigateToProfileUser(idUsuario: string) {
    this.router.navigate(['/profile', idUsuario]);
  }
}
