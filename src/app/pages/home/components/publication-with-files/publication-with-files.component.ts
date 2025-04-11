import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { PublicationService } from '../../../../core/services/publication/publication.service';
import { CommonModule } from '@angular/common';
import { TimeUtils } from '../../../../Utils/TimeElapsed';
import { ReactionComponent } from '../reaction/reaction.component';
import { Router } from '@angular/router';
import { TokenService } from '../../../../core/services/oauth/token.service';
import { TotalsReactionCommentComponent } from '../totals-reaction-comment/totals-reaction-comment.component';
import { ModalService } from '../../../../core/services/modal/modal.service';
import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-publication-with-files',
  imports: [CommonModule,ReactionComponent,TotalsReactionCommentComponent,LoginModalComponent],
  templateUrl: './publication-with-files.component.html',
  styleUrl: './publication-with-files.component.css'
})
export class PublicationWithFilesComponent implements OnInit {
  publications: any[] = [];
  currentUserId: string | null = null;
  isLoginModalVisible$: any;

  constructor(private publicationService: PublicationService,  private tokenService: TokenService,
    private router: Router,private modalService: ModalService) {}
    
  ngOnInit(): void {
    this.currentUserId = this.tokenService.getUserId();
    this.isLoginModalVisible$ = this.modalService.isLoginModalVisible$;
    this.loadPublications();
  }

 getTimeElapsedWrapper(fechaRegistro: string): string {
    return TimeUtils.getTimeElapsed(fechaRegistro);
  }

  loadPublications(page: number = 0): void {
    this.publicationService.getPublicationsWithFilesPaginated(page).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.publications = response.data;
        } else {
          console.error('Error al cargar las publicaciones:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
      }
    });
  }

navigateToCareer(idPublication: string) {
  this.router.navigate(['/publication', idPublication]);
}
  
}
