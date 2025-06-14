import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SummaryComponent } from '../../../../shared/components/summary/summary.component';
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      gsap.registerPlugin(ScrollTrigger);

      gsap.to(".title", {
        scale: 1.5,
        autoAlpha: 0,
        scrollTrigger: {
          end: 300,
          scrub: 0.5
        }
      });

      gsap.from(".hero", {
        scale: 0.95,
        autoAlpha: 0,
        duration: 1.2,
        ease: "power2.out",
        delay: 0.2
      });
      const canvas = document.querySelector(".hero") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");

      if (ctx && canvas) {
        canvas.width = 1068;
        canvas.height = 600;
      }

      const TOTAL_FRAMES: number = 48;

      const createImage = (index: number): string => {
        return `./assets/img/frame/scene${index.toString().padStart(5, '0')}.webp`;
      };

      const images: HTMLImageElement[] = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
        const img = new Image();
        img.src = createImage(i + 1);
        return img;
      });

      const micaela: { frame: number } = {
        frame: 0
      };

      // Animación de scroll en imágenes con GSAP
gsap.to(micaela, {
  frame: TOTAL_FRAMES - 1,
  ease: "none",
  snap: "frame",
  scrollTrigger: {
    trigger: "#hero-section",
    start: 0,
    end: "500", // o "+=400" para una altura personalizada
    scrub: 0.5,
    pin: true // Esto fija el hero mientras dura la animación
  },
  onUpdate: render
});

      images[0].onload = () => render();

      function render(): void {
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = images[micaela.frame];

        if (img && img.complete) {
          ctx.save();
          ctx.filter = 'drop-shadow(0px 2px 10px rgba(0, 0, 0, 0.1))';
          ctx.drawImage(img, 0, 0);

          // Crear gradiente de máscara de arriba (20%) a abajo (80%)
          const gradient = ctx.createLinearGradient(0, canvas.height * 1, 0, canvas.height * 0.6);
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, 'rgba(0,0,0,1)');

          ctx.globalCompositeOperation = 'destination-in';
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.restore();
          ctx.globalCompositeOperation = 'source-over';
        }
      }


    }
  }

}
