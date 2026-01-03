import { Component, OnInit, Injector, ViewChild, input } from '@angular/core'
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component'
import { LabPackageEndpoint } from '../../endpoint/labpackage.endpoint'
import { LabPackage } from '../../models/labpackage.model'
import { GlobalTest } from '../../models/globaltest.model'
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-labpackages',
  templateUrl: './labpackages.component.html',
  styleUrls: ['./labpackages.component.scss']
})
export class LabpackagesComponent extends BaseComponent<LabPackage> {

  @ViewChild('auto_complete_view') auto_complete_view: any;

  LabPackages!: LabPackage[]
  tests: any = []
  selectedTests: any = []
  addPackages: any = [];
  offerPrice!: number
  descript!: string
  pageNum!: number | null;

  constructor(
    injector: Injector,
    private endPoint: LabPackageEndpoint,
    private formBuilder: UntypedFormBuilder,
    public timeSrvc: TimeConversionService,
    private cookiesrvc: CookieStorageService
  ) {
    super(injector)
  }

  selectBoxForm!: UntypedFormGroup;
  all_test: any;

  override ngOnInit(): void {
    this.pageNum = null;
    this.initilizeForm();

    this.selectBoxForm = this.formBuilder.group({
      selectGlobalTest: [null]
    })

    this.page_size = 10;
    this.page_number = 1;
    this.count = 1;
    this.all_count = 1;
    this.query = "";
    this.patients = []

    this.getData()
  }


  descriptionChange(e: any) {
    this.selectPackage.description = e
  }

