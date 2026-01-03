import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[autofocus]'
})
export class AutoFocusDirective {
  @Input() enableAutoFocus: boolean = false;

  constructor(private host: ElementRef) { }

  ngAfterViewInit() {
    this.setDefaultInputFocus();
  }

  public setDefaultInputFocus() {
    if (!this.enableAutoFocus) {
      return;
    }

    let element = this.host.nativeElement; //.focus();
    if (element && element.type !== "search") {
      //element.type = "search";

      setTimeout(() => {
        //element.type = "text";
        element.autocomplete = "chrome-off";
        element.focus();
      }, 100);
    }
  }
}