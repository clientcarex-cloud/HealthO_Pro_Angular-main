import { Component, Injector, } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Staff } from 'src/app/staff/model/staff.model';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})

export class EditProfileComponent extends BaseComponent<Staff> {

  constructor(
    private formBuilder: UntypedFormBuilder,
    private endPoint: StaffEndpoint,
    injector: Injector,
    private route: ActivatedRoute,
    private router: Router,
    public capitalSrvc: CaptilizeService,
    private cookieSrvc: CookieStorageService,
    private proEndpoint: ProEndpoint,
  ) { super(injector) }

  inProgress: boolean = false;
  pageNum!: number | null;
  genders!: any;
  departments: any = [];
  s_Id!: any;
  roles: any = [];
  menusList: any = [];
  labAccessForm!: UntypedFormGroup;
  accessList: any = [];
  accessId!: number;
  employmentTypes!: any;
  staff!: any;
  branches!: any;
  shifts!: any;
  titles: any;

  override ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.s_Id = +params['s_id']
      const data = this.cookieSrvc.getCookieData();
      const id = data.lab_staff_id;

      if (this.s_Id.toString() !== id.toString()) {
        this.router.navigate([''])
      } else {
        this.initializeForm();
        this.route.queryParams.subscribe(params => {
          this.s_Id = +params['s_id']
          if (this.s_Id) {
            this.loadStaff();
          }
        })
        this.pageNum = null;
      }
    }
    )
  }

  loadStaff() {
    this.subsink.sink = this.endPoint.getSingleStaff(this.s_Id).subscribe((data: any) => {
      this.staff = data;
      this.updateInitializeForm(data);

      this.endPoint.getStaffMenuAccess(this.s_Id).subscribe((data: any) => {
        this.accessList = data.results[0]?.lab_menu || []
        this.accessId = data.results[0]?.id;
      })
    })
  }

  initializeForm() {

    this.baseForm = this.formBuilder.group({
      title: [1],
      name: ["", Validators.required],
      mobile_number: ["", Validators.required],
      email: [""],
      is_active: [false],
      date_of_birth: [null],
      CUser: [null],
      gender: [null],
      role: [null],
      department: [null],
      shift: [null],
      branch: [null],
      employement_type: [""],
      signature: [null],
      profile_pic: [null]
    })
  }

  updateInitializeForm(data: any): void {
    this.baseForm.patchValue({
      title: data.title ? data.title : 1,
      name: data.name ? data.name : "",
      mobile_number: data.mobile_number ? data.mobile_number : "",
      email: data.email ? data.email : "",
      is_active: data.is_active !== undefined ? data.is_active : false,
      date_of_birth: data.date_of_birth ? data.date_of_birth : "",
      CUser: data.CUser !== undefined ? data.CUser : null,
      employment_type: data.employment_type ? data.employment_type : null,
      gender: data.gender !== undefined ? data.gender : 1,
      branch: data.branch ? data.branch : null,
      signature : data.signature || null,
      profile_pic: data.profile_pic || null
    });

    this.setValues()
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


  setValues() {
    this.subsink.sink = this.proEndpoint.getStaffGender().subscribe((data: any) => {
      this.genders = data.results;
      if (this.staff && this.staff.gender) {
        this.baseForm.get('gender')?.setValue(this.genders.find((gender: any) => gender.id === this.staff.gender).id)

        const e = this.staff.gender;
        if (e === 2 || e === "2") {
          this.baseForm.get('title')?.setValue(2);
        } else if (e === 1 || e === "1") {
          this.baseForm.get('title')?.setValue(1);
        }
      }
    })

    this.subsink.sink = this.proEndpoint.getTitle().subscribe((data: any) => {
      this.titles = data
    })

    this.subsink.sink = this.endPoint.getDepartments().subscribe((data: any) => {
      const activeDepartments = data.filter((d: any) => d.is_active);
      this.departments = activeDepartments;
      if (this.staff && this.staff.department) {
        //temp line below 
        // this.baseForm.get('department')?.setValue(data.find((dept: any) => dept.id === this.staff.department));

        this.baseForm.get('department')?.setValue(data.find((dept: any) => dept.id === this.staff.department.id));
      }
    });

    this.subsink.sink = this.proEndpoint.getMenus().subscribe((data: any) => {
      this.menusList = data.results
    })

    this.endPoint.getStaffRoles().subscribe((data: any) => {
      this.roles = data;
      if (this.staff && this.staff?.role) {
        //temp line below 
        //  this.baseForm.get('role')?.setValue(this.roles.find((role:any)=> role.id===this.staff.role))

        this.baseForm.get('role')?.setValue(this.roles.find((role: any) => role.id === this.staff.role.id))
      }
    })

    this.proEndpoint.getEmploymentTypes().subscribe((data: any) => {
      this.employmentTypes = data
      if (this.staff && this.staff.employement_type) {
        //temp line below 
        // this.baseForm.get('employement_type')?.setValue(this.employmentTypes.find((emp:any)=> emp.id === this.staff.employement_type))

        this.baseForm.get('employement_type')?.setValue(this.employmentTypes.find((emp: any) => emp.id === this.staff.employement_type.id))
      }

    })

    this.endPoint.getBranches().subscribe((data: any) => {
      this.branches = data.filter((branch: any) => branch.is_active);
      if (this.staff && this.staff.branch) {
        //temp line below 
        //  this.baseForm.get('branch')?.setValue(this.branches.find((branch: any) => branch.id === this.staff.branch));

        this.baseForm.get('branch')?.setValue(this.branches.find((branch: any) => branch.id === this.staff.branch.id));
      }
    });


    this.endPoint.getShits().subscribe((data: any) => {
      this.shifts = data;
      if (this.staff && this.staff.shift) {
        this.baseForm.get('shift')?.setValue(this.shifts.find((shift: any) => shift.id === this.staff.shift))
      }
    })
  }

  getRole(id: any) {
    return this.roles.find((role: any) => role.id === id)
  }


  initializeMenuForm() {
    this.labAccessForm = this.formBuilder.group({
      is_access: true,

      lab_staff: [""],
      lab_menu: [[]]
    })
  }

  calculateDaysBack(dateString: string): string {
    const currentDate = new Date();
    const inputDate = new Date(dateString);

    // Calculate the difference in milliseconds
    const differenceMs = currentDate.getTime() - inputDate.getTime();

    // Calculate the difference in days
    const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

    // Return the result based on the difference
    if (differenceDays === 0) {
      return 'Today';
    } else if (differenceDays === 1) {
      return 'Yesterday';
    } else if (differenceDays <= 7) {
      return `${differenceDays} days ago`;
    } else if (differenceDays <= 30) {
      const weeksAgo = Math.floor(differenceDays / 7);
      return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
    } else if (differenceDays <= 90) {
      return 'One month ago';
    } else if (differenceDays <= 365) {
      const monthsAgo = Math.floor(differenceDays / 30);
      return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
    } else {
      const yearsAgo = Math.floor(differenceDays / 365);
      return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
    }
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

  getUserID() {
    const currentUser = localStorage.getItem('currentUser');
    const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
    const user_id = currentUserObj ? currentUserObj.user_id : null;
    return user_id;
  }

  getModel() {
    const model: any = {
      title: this.baseForm.get('title')?.value || null,
      name: this.baseForm.get('name')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: this.baseForm.get('email')?.value || "",
      is_active: this.baseForm.get('is_active')?.value || true,
      date_of_birth: this.baseForm.get('date_of_birth')?.value || null,
      CUser: this.getUserID(),
      employement_type: this.baseForm.get('employement_type')?.value?.id || null,
      gender: this.baseForm.get('gender')?.value || null,
      role: this.roles.find((role: any) => role.id === this.staff.role.id)?.id || null,
      department: this.baseForm.get('department')?.value?.id || null,
      shift: this.baseForm.get('shift')?.value?.id || null,
      branch: this.baseForm.get('branch')?.value?.id || null,
      signature : this.imageFile || null,
      profile_pic: this.profilePicture || null
    }
    return model;
  }

  override saveApiCall(): void {
    if (this.baseForm.valid) {
      this.inProgress = true;
      const model = this.getModel();
      this.endPoint.updateStaff(this.s_Id, model).subscribe((Response: any) => {

        this.pageNum = null;
        this.alertService.showSuccess("Details Updated", model.name);
        this.inProgress = false;
        // this.loadStaff();
        // location.reload();
        this.router.navigate(["/dashboard"])
      }, (error) => {
        this.inProgress = false;
        this.alertService.showError(error);
      })
    } else {
      this.submitted = true;
    }
  }

















  

  imageFile!: string | null;
  maxWidth = 500; // Set your maximum width
  maxHeight = 500; // Set your maximum height
  
  onFileChanged(event: any): void {
      const file = event.target.files[0];
      if (file) {
          this.convertToBase64(file).then((base64String: string) => {
              // Create an Image object to get image dimensions
              const img = new Image();
              img.src = base64String;
              img.onload = () => {
                  if (img.width > this.maxWidth || img.height > this.maxHeight) {
                      // Reset the input file element
                      event.target.value = '';
                      // Display an error message or handle the oversized image in your preferred way
                      // console.error('Selected image exceeds maximum dimensions');
                      this.alertService.showError('Selected image exceeds maximum dimensions',"")
                  } else {
                      // Assign base64 string to form control
                      this.imageFile = base64String;
                      this.baseForm.get('signature')?.setValue(base64String);
                  }
              };
          });
      }
  }


  profilePicture: string |null  = ''

  ProfileChanged(event: any): void {
    const file = event.target.files[0];
    if (file) {
        this.convertToBase64(file).then((base64String: string) => {
            // Create an Image object to get image dimensions
            const img = new Image();
            img.src = base64String;
            img.onload = () => {
                if (img.width > 5000 || img.height > 5000) {
                    // Reset the input file element
                    event.target.value = '';
                    // Display an error message or handle the oversized image in your preferred way
                    // console.error('Selected image exceeds maximum dimensions');
                    this.alertService.showError('Selected image exceeds maximum dimensions',"")
                } else {
                    // Assign base64 string to form control
                    this.profilePicture = base64String;
                    this.baseForm.get('profile_pic')?.setValue(base64String);
                }
            };
        });
    }
}
  

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  clearLogo(bool: boolean ){
    if(bool){
      this.imageFile = null;
      this.baseForm.get('signature')?.setValue(null)
    }else{
      this.profilePicture = null
      this.baseForm.get('profile_pic')?.setValue(null)
    }

  }



  picture: any = ""

  openXl(content: any, title: string,pic:any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.picture = pic
    this.modalService.open(content, { size: "xl", centered: cntrd, backdropClass: backDrop });
  }

}
