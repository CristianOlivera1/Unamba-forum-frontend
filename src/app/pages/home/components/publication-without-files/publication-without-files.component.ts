import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PublicationService } from '../../../../core/services/publication/publication.service';
import { CommonModule } from '@angular/common';
import {TimeUtils } from '../../../../Utils/TimeElapsed';
import { Router } from '@angular/router';
@Component({
  selector: 'app-publication-without-files',
  imports: [CommonModule],
  templateUrl: './publication-without-files.component.html',
  styleUrl: './publication-without-files.component.css'
})
export class PublicationWithoutFilesComponent implements OnInit {

@Input() publications: any[] = [];

  constructor(private publicationService: PublicationService,private router: Router) {}

  ngOnInit(): void {
   // this.loadPublications();
  }

  loadPublications(): void {
    this.publicationService.getAllPublicationwithoutFile().subscribe({
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

navigateToDetailPublication(idPublication: string) {
  this.router.navigate(['/publication', idPublication]);
}

}
