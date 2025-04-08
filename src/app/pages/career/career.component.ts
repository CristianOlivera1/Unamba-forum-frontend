import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CareerService } from '../../core/services/career/career.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-career',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './career.component.html',
  styleUrl: './career.component.css'
})
export class CareerComponent implements OnInit {
  career: any;

  constructor(
    private route: ActivatedRoute,
    private careerService: CareerService
  ) {}

  ngOnInit() {
   this.loadCareerById();
    
  }

  loadCareerById(): void {
    const idCarrera = this.route.snapshot.paramMap.get('idCarrera');
    if (idCarrera) {
      this.careerService.getCareerById(idCarrera).subscribe({
        next: (response:any) => {
          this.career = response.data;
        },
        error: (err) => {
          console.error('Error al obtener la carrera:', err);
        },
      });
    } else {
      console.error('idCarrera es null');
    }
  }

}


