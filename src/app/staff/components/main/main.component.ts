import { Component, Injector,} from '@angular/core';
import { UntypedFormBuilder, Validators,} from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { StaffEndpoint } from '../../endpoint/staff.endpoint';

import { Staff } from '../../model/staff.model';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { StaffService } from '../../service/staff.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent extends BaseComponent<Staff> {

  constructor(
    private formBuilder: UntypedFormBuilder,
    private endPoint: StaffEndpoint,
    injector: Injector,
    public service: StaffService, 
    public capitalSrvc : CaptilizeService
  ) { super(injector) }

  inProgress: boolean = false;
  pageNum! : number | null;

  override ngOnInit(): void {
    this.dataList$ = this.service.staffs$
    this.total$ = this.service.total$;
    this.pageNum = null;
    this.fetchdata(this.pageNum);
  }

  fetchdata(pageNum: any): void {
    this.subsink.sink = this.endPoint.getStaff(pageNum).subscribe((data: any) => {
      const pntData = data.results;

      if (data.next !== null) {
        pageNum++; // Increase the page number for the next fetch
        this.service.staffs = pntData;
        this.fetchNextPage(pageNum, pntData);
        
      } else {
        // No more pages, assign the data to your service or do other processing
        this.service.staffs = pntData;
      }
    });
  }

  fetchNextPage(pageNum: number, pntData: any[]): void {
    this.endPoint.getStaff(pageNum).subscribe((dataNext: any) => {
      pntData.push(...dataNext.results);

      if (dataNext.next !== null) {
        pageNum++; // Increase the page number for the next fetch
        this.fetchNextPage(pageNum, pntData); // Continue fetching next pages
      } else {
        // No more pages, assign the accumulated data to your service or do other processing
        this.service.staffs = pntData;
      }
    });
  } 


  formatString(e:any,val:any){
    this.baseForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e))
  }

  getModel(){
    const model: any = {
      name : this.baseForm.get('name')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: this.baseForm.get('email')?.value || "",
      is_active: this.baseForm.get('is_active')?.value,
    }
    return model;
  }

  openXl(content: any, sz:string = 'sm', cntrd:boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop});
  }

}
