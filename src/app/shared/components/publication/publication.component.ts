import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { WelcomeComponent } from '../../../pages/home/components/welcome/welcome.component';
import { TokenService } from '../../../core/services/oauth/token.service';
import { PublicationWithoutFilesComponent } from '../../../pages/home/components/publication-without-files/publication-without-files.component';
import { FilterComponent } from '../../../pages/home/components/filter/filter.component';
import { PublicationWithFilesComponent } from '../../../pages/home/components/publication-with-files/publication-with-files.component';
import { PublicationService } from '../../../core/services/publication/publication.service';

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [CommonModule, WelcomeComponent, PublicationWithoutFilesComponent, FilterComponent, PublicationWithFilesComponent],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.css'
})
export class PublicationComponent {
  publicationsWithFiles: any[] = [];
  publicationsWithoutFiles: any[] = [];
  isLoggedIn: boolean = false;
isFiltered = false;

  constructor(private tokenService: TokenService, private publicationService:PublicationService) { }
  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenService.getToken();
  }

onFilterChanged(filter: { idCarrera: string, idCategoria: string }) {
  this.isFiltered = !!(filter.idCarrera || filter.idCategoria);
  this.publicationService.filterPublications(filter.idCategoria, filter.idCarrera).subscribe(res => {
    if (res.type === 'success') {
      this.publicationsWithFiles = Array.isArray(res.publicacionesConArchivos) ? res.publicacionesConArchivos : [];
      this.publicationsWithoutFiles = Array.isArray(res.publicacionesSinArchivos) ? res.publicacionesSinArchivos : [];
    } else {
      this.publicationsWithFiles = [];
      this.publicationsWithoutFiles = [];
    }
  }, () => {
    this.publicationsWithFiles = [];
    this.publicationsWithoutFiles = [];
  });
}
}
