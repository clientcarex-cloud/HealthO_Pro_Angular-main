import { Component, Injector, ViewChild } from '@angular/core'
import { BaseComponent } from '@sharedcommon/base/base.component'
import { CaptilizeService } from '@sharedcommon/service/captilize.service'
import { DashboardEndpoint } from '../../endpoint/dashboard.endpoint'
import { AppAuthService } from 'src/app/core/services/appauth.service'
import { HostListener } from '@angular/core'
import * as echarts from 'echarts'
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service'
import { FormBuilder, UntypedFormGroup } from '@angular/forms'
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service'
import { NgbCalendar, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap'
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint'
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-userdashboard',
  templateUrl: './userdashboard.component.html',
  styleUrls: ['./userdashboard.component.scss']
})

export class UserDashboardComponent extends BaseComponent<any> {

  testing(e: any){
    this.alertService.showError(e);
  }
  constructor(
    private endPoint: DashboardEndpoint,
    private masterEndPoint: MasterEndpoint,
    private formBuilder: FormBuilder,
    injector: Injector,
    private authservice: AppAuthService,
    public capitalSrvc: CaptilizeService,
    private cookieSrvc: CookieStorageService,
    private staffEndpoint : StaffEndpoint,
    public timeSrvc: TimeConversionService,
    private ngbCalendar: NgbCalendar,
		private dateAdapter: NgbDateAdapter<string>,
  ) {
    super(injector)
  }

  show_org = true ;

  userName: any;
  dashboardItems: any ;

  ptn_reg_loading: boolean = false;
  options: any ;

  date: string = '';
  status_id: string = '';
  from_date: string = '';
  to_date: string = '';

  years: any;
  months: any;

  @ViewChild('dateDropdown') dateDropdown: any;

