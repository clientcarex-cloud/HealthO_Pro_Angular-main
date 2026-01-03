import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import * as echarts from 'echarts';
import { MarketExecutiveEndpoint } from '../../marketexecutive.endpoint';
import { NgxSpinnerService } from 'ngx-spinner';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Component({
  selector: 'app-visualize-charts',
  templateUrl: './visualize-charts.component.html',
  styleUrl: './visualize-charts.component.scss'
})

export class VisualizeChartsComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: MarketExecutiveEndpoint,
    private spinner: NgxSpinnerService,
    public timeSrvc: TimeConversionService
   ){ super(injector) };

  override data : any = [ ]
  staffs!:any;
  date: string = "";
  from_date: string = "";
  to_date: string = "";
  pageLoading: boolean = false;
  staffQuery: any = null ;
  revenueChart: any ; 
  chartOption: any;

  referralClass = 'col-lg-6 col-12';
  revenueClass = 'col-lg-6 col-12' ;

  override ngOnInit(): void {
    this.date = this.timeSrvc.getTodaysDate();
    this.getData();
  }

  getData(){
    this.staffs = [];

    this.spinner.show();
    this.pageLoading = true;

    this.subsink.sink = this.endPoint.getExecutiveTargets(
      'all', 1, '', true, this.date, this.from_date, this.to_date, null
    ).subscribe((data: any)=>{
      this.pageLoading = false;
      this.staffs = data?.results || data;

      this.prepareChartData();
      this.revenueChartData()

    }, (error: any)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error)
    });
    
  }

  getRangeValue(e:any){
    if(e.length !== 0){
      if(e.includes("to")){
        this.separateDates(e);
      }else{
        this.date = e;
        this.from_date = "";
        this.to_date = "" ;

        this.getData();
      }}
      else{
        this.date = "";
        this.from_date = "";
        this.to_date = "";

        this.getData();
      }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate;
    this.to_date = endDate ;
    this.date = "";

    this.getData();
  }


  prepareChartData() {
    const labels = this.staffs.map((item: any) => item.labstaff);
    const targetData = this.staffs.map((item: any) => item.no_of_referrals || 0);
    const achievedData = this.staffs.map((item: any) => item.accepted_visits || 0);
    const deniedData = this.staffs.map((item: any) => item.denied_visits || 0);
    const followupData = this.staffs.map((item: any) => item.followup_visits || 0);
  
    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        padding: [10, 15],
        textStyle: {
          color: '#333',
          fontSize: 14,
          fontFamily: "'Readex Pro', sans-serif",
        },
        formatter: (params: any) => {

          const mobileNumber = params[0].data.mobile_number || 'N/A'; 
          let tooltipContent = `
          <strong>${params[0].name}</strong>
          <table style="border-collapse: collapse; width: 100%;">
          `;
          
          params.forEach((param: any) => {
            const color = param.color || '#000'; // Get the series color
            tooltipContent += `
              <tr>
                <td style="padding: 0px;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; margin-right: 5px; border-radius: 5px"></span>
                  ${param.seriesName}
                </td>
                <td style="width: 25px; text-align: center">-</td>
                <td style="text-align: right; padding: 1.5px;"><strong>${param.data}</strong></td>
              </tr>
            `;
          });
      
          tooltipContent += '</table>';
          return tooltipContent;
        },
      },
      legend: {
        data: ['Target', 'Achieved', 'Denied', 'Follow-Up'],
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          rotate: 45, // Set this to any angle you need; 0 means horizontal
          interval: 0, // Show all labels
          formatter: (value: any) => value // Optional: You can format the label text here
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Target',
          type: 'bar',
          stack: 'total',
          data: targetData,
          emphasis: {
            focus: 'series',
          },
          label: {
            show: false,
            position: 'inside',
          },
        },
        {
          name: 'Achieved',
          type: 'bar',
          stack: 'total',
          data: achievedData,
          emphasis: {
            focus: 'series',
          },
          label: {
            show: false,
            position: 'inside',
          },
        },
        {
          name: 'Denied',
          type: 'bar',
          stack: 'total',
          data: deniedData,
          emphasis: {
            focus: 'series',
          },
          label: {
            show: false,
            position: 'inside',
          },
        },
        {
          name: 'Follow-Up',
          type: 'bar',
          stack: 'total',
          data: followupData,
          emphasis: {
            focus: 'series',
          },
          label: {
            show: false,
            position: 'inside',
          },
        },
      ],
    };
  }
  
  revenueChartData() {
    const labels = this.staffs.map((item: any) => item.labstaff);
    const targetData = this.staffs.map((item: any) => item?.target_revenue || 0);
    const achievedData = this.staffs.map((item: any) => item?.revenue_achieved || 0);
  
    this.revenueChart = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        padding: [10, 15],
        textStyle: {
          color: '#333',
          fontSize: 14,
          fontFamily: "'Readex Pro', sans-serif",
        },
        formatter: (params: any) => {

          const mobileNumber = params[0].data.mobile_number || 'N/A'; 
          let tooltipContent = `
          <strong>${params[0].name}</strong>
          <table style="border-collapse: collapse; width: 100%;">
          `;
          
          params.forEach((param: any) => {
            const color = param.color || '#000'; // Get the series color
            tooltipContent += `
              <tr>
                <td style="padding: 0px;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; margin-right: 5px; border-radius: 5px"></span>
                  ${param.seriesName}
                </td>
                <td style="width: 25px; text-align: center">-</td>
                <td style="text-align: right; padding: 1.5px;"><strong>${param.data}</strong></td>
              </tr>
            `;
          });
      
          tooltipContent += '</table>';
          return tooltipContent;
        },
      },
      legend: {
        data: ['Target', 'Achieved', 'Denied', 'Follow-Up'],
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          rotate: 45, // Set this to any angle you need; 0 means horizontal
          interval: 0, // Show all labels
          formatter: (value: any) => value // Optional: You can format the label text here
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Target',
          type: 'bar',
          stack: 'total',
          data: targetData,
          emphasis: {
            focus: 'series',
          },
          label: {
            show: false,
            position: 'inside',
          },
        },
        {
          name: 'Achieved',
          type: 'bar',
          stack: 'total',
          data: achievedData,
          emphasis: {
            focus: 'series',
          },
          label: {
            show: false,
            position: 'inside',
          },
        },

      ],
    };
  }

  initializeChart(): void {
    const chartDom = document.getElementById('referralChart')!;
    const myChart = echarts.init(chartDom);
    myChart.setOption(this.chartOption);
  }
  
}