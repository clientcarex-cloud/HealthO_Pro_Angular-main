import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';


@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
  animations: [
    trigger('messageAnimation', [
      state('start', style({
        opacity: 0
      })),
      state('visible', style({
        opacity: 1
      })),
      transition('start => visible', [
        animate('0.5s')
      ])
    ])
  ]
})


export class LoadingComponent implements OnInit {
  progressPercentage: number = 0;
  messages: string[] = ['Your Account Setup is starting', 'Your Account Setup is in Process', 'Almost There!'];
  currentState: string = 'start';
  currentMessageIndex: number = 0;
  constructor() { }

  ngOnInit(): void {
    const durationSeconds = 17;
    const intervalTime = (durationSeconds * 1000) / 99; // Calculate interval time for each percentage change
    const interval$ = interval(intervalTime).pipe(take(99)); // Emit an interval every intervalTime milliseconds, stopping after 99 emissions
    interval$.subscribe(() => {
      this.progressPercentage++;
    });


    
  }


}
