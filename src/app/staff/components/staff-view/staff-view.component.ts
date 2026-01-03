import { Component, Injector, Input, } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { StaffEndpoint } from '../../endpoint/staff.endpoint';
import { Staff } from '../../model/staff.model';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';
import { SharedModule } from '@sharedcommon/shared.module';


@Component({
  selector: 'app-staff-view',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './staff-view.component.html',
  styleUrls: ['./staff-view.component.scss']
})


export class StaffViewComponent extends BaseComponent<Staff> {


  constructor(
    injector: Injector,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,

    public capitalSrvc: CaptilizeService,
    private cookieSrvc: CookieStorageService,
    public timeSrvc: TimeConversionService,
    private printSrvc: PrintService,

    private endPoint: StaffEndpoint,
    private signUpEndpoint: SignUpEndpoint,
    private masterEndpoint: MasterEndpoint,
    private proEndpoint: ProEndpoint,
  ) { super(injector) }

  navigateBack() {
    window.history.back()
  }

  @Input() doctor: any ;

  inProgress: boolean = false;
  // pageNum!: number | null;
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

  patients_page_permissions: any = [
    {
      name: ""
    }
  ];

  user_permissions: any = {
    number: 0,
    permissions: [],
    lab_staff: 0
  };

  super_menus: any = [];
  postStaffPermissions: boolean = false;
  lab_tech_permissions: any;
  radio_permissions: any;

  override ngOnInit(): void {

    this.initializeForm();

    if(!this.doctor){
      this.route.queryParams.subscribe(params => {
        this.s_Id = +params['s_id']
        if (this.s_Id) {
          this.getData();
        }
      })
    }else{
      this.s_Id = this.doctor?.lab_staff ;
      this.getData();
    }


  }


  getData(){
    this.getUserPermissions();
    this.loadStaff();
    this.model = {
      client_id: this.cookieSrvc.getCookieData().client_id,
      lab_staff_id: this.s_Id,
      operation: this.activeButton,
      page_size: 25,
      page_number: 1,
      from_date: '',
      to_date: '',
      date: ''
    }
    this.getActivityLog();
  }

