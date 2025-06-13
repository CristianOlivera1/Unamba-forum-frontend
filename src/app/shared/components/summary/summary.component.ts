import { AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SummaryService } from '../../../core/services/summary/summary.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TokenService } from '../../../core/services/oauth/token.service';
import gsap from "gsap";

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent implements OnInit,AfterViewInit {
  total: any;
  isLoggedIn: boolean = false;

    usersCount = 0;
  publicationsCount = 0;
  careersCount = 0;
 @ViewChild('usersRef') usersRef!: ElementRef;
  @ViewChild('publicationsRef') publicationsRef!: ElementRef;
  @ViewChild('careersRef') careersRef!: ElementRef;

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

        if (isPlatformBrowser(this.platformId)) {
          gsap.to(this, {
            duration: 1.5,
            usersCount: this.total?.totalUsers || 0,
            roundProps: "usersCount",
            ease: "power1.out"
          });
          gsap.to(this, {
            duration: 1.5,
            publicationsCount: this.total?.totalPublications || 0,
            roundProps: "publicationsCount",
            ease: "power1.out"
          });
          gsap.to(this, {
            duration: 1.5,
            careersCount: this.total?.totalCareers || 0,
            roundProps: "careersCount",
            ease: "power1.out"
          });
        } else {
          // SSR: asigna directamente
          this.usersCount = this.total?.totalUsers || 0;
          this.publicationsCount = this.total?.totalPublications || 0;
          this.careersCount = this.total?.totalCareers || 0;
        }
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

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Blur para users
      gsap.fromTo(this.usersRef.nativeElement, { filter: "blur(3px)" }, { filter: "blur(0px)", duration: 1.5});
      // Blur para publications
      gsap.fromTo(this.publicationsRef.nativeElement, { filter: "blur(3px)" }, { filter: "blur(0px)", duration: 1.5 });
      // Blur para careers
      gsap.fromTo(this.careersRef.nativeElement, { filter: "blur(3px)" }, { filter: "blur(0px)", duration: 1.5 });
    }
  }
}