  initilizeForm() {
    this.baseForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      offer_price: ['', Validators.required],
      total_amount: ['', Validators.required],
      total_discount: ['', Validators.required],
      is_disc_percentage: [false],
      is_active: [true],
      lab_tests: [[]] // Assuming it's an array of IDs
    });
  }

  concatenateShortCodes(data: any) {
    return data.map((item: any) => item?.name).join(', ');
  }


  offerChange(e: any) {
    this.selectPackage.offer_price = e;
  }

  CapitalizeDescIncome(controlName: string) {
    const control = this.baseForm.get(controlName);
    if (control?.value) {
      const words = control.value.split(' ');
      const capitalizedWords = words.map((word: any) => word.charAt(0).toUpperCase() + word.slice(1));
      control.setValue(capitalizedWords.join(' '));
    }
  }

  onItemSelected(item: any): void {
    // Check if the item's ID already exists in selectedTests
    if (!this.selectedTests.some((test: any) => test.id === item.id)) {
      const tempTest = {
        id: item.id,
        name: item.name,
        status: 'Processing',
        cost: item.price,
        discount: '0',
        discountAmount: '0.00',
        total: item.price
      };
      this.selectedTests.push(tempTest);
      if (!this.selectPackage?.lab_tests?.includes(item.id)) {
        this.selectPackage?.lab_tests?.push(item.id);
      }

    } else {
      this.alertService.showInfo(item.name, "Already Added")
    }
    // this.auto_complete_view.clear();
    this.selectBoxForm.get('selectGlobalTest')?.setValue(null);
  }


  deleteAddTest(index: number) {
    this.addPackages.splice(index, 1)
    this.baseForm.value.lab_tests.splice(index, 1)
  }


  selectPackage!: any;
  packageSelected(item: any) {
    this.selectPackage = item;
    this.selectedTests = [];
    item.lab_tests.forEach((test: any) => {
      this.onItemSelected(test)
    })

  }

  deleteViewTest(index: number, id: any = null) {
    this.selectedTests.splice(index, 1);
    if (id) {
      this.selectPackage.lab_tests = this.selectPackage?.lab_tests?.filter((num: any) => num !== id)
    }

  }

  @ViewChild('auto_complete') auto_complete: any;

  onAddPackageSelected(item: any): void {
    // Check if the ID is already present in the lab_tests array
    const isAlreadyAdded = this.baseForm.value?.lab_tests?.includes(item.id) || false ;
    // If the ID is not already present, add the package
    if (!isAlreadyAdded) {
      const tempTest = {
        id: item.id,
        name: item.name,
        status: 'Processing',
        cost: item.price,
        discount: '0',
        discountAmount: '0.00',
        total: item.price,
        sourcing_lab: item?.sourcing_lab || null
      };

      if(this.baseForm.value.lab_tests){
        this.baseForm.value.lab_tests.push(item.id); // Add ID to lab_tests array
        this.addPackages.push(tempTest); // Add package to addPackages array
      }else{
        this.baseForm.get('lab_tests')?.setValue([]);
        this.baseForm.value.lab_tests.push(item.id); // Add ID to lab_tests array
        this.addPackages.push(tempTest); // Add package to addPackages array
      }

    } else {
      // Handle the case when the ID is already present (optional)

      this.alertService.showInfo(`${item.name}`, "Already added")
    }
  }

  selectFirstOption() {
    if (this.auto_complete || this.auto_complete_view) {
      // this.onItemSelected(this.searchData[0])
      this.onAddPackageSelected(this.searchData[0])
    }
  }

  selectFirstOptionView() {
    if (this.auto_complete || this.auto_complete_view) {
      // this.onItemSelected(this.searchData[0])
      this.onItemSelected(this.searchData[0])
    }
  }

  timer: any;
  searchData: any;
  testTerm: any = ""
  searchLoading = false;
  getSearches(searchTerm: string): void {
    if (searchTerm !== "") {
      this.testTerm = searchTerm;
      this.searchLoading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.endPoint.getTestsSearchResults(searchTerm).subscribe((data: any) => {

          this.searchData = [
            ...data.filter((labTest: any) => labTest.is_active)
          ];
          this.searchLoading = false;

        });
      }, 500);
    } else {
      this.testTerm = null;
      this.searchData = [];
      this.searchLoading = false;
    }
  }

  findLabTestById(
    id: number,
    labTests: GlobalTest[] = this.tests
  ): GlobalTest | undefined {
    return labTests.find(test => test.id === id)
  }

  getTotalAmount(): string {
    let totalAmount = 0
    for (const test of this.selectedTests) {
      totalAmount += parseFloat(test.cost)
    }
    return totalAmount.toFixed(2) // Assuming you want to display the amount with two decimal places
  }

  get_AddTotalAmount(): string {
    let totalAmount = 0
    for (const test of this.addPackages) {
      totalAmount += parseFloat(test.cost)
    }
    return totalAmount.toFixed(2) // Assuming you want to display the amount with two decimal places
  }

  modelShow = false;
  openXl(content: any) {
    this.modelShow = true;
    this.baseForm.reset();
    this.addPackages = [];
    
    this.modalService.open(content, { size: 'xl', centered: false, scrollable: true });
  }

  modelHeader: string = ""

  updatePckgs(content: any, item: any, openModal = false) {
    this.modelShow = true;
    this.modelHeader = item.name;
    this.selectPackage = item;
    this.selectedTests = [];
    !openModal ? this.updateForm(item, content) : this.updateForm(item, content, false);
    // this.updateForm(item, content)
  }

  updateForm(item: any, content: any, openModal: boolean = true) {

    this.resetForm();

    item.lab_tests.forEach((test: any) => {
      this.onAddPackageSelected(test)
    })
    this.baseForm.get('name')?.setValue(item?.name);
    this.baseForm.get('description')?.setValue(item?.description);
    this.baseForm.get('offer_price')?.setValue(item?.offer_price);
    this.baseForm.get('total_discount')?.setValue(item?.total_discount);
    this.baseForm.get('is_disc_percentage')?.setValue(item?.is_disc_percentage);
    if (openModal) {
      this.modalService.open(content, { size: 'xl', centered: false, scrollable: true });
    } else {
      this.selectPackage.is_active = !this.selectPackage.is_active;
      this.saveUpdateModel();
    }


  }

  resetForm() {
    this.baseForm.reset();
    this.initilizeForm();
    this.addPackages = [];
  }


  private getModel(): LabPackage {
    const model: any = {
      name: this.baseForm.value?.name,
      description: this.baseForm.value?.description || null,
      offer_price: parseInt(this.baseForm.value?.offer_price),
      total_amount: parseFloat(this.get_AddTotalAmount()),
      total_discount: parseInt(this.baseForm.value?.total_discount),
      is_disc_percentage: this.baseForm.value?.is_disc_percentage || false,
      created_by: parseInt(this.cookiesrvc.getCookieData().lab_staff_id),
      lab_tests: this.baseForm.get('lab_tests')?.value,
    };
    return model;
  }

  override saveApiCall(): any {

    this.baseForm.get('total_amount')?.setValue(this.getPrice());

    if (this.baseForm.valid && this.baseForm.get('lab_tests')?.value.length !== 0) {
      const model: LabPackage = this.getModel();
      this.subsink.sink = this.endPoint.addLabPackage(model).subscribe((response) => {
        this.resetForm();
        this.alertService.showSuccess("Package Added", model.name);
        this.modalService.dismissAll();
        this.getData();
      }, (error) => {

        if (error.error.name[0].includes("exists")) {
          this.alertService.showError("Package with this Name already exists");
        } else {
          this.alertService.showError("oh-oh", error);
        }

      })
    } else {
      this.submitted = true;
      this.baseForm.get('lab_tests')?.value.length === 0 ? this.alertService.showError("Include some tests") : ""


      // Iterate over form controls to check validity
      Object.keys(this.baseForm.controls).forEach(controlName => {
        const control = this.baseForm.get(controlName);
        if (control instanceof FormControl && !control.valid) {
          this.alertService.showError(`Field ${controlName} requires validation`);
        }
      });

    }

  }



  private getUpdateModel(): LabPackage {
    const model: any = {
      name: this.baseForm.value?.name,
      description: this.baseForm.value?.description || null,
      offer_price: parseInt(this.baseForm.value?.offer_price),
      total_amount: parseFloat(this.get_AddTotalAmount()),
      total_discount: parseInt(this.baseForm.value?.total_discount),
      is_disc_percentage: this.baseForm.value?.is_disc_percentage || false,
      created_by: parseInt(this.cookiesrvc.getCookieData().lab_staff_id),
      lab_tests: this.baseForm.get('lab_tests')?.value,
      is_active: this.selectPackage.is_active,
      id: this.selectPackage.id
    };
    return model;
  }

  saveUpdateModel() {

    this.baseForm.get('total_amount')?.setValue(this.getPrice());

    if (this.baseForm.valid && this.baseForm.get('lab_tests')?.value.length !== 0) {
      this.endPoint.updateLabpackage(this.getUpdateModel()).subscribe((response) => {
        this.alertService.showSuccess("Package Updated", this.selectPackage.name);
        this.submitted = false;
        this.modalService.dismissAll();
        this.getData();
      }, (error) => {
        this.alertService.showError("oh-oh", error);
      })
    } else {
      this.submitted = true;
      this.baseForm.get('lab_tests')?.value.length === 0 ? this.alertService.showError("Include some tests") : "";

      // Iterate over form controls to check validity
      Object.keys(this.baseForm.controls).forEach(controlName => {
        const control = this.baseForm.get(controlName);
        if (control instanceof FormControl && !control.valid) {
          this.alertService.showError(`Field ${controlName} requires validation`);
        }
      });
    }

  }



  count!: number;
  all_count!: number;
  patients!: any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  page_size!: any;
  page_number!: any;
  query!: string;
  sort: any = false;

  pkgs: any;

  changeSorting() {
    this.sort = !this.sort;
    this.getData();
  }

  // @ViewChild('datePicker') datePicker!: AppDatePickerComponent;

  getData() {

    this.subsink.sink = this.endPoint.getPaginatedPackages(
      this.page_size,
      this.page_number,
      this.query,
      this.sort
    ).subscribe((data: any) => {
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.pkgs = data.results
    })
  }

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();

    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.getData()
  }

  onPageChange(e: any) {
    this.page_number = e;
    this.getData();
  }

  getRangeValue(e: any) {
    if (e.length !== 0) {
      if (e.includes("to")) {
        this.separateDates(e);
      } else {
        this.date = e;
        this.from_date = "";
        this.to_date = "";
        this.page_number = 1;
        this.getData();
      }
    }
    else {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();
    }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate;
    this.to_date = endDate;
    this.date = "";
    this.pageNum = 1;
    this.getData();
  }

  validatePrice(e: any) {

    if (this.baseForm.get('lab_tests')?.value && this.baseForm.get('lab_tests')?.value.length !== 0) {
      const priceLimit = parseFloat(this.get_AddTotalAmount().replace(/,/g, ''));
      this.discountLimitText = ""
      this.baseForm.get('total_discount')?.setValue("");
      this.baseForm.get('is_disc_percentage')?.setValue(false);
      function extractNumbers(input: string): number {
        const trimmedInput = input.trim(); // Remove leading and trailing whitespace
        const numberPattern = /^0*(\d+(\.\d{1,2})?)/; // Match digits with up to two digits after the decimal point, ignoring leading zeros
        const match = trimmedInput.match(numberPattern);
        if (match) {
          return parseFloat(match[1]);
        } else {
          return 0;
        }
      }

      // const input_number = extractNumbers(e.target.value);
      e.target.value = e.target.value.replace(/[^\d.]/g, '')
      const input_number = e.target.value.replace(/[^\d.]/g, '');

      if (input_number <= 0) {
        this.baseForm.get('offer_price')?.setValue("");
        this.baseForm.get('total_discount')?.setValue("");
        this.OfferPriceText = "";
      } else if (input_number > priceLimit) {
        this.baseForm.get('offer_price')?.setValue(priceLimit?.toFixed(2));
        this.baseForm.get('total_discount')?.setValue(0);
        this.OfferPriceText = "Offer Price can't be more than the Tests Price";
      } else {
        // this.baseForm.get('offer_price')?.setValue(input_number);
        this.baseForm.get('total_discount')?.setValue((priceLimit - input_number)?.toFixed(2));
        this.OfferPriceText = "";
      }


    } else {
      this.baseForm.get('offer_price')?.setValue("");
      this.OfferPriceText = "Add atleast one lab test";
      // this.alertService.showError("","Add atleast one lab test");
    }

  }


  formatCurrency(bill: any): any {
    if (bill) {
      const curr = parseInt(bill).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
      return curr;
    } else {
      return 0
    }
  }


  discountLimitText: string = "";
  OfferPriceText: string = "";
  validateDiscount(e: any) {

    if (this.baseForm.get('lab_tests')?.value && this.baseForm.get('lab_tests')?.value.length !== 0) {
      if (!this.baseForm.get('is_disc_percentage')?.value) {
        this.baseForm.get('offer_price')?.setValue("");
        this.OfferPriceText = "";
        const priceLimit = parseFloat(this.get_AddTotalAmount().replace(/,/g, ''));

        function extractNumbers(input: string): number {
          const trimmedInput = input.trim(); // Remove leading and trailing whitespace
          const numberPattern = /^0*(\d+(\.\d{1,2})?)/; // Match digits with up to two digits after the decimal point, ignoring leading zeros
          const match = trimmedInput.match(numberPattern);
          if (match) {
            return parseFloat(match[1]);
          } else {
            return 0;
          }
        }

        // const input_number = extractNumbers(e.target.value);
        e.target.value = e.target.value.replace(/[^\d.]/g, '')
        const input_number = e.target.value.replace(/[^\d.]/g, '');

        if (input_number <= 0) {
          this.baseForm.get('total_discount')?.setValue("");
          this.baseForm.get('offer_price')?.setValue("");
          this.OfferPriceText = "";
          this.discountLimitText = ""
        } else if (input_number > priceLimit) {
          this.baseForm.get('total_discount')?.setValue(priceLimit?.toFixed(2));
          this.baseForm.get('offer_price')?.setValue(0);
          this.discountLimitText = "Discount can't be more than the Tests Price"
          // this.alertService.showError("","Discount can't be more than the Offer Price")
        } else {
          // this.baseForm.get('total_discount')?.setValue(input_number);
          this.baseForm.get('offer_price')?.setValue((priceLimit - input_number)?.toFixed(2));
          this.discountLimitText = ""
        }
      } else {
        const priceLimit = parseFloat(this.get_AddTotalAmount().replace(/,/g, ''));
        this.baseForm.get('offer_price')?.setValue("")
        function extractNumbers(input: string): number {
          const trimmedInput = input.trim(); // Remove leading and trailing whitespace
          const numberPattern = /^0*(\d+(\.\d+)?)/; // Match digits with optional decimal part, ignoring leading zeros
          const match = trimmedInput.match(numberPattern);
          if (match) {
            return parseFloat(match[1]);
          } else {
            return 0;
          }
        }

        // const input_number = extractNumbers(e.target.value);
        e.target.value = e.target.value.replace(/[^\d.]/g, '')
        const input_number = e.target.value.replace(/[^\d.]/g, '');

        if (input_number <= 0) {
          this.baseForm.get('total_discount')?.setValue("");
          this.baseForm.get('offer_price')?.setValue("");
          this.discountLimitText = ""
        } else if (input_number > 100) {
          this.baseForm.get('total_discount')?.setValue(100);
          this.baseForm.get('offer_price')?.setValue(0);
          this.discountLimitText = "Maximum Limit Reached"
        } else {
          this.baseForm.get('total_discount')?.setValue(input_number);
          this.discountLimitText = ""
          const amt = priceLimit - (priceLimit * (input_number / 100))
          this.baseForm.get('offer_price')?.setValue(amt.toString().includes(".") ? amt.toFixed(2): amt)
        }
      }
    } else {
      this.baseForm.get('total_discount')?.setValue("");
      this.discountLimitText = "Add atleast one lab test"
      // this.alertService.showError("", "Add atleast one lab test");
    }
  }

  getDiscount(): number | undefined {
    const totalAmount = parseFloat(this.get_AddTotalAmount().replace(/,/g, '')); // Parse total amount
    const offerPrice = this.baseForm.get('offer_price')?.value || 0; // Get offer price

    if (this.baseForm.get('lab_tests')?.value && totalAmount && offerPrice) {
      const discount = totalAmount - offerPrice; // Calculate discount
      return parseFloat(discount.toFixed(2)) > 0 ? parseFloat(discount.toFixed(2)) : 0; // Return discount with only up to two decimal places
    }

    return 0; // Return undefined if any necessary value is missing
  }


  getPrice() {
    const totalAmount = parseFloat(this.get_AddTotalAmount().replace(/,/g, '')); // Parse total amount
    return totalAmount || 0
  }


  getFormatedVal(num:any){
    return parseFloat(num.replace(/,/g, ''))
  }


  resetDiscount() {
    this.baseForm.get('total_discount')?.setValue("");
    this.baseForm.get('offer_price')?.setValue("")
  }
}
