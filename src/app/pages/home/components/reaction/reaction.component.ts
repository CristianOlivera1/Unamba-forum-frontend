import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ReactionPublicationService } from '../../../../core/services/reaction/reaction-publication.service';
import { TokenService } from '../../../../core/services/oauth/token.service';
import { ModalLoginService } from '../../../../core/services/modal/modalLogin.service';
import { ModalInfoCompleteService } from '../../../../core/services/modal/modalCompleteInfo.service';
import { ProfileService } from '../../../../core/services/profile/profile.service';

@Component({
  selector: 'app-reaction',
  imports: [CommonModule],
  templateUrl: './reaction.component.html',
  styleUrl: './reaction.component.css'
})
export class ReactionComponent implements OnInit {

  @Input() idUsuario!: string;
  @Input() idPublicacion!: string;

  popoverVisible = false;
  tooltipActivo: string | null = null;
  currentReaction: string | null = null;
  isLoggedIn = false;

  
  constructor(private reactionService: ReactionPublicationService,    private tokenService: TokenService,private modalService: ModalLoginService,    private modalInfoCompleteService: ModalInfoCompleteService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    if (this.idUsuario && this.idPublicacion) {
      this.loadCurrentReaction();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idUsuario'] || changes['idPublicacion']) {
      if (this.idUsuario && this.idPublicacion) {
        this.loadCurrentReaction();
      }
    }
  }

  loadCurrentReaction(): void {
    this.reactionService.getReaction(this.idUsuario, this.idPublicacion).subscribe({
      next: (response) => {
        this.currentReaction = response?.data?.tipo || null;
      },
      error: (err) => {
        console.error('Error al cargar la reacción:', err);
      }
    });
  }

  addReaction(tipo: string): void {
    if (!this.tokenService.isLoggedIn()) {
      // Mostrar el modal de inicio de sesión si el usuario no está autenticado
      this.modalService.showLoginModal();
      return;
    }

    if (this.currentReaction === tipo) {
      // Si el usuario hace clic en el mismo emoji, elimina la reacción
      this.removeReaction();
      return;
    }
  
    // Verificar si el perfil del usuario tiene idCarrera
    this.profileService.getProfileByUserId(this.idUsuario).subscribe({
      next: (response: any) => {
      if (response.type === 'success' && !response.data.idCarrera) {
        // Mostrar el modal de completar información si idCarrera es null
        this.modalInfoCompleteService.showInfoCompleteModal();
        return;
      }

      if (this.currentReaction) {
        // Si ya existe una reacción, actualiza la reacción
        this.reactionService.updateReaction(this.idUsuario, this.idPublicacion, tipo).subscribe({
        next: () => {
          this.currentReaction = tipo;
          this.popoverVisible = false;
        },
        error: (err) => {
          console.error('Error al actualizar la reacción:', err);
        }
        });
      } else {
        // Si no existe una reacción, inserta una nueva
        const dtoReaction = {
        idUsuario: this.idUsuario,
        idPublicacion: this.idPublicacion,
        tipo: tipo
        };

        this.reactionService.addReaction(dtoReaction).subscribe({
        next: () => {
          this.currentReaction = tipo;
          this.popoverVisible = false;
        },
        error: (err) => {
          console.error('Error al agregar la reacción:', err);
        }
        });
      }
      },
      error: (err) => {
      console.error('Error al verificar el perfil del usuario:', err);
      }
    });

  }

  removeReaction(): void {

    if (!this.tokenService.isLoggedIn()) {
      this.modalService.showLoginModal();
      return;
    }

    if (!this.currentReaction) {
      this.addReaction('Me identifica');
      return;
    }
  
    this.reactionService.removeReaction(this.idUsuario, this.idPublicacion).subscribe({
      next: () => {
        this.currentReaction = null;
      },
      error: (err) => {
        console.error('Error al eliminar la reacción:', err);
      }
    });
  }

  mostrarPopover() {
    this.popoverVisible = true;
  }
  
  mantenerPopoverVisible() {
    this.popoverVisible = true;
  }
  
  ocultarPopover() {
    this.popoverVisible = false;
  }
  
  mostrarTooltip(nombre: string) {
    this.tooltipActivo = nombre;
  }
  
  ocultarTooltip() {
    this.tooltipActivo = null;
  }
  
}
