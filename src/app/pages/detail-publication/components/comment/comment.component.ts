import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CommentPublicationService } from '../../../../core/services/commentPublication/comment-publication.service';
import { TokenService } from '../../../../core/services/oauth/token.service';
import { ProfileService } from '../../../../core/services/profile/profile.service';
import { FormsModule } from '@angular/forms';
import { ReactionCommentAndResponse } from '../../../../core/services/reaction/reaction-comments.service';
import { ResponsesCommentComponent } from '../responses-comment/responses-comment.component';

@Component({
  selector: 'app-comment',
  imports: [CommonModule, FormsModule,ResponsesCommentComponent],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent implements OnInit {
  @Input() idPublicacion!: string;
  comments: any[] = [];
  newCommentContent: string = '';
  isLoggedIn: boolean = false;
  userProfile: any = null;
  tiposReacciones: string[] = ['Me identifica', 'Es increíble', 'Qué divertido'];

  constructor(
    private commentPublicationService: CommentPublicationService,
    private tokenService: TokenService,
    private profileService: ProfileService, private reactionCommentAndResponse: ReactionCommentAndResponse
  ) { }

  ngOnInit(): void {
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
  }
  
  selectedCommentId: string | null = null; // ID del comentario seleccionado para responder

  handleReply(commentId: string): void {
    this.selectedCommentId = commentId; // Establece el comentario seleccionado
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

  userReactions: { [idComentario: string]: string } = {};
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

  extractUserIdFromToken(): string | null {
    const token = this.tokenService.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.idUsuario || null;
    }
    return null;
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
    if (!this.isLoggedIn) {
      console.error('El usuario no está logueado.');
      return;
    }

    if (!this.newCommentContent.trim()) {
      console.error('El comentario no puede estar vacío.');
      return;
    }
    const formData = new FormData();
    formData.append('idUsuario', this.userProfile.idUsuario);
    formData.append('idPublicacion', this.idPublicacion);
    formData.append('contenido', this.newCommentContent);

    this.commentPublicationService.addComment(formData).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          console.log('Comentario agregado correctamente.');
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
  }

  handleReaction(tipo: string, comment: any): void {
    if (!this.isLoggedIn) {
      console.error('El usuario no está logueado.');
      return;
    }

    const idComentario = comment.idComentario;
    const idReaccion = this.userReactions[idComentario]; // <-- Esto es clave
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
        // Actualizamos el mapa
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
        console.log('Reacción eliminada correctamente.');

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
}
