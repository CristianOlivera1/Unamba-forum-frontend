import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CareerService } from '../../../core/services/career/career.service';
import { SummaryService } from '../../../core/services/summary/summary.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TokenService } from '../../../core/services/oauth/token.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent implements OnInit {
  total: any;
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private summaryService: SummaryService,   private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.loadSummaryData();
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!this.tokenService.getToken();
    }
  }

  loadSummaryData(): void {
    this.summaryService.getTotalCareerPublicationUser().subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.total = response.data;

        } else {
          console.error('Error al cargar las carreras:', response.listMessage);
          alert('No se pudieron cargar las carreras.');
        }
      },
      error: (error: any) => {
        console.error('Error en la solicitud:', error);
      }
    });
  }
}
