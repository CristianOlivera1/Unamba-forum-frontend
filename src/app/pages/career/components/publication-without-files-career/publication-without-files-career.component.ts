import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PublicationService } from '../../../../core/services/publication/publication.service';
import { TimeUtils } from '../../../../Utils/TimeElapsed';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publication-without-files-career',
  imports: [CommonModule,RouterLink],
  templateUrl: './publication-without-files-career.component.html',
  styleUrl: './publication-without-files-career.component.css'
})
export class PublicationWithoutFilesCareerComponent implements OnChanges {
  @Input() idCarrera!: string;
  publications: any[] = [];
  currentPage: number = 0;

  constructor(private publicationService: PublicationService,private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idCarrera'] && this.idCarrera) {
   if (this.idCarrera === 'all') {
      this.loadAllPublicationsWithoutFiles();
    } else {
      this.loadPublications();
    }
    }
  }
  loadAllPublicationsWithoutFiles(): void {
  this.publicationService.getAllPublicationwithoutFile().subscribe({
    next: (response: any) => {
      if (response.type === 'success') {
        this.publications = response.data;
      } else {
        console.error('Error al cargar las publicaciones sin archivos:', response.listMessage);
      }
    },
    error: (error: any) => {
      console.error('Error en la solicitud:', error);
    }
  });
}
 loadPublications(): void {
    this.publicationService.getPublicationsWithoutFilesByCareerPaginated(this.idCarrera, this.currentPage).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.publications = response.data;
        } else {
          console.error('Error al cargar las publicaciones:', response.listMessage);
        }
      },
      error: (error: any) => {
        console.error('Error en la solicitud:', error);
      }
    });
  }

  loadMore(): void {
    this.currentPage++;
    this.publicationService.getPublicationsWithoutFilesByCareerPaginated(this.idCarrera, this.currentPage).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.publications = [...this.publications, ...response.data];
        } else {
          console.error('Error al cargar más publicaciones:', response.listMessage);
        }
      },
      error: (error: any) => {
        console.error('Error en la solicitud:', error);
      }
    });
  }

  getTimeElapsedWrapper(fechaRegistro: string): string {
    return TimeUtils.getTimeElapsed(fechaRegistro);
  }

  /*Scroll de publicaciones */
  dragState: { [key: string]: { isDragging: boolean; startX: number; scrollLeft: number } } = {
    publi: { isDragging: false, startX: 0, scrollLeft: 0 },
  };

  @ViewChild('scrollPubli') scrollPubli!: ElementRef;

  startDrag(event: MouseEvent | TouchEvent, key: string) {
    this.dragState[key].isDragging = true;
    const scrollEl = this.getScrollEl(key);
    const pageX = 'touches' in event ? event.touches[0].pageX : event.pageX;
    this.dragState[key].startX = pageX - scrollEl.offsetLeft;
    this.dragState[key].scrollLeft = scrollEl.scrollLeft;
  }

  onDrag(event: MouseEvent | TouchEvent, key: string) {
    if (!this.dragState[key].isDragging) return;
    event.preventDefault();
    const scrollEl = this.getScrollEl(key);
    const pageX = 'touches' in event ? event.touches[0].pageX : event.pageX;
    const x = pageX - scrollEl.offsetLeft;
    const walk = x - this.dragState[key].startX;
    scrollEl.scrollLeft = this.dragState[key].scrollLeft - walk;
  }

  stopDrag(key: string) {
    this.dragState[key].isDragging = false;
  }

  getScrollEl(key: string): HTMLElement {
    switch (key) {
      case 'publi':
        return this.scrollPubli.nativeElement;
      default:
        return document.body;
    }
}
}
