import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrl: './import-data.component.scss'
})

export class ImportDataComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private proEndpoint : ProEndpoint,
    private staffEndpoint: StaffEndpoint,
    private signUpEndpoint: SignUpEndpoint,
    private cookieSrvc : CookieStorageService
  ){
    super(injector);
  }

  departments: any ;
  copied_Data: any;
  organization: any;
  copyBiz_id: any;

  override ngAfterViewInit(): void {
    this.subsink.sink = this.signUpEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      this.organization = data[0];
  })
}


copied: boolean = false;
  override ngOnInit(): void {
    this.getData()

  }


  getData(){
    this.select_depts = [];
    this.copied_Data = [];
    this.subsink.sink = this.staffEndpoint.getDepartmentsToCopy(this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
      this.departments = data ;
      this.subsink.sink = this.staffEndpoint.getCopyBizData(this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
        this.copyBiz_id = data[0].id;
        this.copied_Data = data[0].departments ;
        this.copied = this.copied_Data.length  == this.departments.length

      })
    })
  }

  
  select_depts: any = [];

  checkSelectAll(){
    let count = 0;
    this.departments?.forEach((d:any)=>{
      if(!this.checkCopiedOrNot(d.name)){
        // this.select_depts.push(d.name);
        count += 1;
       
      }})

      return  this.select_depts?.length == count;
  }

  selectedDepartments(e:any, item:any){
    if(e){
      this.select_depts.push(item.name);
    }else{
      this.select_depts = this.select_depts.filter((d:any)=> d !== item.name);
    }
  }


  checkCopiedOrNot(term:any){
    return this.copied_Data.find((d:any)=> term == d?.name);
    // return this.select_depts.find((d:any)=> d == term)
  }

  hadOrNot(term:any){
    this.select_depts.find((d:any)=> d == term)
  }
  selectAll(e:any){
    if(e){
      this.select_depts = []
      this.departments.forEach((d:any)=>{
        if(!this.checkCopiedOrNot(d.name)){
          this.select_depts.push(d.name);
        }}
      )
    }else{
      this.select_depts = []
    }
  }

  postDepartmentsForSetup(){
    if(this.select_depts.length >= 1){
      const model = {
        b_id: this.organization.id,
        client: this.cookieSrvc.getCookieData().client_id,
        departments_list: this.select_depts
      }
  
      this.staffEndpoint.UpdateDepartmentsForCopy(model, this.copyBiz_id).subscribe((res:any)=>{
        this.alertService.showSuccess("Test Imported Successfully");
        this.modalService.dismissAll();
        this.getData();
      })
    }else{
      this.alertService.showInfo("Select Atleast One Department", "")
    }

  }
}
