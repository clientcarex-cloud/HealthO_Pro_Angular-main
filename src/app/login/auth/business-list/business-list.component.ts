import { Component, OnInit } from '@angular/core';
// import { LoginEndpoint } from '../../endpoint/signin.endpoint';
import { BusinessEndpoint } from '../../endpoint/business.endpoint';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-business-list',
  templateUrl: './business-list.component.html',
  styleUrls: ['./business-list.component.scss']
})
export class BusinessListComponent implements OnInit {

  constructor(private endPoint : BusinessEndpoint, private router: Router) { }

  profiles:any = [];

  ngOnInit(): void {
    const currentUser = localStorage.getItem('currentUser');
    const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
    const bid_list = currentUserObj ? currentUserObj?.bid_list : null;

    bid_list.forEach((bid: any) => {
        this.endPoint.getBusinessProfiles(bid).subscribe((data: any) => {
       
            if (data.results.length === 1) {
                this.profiles.push({ bid: bid, profile: data.results[0] });
            } else {
                data.results.forEach((all_profiles_inBID: any) => {
                    this.profiles.push({ bid: bid, profile: all_profiles_inBID });
                });
            }
        });
    });
}


saveBid(business : any){

  const currentUserString = localStorage.getItem('currentUser');
  if (currentUserString) {
      // Parse the string to get the object
      const currentUser = JSON.parse(currentUserString);
  
      // Update the b_id property
      currentUser.b_id = business.bid;

      //update labstaff

      let labStaffObj = { labStaff_id: business.profile.id, };

      let jsonString = JSON.stringify(labStaffObj);
      localStorage.setItem('labStaff', jsonString)

      // Store the updated object back in local storage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      this.router.navigate(['']);
  }
}


}
