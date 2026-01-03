import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import * as Util from '@sharedcommon/base/utils';

@Directive({
    selector: '[allowLettersOnly]'
})

export class AllowLettersOnlyDirective {
    @Input() enableAllowLettersOnly: boolean = false;
    @Input() allowUnderScore: boolean = false;
    @Input() allowEmptySpace: boolean = false;
    @Input() allowNumbers: boolean = false;
    @Input() allowSpecialChars: boolean = false;

    constructor(private el: ElementRef) {
    }

    @HostListener('input', ['$event']) onInputChange(event: any) {
        if (!this.enableAllowLettersOnly) {
            return;
        }

        const initalValue = this.el.nativeElement.value;

        this.el.nativeElement.value = 
            Util.keepOnlyLetters(
                initalValue, 
                this.allowUnderScore,
                this.allowEmptySpace,
                this.allowNumbers,
                this.allowSpecialChars);

        if (initalValue !== this.el.nativeElement.value) {
            event.stopPropagation();
        }
    }
}