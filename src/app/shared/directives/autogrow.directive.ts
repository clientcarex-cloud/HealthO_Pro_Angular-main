import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'textarea[autoGrow]'
})
export class AutoGrowDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjustHeight();
  }

  ngOnInit(): void {
    this.adjustHeight();
  }

  private adjustHeight(): void {
    const textarea = this.el.nativeElement as HTMLTextAreaElement;
    textarea.style.overflow = 'hidden';
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
