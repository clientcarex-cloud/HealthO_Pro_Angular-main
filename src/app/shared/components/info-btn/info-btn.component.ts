import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-info-btn',
  templateUrl: './info-btn.component.html',
  styleUrls: ['./info-btn.component.scss']
})
export class InfoBtnComponent implements OnInit {

  constructor(private sanitizer: DomSanitizer, config: NgbDropdownConfig) { 
    config.autoClose = true
  }

  ngOnInit(): void {
  }

  @Input() title = "Incrasoft";
  @Input() description = "Lorem Ipsum Lorem ipsum Lorem Ipsum";
  @Input() youtubeLink = "https://youtube.com/embed/HtMF973tXIY?si=jOyj93ChGVhuJ8jy";
  @Input() articleLink = "www.incrasoft.com";
  @Input() steps="1. Lorem ipsum 2. Lorem upsum"

  safeUrl : any ;
  
  get sanitizedYoutubeLink(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.youtubeLink);
  }


  formatSteps(stepsString: string): string {
    // Split the stepsString into an array of steps
    const steps = stepsString.split('. ');

    // Create an array to hold the formatted steps
    const formattedSteps: string[] = [];

    // Iterate over the steps and format each one
    steps.forEach((step, index) => {
        formattedSteps.push(`<li>${step}</li>`);
    });

    // Return the formatted steps as an HTML list
    return `<ol>${formattedSteps.join('')}</ol>`;
}

}
