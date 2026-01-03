import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[position]'
})
export class PositionDirective {
  @Input('position') position: any;
  @HostBinding('style.left.px') left:any;
  @HostBinding('style.top.px') top: any;

  ngOnChanges(): void {
    if (!this.position) {
      return;
    }
    
    this.left = this.position.left;
    this.top = this.position.top;
  }
}