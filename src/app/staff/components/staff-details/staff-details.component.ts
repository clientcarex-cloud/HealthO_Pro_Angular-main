import { Component, Injector, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { StaffEndpoint } from '../../endpoint/staff.endpoint';
import { Staff } from '../../model/staff.model';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { StaffService } from '../../service/staff.service';
import { ActivatedRoute } from '@angular/router';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { FileService } from '@sharedcommon/service/file.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { SharedModule } from '@sharedcommon/shared.module';

@Component({
  selector: 'app-staff-details',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.scss']
})
export class StaffDetailsComponent extends BaseComponent<Staff> {

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    public service: StaffService,
    private cookieSrvc : CookieStorageService,
    private fileSrvc: FileService,
    public capitalSrvc: CaptilizeService,
    private proEndpoint: ProEndpoint,
    private masterEndpoint: MasterEndpoint,
    private endPoint: StaffEndpoint,
    private signupEndpoint: SignUpEndpoint
  ) { super(injector) }


  navigateBack() {
    window.history.back()
  }
  

  @Input() doctor: any ;

  inProgress: boolean = false;

  genders!: any;
  departments!: any;
  s_Id!: any;
  roles!: any;
  menusList: any = [];
  labAccessForm!: UntypedFormGroup;
  accessList: any = [];
  shifts: any;
  branches: any = [];
  employmentTypes!: any;

  titles: any = [];

  patients_page_permissions: any = [
    {
      name: ""
    }
  ];


  lab_tech_permissions: any;
  radio_permissions: any;

  super_menus: any = [];

  override ngOnInit(): void {
    this.initializeForm();

    this.subsink.sink = this.proEndpoint.getTitle().subscribe((data: any) => {
      this.titles = data
    })

    this.subsink.sink = this.proEndpoint.getStaffGender().subscribe((data: any) => {
      this.genders = data.results;
    })

    this.subsink.sink = this.endPoint.getDepartments().subscribe((data: any) => {
      this.departments = data.filter((d: any) => d.is_active);
    })

    this.subsink.sink = this.endPoint.getStaffRoles().subscribe((data: any) => {
      this.roles = data
    })

    this.subsink.sink = this.proEndpoint.getMenus().subscribe((data: any) => {
      this.menusList = data;
      this.super_menus = [];

      data.forEach((menu: any) => {
        this.super_menus.push(menu.id);
      })
    })

    this.subsink.sink = this.proEndpoint.getEmploymentTypes().subscribe((data: any) => {
      this.employmentTypes = data
    })

    this.subsink.sink = this.endPoint.getShits().subscribe((data: any) => {
      this.shifts = data
    })

    this.subsink.sink = this.endPoint.getBranches().subscribe((data: any) => {
      this.branches = data
    })


    this.subsink.sink = this.proEndpoint.getAllPatientsPagePErmissions(this.s_Id).subscribe((data: any) => {

      function transformData(data: any) {
        const grouped: any = {};

        data.forEach((item: any) => {
          // If the label doesn't exist in the grouped object, initialize it
          if (!grouped[item.label]) {
            grouped[item.label] = {
              label: item.label,
              permissions: []
            };
          }
          // Push the current item into the permissions array
          grouped[item.label].permissions.push(item);
        });

        // Convert the grouped object into an array of objects
        return Object.values(grouped);
      }


      const grouped: any = transformData(data);
      this.patients_page_permissions = grouped[0].permissions
      this.lab_tech_permissions = grouped[1].permissions;
      this.radio_permissions = grouped[2].permissions


    })
  }


  all_branches: any = [];
  organization: any ;
  override ngAfterViewInit(): void {
    this.subsink.sink = this.signupEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      this.organization = data[0];

      if(this.organization?.addresses && this.organization.addresses?.length > 0){
        this.organization.addresses.forEach((address: any)=> {
          this.selectedBranches.push(address.id) ;
        })

        this.all_branches = this.selectedBranches ; 
      }

    })
  }




  changeTitle(e: any) {
    if (e.target.value === "2" || e.target.value === "3" || e.target.value === 2 || e.target.value === 3) {
      this.baseForm.get('gender')?.setValue(2);
    } else if (e.target.value === 1 || e.target.value === "1") {
      this.baseForm.get('gender')?.setValue(1);
    }
  }

  changeGender(e: any) {
    if (e.target.value === 2 || e.target.value === "2") {
      this.baseForm.get('title')?.setValue(2);
    } else if (e.target.value === 1 || e.target.value === "1") {
      this.baseForm.get('title')?.setValue(1);
    }
  }

  initializeForm() {
    this.baseForm = this.formBuilder.group({
      title: [this.titles[0]?.id || 1],
      name: ["", Validators.required],
      mobile_number: ["", Validators.required],
      email: [""],
      is_active: [false],
      date_of_birth: [null],
      CUser: [null],
      employement_type: [null],
      gender: [1],
      role: [null, Validators.required],
      department: [null],
      shift: [null],
      branch: [null],
      signature: [null],
      profile_pic: [null],
      is_superadmin: [false],

      can_login: [true],
    })
  }

  initializeMenuForm() {
    this.labAccessForm = this.formBuilder.group({
      is_access: true,
      lab_staff: [""],
      lab_menu: [[]]
    })
  }

  formatString(e: any, val: any) {
    this.baseForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e))
  }

  addRemoveCheck(e: any, id: number) {
    if (e) {
      this.accessList.push(id);
    } else {
      this.accessList = this.accessList.filter((item: any) => item !== id);
    }
  }


  selectAll: boolean = false;

  selectAllPermissions() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.accessList = [];
      this.menusList.forEach((m: any) => {
        this.accessList.push(m.id);
      })
    } else {
      this.accessList = [];
    }
  }

  getUserID() {
    const currentUser = localStorage.getItem('currentUser');
    const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
    const user_id = currentUserObj ? currentUserObj.user_id : null;
    return user_id;
  }

  test() {

  }

  getModel() {
    const model: any = {
      name: this.baseForm.get('name')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: this.baseForm.get('email')?.value || "",
      is_active: true,
      date_of_birth: this.baseForm.get('date_of_birth')?.value || null,

      employement_type: this.baseForm.get('employement_type')?.value?.id || null,
      gender: this.baseForm.get('gender')?.value?.id || null,
      role: this.baseForm.get('role')?.value?.id || null,
      department: this.baseForm.get('department')?.value?.id || null,
      shift: this.baseForm.get('shift')?.value?.id || null,
      branch: this.baseForm.get('branch')?.value?.id || null,
      signature: this.imageFile || null,
      profile_pic: this.profilePicture || null,
      is_superadmin: this.baseForm.get('role')?.value?.name.toLowerCase().replace(" ", "").includes("superadmin"),

      branches: this.is_super_admin() ? this.all_branches : this.selectedBranches
    }
    return model;
  }


  saveDoctor(doctor: any){

    const model = {
      doctor_id : doctor?.id || null,
      can_login: this.baseForm.get('can_login')?.value,
      permissions: this.permissions,
      number: this.permission_discount,
      branches: this.selectedBranches, 
      lab_menu: this.accessList
    }

    return model ;
  }

  override saveApiCall(): any {

    return new Promise((resolve, reject)=>{
      if (this.baseForm.valid) {

        this.inProgress = true;
        const model = this.getModel();
  
        this.subsink.sink = this.endPoint.postStaff(model).subscribe((Response: any) => {
  
          this.alertService.showSuccess("Staff Added", model.name);
  
          const permissions = {
            is_access: true,
            lab_staff: Response.id,
            lab_menu: this.accessList
          }
  
          this.subsink.sink = this.endPoint.postStaffPermissions(permissions).subscribe((res: any) => {
            this.alertService.showSuccess("Permissions Assigned");
            this.accessList = [];
          }, (error) => {
            this.alertService.showError(error);
          });
  
          const user_permissions = {
            is_access: true,
            lab_staff: Response.id,
            permissions: this.permissions,
            number: this.permission_discount
          }
  
          this.subsink.sink = this.endPoint.postStaffUSerPermission(user_permissions).subscribe((res: any) => {
            this.alertService.showSuccess("User Permissions Assigned");
            this.permissions = [];
            this.permission_discount = 0;
            

          }, (error) => {
            
            this.showAPIError(error);
          })
  
          if(this.baseForm.get('can_login')?.value){
            // this.toggleAccess(Response, true);

            const model ={
              client: this.cookieSrvc.getCookieData().client_id,
              lab_staff : Response.id
            }
        
            this.subsink.sink = this.endPoint.toggleAccess(model).subscribe((res:any)=>{
              res['user_tenant.isactive'] ?  this.alertService.showSuccess("Login Active", Response.name ) : this.alertService.showInfo("Login Inactive", Response.name);
              this.resetBaseForm();

              resolve({});
            },(error)=>{
              
              resolve({});
              this.showAPIError(error);
              this.resetBaseForm();
            })


          }else{

            resolve({});
            this.resetBaseForm();
          }
  
  
        }, (error) => {
          this.inProgress = false;
  
          if (error.error && error.error.mobile_number[0].includes('exists')) {
            this.alertService.showError("Staff with this mobile number already exists", "")
          } else {
            this.alertService.showError(error.statusText)
          }
        })
  
      } else {
        this.submitted = true;
        this.showBaseFormErrors();
      }
    })

  }

  toggleAccess(staff:any, e: any){

    const model ={
      client: this.cookieSrvc.getCookieData().client_id,
      lab_staff : staff.id
    }

    this.subsink.sink = this.endPoint.toggleAccess(model).subscribe((res:any)=>{
      res['user_tenant.isactive'] ?  this.alertService.showSuccess("Login Active", staff.name ) : this.alertService.showInfo("Login Inactive", staff.name);
      this.resetBaseForm();
    },(error)=>{
      this.showAPIError(error);
      this.resetBaseForm();
    })

  }

  resetBaseForm(){
    this.baseForm.reset();
    this.initializeForm();
    this.inProgress = false;
  }

  changeRole() {
    if (this.baseForm.get('role')?.value?.name.toLowerCase().replace(" ", "").includes("superadmin")) {
      this.accessList = this.super_menus;
      this.baseForm.get('can_login')?.setValue(true);

    } else {
      this.accessList = [];
      this.baseForm.get('can_login')?.setValue(false);
    }
  }

  is_super_admin() {
    return this.baseForm.get('role')?.value?.name.toLowerCase().replace(" ", "").includes("superadmin");
  }


  imageFile!: string | null;
  maxWidth = 500; // Set your maximum width
  maxHeight = 500; // Set your maximum height
  profilePicture: string | null = ''

  onFileChanged(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileSrvc.convertToBase64(file).then((base64String: string) => {
        const img = new Image();
        img.src = base64String;
        img.onload = () => {
          if (img.width > this.maxWidth || img.height > this.maxHeight) {
            event.target.value = '';
            this.alertService.showError('Selected image exceeds maximum dimensions', "")
          } else {
            this.imageFile = base64String;
            this.baseForm.get('signature')?.setValue(base64String);
          }
        };
      });
    }
  }

  ProfileChanged(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileSrvc.convertToBase64(file).then((base64String: string) => {
        const img = new Image();
        img.src = base64String;
        img.onload = () => {
          if (img.width > 5000 || img.height > 5000) {
            event.target.value = '';
            this.alertService.showError('Selected image exceeds maximum dimensions', "")
          } else {
            this.profilePicture = base64String;
            this.baseForm.get('profile_pic')?.setValue(base64String);
          }
        };
      });
    }
  }

  clearLogo(bool: boolean) {
    if (bool) {
      this.imageFile = null;
      this.baseForm.get('signature')?.setValue(null)
    } else {
      this.profilePicture = null
      this.baseForm.get('profile_pic')?.setValue(null)
    }

  }

  picture: any = ""

  openXl(content: any, title: string, pic: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.picture = pic
    this.modalService.open(content, { size: "xl", centered: cntrd, backdropClass: backDrop });
  }

  changesMadeForAccess: boolean = false;
  permissions: any = [];
  permission_discount = 0;

  getDiscountSetting() {
    this.subsink.sink = this.masterEndpoint.getBusinessDiscountSetting().subscribe((data: any) => {
      if (data.length !== 0) {
        this.permission_discount = data[0].number
      }
    })
  }

  addRemoveCheckUserPermissions(e: any, id: any) {
    this.changesMadeForAccess = true;
    if (e) {
      this.permissions.push(id);
      if (id == 5) {
        this.getDiscountSetting();
      } if (id == 9 && !this.permissions.includes(8)) {
        this.permissions.push(8);
      } if (id == 3 && !this.permissions.includes(2)) {
        this.permissions.push(2);
      } if (id == 2 && this.permissions.includes(3)) {
        this.permissions = this.permissions.filter((item: any) => item !== 3);
      } if (id == 8 && this.permissions.includes(9)) {
        this.permissions = this.permissions.filter((item: any) => item !== 9);
      } if (id == 16 && !this.permissions.includes(13)) {
        this.permissions.push(13);
      }
      if (id == 17 && !this.permissions.includes(15)) {
        this.permissions.push(15);
      }

    } else {
      this.permissions = this.permissions.filter((item: any) => item !== id);
      if (id == 2 && this.permissions.includes(3)) {
        this.permissions = this.permissions.filter((item: any) => item !== 3);
      } if (id == 8 && this.permissions.includes(9)) {
        this.permissions = this.permissions.filter((item: any) => item !== 9);
      } if (id == 13 && this.permissions.includes(16)) {
        this.permissions = this.permissions.filter((item: any) => item !== 16);
      } if (id == 15 && this.permissions.includes(17)) {
        this.permissions = this.permissions.filter((item: any) => item !== 17);
      }

    }
  }


  enterDiscount(e: any) {
    e.target.value = e.target.value.replace(/[^\d.]/g, '');
    const input_number = e.target.value.replace(/[^\d.]/g, '')
    if (input_number > 100) {
      e.target.value = 100;
      this.permission_discount = 100;
    } else if (input_number < 0) {
      e.target.value = 0;
      this.permission_discount = 0;
    } else {
      this.permission_discount = e.target.value;
    }
  }


  checkAllUserPermissions(e: any) {
    if (e) {
      this.permissions = [];
      this.getDiscountSetting();
      this.patients_page_permissions.forEach((p: any) => {
        this.permissions.push(p.id);
      })
    } else {
      this.permission_discount = 0;
      this.permissions = [];
    }
  }

  checkedAll() {
    function arraysAreEqual(arr1: number[], arr2: number[]): boolean {
      // Convert arrays to sets to handle unordered and duplicate values
      const set1 = new Set(arr1);
      const set2 = new Set(arr2);

      // Check if sets are equal
      if (set1.size !== set2.size) {
        return false;
      }

      for (const item of set1) {
        if (!set2.has(item)) {
          return false;
        }
      }

      return true;
    }

    let ptn_prms: any = []
    this.patients_page_permissions.forEach((p: any) => {
      ptn_prms.push(p.id);
    });

    const selected = this.permissions.filter((p: any) => p != 12 && p != 13 && p != 14 && p != 15);

    return arraysAreEqual(ptn_prms, selected)
  }

  toggleLogin_access(type: any, value: any) {
    this.baseForm.get(type)?.setValue(value);
  }


  selectedBranches: any = [] ;

  addOrRemoveBranches(val: any, id: any){
    if(val){
      if(!this.selectedBranches.includes(id)){
        this.selectedBranches.push(id) ;
      }
    }else{
      this.selectedBranches = this.selectedBranches.filter((branch: any) => branch != id );
    }
  }

  selectAllBranches(val: any){
    this.selectedBranches = [] ;

    if(val){
      this.organization.addresses.forEach((org: any)=>{
        this.selectedBranches.push(org.id)
      })
    }

  }

  is_branched(id: any){
    return this.selectedBranches.includes(id);
  }

}