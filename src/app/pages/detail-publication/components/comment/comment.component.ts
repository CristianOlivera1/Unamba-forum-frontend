import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Inject, Input, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommentPublicationService } from '../../../../core/services/commentPublication/comment-publication.service';
import { TokenService } from '../../../../core/services/oauth/token.service';
import { ProfileService } from '../../../../core/services/profile/profile.service';
import { FormsModule } from '@angular/forms';
import { ReactionCommentAndResponse } from '../../../../core/services/reaction/reaction-comments.service';
import { ResponsesCommentComponent } from '../responses-comment/responses-comment.component';
import { TimeUtils } from '../../../../Utils/TimeElapsed';
import { HoverAvatarComponent } from '../../../home/components/hover-avatar/hover-avatar.component';
import { Router, RouterLink } from '@angular/router';
import { ModalLoginService } from '../../../../core/services/modal/modalLogin.service';
import { ModalInfoCompleteService } from '../../../../core/services/modal/modalCompleteInfo.service';

@Component({
  selector: 'app-comment',
  imports: [CommonModule, FormsModule, ResponsesCommentComponent,HoverAvatarComponent,RouterLink],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CommentComponent implements OnInit {
  @Input() idPublicacion!: string;
  @ViewChild('commentTextarea') commentTextarea!: ElementRef;

  comments: any[] = [];
  newCommentContent: string = '';
  isLoggedIn: boolean = false;
  userProfile: any = null;
  tiposReacciones: string[] = ['Me identifica', 'Es increíble', 'Qué divertido'];

  hoverProfileData: any = null;
  hoverPosition = { top: 0, left: 0 };
  isHoverModalVisible = false;
  isHovering = false;

  showEmojiPicker: boolean = false;

  isLoginModalVisible: boolean = false;
  isInfoCompleteModalVisible$: any;
  userReactions: { [idComentario: string]: string } = {};

  constructor(
    private commentPublicationService: CommentPublicationService,
    private tokenService: TokenService,
    private profileService: ProfileService, private reactionCommentAndResponse: ReactionCommentAndResponse, @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private modalLoginService: ModalLoginService,private modalInfoCompleteService: ModalInfoCompleteService,
  ) { }

  ngOnInit(): void {
    this.isInfoCompleteModalVisible$ = this.modalInfoCompleteService.isInfoCompleteModalVisible$;

    this.isLoggedIn = !!this.tokenService.getToken();
    if (this.isLoggedIn) {
      this.loadUserProfile().then(() => {
        this.loadUserReactions();
      });
    }

    if (this.idPublicacion) {
      this.loadComments();
    } else {
      console.error('idPublicacion no está definido.');
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        this.isLoggedIn = !!this.tokenService.getToken();
        if (this.isLoggedIn) {
          this.loadUserProfile().then(() => {
            this.loadUserReactions();
          });
        } else {
          this.userProfile = null;
        }
      });
    }
    if (isPlatformBrowser(this.platformId)) {
      import('emoji-picker-element');
    }
  }

  selectedCommentId: string | null = null;

  handleReply(commentId: string): void {
    this.selectedCommentId = commentId;
  }

  focusTextarea(): void {
    setTimeout(() => {
      this.commentTextarea?.nativeElement.focus();
    }, 0);
  }

  loadUserProfile(): Promise<void> {
    return new Promise((resolve, reject) => {
      const userId = this.tokenService.getUserId();
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

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  addEmoji(event: any): void {
    const emoji = event.detail.unicode;
    this.newCommentContent += emoji;
    this.showEmojiPicker = false;
  }
  loadUserReactions(): void {
    if (!this.isLoggedIn) {
      return;
    }

    this.reactionCommentAndResponse.getUserReactionsToComments(this.userProfile.idUsuario, this.idPublicacion).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.userReactions = response.data.reduce((acc: any, reaction: any) => {
            acc[reaction.idComentario] = reaction.idReaccion;
            return acc;
          }, {});
        } else {
          console.error('Error al cargar las reacciones del usuario:', response.listMessage);
        }
      },
      error: (err) => {
        console.error('Error al obtener las reacciones del usuario:', err);
      }
    });
  }
  handleTextareaClick(): void {
    if (!this.isLoggedIn) {
      this.isLoginModalVisible = true;
      this.modalLoginService.showLoginModal();
    }
  }


  loadComments(): void {
    this.commentPublicationService.getCommentsByPublication(this.idPublicacion).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {

          this.comments = response.data;
        } else {
          console.error('Error al cargar los comentarios:', response.listMessage);
        }
      },
      error: (err) => {
        console.error('Error al obtener los comentarios:', err);
      }
    });
  }

  addComment(): void {
    if (!this.newCommentContent.trim()) {
      console.error('El comentario no puede estar vacío.');
      return;
    }

    // Verificar si el perfil del usuario tiene idCarrera
    this.profileService.getProfileByUserId(this.userProfile.idUsuario).subscribe({
      next: (response: any) => {
        if (response.type === 'success' && !response.data.idCarrera) {
          this.modalInfoCompleteService.showInfoCompleteModal();
          return;
        }

        // Si el usuario tiene carrera, proceder a agregar el comentario
        const formData = new FormData();
        formData.append('idUsuario', this.userProfile.idUsuario);
        formData.append('idPublicacion', this.idPublicacion);
        formData.append('contenido', this.newCommentContent);

        this.commentPublicationService.addComment(formData).subscribe({
          next: (response: any) => {
            if (response.type === 'success') {
              this.newCommentContent = '';
              this.loadComments();
            } else {
              console.error('Error al agregar el comentario:', response.listMessage);
            }
          },
          error: (err) => {
            console.error('Error al agregar el comentario:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al verificar el perfil del usuario:', err);
      }
    });
  }

  handleReaction(tipo: string, comment: any): void {
    if (!this.isLoggedIn) {
      console.error('El usuario no está logueado.');
      return;
    }

    const idComentario = comment.idComentario;
    const idReaccion = this.userReactions[idComentario];
    const reaccionActual = comment.reacciones.find((r: { idReaccion: string }) => r.idReaccion === idReaccion);

    if (reaccionActual && reaccionActual.tipo === tipo) {
      // Verifica que idReaccion no sea undefined antes de llamar
      if (idReaccion) {
        this.removeReaction(idComentario);
      } else {
        console.warn('La reacción aún no ha sido registrada en userReactions.');
      }
    } else if (reaccionActual) {
      this.updateReaction(idComentario, tipo);
    } else {
      this.addReaction(idComentario, tipo);
    }
  }

  addReaction(idComentario: string, tipo: string): void {
    this.reactionCommentAndResponse.addReactionToCommentOrResponse({
      idComentario: idComentario,
      idUsuario: this.userProfile.idUsuario,
      tipo: tipo
    }).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          const idReaccion = response.data.idReaccion;

          this.userReactions[idComentario] = idReaccion;

          // ✅ Actualizar el comentario correspondiente
          const comment = this.comments.find(c => c.idComentario === idComentario);
          if (comment) {
            let reaccionExistente = comment.reacciones.find((r: any) => r.tipo === tipo);
            if (reaccionExistente) {
              reaccionExistente.cantidad++;
              reaccionExistente.idReaccion = idReaccion;
            } else {
              comment.reacciones.push({
                tipo: tipo,
                cantidad: 1,
                idReaccion: idReaccion
              });
            }
          }
        }
      },
      error: (err) => {
        console.error('Error al agregar la reacción:', err);
      }
    });
  }

  updateReaction(idComentario: string, nuevoTipo: string): void {
    const idReaccion = this.userReactions[idComentario];

    if (!idReaccion) {
      console.error('No se encontró una reacción para actualizar.');
      return;
    }

    const dtoReaction = {
      idUsuario: this.userProfile.idUsuario,
      idComentario,
      idRespuesta: undefined,
      nuevoTipo
    };

    this.reactionCommentAndResponse.updateReactionCommentOrResponse(idReaccion, dtoReaction).subscribe({
      next: () => {
        const comment = this.comments.find(c => c.idComentario === idComentario);
        if (comment) {
          const anterior = comment.reacciones.find((r: any) => r.idReaccion === idReaccion);
          if (anterior) anterior.cantidad--;

          comment.reacciones = comment.reacciones.filter((r: any) => r.cantidad > 0);

          let nueva = comment.reacciones.find((r: any) => r.tipo === nuevoTipo);
          if (nueva) {
            nueva.cantidad++;
            nueva.idReaccion = idReaccion;
          } else {
            comment.reacciones.push({
              tipo: nuevoTipo,
              cantidad: 1,
              idReaccion
            });
          }
        }
        this.userReactions[idComentario] = idReaccion;
      },
      error: (err) => {
        console.error('Error al actualizar la reacción:', err);
      },
    });
  }

  removeReaction(idComentario: string): void {
    const idReaccion = this.userReactions[idComentario];
    if (!idReaccion) {
      console.error('No se encontró una reacción para eliminar.');
      return;
    }

    this.reactionCommentAndResponse.removeReactionCommentOrResponse(idReaccion).subscribe({
      next: () => {

        const comment = this.comments.find(c => c.idComentario === idComentario);
        if (comment) {
          const reaccion = comment.reacciones.find((r: any) => r.idReaccion === idReaccion);
          if (reaccion) {
            reaccion.cantidad--;
            if (reaccion.cantidad <= 0) {
              comment.reacciones = comment.reacciones.filter((r: any) => r.idReaccion !== idReaccion);
            }
          }
        }

        delete this.userReactions[idComentario];
      },
      error: (err) => {
        console.error('Error al eliminar la reacción:', err);
      }
    });
  }

  isUserReaction(comment: any, tipo: string): boolean {
    const idReaccion = this.userReactions[comment.idComentario];
    const reaccion = comment.reacciones.find((r: any) => r.idReaccion === idReaccion);
    return reaccion?.tipo === tipo;
  }

  getCantidadReaccion(reacciones: any[], tipo: string): number {
    return reacciones
      .filter(r => r.tipo === tipo)
      .reduce((total, r) => total + r.cantidad, 0);
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
  getTimeElapsedWrapper(fechaRegistro: string): string {
    return TimeUtils.getTimeElapsed(fechaRegistro);
  }
}
