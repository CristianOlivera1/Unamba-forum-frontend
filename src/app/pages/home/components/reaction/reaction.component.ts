import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ReactionPublicationService } from '../../../../core/services/reaction/reaction-publication.service';
import { TokenService } from '../../../../core/services/oauth/token.service';
import { ModalLoginService } from '../../../../core/services/modal/modalLogin.service';
import { ModalInfoCompleteService } from '../../../../core/services/modal/modalCompleteInfo.service';
import { ProfileService } from '../../../../core/services/profile/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reaction',
  imports: [CommonModule],
  templateUrl: './reaction.component.html',
  styleUrl: './reaction.component.css'
})
export class ReactionComponent implements OnInit {
  @Input() idUsuario!: string;
  @Input() idPublicacion!: string;
  @Output() reactionChanged = new EventEmitter<void>();

  popoverVisible = false;
  tooltipActivo: string | null = null;
  currentReaction: string | null = null;
  isLoggedIn = false;

  constructor(private reactionService: ReactionPublicationService,    private tokenService: TokenService,private modalService: ModalLoginService,    private modalInfoCompleteService: ModalInfoCompleteService,
    private profileService: ProfileService,private router: Router,@Inject(PLATFORM_ID) private platformId: Object
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

      this.modalService.showLoginModal();
      return;
    }

    if (this.currentReaction === tipo) {
      this.removeReaction();
      return;
    }
  
    // Verificar si el perfil del usuario tiene idCarrera
    this.profileService.getProfileByUserId(this.idUsuario).subscribe({
      next: (response: any) => {
      if (response.type === 'success' && !response.data.idCarrera) {
        this.modalInfoCompleteService.showInfoCompleteModal();
        return;
      }

      if (this.currentReaction) {
        // Si ya existe una reacción, actualiza la reacción
        this.reactionService.updateReaction(this.idUsuario, this.idPublicacion, tipo).subscribe({
        next: () => {
          this.currentReaction = tipo;
          this.popoverVisible = false;
          this.reactionChanged.emit();

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
          this.reactionChanged.emit();

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
        this.reactionChanged.emit();

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
  navigateToDetailAndFocusComment(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `/publication/${this.idPublicacion}?focusComment=true`;
    }
  }
  
}
