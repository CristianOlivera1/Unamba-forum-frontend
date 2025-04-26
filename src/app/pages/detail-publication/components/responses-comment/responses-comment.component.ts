import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResponseCommentService } from '../../../../core/services/commentPublication/response-comment.service';
import { TokenService } from '../../../../core/services/oauth/token.service';
import { ProfileService } from '../../../../core/services/profile/profile.service';
import { HoverAvatarComponent } from '../../../home/components/hover-avatar/hover-avatar.component';
import { Router } from '@angular/router';
import { ModalInfoCompleteService } from '../../../../core/services/modal/modalCompleteInfo.service';
import { ModalLoginService } from '../../../../core/services/modal/modalLogin.service';


@Component({
  selector: 'app-responses-comment',
  imports: [CommonModule, FormsModule, HoverAvatarComponent],
  templateUrl: './responses-comment.component.html',
  styleUrl: './responses-comment.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class ResponsesCommentComponent implements OnInit {
  @Input() idComentario!: string;
  @Input() idUsuario!: string;
  @Output() close = new EventEmitter<void>();
  @Input() nombreUsuario!: string;
  responses: any[] = [];
  responseContents: { [key: string]: string } = {};
  newResponseContent: string = '';
  selectedResponseId: string | null = null;
  userProfile: any = null;
  isLoggedIn: boolean = false;

  showEmojiPicker: boolean = false;

  hoverProfileData: any = null;
  hoverPosition = { top: 0, left: 0 };
  isHoverModalVisible = false;
  isHovering = false;

  isLoginModalVisible: boolean = false;
  isInfoCompleteModalVisible$: any;

  constructor(private responseCommentService: ResponseCommentService, @Inject(PLATFORM_ID) private platformId: Object, private tokenService: TokenService,
    private profileService: ProfileService, private router: Router, private modalInfoCompleteService: ModalInfoCompleteService, private modalLoginService: ModalLoginService) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenService.getToken();
    this.isInfoCompleteModalVisible$ = this.modalInfoCompleteService.isInfoCompleteModalVisible$;

    if (this.isLoggedIn) {
      this.loadUserProfile();
    }
    if (isPlatformBrowser(this.platformId)) {
      import('emoji-picker-element');
    }
    this.newResponseContent = `@${this.nombreUsuario} `;
    this.loadResponses();
  }
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  addEmoji(event: any): void {
    const emoji = event.detail.unicode;
    if (this.selectedResponseId) {
      this.responseContents[this.selectedResponseId] += emoji;
    } else {
      this.newResponseContent += emoji;
    }
    this.showEmojiPicker = false;
  }

  loadUserProfile(): Promise<void> {
    return new Promise((resolve, reject) => {
      const userId = this.extractUserIdFromToken();
      if (userId) {
        this.profileService.getProfileByUserId(userId).subscribe(
          (response) => {
            if (response.type === 'success') {
              this.userProfile = response.data;
              resolve();
            } else {
              reject(response.listMessage);
            }
          },
          (error) => {
            console.error('Error en la solicitud del perfil:', error);
            reject(error);
          }
        );
      } else {
        reject('No se pudo extraer el ID del usuario del token.');
      }
    });
  }

  handleTextareaClick(): void {
    if (!this.isLoggedIn) {
      this.isLoginModalVisible = true;
      this.modalLoginService.showLoginModal();
    }
  }
  extractUserIdFromToken(): string | null {
    const token = this.tokenService.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.idUsuario || null;
    }
    return null;
  }

  loadResponses(): void {
    this.responseCommentService.getResponsesByComment(this.idComentario).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          // Aplanar las respuestas y asignarlas a la propiedad responses
          this.responses = this.flattenResponses(response.data);
        } else {
          console.error('Error al cargar las respuestas:', response.listMessage);
        }
      },
      error: (err) => {
        console.error('Error al obtener las respuestas:', err);
      }
    });
  }

  private flattenResponses(responses: any[]): any[] {
    const flattened: any[] = [];

    responses.forEach(response => {
      flattened.push(response);
      if (response.respuestasHijas && response.respuestasHijas.length > 0) {
        // Aplanar las respuestas hijas y agregarlas al array
        flattened.push(...this.flattenResponses(response.respuestasHijas));
      }
    });

    return flattened;
  }
  addResponse(responseId?: string): void {
    let content = responseId ? this.responseContents[responseId] : this.newResponseContent;

    if (!content?.trim()) {
      console.error('La respuesta no puede estar vacía.');
      return;
    }
    // Validar que el contenido no sea solo la mención
    if (responseId) {
      const mention = `@${this.responses.find(r => r.idRespuesta === responseId)?.nombreCompleto} `;
      if (content.trim() === mention.trim()) {
        console.error('No puedes enviar solo la mención.');
        return;
      }
      if (!content.startsWith(mention)) {
        content = mention + content; // Agregar la mención al inicio si no está
      }
    } else {
      const mention = `@${this.nombreUsuario} `;
      if (content.trim() === mention.trim()) {
        console.error('No puedes enviar solo la mención.');
        return;
      }
      if (!content.startsWith(mention)) {
        content = mention + content; // Agregar la mención al inicio si no está
      }
    }


    const formData = new FormData();
    if (responseId) {
      formData.append('idRespuestaPadre', responseId); // Responder a una respuesta
    } else {
      formData.append('idComentario', this.idComentario); // Responder a un comentario
    }

    formData.append('idUsuario', this.idUsuario);
    formData.append('contenido', content);

    this.responseCommentService.addResponse(formData).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          console.log('Respuesta agregada correctamente.');
          if (responseId) {
            delete this.responseContents[responseId];
          } else {
            this.newResponseContent = '';
          }
          this.selectedResponseId = null;
          this.loadResponses();
        } else {
          console.error('Error al agregar la respuesta:', response.listMessage);
        }
      },
      error: (err) => {
        console.error('Error al agregar la respuesta:', err);
      }
    });
  }

  handleReplyToResponse(response: any): void {
    this.selectedResponseId = response.idRespuesta;
    this.responseContents[response.idRespuesta] = `@${response.nombreCompleto} `;
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
  closeResponses(): void {
    this.close.emit();
  }

  enforceMentionForComment(): void {
    const mention = `@${this.nombreUsuario} `;

  }
  enforceMention(responseId: string, nombreCompleto: string): void {
    const mention = `@${nombreCompleto} `;
  }

  navigateToProfileUser(idUsuario: string) {
    this.router.navigate(['/profile', idUsuario])
  }
}