  override ngOnInit(): void {

    
    if (this.cookieSrvc.getUserType() === 3) {
      this.subsink.sink = this.masterEndPoint.getDDashBoardOptions(this.cookieSrvc.getCookieData().lab_staff_id, this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
        this.options = data.filter((d: any) => d.is_active);

        if(data.length == 0){
          this.createOptions();
        }
      })
      
      this.addBlur()
      this.subsink.sink = this.staffEndpoint.getSingleStaff(this.cookieSrvc.getCookieData().lab_staff_id).subscribe((data:any)=>{
        this.userName = data?.name || "";
      })
      this.show_org = true ;

    }else{
      this.show_org = false;
    }


  }

  createOptions(){
    const model = {
      lab_staff : this.cookieSrvc.getCookieData().lab_staff_id
    }
    this.subsink.sink = this.masterEndPoint.postDashboardOptions(model).subscribe((data:any)=>{
      this.subsink.sink = this.masterEndPoint.getDDashBoardOptions(this.cookieSrvc.getCookieData().lab_staff_id, this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
        this.options = data;
        this.addBlur();
      })
    })
  }


  checkDashBoardOptions(i: any) {
    return this.options?.find((o:any)=> o?.dash_board == i)?.is_active ;
  }

  onDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.dashboardItems, event.previousIndex, event.currentIndex);
  }


  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const element = document.querySelector('.sticky-top') as HTMLElement
    const dashboardText = document.querySelector(
      '.dashboard-text'
    ) as HTMLElement
    if (element && dashboardText) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= 0) {
        dashboardText.classList.add('invisible')
      } else {
        dashboardText.classList.remove('invisible')
      }
    }
  }

  getTodayDate(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0') // Months are zero-based, so we add 1
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`
  }

  unlockButton!: boolean
  timeoutId: any

  // Reset the timeout whenever there is an activity
  resetBlurTimeout() {
    clearTimeout(this.timeoutId)
    this.timeoutId = setTimeout(() => {
      this.addBlur()
    }, 60000) // 60 seconds
  }

  handleActivity() {
    if (!this.unlockButton) {
      this.resetBlurTimeout()
      this.removeBlur()
    }
  }

  removeBlur() {
    const dashboard = document.getElementById('dashboard')
    dashboard?.classList.remove('blur-effect')
    this.unlockButton = false
    this.resetBlurTimeout()
  }

  @HostListener('window:mousemove') onMouseMove() {
    this.handleActivity()
  }

  @HostListener('window:keypress') onKeyPress() {
    this.handleActivity()
  }

  addBlur() {
    const dashboard = document.getElementById('dashboard')
    this.unlockButton = true
    dashboard?.classList.add('blur-effect')
  }


  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(' to ')
    this.from_date = startDate
    this.to_date = endDate
    this.date = ''
  }

  getRangeValue(e: any) {
    if (e.length !== 0) {
      if (e.includes('to')) {
        this.separateDates(e);
      } else {
        this.date = e;
        this.from_date = '';
        this.to_date = '';
      }
    } else {
      this.getRangeValue(this.getTodayDate());
      this.from_date = '';
      this.to_date = '';
    }
  
    this.ptn_reg_loading = true;
    this.dateDropdown?.close();

    this.resetValues();

    this.getBusinessCollections();
    
    this.subsink.sink = this.endPoint
      .getBusinessAnalytics(this.date, this.status_id, this.from_date, this.to_date)
      .pipe(
        catchError(error => {
          console.error('Error in getBusinessAnalytics:', error);
          return of(null); // Continue with null in case of error
        }),
        finalize(() => this.nextRequest())
      )
      .subscribe((data: any) => {
        this.business = [data];
      });
  }
  
  nextRequest() {
    forkJoin([
      this.endPoint.getPatientsOverview(this.date, this.status_id, this.from_date, this.to_date).pipe(
        catchError(error => {
          console.error('Error in getPatientsOverview:', error);
          return of({});
        })
      ),
      this.endPoint.getReferralDoctorAnalytics(this.pageNum, this.date, this.status_id, this.from_date, this.to_date).pipe(
        catchError(error => {
          console.error('Error in getReferralDoctorAnalytics:', error);
          return of({ results: [] });
        })
      ),
      this.endPoint.getDepartment(this.date, this.status_id, this.from_date, this.to_date).pipe(
        catchError(error => {
          console.error('Error in getDepartment:', error);
          return of({ results: [] });
        })
      ),
      this.endPoint.getPayModes(this.date, this.status_id, this.from_date, this.to_date).pipe(
        catchError(error => {
          console.error('Error in getPayModes:', error);
          return of({ results: [] });
        })
      ),
      this.endPoint.getPhlebotomists(this.date, this.status_id, this.from_date, this.to_date).pipe(
        catchError(error => {
          console.error('Error in getPhlebotomists:', error);
          return of({ results: [] });
        })
      ),
      this.endPoint.getTechnicians(this.date, this.status_id, this.from_date, this.to_date).pipe(
        catchError(error => {
          console.error('Error in getTechnicians:', error);
          return of({ results: [] });
        })
      ),
      this.endPoint.getTopLabTests(this.date, this.status_id, this.from_date, this.to_date).pipe(
        catchError(error => {
          console.error('Error in getTopLabTests:', error);
          return of({ results: [] });
        })
      ),
      this.endPoint.getRecepsOverview(this.date, this.status_id, this.from_date, this.to_date).pipe(
        catchError(error => {
          console.error('Error in getRecepsOverview:', error);
          return of({ results: [] });
        })
      ),
      this.endPoint.getDocAuthorization(this.date, this.status_id, this.from_date, this.to_date).pipe(
        catchError(error => {
          console.error('Error in getDocAuthorization:', error);
          return of({ results: [] });
        })
      ),
      this.endPoint.getPtnAnalytics(this.date, this.status_id, this.from_date, this.to_date).pipe(
        catchError(error => {
          this.ptn_reg_loading = false;
          console.error('Error in getPtnAnalytics:', error);
          return of({});
        }),
        finalize(() => this.ptn_reg_loading = false)
      )
    ]).subscribe(results => {
      // Handle Patients Overview
      const patientsOverview:any = results[0];
      if (Object.keys(patientsOverview).length === 0) {
        this.ZeroPatientOverviewChartOption();
      } else {
        for (let key in patientsOverview.age_group) {
          if (patientsOverview.age_group[key] === 0) {
            delete patientsOverview.age_group[key];
          }
        }
        this.PatientsOverViewData = patientsOverview;
        this.patientOverviewChart(patientsOverview);
      }
  
      // Handle Referral Doctor Analytics
      const doctorsData: any = results[1];
      this.doctorsData = doctorsData.results;
      this._referralDoctor(doctorsData.results);
  
      // Handle Department
      const departmentData:any = results[2];
      if (Object.keys(departmentData.results).length === 0) {
        this.departments = [{ department_name: '', test_count: 0 }];
        let names: any = [];
        let value: any = [];
        this.departments.forEach((d: any) => {
          if (d.department_name && d.test_count) {
            d.department_name += ` - ${d.test_count}`
            names.push(d.department_name);
            value.push(d.test_count);
          }
        });
        this._departmentChart('["--vz-success"]', names, value, this.departments);
      } else {
        this.departments = departmentData?.results;
        let names: any = [];
        let value: any = [];
        departmentData.results.forEach((d: any) => {
          if (d.department_name && d.test_count) {
            d.department_name += ` - ${d.test_count}`
            names.push(d.department_name);
            value.push(d.test_count);
          }
        });
        this._departmentChart('["--vz-success"]', names, value, this.departments);
      }
  
      // Handle Pay Modes
      const payModesData:any = results[3];
      if (payModesData?.results) {
        payModesData.results.length !== 0 ? this.generateChartOptions(payModesData.results) : this.generateChartOptions(this.payModes);
      }
  
      // Handle Phlebotomists
      const phlebotomistsData: any = results[4];
      if (phlebotomistsData?.results) {
        if (phlebotomistsData.results.length !== 0) {
          this.phlebotomists = phlebotomistsData.results;
          this.phlebotomistChart();
        } else {
          this.phlebotomistChart();
        }
      } else {
        this.phlebotomistChart();
      }
  
      // Handle Technicians
      const techniciansData:any = results[5];
      if (techniciansData?.results) {
        techniciansData.results.length !== 0 ? this.technicianChart(techniciansData.results) : this.technicianChart(this.technicians);
      }
  
      // Handle Top Lab Tests
      const labTestsData:any = results[6];
      const defaultTestModel = { test_name: ' ', test_count: 0 };
      if (labTestsData?.results) {
        labTestsData.results.length !== 0 ? this._testChart(labTestsData.results) : this._testChart([defaultTestModel]);
      }
  
      // Handle Receptionist Overview
      const recepsOverviewData:any = results[7];
      if (recepsOverviewData?.results) {
        recepsOverviewData.results.length !== 0 ? this._overviewReceptionist(recepsOverviewData.results) : this._overviewReceptionist(this.patientOverview);
      }
  
      // Handle Doctor Authorization
      const docAuthData:any = results[8];
      if (docAuthData?.results) {
        docAuthData.results.length !== 0 ? this._authorizationDoctor(docAuthData.results) : this._authorizationDoctor(this.doctor_auth);
      }
  
      // Handle Patient Analytics
      const ptnAnalyticsData = results[9];
      this.returnPatientNumberChart(ptnAnalyticsData);
  
      // Reload Dashboard if necessary
      this.reloadDashboard();

      this.callCharts();
    });
  }

  reloadDashboard(){
    this.dashboardItems = [
      {
        dash_board: "FINANCIAL INFO",
        is_financial: true,
        business: this.business[0],
        chartOptions: null,
        graph_size: 'col-12',
        icon: ""
      },
      {
        dash_board: "NET COLLECTIONS",
        is_netcollections: true,
        collections: this.collections,
        chartOptions: null,
        graph_size: 'col-12',
        icon: "ri-wallet-3-line fs-4"
      },
      {
        dash_board: "PATIENT REGISTRATION",
        chartOptions: this.patientAnalyticsNumbers,
        graph_size: 'col-12',
        count: this.patientsCount,
        countLabel : 'Total Patients',
        is_normal: true,
        icon: "ri-hospital-line fs-4"
      },
      {
        dash_board: "PATIENT OVERVIEW",
        chartOptions: this.patientOverviewChartOption,
        graph_size: 'col-lg-6 col-12',
        is_normal: true,
        icon: "ri-team-line fs-4"
      },
      {
        dash_board: "REFERRAL DOCTORS",
        chartOptions: this.refDoctors,
        graph_size: 'col-lg-6 col-12',
        is_normal: true,
        icon: "ri-stethoscope-line fs-4"
      },
      {
        dash_board: "PHLEBOTOMISTS",
        chartOptions: this.phlebotomists,
        graph_size: 'col-lg-6 col-12',
        is_normal: true,
        icon: "ri-test-tube-line fs-4"
      },
      {
        dash_board: "LAB TECHNICIANS",
        chartOptions: this.techchart,
        graph_size: 'col-lg-6 col-12',
        is_normal: true,
        icon: "ri-microscope-line fs-4"
      },
      {
        dash_board: "RECEPTIONIST OVERVIEW",
        chartOptions: this.receptionistOverviewChart,
        graph_size: 'col-lg-6 col-12',
        is_normal: true,
        icon: "ri-nurse-line fs-4"
      },
      {
        dash_board: "DOCTOR AUTHORIZATION",
        chartOptions: this.doctor_auth_chart,
        graph_size: 'col-lg-6 col-12',
        is_normal: true,
        icon: "ri-stethoscope-line fs-4"
      },
      {
        dash_board: "DEPARTMENT ANALYTICS",
        chartOptions: this.departmentsAnalytics,
        graph_size: 'col-lg-6 col-12',
        is_normal: true,
        icon: "ri-bar-chart-2-line fs-4"
      },
      {
        dash_board: "PAYMENT MODE INSIGHTS",
        chartOptions: this.payModeChartOption,
        graph_size: 'col-lg-6 col-12',
        is_normal: true,
        icon: "ri-bank-card-line fs-4"
      },
      {
        dash_board: "TOP LAB TESTS",
        chartOptions: this.testsCharts,
        graph_size: 'col-12',
        is_normal: true,
        icon: "ri-flask-line fs-4"
      }
    ];

  }

  callCharts(){

    this.options.forEach((option: any) => {
      const dashBoard = this.dashboardItems.find((item: any) => item.dash_board === option.dash_board);
  
      // Destructure the dashboard properties with defaults
      const {
          is_financial = null,
          business = null,
          chartOptions = null,
          is_netcollections = null,
          collections = null,
          is_normal = null,
          graph_size = null, // remove later
          icon = null,
          count = null,
          countLabel = null
      } = dashBoard || {};
  
      // Assign values to option
      option['is_financial'] = is_financial;
      option['business'] = business;
      option['chartOptions'] = chartOptions;
      option['is_netcollections'] = is_netcollections;
      option['collections'] = collections;
      option['is_normal'] = is_normal;
      option['icon'] = icon;
      option['count'] = count ;
      option['countLabel'] = countLabel;
      // option['graph_size'] = graph_size; // remove later
  });
  
  this.dashboardItems = this.options
  

  }





  resetValues(){
    this.business = [
      {
        total_amount: 0,
        total_discount: 0,
        net_amount: 0,
        balance_amount: 0,
        refund_amount: 0
      }
    ]
  
    this.totalAmount = 0;

    this.dates = null 
    this.patientAnalyticsNumbers = null
    this.patientsCount = 0

    this.patientOverviewChartOption = null ;

    this.PatientsOverViewData = [
      {
        total_patients: 0,
        male_count: 0,
        female_count: 0,
        age_group: {
          '0_18': 0,
          '19_30': 0,
          '31_50': 0,
          above_50: 0
        }
      }
    ]

    this.refDoctors = null ;
    this.doctorsData = null ;

    this.departmentsAnalytics = null ;
    this.departments = null ;

    this.payModes = [
      { total_patients: 0, total_amount: 0, pay_mode: 'Cash' },
      { total_patients: 0, total_amount: 0, pay_mode: 'Cheque' },
      { total_patients: 0, total_amount: 0, pay_mode: 'UPI' }
    ]

    this.payModeChartOption = null ;

    this.phlebotomists = [
      {
        collected_by: '',
        total_collected: 0,
        total_pending: 0
      }
    ]

    this.technicians = [
      {
        total_received: 0,
        report_created_by_name: '',
        total_draft_reports: 0,
        total_authorization_pending: 0,
        total_completed: 0
      }
    ]
  
    this.techchart = null ;


    this.testsCharts = null ;
    this.tests = null ;

    this.patientOverview = [
      {
        created_by: '',
        total_patients: 0,
        total_amount: 0,
        total_paid: 0,
        total_due: 0,
        total_cash: 0
      }
    ]
  
    this.receptionistOverviewChart = null ;

    this.doctor_auth = [
      {
        added_by: '',
        total_authorization_pending: 0,
        total_authorized_completed: 0
      }
    ]
  
    this.doctor_auth_chart = null ;

    this.collections= {
      new_collections: {
        Cash: 'NA',
        UPI: 'NA',
        Cheque: 'NA',
        Card: 'NA',
        total: 'NA'
      },
      previous_due_collections: {
        Cash: 'NA',
        UPI: 'NA',
        Cheque: 'NA',
        Card: 'NA',
        total: 'NA'
      },
      refund_collections: {
        Cash: 'NA',
        UPI: 'NA',
        Cheque: 'NA',
        Card: 'NA',
        total: 'NA'
      },
      subtotals: {
        Cash: 'NA',
        UPI: 'NA',
        Cheque: 'NA',
        Card: 'NA',
        total: 'NA'
      }
    };
  

  }

  
  pageNum!: null
  business: any = [
    {
      total_amount: 0,
      total_discount: 0,
      net_amount: 0,
      balance_amount: 0,
      refund_amount: 0
    }
  ]

  totalAmount: number = 0

  formatCurrency(bill: any): any {
    if (bill) {
      const formatted = parseFloat(bill).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      })
      return formatted
    } else {
      return 0
    }
  }

  counterAmount() {
    while (this.business[0].total_amount !== this.totalAmount) {
      this.totalAmount = this.totalAmount + 1
    }
  }

  test() {
    const currentUser = this.authservice.currentUserValue
  }


  dates: any
  patientAnalyticsNumbers: any
  patientsCount: number = 0

  returnPatientNumberChart(ptnData: any) {
    let keys = Object.keys(ptnData)
    const vals = Object.values(ptnData)
    this.patientsCount = 0;
    vals.forEach((v: any) => this.patientsCount += v )

    const isKeysValid = keys.length === 24 && keys.every(key => /^\d+$/.test(key) && parseInt(key) >= 0 && parseInt(key) <= 23)

    let axisInterval = 1 ;

    if(!isKeysValid){
      const totalKeys = keys.length;
      
      if (totalKeys <= 31) {
        axisInterval = 1; // Show every day if there are few data points (e.g., 30 days)
      } else if (totalKeys <= 60) {
        axisInterval = 2; // Show every other day
      } else if (totalKeys <= 120) {
        axisInterval = 5; // Show every 5th day
      } else if (totalKeys <= 366) {
        axisInterval = 13; // Show every week for a year (365 days)
      } else {
        axisInterval = 30; // Show one label per month (if > 365 days, for example, multiple years)
      }

    }else{
      keys = keys.map((key: string) => {
        const hour = parseInt(key)
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          if (hour === 0) {
            return '12 AM'
          } else if (hour < 12) {
            return `${hour} AM`
          } else if (hour === 12) {
            return '12 PM'
          } else {
            return `${hour - 12} PM`
          }
        } else {
          return key // Return original key for other values
        }
      })
    }

    this.patientAnalyticsNumbers = {
      xAxis: {
        type: 'category',
        data: keys,
        axisLabel: {
          interval: isKeysValid ? 0 : axisInterval,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: vals,
          type: 'line',
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#0030a1' },
                { offset: 1, color: '#bbcefa' }
              ]),
              opacity: 0.6 // Adjust the opacity as needed
            }
          },
          emphasis: {
            focus: 'series'
          }
        }
      ],
      grid: {
        left: '5%',
        right: '5%',
        top: '8%',
        bottom: '3%',
        containLabel: true
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'medium',
          color: '#000',
          fontFamily: 'Montserrat, sans-serif'
        }
      },
      textStyle: {
        fontFamily: 'Montserrat, sans-serif'
      },
      tooltip: {
        trigger: 'axis',
 
        formatter: function (params: any) {
          const date = params[0].axisValue
          const value = params[0].value
          return ` <style>
          .data-table {
              border-collapse: collapse;
              width: 100%;
              font-size: 14px;
          }
          .data-table td {
              border: 1px solid transparent;
              text-align: left;
              padding: 8px;
              font-size: 13px;
          }
          .data-table tr {
            display: block; /* Convert table row into a block-level element */

            border-radius: 5px; /* Apply border-radius to table row */

        }
          .data-table tr:nth-child(even) {
              background-color: rgb(84, 112, 198,0.2);
              border-radius: 5px;
              font-size: 13px;
          }
          
          .data-table tr:hover {
              background-color: #dddddd;
              font-size: 13px;
          }
          .label {
              font-weight: normal;
              font-size: 13px;
          }
          .value {
              font-size: 16px;
              color: black;
              font-weight: 600;
          }
      </style>

      <table class="data-table">
          <tr>
              <td class="label">${isKeysValid ? 'Time' : 'Date'}:</td>
              <td class="value">${date}</td>
          </tr>
          <tr>
              <td class="label">Patients:</td>
              <td class="value">${value}</td>
          </tr>
      </table>`
        }
      }
    }
  }

  // patient chart overview

  patientOverviewChartOption: any

  PatientsOverViewData: any = [
    {
      total_patients: 0,
      male_count: 0,
      female_count: 0,
      age_group: {
        '0_18': 0,
        '19_30': 0,
        '31_50': 0,
        above_50: 0
      }
    }
  ]

  patientOverviewChart(data: any): any {
    // const legendData = data.map((item:any) => item.age_group);
    const option = {
      title: {
        text: `Total Patients - ${data.total_patients}`,
        subtext: `Male - ${data.male_count}    |    Female - ${data.female_count}`,
        left: 'right',
        textStyle: {
          fontFamily: 'Montserrat, sans-serif',
          color: '#000', // Set the color you want
          fontSize: 14, // Set the font size you want
          fontWeight: 'bold' // Set the font weight you want
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          const data = params.data
          return `
                <span style="font-size:16px; color: black; font-weight:400;">${params.name}</span><br />
                <small>Total Patients:</small> <span style="color: black;font-weight:400;"><b>${data.value}</b></span><br />`
        },
        title: 'Patient Analytics'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: '#000',
          fontFamily: 'Montserrat, sans-serif'
        }
      },
      textStyle: {
        fontFamily: 'Montserrat, sans-serif',
        color: '#000'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'medium',
          color: '#000',
          fontFamily: 'Montserrat, sans-serif'
        }
      },
      series: [
        {
          type: 'pie',
          top: 90,
          bottom: 0,
          radius: ['50%', '80%'],
          avoidLabelOverlap: false,
          name: '',
          label: {
            show: true,
            position: 'outside',
            fontFamily: 'Montserrat, sans-serif'
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 0.5,
              fontFamily: 'Montserrat, sans-serif',
              type: 'solid'
            }
          },
          data: [
            { value: data.age_group['0_18'], name: 'Age Below 18' },
            { value: data.age_group['19_30'], name: 'Age above 18' },
            { value: data.age_group['31_50'], name: 'Age Between 31-50' },
            { value: data.age_group['above_50'], name: 'Age Above 50' }
          ].filter(item => item.value !== 0),
          textStyle: {
            fontFamily: 'Montserrat, sans-serif'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'medium'
            }
          }
        }
      ]
    }

    this.patientOverviewChartOption = option
    return option
  }

  ZeroPatientOverviewChartOption(): any {
    const option = {
      title: {
        text: `Total Patients - 0`,
        subtext: `Male - 0    |    Female - 0`,
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'medium'
        }
      },
      series: [
        {
          type: 'pie',
          top: 90,
          bottom: 40,
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          name: '',
          data: [{ value: 0 || 0, name: 'Patients' }],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 5,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }

    this.patientOverviewChartOption = option
    return option
  }

  // referral doctor

  refDoctors: any

  doctorsData!: any

  private _referralDoctor(doctorData: any[]) {
    if (doctorData.length === 0) {
      // If no data, display a funnel chart with a single data point representing zero values
      this.refDoctors = {
        tooltip: {
          trigger: 'item',
          formatter: function (params: any) {
            return `
                <span style="font-size:16px; color: black;">${params.name}</span><br />
                <small>Total Patients:</small> <span style="color: black;">0</span><br />
                <small>Total Amount:</small> <span style="color: black;">0</span><br />
                <small>Total Paid:</small> <span style="color: black;">0</span><br />`
          },
          title: 'Patient Analytics'
        },
        series: [
          {
            name: '',
            type: 'funnel',
            data: [{ value: 0, name: 'No Data' }],
            label: {
              show: true,
              position: 'outside'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 0.5,
                type: 'solid'
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'medium'
              }
            }
          }
        ],
        textStyle: {
          fontFamily: 'Readex Pro, sans-serif'
        }
      }

    } else {
      let nullPatients = 0;
      let nullCost = 0;
      let nullPaid = 0;
  
      let combinedTotalPatients = 0;
      let combinedTotalCost = 0;
      let combinedTotalPaid = 0;
  
      doctorData = doctorData.sort((a, b) => parseFloat(b.total_cost) - parseFloat(a.total_cost));
  
      doctorData.forEach(doctor => {
        if (doctor.doctor_name) {
          doctor.doctor_name += `, ${formatAmount(doctor.total_cost)}`;
          combinedTotalPatients += doctor.total_patients;
          combinedTotalCost += parseFloat(doctor.total_cost);
          combinedTotalPaid += parseFloat(doctor.total_paid);
        } else {
          doctor.doctor_name = `SELF, ${formatAmount(doctor.total_cost)}`;
          nullPatients += doctor.total_patients;
          nullCost += parseFloat(doctor.total_cost);
          nullPaid += parseFloat(doctor.total_paid);
        }
      });
  
      const legendData = doctorData.map(item => item.doctor_name);
      const combinedTotalCostFormatted = formatAmount(combinedTotalCost);
      const combinedTotalPaidFormatted = formatAmount(combinedTotalPaid);
  
      function formatAmount(num: number): string {
        return parseInt(num.toString())
          .toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR'
          })
          .slice(0, -3);
      }
  
      this.refDoctors = {
        tooltip: {
          trigger: 'item',
          formatter: function (params: any) {
            const data = params.data;
            return `
              <span style="font-size:16px;padding-bottom: 5px;color: black"><b>${params.name ? params.name : 'SELF'}</b></span><br />
              <table>
                <tr>
                  <td><small>Total Patients:</small></td>
                  <td style="color:#000;font-weight:600; text-align:end;padding-left:12px">${data.total_patients}</td>
                </tr>
                <tr>
                  <td><small>Total Amount:</small></td>
                  <td style="color:#000;font-weight:600; text-align:end;padding-left:12px">${formatAmount(data.value)}</td>
                </tr>
                <tr>
                  <td><small>Total Paid:</small></td>
                  <td style="color:#000;font-weight:600; text-align:end;padding-left:12px">${formatAmount(data.total_paid)}</td>
                </tr>
              </table>`;
          }
        },
        title: {
          text: `Referral Patients - ${combinedTotalPatients}   |   Total Paid - ${combinedTotalPaidFormatted}   |   Total Amount - ${combinedTotalCostFormatted}\nSELF - ${nullPatients}   |   Paid - ${formatAmount(nullPaid)}   |   Amount - ${formatAmount(nullCost)}`,
          rich: true,
          left: 'left',
          right: 0,
          top: 0,
          textStyle: {
            fontFamily: 'Readex Pro, sans-serif',
            color: 'rgb(0,0,0,0.85)',
            fontWeight: '300',
            lineHeight: '18',
            fontSize: '12',
            rich: {
              content: {
                lineHeight: '18px',
                align: 'left'
              }
            }
          },
          subtextStyle: {
            color: 'rgb(0,0,0,0.75)',
            fontWeight: '500',
            lineHeight: '18',
            rich: {
              content: {
                lineHeight: '18px',
                align: 'left'
              }
            }
          }
        },
        graphic: [
          {
            type: 'group',
            left: '0%',
            top: '30%',
            children: [
              {
                type: 'text',
                style: {

                  font: 'bold 14px Montserrat, sans-serif',
                  fill: 'rgb(0,0,0,0.75)',
                },
                z: 100
              }
            ]
          }
        ],
  
        legend: {
          show: true,
          orient: 'vertical',
          right: '0',
          left: '0%',
          top: '35%',
          title: {
            text: 'Legend Title',
            textStyle: {
              color: '#000',
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          data: legendData,
          textStyle: {
            color: '#000'
          }
        },
        series: [
          {
            name: 'Referral Doctors',
            type: 'funnel',
            right: '0%',
            left: '33%',
            top: '15%',
            bottom: '0%',
            width: '60%',
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              show: false,
              position: 'outside'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 0.5,
                type: 'solid'
              }
            },
            data: doctorData.map(item => ({
              value: item.total_cost,  // Keep this as the value for the funnel
              name: item.doctor_name,
              total_paid: item.total_paid,
              total_patients: item.total_patients
            }))
          }
        ],
        textStyle: {
          fontFamily: 'Montserrat, sans-serif',
          color: '#000'
        }
      };
    }
  }
  
  // department
  departmentsAnalytics!: any
  departments!: any

  private _departmentChart(colors: any, names: any[], values: any[], departments: any) {

    let count = 0;
    departments.forEach((test:any) => count+=test.test_count)

    const legendData = departments.map((item: any) => item.department_name);

    this.departmentsAnalytics = {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `<span style="color: black; ">${params.name}</span>
          <br><span style="font-weight: bold;color: #000;">${params.value} (${params.percent}%</span>)`
        }
      },
      title: {
        subtext: `Total Test Counts - ${count}`,
        rich: true,
        left: 'left',
        textStyle: {
          fontFamily: 'Readex Pro, sans-serif',
          color: 'rgb(0,0,0,0.85)',
          fontWeight: '300',
          lineHeight: '18',
          fontSize: '12',
          rich: {
            content: {
              lineHeight: '18px',
              align: 'left'
            }
          }
        },
        subtextStyle: {
          color: 'rgb(0,0,0,0.75)',
          fontWeight: '500',
          lineHeight: '15',
          rich: {
            content: {
              lineHeight: '15px',
              align: 'left'
            }
          }
        }
      },
      legend: {
        top: '10%',
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: '#000',
          fontFamily: 'Montserrat, sans-serif'
        },

        data: legendData
      },
      series: [
        {
          name: 'Lab Test',
          type: 'pie',
          radius: ['0%', '60%'],
          right: '0%',
          left: '33%',
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'outside',
            right: 'right'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'medium'
            }
          },
          labelLine: {
            show: true
          },
          data: departments.map((item: any) => ({
            value: item.test_count,
            name: item.department_name
          }))
        }
      ],
      textStyle: {
        fontFamily: 'Montserrat, sans-serif'
      }
    }
    
  }

  // pay mode graph
  payModes: any = [
    { total_patients: 0, total_amount: 0, pay_mode: 'Cash' },
    { total_patients: 0, total_amount: 0, pay_mode: 'Cheque' },
    { total_patients: 0, total_amount: 0, pay_mode: 'UPI' }
  ]

  payModeChartOption!: any

  generateChartOptions(data: any) {
    const payModes = data.map((item: any) => item.pay_mode)

    function formatAmount(num: number): string {
      return parseInt(num.toString())
        .toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR'
        })
        .slice(0, -3)
    }

    const totalPatients = data.reduce(
      (acc: number, curr: any) => acc + curr.total_patients,
      0
    )
    const totalAmount = data.reduce(
      (acc: number, curr: any) => acc + parseFloat(curr.total_amount),
      0
    )

    this.payModeChartOption = {
      title: {
        text: `Total Amount: ${formatAmount(
          totalAmount
        )}   |   Total Patients: ${totalPatients}`,
        // subtext: `Total Patients: ${totalPatients}   |   Total Amount: ${formatAmount(totalAmount)}`,
        left: 'center',
        textStyle: {
          fontFamily: 'Readex Pro, sans-serif',
          color: 'rgb(0,0,0,0.85)',
          fontWeight: '300',
          lineHeight: '18',
          fontSize: '12',
          rich: {
            content: {
              lineHeight: '18px',
              align: 'left'
            }
          }
        },
        subtextStyle: {
          color: '#000',
          fontWeight: 'normal',
          lineHeight: 24
        }
      },
      legend: {
        data: ['Total Patients', 'Total Amount'],
        textStyle: {
          fontFamily: 'Montserrat, sans-serif',
          color: '#000'
        },
        top: 'bottom' // Adjust legend position
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const data = params[0].data
          return `
                  <span style="font-size:16px; color: black; font-weight:400;"><b>${params[0].name
            }</b></span><br />
                  <table style="width:100%;">
                      <tr>
                          <td style="text-align:left;"><small>Total Patients:</small></td>
                          <td style="text-align:right;"><span style="color:black;font-weight:bold;">${data.value
            }</span></td>
                      </tr>
                      <tr>
                          <td style="text-align:left;"><small>Total Amount:</small></td>
                          <td style="text-align:right;"><span style="color:black;font-weight:bold;padding-left:12px">${formatAmount(
              data.total_amount
            )}</span></td>
                      </tr>
                  </table>`
        }
      },
      xAxis: {
        type: 'category',
        data: payModes,
        axisLabel: {
          interval: 0,
          textStyle: {
            fontFamily: 'Montserrat, sans-serif',
            color: '#000'
          }
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Patients',
          position: 'left',
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              fontFamily: 'Montserrat, sans-serif',
              color: '#000'
            }
          },
          splitLine: {
            show: false
          }
        },
        {
          type: 'value',
          name: 'Amount',
          position: 'right',
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              fontFamily: 'Montserrat, sans-serif',
              color: '#000'
            }
          },
          splitLine: {
            show: true
          }
        }
      ],
      series: [
        {
          name: 'Patients',
          type: 'bar',
          yAxisIndex: 0,

          data: data.map((item: any) => ({
            value: item.total_patients,
            total_amount: item.total_amount
          })),
          itemStyle: {
            color: '#5470c6' // Blue color
          }
        },
        {
          name: 'Amount',
          type: 'bar',
          yAxisIndex: 1,
          data: data.map((item: any) => parseFloat(item.total_amount)),
          itemStyle: {
            color: '#91cc75' // Green color
          }
        }
      ],
      textStyle: {
        fontFamily: 'Montserrat, sans-serif',
        color: '#000'
      }
    }
  }

  // phlebotomist
  phlebotomists: any = [
    {
      collected_by: '',
      total_collected: 0,
      total_pending: 0
    }
  ]

  phlebotomistChart(): void {
    this.phlebotomists.sort((a:any, b:any) => b.total_collected - a.total_collected);
  
    let total_collection = 0
    let total_pending = 0

    this.phlebotomists.forEach((item: any) => {
      item.collected_by = `${item.collected_by} - ${item.total_collected}`
      total_collection = total_collection + item.total_collected
      total_pending = total_pending + item.total_pending
    })

    const phlebotomistNames = this.phlebotomists.map(
      (item: any) => item.collected_by
    )
    const totalCollectedData = this.phlebotomists.map(
      (item: any) => item.total_collected
    )
    const totalPendingData = this.phlebotomists.map(
      (item: any) => item.total_pending
    )


    this.phlebotomists = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const phlebotomistIndex = phlebotomistNames.indexOf(params.name)
          return `
          <span style="font-size:16px; color: black;"><b>${params.name}</b></span><br />
          
          <table>
          <tr>
              <td><small>Samples Collected:</small></td>
              <td style="color:#000;font-weight:600; text-align:end;padding-left:12px">${totalCollectedData[phlebotomistIndex]}</td>
          </tr>
          <tr>
              <td><small>Samples Pending:</small></td>
              <td style="color:#000;font-weight:600; text-align:end;padding-left:12px">${totalPendingData[phlebotomistIndex]}</td>
          </tr>
          </table>
        `
        }
      },
      legend: {
        show: true,
        orient: 'vertical',
        right: '0',
        left: '0%',
        top: '35%',
        data: phlebotomistNames,
        textStyle: {
          color: '#000'
        }
      },
      title: {
        // text: 'Top Phlebotomists',
        text: `Total Sample Collections - ${total_collection}\nTotal Pending - ${total_pending}`,
        rich: true,
        left: 'left',
        right: 0,
        top: 0,
        textStyle: {
          fontFamily: 'Readex Pro, sans-serif',
          color: 'rgb(0,0,0,0.85)',
          fontWeight: '300',
          lineHeight: '18',
          fontSize: '12',
          rich: {
            content: {
              lineHeight: '18px',
              align: 'left'
            }
          }
        },
        subtextStyle: {
          color: 'rgb(0,0,0,0.75)',
          fontWeight: '500',
          lineHeight: '18',
          rich: {
            content: {
              lineHeight: '18px',
              align: 'left'
            }
          }
        }
      },
      graphic: [
        {
          type: 'group',
          left: '0%',
          top: '30%',
          children: [
            {
              type: 'text',
              style: {
                font: 'bold 14px Montserrat, sans-serif',
                fill: 'rgb(0,0,0,0.75)'
              },
              z: 100
            }
          ]
        }
      ],
      series: [
        {
          type: 'funnel',
          right: '0%',
          left: '33%',
          top: '15%',
          bottom: '0%',
          width: '60%',
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          name: 'Phlebotomists',
          gap: 2,
          label: {
            show: false,
            // position: 'outside'
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 0.5,
              type: 'solid'
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          // emphasis: {
          //   label: {
          //     show: true,
          //     fontSize: 14,
          //     fontWeight: 'medium',
          //     color: '#000',
          //     fontFamily: 'Montserrat, sans-serif'
          //   }
          // },
          data: this.phlebotomists.map((item: any, index: any) => ({
            value: totalCollectedData[index],
            name: item.collected_by
          }))
        }
      ],
      textStyle: {
        fontFamily: 'Montserrat, sans-serif',
        color: '#000'
      }
    }
  }

  // technicians grapgh

  technicians: any = [
    {
      total_received: 0,
      report_created_by_name: '',
      total_draft_reports: 0,
      total_authorization_pending: 0,
      total_completed: 0
    }
  ]

  techchart: any

  technicianChart(chartData: any[]): void {
    chartData.sort((a:any, b:any) => b.total_received - a.total_received);

    let received: any = 0
    let drafts = 0
    let pendings = 0
    let completed = 0

    chartData.forEach((item: any) => {
      item.report_created_by_name = `${item.report_created_by_name} - ${item.total_received}`
      received += parseInt(item.total_received)
      drafts += parseInt(item.total_draft_reports)
      pendings += parseInt(item.total_authorization_pending)
      completed += parseInt(item.total_completed)
    })

    const names = chartData.map((item: any) => item.report_created_by_name)
    const totalReceivedData = chartData.map((item: any) => item.total_received)
    const totalDraftData = chartData.map(
      (item: any) => item.total_draft_reports
    )
    const totalPendingData = chartData.map(
      (item: any) => item.total_authorization_pending
    )
    const totalCompletedData = chartData.map(
      (item: any) => item.total_completed
    )

    this.techchart = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const index = names.indexOf(params.name)
          return `
          <span style="font-size:16px; color: black;"><b>${params.name}</b></span><br />
          
          <table>
          <tr>
              <td><small>Total Received:</small></td>
              <td style="color:#000;font-weight:600; text-align:end;padding-left:6px">${totalReceivedData[index]}</td>
          </tr>
          <tr>
              <td><small>Total Draft Reports:</small></td>
              <td style="color:#000;font-weight:600; text-align:end;padding-left:6px">${totalDraftData[index]}</td>
          </tr>
          <tr>
              <td><small>Total Authorization Pending:</small></td>
              <td style="color:#000;font-weight:600; text-align:end;padding-left:6px">${totalPendingData[index]}</td>
          </tr>
          <tr>
              <td><small>Total Completed:</small></td>
              <td style="color:#000;font-weight:600; text-align:end;padding-left:6px">${totalCompletedData[index]}</td>
          </tr>
          </table>
        `
        }
      },
      title: {
        // text: 'Top Technicians',
        text: `Total Sample Received - ${received}   |   Total Drafts - ${drafts}\nTotal Authorization Pending - ${pendings}   |   Total Reports Completed - ${completed}
        `,
        rich: true,
        left: 'left',
        textStyle: {
          fontFamily: 'Readex Pro, sans-serif',
          color: 'rgb(0,0,0,0.85)',
          fontWeight: '300',
          lineHeight: '18',
          fontSize: '12',
          rich: {
            content: {
              lineHeight: '18px',
              align: 'left'
            }
          }
        },
        subtextStyle: {
          color: 'rgb(0,0,0,0.75)',
          fontWeight: '500',
          lineHeight: '15',
          rich: {
            content: {
              lineHeight: '15px',
              align: 'left'
            }
          }
        }
      },
      graphic: [
        {
          type: 'group',
          left: '0%',
          top: '30%',
          children: [
            {
              type: 'text',
              style: {
                // text: 'Top Technicians',
                font: 'bold 14px Montserrat, sans-serif',
                fill: 'rgb(0,0,0,0.75)'
              },
              z: 100
            }
          ]
        }
      ],
      legend: {
        show: true,
        orient: 'vertical',
        right: '0',
        left: '0%',
        top: '35%',
        // bottom: '0%',
        title: {
          // Title for the legend
          text: 'Legend Title',
          textStyle: {
            color: '#000',
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: names.filter(name => name !== null),
        textStyle: {
          color: '#000'
        }
      },
      series: [
        {
          type: 'funnel',
          right: '0%',
          left: '33%',
          top: '15%',
          bottom: '0%',
          width: '60%',
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          name: 'Technicians',
          gap: 2,
          label: {
            show: false,
            // position: 'outside'
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 0.5,
              type: 'solid'
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          // emphasis: {
          //   label: {
          //     show: true,
          //     fontSize: 14,
          //     fontWeight: 'medium',
          //     color: '#000',
          //     fontFamily: 'Montserrat, sans-serif'
          //   }
          // },
          data: chartData
            .filter((item: any) => item.report_created_by_name !== null)
            .map((item: any) => ({
              value: item.total_received,
              name: item.report_created_by_name
            }))
        }
      ],
      textStyle: {
        fontFamily: 'Montserrat, sans-serif',
        color: '#000'
      }
    }
  }

  // global tests
  testsCharts: any
  tests!: any

  private _testChart(testData: any) {
    let count = 0 ;

    testData.forEach((test:any) => {
      count+=test.test_count;
      test.test_name = `${test.test_name} - ${test.test_count}`;
    })
    // testData = testData.forEach((test: any)=> test.name = `${test.test_name} - ${test.test_count}`);
    const legendData = testData.map((item: any) => item.test_name);

    this.testsCharts = {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `<span style="color: black; ">${params.name}</span>
          <br><span style="font-weight: bold;color: #000;">${params.value} (${params.percent}%</span>)`
        }
      },
      title: {
        // text: 'Top Technicians',
        text: `Total Tests Done - ${count}`,
        rich: true,
        left: 'left',
        textStyle: {
          fontFamily: 'Readex Pro, sans-serif',
          color: 'rgb(0,0,0,0.85)',
          fontWeight: '300',
          lineHeight: '18',
          fontSize: '12',
          rich: {
            content: {
              lineHeight: '18px',
              align: 'left'
            }
          }
        },
        subtextStyle: {
          color: 'rgb(0,0,0,0.75)',
          fontWeight: '500',
          lineHeight: '15',
          rich: {
            content: {
              lineHeight: '15px',
              align: 'left'
            }
          }
        }
      },
      legend: {
        top: '10%',
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: '#000',
          fontFamily: 'Montserrat, sans-serif'
        },
        data: legendData
      },
      series: [
        {
          name: 'Lab Test',
          type: 'pie',
          radius: ['0%', '60%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'outside',
            right: 'right'
          },
          // emphasis: {
          //   label: {
          //     show: true,
          //     fontSize: 14,
          //     fontWeight: 'medium'
          //   }
          // },
          labelLine: {
            show: true
          },
          data: testData.map((item: any) => ({
            value: item.test_count,
            name: item.test_name
          }))
        }
      ],
      textStyle: {
        fontFamily: 'Montserrat, sans-serif'
      }
    }
  }

  // patient registration overview
  patientOverview: any = [
    {
      created_by: '',
      total_patients: 0,
      total_amount: 0,
      total_paid: 0,
      total_due: 0,
      total_cash: 0
    }
  ]

  receptionistOverviewChart!: any

  private _overviewReceptionist(patientData: any[] = this.patientOverview) {
    if (patientData.length === 0) {
      // If no data, display a funnel chart with a single data point representing zero values
      this.patientOverview = {
        tooltip: {
          trigger: 'item',
          formatter: function (params: any) {
            return `
                <span style="font-size:16px; color: black;">${''}</span><br />
                <small>Total Patients:</small> <span style="color: black;">0</span><br />
                <small>Total Amount:</small> <span style="color: black;">0</span><br />
                <small>Total Paid:</small> <span style="color: black;">0</span><br />`
          },
          title: 'Patient Analytics'
        },
        series: [
          {
            name: 'Patient Analytics',
            type: 'funnel',
            data: [{ value: 0, name: 'No Data' }],
            label: {
              show: false,
              position: 'outside'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 0.5,
                type: 'solid'
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            // emphasis: {
            //   label: {
            //     show: true,
            //     fontSize: 14,
            //     fontWeight: 'medium'
            //   }
            // }
          }
        ],
        textStyle: {
          fontFamily: 'Readex Pro, sans-serif'
        }
      }
    } else {

      patientData.sort((a:any, b:any) => b.total_patients - a.total_patients);

      let patients = 0
      let due = 0
      let amount = 0
      let paid = 0
      let cash = 0

      patientData.forEach((data: any) => {
        data.created_by = `${data.created_by} - ${data.total_patients}`
        patients += data.total_patients
        due += data.total_due
        amount += data.total_amount
        paid += data.total_paid
        cash += data.total_cash
      })

      // If there is data, generate the funnel chart as before
      const legendData = patientData.map(item => item.created_by);

      function formatAmount(num: number): string {

        return parseInt(num.toString())
          .toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR'
          })
          .slice(0, -3)
      }

      this.receptionistOverviewChart = {
        tooltip: {
          trigger: 'item',
          formatter: function (params: any) {
            const data = params.data

            return `
              <span style="font-size:16px; color: black;"><b>${params?.name
              }</b></span><br />
              <table style="width:100%;">
              <tr>
                  <td style="text-align:left;"><small>Total Patients:</small></td>
                  <td style="text-align:right; padding-left: 9px;"><b><span style="color:black;">${data.total_patients
              }</span></b></td>
              </tr>
              <tr>
                  <td style="text-align:left;"><small>Total Due:</small></td>
                  <td style="text-align:right; padding-left: 9px;"><b><span style="color:black;">${formatAmount(
                data.total_due
              )}</span></b></td>
              </tr>
              <tr>
                  <td style="text-align:left;"><small>Total Amount:</small></td>
                  <td style="text-align:right; padding-left: 9px;"><b><span style="color:black;">${formatAmount(
                data.total_amount
              )}</span></b></td>
              </tr>
              <tr>
                  <td style="text-align:left;"><small>Total Paid:</small></td>
                  <td style="text-align:right; padding-left: 9px;"><b><span style="color:black;">${formatAmount(
                data.total_paid
              )}</span></b></td>
              </tr>
              <tr>
                  <td style="text-align:left;"><small>Total Cash:</small></td>
                  <td style="text-align:right; padding-left: 9px;"><b><span style="color:black;">${data.total_cash ? formatAmount(data.total_cash) : 0
              }</span></b></td>
              </tr>
          </table>
            `
          }
        },
        title: {
          text: `Total Patients - ${patients}   |   Total Due - ${formatAmount(
            due
          )}   |   Total Amount - ${formatAmount(
            amount
          )}\nTotal Paid - ${formatAmount(
            paid
          )}   |   Total Cash - ${formatAmount(cash)}`,
          rich: true,
          left: 'left',
          textStyle: {
            fontFamily: 'Readex Pro, sans-serif',
            color: 'rgb(0,0,0,0.85)',
            fontWeight: '300',
            lineHeight: '18',
            fontSize: '12',
            rich: {
              content: {
                lineHeight: '18px',
                align: 'left'
              }
            }
          },
          subtextStyle: {
            color: 'rgb(0,0,0,0.75)',
            fontWeight: '500',
            lineHeight: '18',
            rich: {
              content: {
                lineHeight: '18px',
                align: 'left'
              }
            }
          }
        },
        legend: {
          show: true,
          orient: 'vertical',
          right: '0',
          left: '0%',
          top: '35%',
          data: legendData,
          textStyle: {
            color: '#000'
          }
        },
        graphic: [
          {
            type: 'group',
            left: '0%',
            top: '30%',
            children: [
              {
                type: 'text',
                style: {
                  // text: 'Receptionists Stats',
                  font: 'bold 14px Montserrat, sans-serif',
                  fill: 'rgb(0,0,0,0.75)'
                },
                z: 100
              }
            ]
          }
        ],
        series: [
          {
            name: 'Patient Overview',
            type: 'funnel',
            right: '0%',
            left: '33%',
            top: '15%',
            bottom: '0%',
            width: '60%',
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              show: false,
              position: 'outside'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 0.5,
                type: 'solid'
              }
            },

            // emphasis: {
            //   label: {
            //     show: true,
            //     fontSize: 14,
            //     fontWeight: 'medium',
            //     color: '#000',
            //     fontFamily: 'Montserrat, sans-serif'
            //   }
            // },
            data: patientData.map(item => ({
              value: item.total_patients || 0,
              total_patients: item?.total_patients || 0,
              name: item?.created_by || '',
              total_due: item?.total_due || 0,
              total_paid: item?.total_paid || 0,
              total_amount: item?.total_amount || 0,
              total_cash: item?.total_cash || 0 // Include total_cash mapping here
            }))
          }
        ],
        textStyle: {
          fontFamily: 'Montserrat, sans-serif',
          color: '#000'
        }
      }
    }
  }

  // Doctor Authorization

  doctor_auth: any = [
    {
      added_by: '',
      total_authorization_pending: 0,
      total_authorized_completed: 0
    }
  ]

  doctor_auth_chart: any

  private _authorizationDoctor(docAuthData: any[] = this.doctor_auth): any {
    if (docAuthData.length === 0) {
      // If no data, display a funnel chart with a single data point representing zero values
      this.doctor_auth = {
        tooltip: {
          trigger: 'item',
          formatter: function (params: any) {
            return `
                <span style="font-size:16px; color: black;">${params.created_by}</span><br />
                <small>Total Patients:</small> <span style="color: black;">0</span><br />
                <small>Total Amount:</small> <span style="color: black;">0</span><br />
                <small>Total Paid:</small> <span style="color: black;">0</span><br />`
          }
        },

        series: [
          {
            name: '',
            type: 'funnel',
            data: [{ value: 0, name: 'No Data' }],
            label: {
              show: false,
              position: 'outside'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 0.5,
                type: 'solid'
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            // emphasis: {
            //   label: {
            //     show: true,
            //     fontSize: 14,
            //     fontWeight: 'medium'
            //   }
            // }
          }
        ],
        textStyle: {
          fontFamily: 'Readex Pro, sans-serif'
        }
      }
    } else {

      let pending = 0
      let completed = 0

      docAuthData.forEach((item: any) => {
        item.added_by = `${item.added_by} - ${item.total_authorized_completed}`
        pending += item.total_authorization_pending
        completed += item.total_authorized_completed
      })

      docAuthData.sort((a:any, b:any) => b.total_authorized_completed - a.total_authorized_completed);

      const legendData = docAuthData.map(item => item.added_by)

      this.doctor_auth_chart = {
        tooltip: {
          trigger: 'item',
          formatter: function (params: any) {
            const data = params.data
            return `
          <span style="font-size:16px; color: black;"><b>${data.name}</b></span><br />
          <table style="width:100%;">
              <tr>
                <td style="text-align:left;"><small>Total Authorization Completed:</small></td>
                <td style="text-align:right; padding-left: 6px;"><b><span style="color:black;">${data.value}</span></b></td>
            </tr>
            <tr>
                <td style="text-align:left;"><small>Total Authorization Pending:</small></td>
                <td style="text-align:right; padding-left: 6px;"><b><span style="color:black;">${data.pending}</span></b></td>
            </tr>
           
        </table>
            `
          }
        },
        graphic: [
          {
            type: 'group',
            left: '0%',
            top: '30%',
            children: [
              {
                type: 'text',
                style: {
                  // text: 'Authorization Doctors',
                  font: 'bold 14px Montserrat, sans-serif',
                  fill: 'rgb(0,0,0,0.75)'
                },
                z: 100
              }
            ]
          }
        ],
        legend: {
          show: true,
          orient: 'vertical',
          right: '0',
          left: '0%',
          top: '35%',
          // bottom: '0%',
          title: {
            // Title for the legend
            // text: 'Authorization Doctors',
            textStyle: {
              color: '#000',
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          data: legendData,
          textStyle: {
            color: '#000'
          }
        },

        title: {
          text: `Total Authorization Completed - ${completed}\nTotal Authorization Pending - ${pending}`,
          rich: true,
          left: 'left',
          textStyle: {
            fontFamily: 'Readex Pro, sans-serif',
            color: 'rgb(0,0,0,0.85)',
            fontWeight: '300',
            lineHeight: '18',
            fontSize: '12',
            rich: {
              content: {
                lineHeight: '18px',
                align: 'left'
              }
            }
          },
          subtextStyle: {
            color: 'rgb(0,0,0,0.75)',
            fontWeight: '500',
            rich: {
              content: {
                lineHeight: 24,
                align: 'center'
              }
            }
          }
        },
        series: [
          {
            type: 'funnel',
            right: '0%',
            left: '33%',
            top: '15%',
            bottom: '0%',
            width: '60%',
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              show: false,
              // position: 'outside'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 0.5,
                type: 'solid'
              }
            },

            // emphasis: {
            //   label: {
            //     show: true,
            //     fontSize: 14,
            //     fontWeight: 'medium',
            //     color: '#000',
            //     fontFamily: 'Montserrat, sans-serif'
            //   }
            // },
            data: docAuthData.map(item => ({
              value: item.total_authorized_completed,
              name: item.added_by,
              pending: item.total_authorization_pending
            }))
          }
        ],
        textStyle: {
          fontFamily: 'Montserrat, sans-serif',
          color: '#000'
        }
      }
    }
  }


  collections: any = {
    new_collections: {
      Cash: 'NA',
      UPI: 'NA',
      Cheque: 'NA',
      Card: 'NA',
      total: 'NA'
    },
    previous_due_collections: {
      Cash: 'NA',
      UPI: 'NA',
      Cheque: 'NA',
      Card: 'NA',
      total: 'NA'
    },
    refund_collections: {
      Cash: 'NA',
      UPI: 'NA',
      Cheque: 'NA',
      Card: 'NA',
      total: 'NA'
    },
    subtotals: {
      Cash: 'NA',
      UPI: 'NA',
      Cheque: 'NA',
      Card: 'NA',
      total: 'NA'
    }
  };

collections_loading: boolean = false;

changeCollections(e: any){
  if(e && e!= ''){
    this.getBusinessCollections(e);
  }else{
      this.getBusinessCollections();
  }

  
}



  getBusinessCollections(date: any = this.timeSrvc.getTodaysDate()){
    this.collections_loading = true;

    this.subsink.sink = this.endPoint.getPaymentCollections(this.date, this.from_date, this.to_date).subscribe((data:any)=>{
      this.collections = data;
      this.collections_loading = false;
    }, (error)=>{
      this.collections_loading = false;
      this.alertService.showError("Failed to Fetch Business Collections")
    })
  }
}
