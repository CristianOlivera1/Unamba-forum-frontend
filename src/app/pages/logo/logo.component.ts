import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { animate, stagger, svg } from 'animejs';

@Component({
  selector: 'app-logo',
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css'
})
export class LogoComponent implements OnInit  {

  constructor(  @Inject(PLATFORM_ID) private platformId: Object) { }
  ngOnInit(): void {


    if (isPlatformBrowser(this.platformId)) {

      animate(svg.createDrawable('.line'), {
        draw: ['0 0', '0 1', '1 1'],
        ease: 'inOutQuad',
        duration: 3800,
        delay: stagger(150),
        loop: true
      });
    }
  }
}
