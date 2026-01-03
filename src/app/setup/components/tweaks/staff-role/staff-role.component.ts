import { Component, OnInit } from '@angular/core';
import { BaseEndpoint } from '@sharedcommon/base/base.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { MenuItem } from 'src/app/layouts/sidebar/menu.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { AlertService } from '@sharedcommon/service/alert.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';

@Component({
  selector: 'app-staff-role',
  templateUrl: './staff-role.component.html',
  styleUrls: ['./staff-role.component.scss']
})

export class StaffRoleComponent implements OnInit {

  roles: any = [];
  filteredRoles:any = [];
  staffRoles: any =[];
  showInput: boolean = false;
  menuList!: any;
  accessList:any = [];

  staffName!:UntypedFormGroup;

  rolePermissions = [];

  selectedRole!: string | null;

  filteredMenu!:any;

  constructor(
    private endPoint: MasterEndpoint,
    private proEndpoint: ProEndpoint,
    private formBuilder: UntypedFormBuilder, 
    public capitalSrvc : CaptilizeService, 
    private alertSrvc : AlertService
    ) { }

  ngOnInit(): void {

    this.staffName = this.formBuilder.group({
      name : ["", Validators.required]
    })

    this.fetchRoles();
    
    this.proEndpoint.getMenus().subscribe((data:any)=>{
      this.menuList = data;
    })

  }

  fetchMenuAccessList(id:any){
    this.accessList = [];
    this.filteredMenu = [];
    this.endPoint.getStaffRoleMenuAccessList(id).subscribe((response:any)=>{
      this.accessList = response.results[0]?.lab_menu_access_list || [];
    }, (Error)=>{
      this.alertSrvc.showError(Error)
    })
  }

  fetchRoles(){
    this.roles= [];
    this.filteredRoles = [];
    this.staffRoles =[];

    this.endPoint.getStaffRoles().subscribe((data:any)=>{
      this.roles = data;
      this.filteredRoles = data;
    })


    this.endPoint.getStaffRoles().subscribe((data:any)=>{
      this.staffRoles = data
    })
  }

  formatName(e:any){
    this.staffName.get('name')?.setValue(this.capitalSrvc.capitalizeReturn(e))
  }

  checkInclude(id:number):boolean{
    return this.accessList?.includes(id) || false
  }

  UpdatePermissionsModelAndSend(data: any){
    const model: any ={
      lab_staff_role: this.selectedId,
      lab_menu_access_list: data
    }

    this.endPoint.updateStaffRolePermissions(this.selectedId,model).subscribe((res:any)=>{
      this.alertSrvc.showSuccess("Permissions Updated");
    }, (error)=>{
      this.alertSrvc.showError(error)
    })
  }

  accessPermissions(e:any, id:number){
    if(e){
      this.accessList.push(id);
    }else{
      this.accessList = this.accessList.filter((item:any) => item !== id);
    }
    this.UpdatePermissionsModelAndSend(this.accessList);
  }

  getModel(){
    const model = {
      name : this.staffName.get('name')?.value,
      is_active: true,

    }

    return model;
  }

  saveRole(){
    const role = this.getModel();
    this.endPoint.postStaffRole(role).subscribe((Response)=>{
      this.alertSrvc.showSuccess("Role Added");
      this.fetchRoles();
    }, (Error)=>{
      this.alertSrvc.showError(Error);
    })
  }

  updateStaffRole(role:any, e:any){
    let temp = role
    temp.is_active = e;
    this.endPoint.updateStaffRole(role).subscribe((Response:any)=>{
      role = Response;
      Response.is_active ? this.alertSrvc.showSuccess("Active",`${role.name}`) : ""
      !Response.is_active ? this.alertSrvc.showInfo("Inactive",`${role.name}`) : ""
    }, (Error)=>{
      // role.is_active = !e;
      this.alertSrvc.showError(Error);
    })
  }

  selectedId!: any ;
  sortRoles(e:any){
    if(e?.id){
      this.selectedId = e?.id;
      this.selectedRole = e.name;
      this.fetchMenuAccessList(e.id);
      
    }else{
      this.selectedId = null;
      this.selectedRole = null
      this.filteredRoles = this.roles;
    }
  }

}