  organization: any ;
  all_branches: any = [] ;
  override ngAfterViewInit(): void {
    this.subsink.sink = this.signUpEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      this.organization = data[0];

      if(this.organization?.addresses && this.organization.addresses?.length > 0){
        this.organization.addresses.forEach((address: any)=> {
          this.all_branches.push(address.id) ;
        })
      }

    })
  }


  getUserPermissions() {

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


      // this.patients_page_permissions = data;
      const grouped: any = transformData(data);
      this.patients_page_permissions = grouped[0].permissions
      this.lab_tech_permissions = grouped[1].permissions;
      this.radio_permissions = grouped[2].permissions

      this.subsink.sink = this.endPoint.getStaffPatientsPermissions(this.s_Id).subscribe((data: any) => {
        if (data.length == 0) {
          this.postStaffPermissions = true;
          this.user_permissions.lab_staff = this.s_Id;
          this.user_permissions = {
            number: 0,
            permissions: [],
            lab_staff: this.s_Id
          }
        } else {
          this.user_permissions = data[0];
        }
      })

    })

  }


  loadStaff() {
    this.subsink.sink = this.endPoint.getSingleStaff(this.s_Id).subscribe((data: any) => {
      this.staff = data;

      this.updateInitializeForm(data);

      this.subsink.sink = this.endPoint.getStaffMenuAccess(this.s_Id).subscribe((data: any) => {
        this.accessList = data.results[0]?.lab_menu || []
        this.accessId = data.results[0]?.id || "";

        data.results[0]?.lab_menu.length == this.menusList.length ? this.selectAll = true : this.selectAll = false
      })

      if(data.branches){
        this.selectedBranches = [] ;
        data.branches.forEach((d:any)=>{
          this.selectedBranches.push(d.id) ;
        })
      }
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
      gender: [1],
      role: [null, Validators.required],
      department: [null],
      shift: [null],
      branch: [null],
      employement_type: [""],
      signature: [null],
      profile_pic: [null],
      can_login: [false]
    })
  }

  updateInitializeForm(data: any): void {
    this.baseForm.patchValue({
      title: [1],
      name: data.name ? data.name : "",
      mobile_number: data.mobile_number ? data.mobile_number : "",
      email: data.email ? data.email : "",
      is_active: data.is_active !== undefined ? data.is_active : false,
      date_of_birth: data.date_of_birth ? data.date_of_birth : "",
      CUser: data.CUser !== undefined ? data.CUser : null,
      employment_type: data.employment_type ? data.employment_type : null,
      gender: data.gender !== undefined ? data.gender : 1,
      branch: data.branch ? data.branch : null,
      signature: data?.signature || null,
      profile_pic: data?.profile_pic || null,
      can_login: data?.is_login_access || false
    });

    this.setValues();
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

  changeRole() {
    this.changesMadeForMenu = true
    if (this.baseForm.get('role')?.value?.name.toLowerCase().replace(" ", "").includes("superadmin")) {
      this.accessList = this.super_menus;
      this.alertService.showInfo("All Menus Access Given.");
      this.baseForm.get('can_login')?.setValue(true);
    } else {
      this.alertService.showInfo("Menus Access Removed.")
      this.accessList = [];
      // this.baseForm.get('can_login')?.setValue(false);
    }
  }

  setValues() {

    this.subsink.sink = this.proEndpoint.getTitle().subscribe((data: any) => {
      this.titles = data
    })

    this.subsink.sink = this.proEndpoint.getStaffGender().subscribe((data: any) => {
      this.genders = data.results;
      if (this.staff && this.staff.gender) {
        this.baseForm.get('gender')?.setValue(this.genders.find((gender: any) => gender.id === this.staff.gender)?.id)

        const e = this.staff.gender;
        if (e === 2 || e === "2") {
          this.baseForm.get('title')?.setValue(2);
        } else if (e === 1 || e === "1") {
          this.baseForm.get('title')?.setValue(1);
        }
      }
    })

    this.subsink.sink = this.endPoint.getDepartments().subscribe((data: any) => {
      const activeDepartments = data.filter((d: any) => d.is_active);
      this.departments = activeDepartments;
      if (this.staff && this.staff.department) {
        this.baseForm.get('department')?.setValue(data.find((dept: any) => dept.id === this.staff.department.id));
      }
    });

    this.subsink.sink = this.proEndpoint.getMenus().subscribe((data: any) => {
      this.menusList = data;
      this.super_menus = [];

      data.forEach((menu: any) => {
        this.super_menus.push(menu.id);
      })
    })

    this.subsink.sink = this.endPoint.getStaffRoles().subscribe((data: any) => {
      this.roles = data;
      if (this.staff && this.staff?.role) {
        this.baseForm.get('role')?.setValue(this.roles.find((role: any) => role.id === this.staff.role.id))
      }
    })

    this.subsink.sink = this.proEndpoint.getEmploymentTypes().subscribe((data: any) => {
      this.employmentTypes = data
      if (this.staff && this.staff.employement_type) {
        this.baseForm.get('employement_type')?.setValue(this.employmentTypes.find((emp: any) => emp.id === this.staff.employement_type.id))
      }

    })

    this.subsink.sink = this.endPoint.getBranches().subscribe((data: any) => {
      this.branches = data.filter((branch: any) => branch.is_active);
      if (this.staff && this.staff.branch) {
        this.baseForm.get('branch')?.setValue(this.branches.find((branch: any) => branch.id === this.staff.branch.id));
      }
    });

    this.subsink.sink = this.endPoint.getShits().subscribe((data: any) => {
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

  formatString(e: any, val: any) {
    this.baseForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e))
  }

  changesMadeForMenu: boolean = false;

  addRemoveCheck(e: any, id: number) {
    this.changesMadeForMenu = true;
    if (e) {
      this.accessList.push(id);
    } else {
      this.accessList = this.accessList.filter((item: any) => item !== id);
      this.selectAll = this.accessList.length === this.menusList.length;
    }
  }

  selectAll: boolean = false;
  checkALLSelected() {
    // Extracting ids from the menusList array
    const object_ids = this.menusList.map((obj: any) => obj.id);

    // Check if each number in the accessList is present in object_ids
    return this.accessList.every((num: any) => object_ids.includes(num));
  }

  selectAllPermissions() {
    this.changesMadeForMenu = true;
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


  getModel() {
    const model: any = {
      name: this.baseForm.get('name')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: this.baseForm.get('email')?.value || "",
      is_active: this.baseForm.get('is_active')?.value || true,
      date_of_birth: this.baseForm.get('date_of_birth')?.value || null,
      id: this.s_Id,
      employement_type: this.baseForm.get('employement_type')?.value?.id || null,
      gender: parseInt(this.baseForm.get('gender')?.value) || null,
      role: this.baseForm.get('role')?.value?.id || null,
      department: this.baseForm.get('department')?.value?.id || null,
      shift: this.baseForm.get('shift')?.value?.id || null,
      branch: this.baseForm.get('branch')?.value?.id || null,
      signature: this.baseForm.get('signature')?.value || null,
      profile_pic: this.baseForm.get('profile_pic')?.value || null,
      is_superadmin: this.baseForm.get('role')?.value?.name.toLowerCase().replace(" ", "").includes("superadmin"),

      branches: this.is_superadmin() ? this.all_branches : this.selectedBranches 
    }
    return model;
  }


  async saveDoctor(doctor: any){
    try{
    this.baseForm.get('name')?.setValue(doctor?.name);
    this.baseForm.get('mobile_number')?.setValue(doctor?.mobile_number);

    await this.saveApiCall() ;
    }catch(error){ }
  }


  saveStaff(){
    if(this.baseForm.valid){
      this.saveApiCall();
    }else{
      this.showBaseFormErrors();
    }
  }

  override async saveApiCall() {
    return new Promise((resolve, reject)=>{
      this.inProgress = true;
      const model = this.getModel();
      this.subsink.sink = this.endPoint.updateStaff(this.s_Id, model).subscribe((Response: any) => {
  
        this.alertService.showSuccess("Updated", model.name);
  
        if (this.changesMadeForMenu) {
          const permissions = {
            id: this.accessId,
            is_access: true,
            lab_staff: Response.id,
            lab_menu: this.accessList
          }
          this.subsink.sink = this.endPoint.updateStaffPermissions(this.accessId, permissions).subscribe((res: any) => {
            this.alertService.showSuccess("Permissions Assigned");
            this.baseForm.reset();
            this.initializeForm();
            this.loadStaff();
          }, (error) => {
            this.subsink.sink = this.endPoint.postStaffPermissions(permissions).subscribe((res: any) => {
              this.alertService.showSuccess("Permissions Assigned");
              this.baseForm.reset();
            }, (error) => {
  
              this.alertService.showError(error);
            })
          })
        }
  
        if (this.changesMadeForAccess) {
          if (this.postStaffPermissions) {
            this.endPoint.postStaffUSerPermission(this.user_permissions).subscribe((data: any) => {
              this.alertService.showSuccess("Staff User Permissions Updated Successfully");
              this.postStaffPermissions = false
              this.getUserPermissions();
            }, (error) => {
              this.alertService.showError("Update Failed")
            })
          } else {
            this.endPoint.updateStaffUserPermissionForAccess(this.user_permissions, this.user_permissions.id).subscribe((data: any) => {
              this.alertService.showSuccess("Staff User Permissions Updated Successfully")
            }, (error) => {
              this.alertService.showError("Update Failed")
            })
          }
  
        }
  
        if(this.staff.is_login_access != this.baseForm.get('can_login')?.value){
          this.toggleAccess(this.staff, this.baseForm.get('can_login')?.value);
        }else{
          this.inProgress = false;
          this.loadStaff();
        }
  
      }, (error) => {
        this.inProgress = false;
  
        if (error.error && error.error.mobile_number[0].includes('exists')) {
          this.alertService.showError("Staff with this mobile number already exists", "")
        } else {
          this.showAPIError(error);
        }
      })
    })
  }

  toggleAccess(staff:any, e: any){

    const model ={
      client: this.cookieSrvc.getCookieData().client_id,
      lab_staff : staff.id
    }

    this.subsink.sink = this.endPoint.toggleAccess(model).subscribe((res:any)=>{
      res['user_tenant.isactive'] ?  this.alertService.showSuccess("Login Active", staff.name ) : this.alertService.showInfo("Login Inactive", staff.name);
      this.inProgress = false;
    },(error)=>{
      this.inProgress = false;
      this.alertService.showError(error?.error?.error || error?.error?.Error || error);
    })

  }





  // imageFile!: string | null;
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
            this.alertService.showError('Selected image exceeds maximum dimensions', "")
          } else {
            // Assign base64 string to form control
            // this.imageFile = base64String;
            this.baseForm.get('signature')?.setValue(base64String);
          }
        };
      });
    }
  }


  // profilePicture: string | null = ''

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
            this.alertService.showError('Selected image exceeds maximum dimensions', "")
          } else {
            // Assign base64 string to form control
            // this.profilePicture = base64String;
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

  clearLogo(bool: boolean) {
    if (bool) {
      // this.imageFile = null;
      this.baseForm.get('signature')?.setValue(null)
    } else {
      // this.profilePicture = null
      this.baseForm.get('profile_pic')?.setValue(null)
    }

  }



  picture: any = "";
  title: any = "";

  openXl(content: any, pic: any, title: any) {
    this.picture = pic ;
    this.title = title;
    this.modalService.open(content, { size: "xl", centered: true });
  }


  fieldTextType: boolean = true

  /**
 * Password Hide/Show
 */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }



  activeButton: any = 'POST';
  logs: any;
  model: any;


  changePageSize(e: any) {
    this.model.page_size = e.target.value;
    this.getActivityLog();
  }

  changePageNumber(e: any) {
    if (e) {
      this.model.page_number = this.model.page_number
    } else {

    }
  }



  formatPath(path: string): string {
    const words = path.split('/').filter(word => word !== ''); // Split by "/" and remove empty strings
    const capitalizedWords = words.map(word => word.replace(/_/g, ' ').replace(/\b\w/g, firstLetter => firstLetter.toUpperCase())); // Capitalize each word
    return capitalizedWords.join(' '); // Join words with space
  }

  changeActivitySettings(id: any) {
    this.activeButton = id;
    this.model.operation = id;
    this.getActivityLog()
  }

  getRangeValue(e: any) {
    if (e.length !== 0) {
      if (e.includes("to")) {
        this.separateDates(e);
      } else {
        this.model.date = e;
        this.model.from_date = "";
        this.model.to_date = "";
        this.model.page_number = 1;
        this.getActivityLog();
      }
    }
    else {
      this.model.date = this.timeSrvc.getTodaysDate();
      this.model.from_date = "";
      this.model.to_date = "";
      this.model.page_number = 1;
      this.getActivityLog();
    }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.model.from_date = startDate;
    this.model.to_date = endDate;
    this.model.date = "";
    this.model.page_number = 1;
    this.getActivityLog();

  }

  getActivityLog() {
    this.logs = [];
    this.subsink.sink = this.endPoint.getActivityLogs(this.model).subscribe((data: any) => {
      this.logs = data.results;
    });
  }

  parseJSONObj(e: any) {
    try {
      return JSON.parse(e);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return {}; // or any default value that fits your scenario
    }
  }

  transformFieldName(fieldName: string): string {
    return fieldName.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  extractLastWord(input: string): string {
    // Split the input string by '/'
    const parts = input.split('/');

    // Get the last part after the last '/'
    const lastPart = parts[parts.length - 1];

    // Return the last part
    return this.transformFieldName(lastPart);
  }

  extractKeywords(activityString: any) {
    const keywords = activityString.toLowerCase().match(/\b(?:refunded|authorized|cancelled tests|created labdoctors|registered|sample collected|tests cancelled|package cancelled|created|booked|receipt|generated|cancelled)\b/g);
    if (keywords) {
      const inputString = this.capitalSrvc.capitalizeReturn(keywords.join(', '))
      const words = inputString.split(',').map(word => word.trim());

      // Filter out duplicate words
      const uniqueWords = words.filter((word, index) => words.indexOf(word) === index);
      return uniqueWords.join(', ');
    } else {
      return 'No keywords found';
    }
  }

  removeTimeZone(activity: string): string {
    // Define a regular expression pattern to match the time zone information
    const pattern = /\sin\s\d+(\.\d+)?\sseconds|\sin\s\d+(\.\d+)?\sseconds\)/;

    // Use replace() method with the pattern to remove the matched substring
    return activity.replace(pattern, '');
  }


  showPatient(details: any) {
    this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: details } });
  }

  // Helper method to get the keys of an object
  objectKeys(obj: any) {
    return Object.keys(obj);
  }

  // Helper method to format the keys for display
  formatKey(key: string): string {
    // Replace underscores with spaces and capitalize words
    return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  getPageValue(key: any) {
    return this.patients_page_permissions[key]
  }

  // Helper method to check if the value is a boolean
  isBoolean(value: any): boolean {
    return typeof value === 'boolean';
  }

  getDiscountSetting() {
    this.subsink.sink = this.masterEndpoint.getBusinessDiscountSetting().subscribe((data: any) => {
      if (data.length !== 0) {
        this.user_permissions.number = data[0].number
      }
    })
  }


  changesMadeForAccess: boolean = false;

  addRemoveCheckUserPermissions(e: any, id: any) {
    this.changesMadeForAccess = true;
    if (e) {
      this.user_permissions.permissions.push(id);
      if (id == 9 && !this.user_permissions.permissions.includes(8)) {
        this.user_permissions.permissions.push(8);
      } if (id == 3 && !this.user_permissions.permissions.includes(2)) {
        this.user_permissions.permissions.push(2);
      } if (id == 5) {
        this.getDiscountSetting();
      } if (id == 16 && !this.user_permissions.permissions.includes(13)) {
        this.user_permissions.permissions.push(13);
      } if (id == 17 && !this.user_permissions.permissions.includes(15)) {
        this.user_permissions.permissions.push(15);
      }
    } else {
      this.user_permissions.permissions = this.user_permissions.permissions.filter((item: any) => item !== id);
      if (id == 2 && this.user_permissions.permissions.includes(3)) {
        this.user_permissions.permissions = this.user_permissions.permissions.filter((item: any) => item !== 3);
      } if (id == 8 && this.user_permissions.permissions.includes(9)) {
        this.user_permissions.permissions = this.user_permissions.permissions.filter((item: any) => item !== 9);
      } if (id == 13 && this.user_permissions.permissions.includes(16)) {
        this.user_permissions.permissions = this.user_permissions.permissions.filter((item: any) => item !== 16);
      } if (id == 15 && this.user_permissions.permissions.includes(17)) {
        this.user_permissions.permissions = this.user_permissions.permissions.filter((item: any) => item !== 17);
      }
    }
  }

  enterDiscount(e: any) {
    this.changesMadeForAccess = true;
    e.target.value = e.target.value.replace(/[^\d.]/g, '');
    const input_number = e.target.value.replace(/[^\d.]/g, '')
    if (input_number > 100) {
      e.target.value = 100;
      this.user_permissions.number = 100;
    } else if (input_number < 0) {
      e.target.value = 0;
      this.user_permissions.number = 0;
    } else {
      this.user_permissions.number = e.target.value;
    }
  }

  checkAllUserPermissions(e: any) {
    this.changesMadeForAccess = true;
    if (e) {
      this.user_permissions.permissions = [];
      this.getDiscountSetting();
      this.patients_page_permissions.forEach((p: any) => {
        this.user_permissions.permissions.push(p.id);
      })
    } else {
      this.user_permissions.permissions = [];
    }
  }

  is_superadmin() {
    return this.baseForm?.get('role')?.value?.name.toLowerCase().replace(' ', '').includes('superadmin') || false
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

    const selected = this.user_permissions.permissions.filter((p: any) => p != 12 && p != 13 && p != 14 && p != 15);

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

  isHtml(inputString: any) {
    const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
    return htmlTagPattern.test(inputString);
  }

  selectedHtml: any = "" ;
  insertPdf(modal: any, htmlContent: any) {
    this.openModal(modal, { size: "xl", centered: true})

    const settings = {
      header_height: "100",
      footer_height: "100",
      margin_left: "45.0",
      margin_right: "45.0",
      display_letterhead: false
    }

    this.selectedHtml = htmlContent ;
    let content = this.printSrvc.setMiniView(htmlContent, '', settings, '');
    const iframe = document.getElementById('disbaled_iframe') as any;
    iframe!.contentDocument.open();
    iframe!.contentDocument.write(content);
    iframe!.contentDocument.close();
  }

  copyText(){
    async function writeClipboardText(text: any) {
      try {
        await navigator.clipboard.writeText(text);
        
      } catch (error: any) {
        console.error(error.message);
      }
    }

    writeClipboardText(this.selectedHtml || '');
    this.alertService.showSuccess("Text Copied");
  }

}
