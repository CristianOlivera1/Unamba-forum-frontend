import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CareerService } from '../../../core/services/career/career.service';
import { SummaryService } from '../../../core/services/summary/summary.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent implements OnInit {
  total: any;

  constructor(
    private route: ActivatedRoute,
    private summaryService: SummaryService
  ) { }

  ngOnInit() {
    this.loadSummaryData();

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
