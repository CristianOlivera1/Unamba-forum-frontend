import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-modal-user-comment-publication',
  imports: [CommonModule],
  templateUrl: './modal-user-comment-publication.component.html',
  styleUrl: './modal-user-comment-publication.component.css'
})
export class ModalUserCommentPublicationComponent {
  @Input() usersComment: any[] = [];
  @Input() position: { top: number; left: number } | null = null;

}
