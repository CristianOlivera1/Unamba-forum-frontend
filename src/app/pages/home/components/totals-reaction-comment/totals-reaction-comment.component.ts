import { Component, Input, OnInit } from '@angular/core';
import { ReactionPublicationService } from '../../../../core/services/reaction/reaction-publication.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-totals-reaction-comment',
  imports: [CommonModule],
  templateUrl: './totals-reaction-comment.component.html',
  styleUrl: './totals-reaction-comment.component.css'
})
export class TotalsReactionCommentComponent implements OnInit {
  @Input() idPublicacion!: string;

  reacciones: { tipo: string; cantidad: number }[] = [];
  totalComentarios: number = 0;

  constructor(private reactionService: ReactionPublicationService) {}

  ngOnInit(): void {
    this.loadReactionSummary();
  }

  loadReactionSummary(): void {
    this.reactionService.getReactionAndCommentSummary(this.idPublicacion).subscribe({
      next: (response) => {
        if (response.type === 'success') {
          this.reacciones = response.data.reacciones.filter((r: any) => r.cantidad > 0); // Filtrar reacciones con cantidad > 0
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
}
