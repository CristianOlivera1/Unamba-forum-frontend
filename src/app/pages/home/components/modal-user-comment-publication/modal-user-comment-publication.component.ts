import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-modal-user-comment-publication',
  imports: [CommonModule,RouterLink],
  templateUrl: './modal-user-comment-publication.component.html',
  styleUrl: './modal-user-comment-publication.component.css'
})
export class ModalUserCommentPublicationComponent {
  @Input() usersComment: any[] = [];
  @Input() position: { top: number; left: number } | null = null;

  constructor(private router:Router){}
  navigateToProfileUser(idUsuario:string){
    this.router.navigate(["/profile",idUsuario])
  }
}
