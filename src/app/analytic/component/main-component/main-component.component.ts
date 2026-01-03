import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-main-component',
  templateUrl: './main-component.component.html',
})
export class MainComponentComponent implements OnInit {
  activeTab: number = 1;  // Default tab

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Get the 'tab' parameter from the URL and set the activeTab
    this.route.params.subscribe(params => {
      const tabId = +params['tab'];  // Convert string to number
      if (tabId >= 1 && tabId <= 5) {
        this.activeTab = tabId;  // Set activeTab based on the URL
      }
    });
  }

  // This function is called to navigate to a specific tab in the URL
  changeTab(tabId: number): void {
    this.router.navigate(['/analytic/analytics/', { tab: tabId }]); // Update URL with the selected tab
  }
}
