import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResponseCommentService } from '../../../../core/services/commentPublication/response-comment.service';

@Component({
  selector: 'app-responses-comment',
  imports: [CommonModule,FormsModule],
  templateUrl: './responses-comment.component.html',
  styleUrl: './responses-comment.component.css'
})
export class ResponsesCommentComponent implements OnInit {
  @Input() idComentario!: string; // ID del comentario al que se responde
  @Input() idUsuario!: string; // ID del usuario logueado
  @Output() close = new EventEmitter<void>(); // Evento para cerrar el componente

  responses: any[] = []; // Lista de respuestas
  responseContents: { [key: string]: string } = {}; // Almacena el contenido de cada respuesta
  newResponseContent: string = ''; // Almacena el contenido de una nueva respuesta
  selectedResponseId: string | null = null; // ID de la respuesta seleccionada para responder
  constructor(private responseCommentService: ResponseCommentService) {}

  ngOnInit(): void {
    this.loadResponses();
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
      flattened.push(response); // Agregar la respuesta actual
      if (response.respuestasHijas && response.respuestasHijas.length > 0) {
        // Aplanar las respuestas hijas y agregarlas al array
        flattened.push(...this.flattenResponses(response.respuestasHijas));
      }
    });
  
    return flattened;
  }
  addResponse(responseId?: string): void {
    const content = responseId ? this.responseContents[responseId] : this.newResponseContent;
  
    if (!content?.trim()) {
      console.error('La respuesta no puede estar vacía.');
      return;
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
            delete this.responseContents[responseId]; // Limpiar el contenido de la respuesta
          } else {
            this.newResponseContent = ''; // Limpiar el contenido del comentario
          }
          this.selectedResponseId = null; // Reiniciar el ID de la respuesta seleccionada
          this.loadResponses(); // Recargar las respuestas
        } else {
          console.error('Error al agregar la respuesta:', response.listMessage);
        }
      },
      error: (err) => {
        console.error('Error al agregar la respuesta:', err);
      }
    });
  }
  handleReplyToResponse(responseId: string): void {
    this.selectedResponseId = responseId; // Establece el ID de la respuesta seleccionada
  }
  closeResponses(): void {
    this.close.emit(); // Emitir evento para cerrar el componente
  }
}
