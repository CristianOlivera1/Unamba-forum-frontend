import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ReactionPublicationService } from '../../../../core/services/reaction/reaction-publication.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-totals-reaction-comment',
  imports: [CommonModule],
  templateUrl: './totals-reaction-comment.component.html',
  styleUrl: './totals-reaction-comment.component.css'
})
export class TotalsReactionCommentComponent implements OnInit {
  @Input() idPublicacion!: string;
  @Output() hoverReaction = new EventEmitter<{ tipo: string; event: MouseEvent }>();
  @Output() leaveReaction = new EventEmitter<void>();
  @Output() hoverComments = new EventEmitter<{ event: MouseEvent }>();
  @Output() leaveComments = new EventEmitter<void>();
  @Input() totalComentarios!: number;
  @Input() reacciones: { tipo: string; cantidad: number }[] = [];


  constructor(private reactionService: ReactionPublicationService,@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
      this.loadReactionSummary();
  }

  loadReactionSummary(): void {
    this.reactionService.getReactionAndCommentSummary(this.idPublicacion).subscribe({
      next: (response) => {
        if (response.type === 'success') {
          this.reacciones = response.data.reacciones.filter((r: any) => r.cantidad > 0);
          this.totalComentarios = response.data.totalComentarios;
        } else {
          console.error('Error al obtener el resumen de reacciones:', response.listMessage);
        }
      },
      error: (err) => {
        console.error('Error en la solicitud:', err);
      }
    });
  }

  onHoverReaction(tipo: string, event: MouseEvent): void {
    this.hoverReaction.emit({ tipo, event });
  }

  onLeaveReaction(): void {
    this.leaveReaction.emit();
  }

  onHoverComments(event: MouseEvent): void {
    this.hoverComments.emit({ event });
  }

  onLeaveComments(): void {
    this.leaveComments.emit();
  }
  
  navigateToDetailAndFocusComment(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `/publication/${this.idPublicacion}?focusComment=true`;
    }
  }
}
