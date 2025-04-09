import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { WelcomeComponent } from '../../../pages/home/components/welcome/welcome.component';
import { TokenService } from '../../../core/services/oauth/token.service';
import { PublicationWithoutFilesComponent } from '../../../pages/home/components/publication-without-files/publication-without-files.component';
import { FilterComponent } from '../../../pages/home/components/filter/filter.component';
import { PublicationWithFilesComponent } from '../../../pages/home/components/publication-with-files/publication-with-files.component';

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [CommonModule,WelcomeComponent,PublicationWithoutFilesComponent,FilterComponent,PublicationWithFilesComponent],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.css'
})
export class PublicationComponent {
 
  isLoggedIn: boolean = false;

  constructor(private tokenService: TokenService) {}
  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenService.getToken();
  }
  
}
