import { Component, OnInit, TemplateRef, ElementRef, ContentChild, HostListener, HostBinding } from '@angular/core';
// import { Subject } from 'rxjs/Subject';
import { Subject } from 'rxjs';

interface Position {
  top: number;
  left: number;
}

@Component({
  selector: 'app-magnify',
  templateUrl: './magnify.component.html',
  styleUrls: ['./magnify.component.css']
})
export class MagnifyComponent {
  @ContentChild(TemplateRef) template!: TemplateRef<any>;

  @HostBinding('class.visible') visible = false;
  @HostBinding('attr.touch-action') touchAction = 'none';

  position$ = new Subject<Position>();
  innerPosition$ = new Subject<Position>();

  constructor(private element: ElementRef) {}

  @HostListener('pointermove', ['$event'])
  move(event: PointerEvent) {
    if (!this.visible) {
      return;
    }

    const target = this.element.nativeElement;

    this.innerPosition$.next({
      top: -1 * (event.pageY - target.offsetTop),
      left: -1 * (event.pageX - target.offsetLeft)
    });

    this.position$.next({
      top: event.clientY,
      left: event.clientX
    });
  }

  @HostListener('pointerdown', ['$event'])
  enter(event: PointerEvent) {
    this.visible = true;

    this.move(event); // initial position
  }

  @HostListener('window:pointerup', ['$event'])
  @HostListener('window:scroll')
  leave() {
    this.visible = false;
  }
}