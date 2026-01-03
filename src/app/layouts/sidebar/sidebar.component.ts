import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from './menu.model';
import { SideBarEndPoint } from '../endpoints/sidebar.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { MessageEndpoint } from 'src/app/message/massage.endpoint';
import { MessageService } from '../message.services';
import { PushNotificationService } from 'ng-push-notification';
import { Subscription, interval } from 'rxjs';
import { WebsocketService } from 'src/app/message/message.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent extends BaseComponent<any> {

  menu: any;
  toggle: any = false;

  menuItems: any = [];
  accessItems: any = [];
  staffId!: number;
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();
  manageStackObj = { label: 'MANAGEMENT STACK', isTitle: true, };

  OutSourcingStackObj = { label: 'SOURCING', isTitle: true, };

  testRadiologyReport: any = {
    label: "Analytics",
    ordering: 14,
    icon: "ri-line-chart-line",
    link: "/analytic/analytics",
    is_active: true,
  }

  testRadiologyRssseport: any = {
    label: "Nursing Station",
    ordering: '',
    icon: "ri-nurse-line",
    link: "/nursingstation",
    is_active: true,
  }

  extraMenu : any = {
    id: 16000,
    label: 'Sourcing',
    icon: 'lab la-delicious',
    subItems: [
      {
        id: 16001,
        label: 'Patients',
        link: '/admin/idsettings',
        // parentId: 1000
      },
      {
        id: 16002,
        label: 'Collaborations',
        link: '/admin/deptgroups',
        // parentId: 1000
      },
    ]
  }

  constructor(
    injector: Injector,
    private router: Router,
    private endPoint: SideBarEndPoint,
    private proEndpoint: ProEndpoint,
    private staffEndpoint: StaffEndpoint,
    private messageEndpoint: MessageEndpoint,

    public translate: TranslateService,
    private cookieSrvc: CookieStorageService,
    private websocketService: WebsocketService,
    private pushNotification: PushNotificationService
  ) {
    super(injector);
    translate.setDefaultLang('en');
  }



  unreadMesgs: any = 0;

  private messageSubscription!: Subscription;


  override ngOnInit(): void {
    // Menu Items
    this.toggleMobileMenu("");

    if(!this.cookieSrvc.is_sa_login()){
      if (this.cookieSrvc.getUserType() === 3) {
        this.getMenus() ;
      } else {
        this.menuItems = [
          {
            id: 13,
            label: "Dashboard",
            ordering: 13,
            icon: "ri-file-paper-line",
            link: "/dashboard",
            is_active: true,
            added_on: "2024-03-09T23:16:47.741317",
            last_updated: "2024-03-09T23:16:47.741317",
            health_care_registry_type: 1
          }
        ]
      }
    }else{

      this.menuItems = [
        {
          id: 1,
          label: "Clients",
          ordering: 13,
          icon: "ri-community-line",
          link: "/admin/client",
          is_active: true,
        },
        {
          id: 2,
          label: "Global Settings",
          ordering: 13,
          icon: "ri-settings-3-line",
          link: "/admin/gs",
          is_active: true,
        },
        {
          id: 3,
          label: "Plans",
          ordering: 13,
          icon: "ri-pulse-line",
          link: "/admin/plans",
          is_active: true,
        }
      ]

    }


    this.startMessagesCount()

  }

  getMenus(){
    const data = this.cookieSrvc.getCookieData();

    this.subsink.sink = this.staffEndpoint.getStaffMenuAccess(data.lab_staff_id).subscribe((accesed: any) => {
      this.accessItems = accesed?.results[0]?.lab_menu || [];

      this.subsink.sink = this.proEndpoint.getMenus().subscribe((menus: any) => {
 
        menus.forEach((m: any) => {
          if (m.is_active && this.accessItems.includes(m.id)) {

            if( m.id == 20 || m.id == 21){
              if (!this.menuItems.some((item: any) => item.label === this.OutSourcingStackObj.label && item.isTitle === this.OutSourcingStackObj.isTitle)) {
                this.menuItems.push(this.OutSourcingStackObj)
              }
            }

            if ( m.id === 10 || m.id === 11 || m.id == 12 || m.id === 14 || m.id === 15 || m.id == 22) {
              if (!this.menuItems.some((item: any) => item.label === this.manageStackObj.label && item.isTitle === this.manageStackObj.isTitle)) {
                this.menuItems.push(this.manageStackObj)
              }
            }
            this.menuItems.push(m);
          }
        })
      })
    })
  }


  startMessagesCount() {
    this.messageSubscription = this.websocketService.getMessages().subscribe(
      (message) => {
        this.handleWebSocketMessage(message);
      },
      (err) => {
        // console.error('WebSocket error:', err);
      }
    );


    const model = {
      type: 'get_total_messages_count',
      room_group_name: "",
      data: {}
    }
    this.websocketService.sendMessage(model)
  }


  private handleWebSocketMessage(message: any): void {

    if (message.type == 'get_total_messages_count') {
      if (message.total_unread_messages_count.total_messages_count != 0) {
        this.unreadMesgs = message.total_unread_messages_count.total_messages_count
      }

    }

  }

  override ngOnDestroy(): void {
    // Clean up the timer subscription when the component is destroyed
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private timerSubscription: Subscription | undefined;

  startTimer(): void {
    // Call getUnreadMsgs() immediately when starting the timer
    this.getUnreadMsgs();

    // Use interval from RxJS to create a timer that triggers every 3 minutes
    this.timerSubscription = interval(2 * 60 * 1000) // Interval in milliseconds (3 minutes)
      .subscribe(() => {
        this.getUnreadMsgs();
      });
  }


  async getCombinedChats(e: any = '') {
    try {
      const data: any = await this.messageEndpoint.getMessages(e, 5).toPromise();

      for (const d of data.results) {
        if (!d.group && d.chat_data.self_unread_messages !== 0) {
          if (!this.cookieSrvc.showedMessages(d.chat_data.id, d.chat_data.self_unread_messages)) {
            await this.showPush(d.latest_message.text, d.chat_data.partner.dp, d.chat_data.partner.username);
          }
        } else if (d.group && d.group_data.current_user_unread_messages_count !== 0) {
          if (!this.cookieSrvc.showedMessages(d.group_data.id, d.group_data.current_user_unread_messages_count)) {
            await this.showPush(d.latest_message.text, d.group_data.dp || '', d.name);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }



  private async showPush(text: any, icon_dp: any, name: any) {
    // Simulate a slight delay to avoid overwriting notifications
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Or simply this:
    this.pushNotification.show(name, {
      icon: icon_dp,
      body: text,
      sound: "/assets/images/tone.wav",
      silent: false
    });
  }

  getUnreadMsgs(show: boolean = true) {
    this.subsink.sink = this.messageEndpoint.getunreadMessagesCount().subscribe((res: any) => {
      const newUnreadMesgs = res.total_messages_count;

      // Check if there are new unread messages
      if (newUnreadMesgs > this.unreadMesgs && show) {
        this.unreadMesgs = newUnreadMesgs;
        this.getCombinedChats(); // Display notifications for new unread messages
      }
    });
  }



  /***
   * Activate droup down set
   */
  override ngAfterViewInit() {
    this.initActiveMenu();
    //this.toggleMobileMenu(null);
  }

  removeActivation(items: any) {
    items.forEach((item: any) => {
      if (item.classList.contains("menu-link")) {
        if (!item.classList.contains("active")) {
          item.setAttribute("aria-expanded", false);
        }
        (item.nextElementSibling) ? item.nextElementSibling.classList.remove("show") : null;
      }
      if (item.classList.contains("nav-link")) {
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
        item.setAttribute("aria-expanded", false);
      }
      item.classList.remove("active");
    });
  }

  toggleSubItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;
    let dropDowns = Array.from(document.querySelectorAll('.sub-menu'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });

    let subDropDowns = Array.from(document.querySelectorAll('.menu-dropdown .nav-link'));
    subDropDowns.forEach((submenu: any) => {
      submenu.setAttribute('aria-expanded', "false");
    });

    if (event.target && event.target.nextElementSibling) {
      isCurrentMenuId.setAttribute("aria-expanded", "true");
      event.target.nextElementSibling.classList.toggle("show");
    }
  };

  toggleExtraSubItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;
    let dropDowns = Array.from(document.querySelectorAll('.extra-sub-menu'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });

    let subDropDowns = Array.from(document.querySelectorAll('.menu-dropdown .nav-link'));
    subDropDowns.forEach((submenu: any) => {
      submenu.setAttribute('aria-expanded', "false");
    });

    if (event.target && event.target.nextElementSibling) {
      isCurrentMenuId.setAttribute("aria-expanded", "true");
      event.target.nextElementSibling.classList.toggle("show");
    }
  };

  toggleItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;
    if (isMenu.classList.contains("show")) {
      isMenu.classList.remove("show");
      isCurrentMenuId.setAttribute("aria-expanded", "false");
    } else {
      let dropDowns = Array.from(document.querySelectorAll('#navbar-nav .show'));
      dropDowns.forEach((node: any) => {
        node.classList.remove('show');
      });
      (isMenu) ? isMenu.classList.add('show') : null;
      const ul = document.getElementById("navbar-nav");
      if (ul) {
        const iconItems = Array.from(ul.getElementsByTagName("a"));
        let activeIconItems = iconItems.filter((x: any) => x.classList.contains("active"));
        activeIconItems.forEach((item: any) => {
          item.setAttribute('aria-expanded', "false")
          item.classList.remove("active");
        });
      }
      isCurrentMenuId.setAttribute("aria-expanded", "true");
      if (isCurrentMenuId) {
        this.activateParentDropdown(isCurrentMenuId);
      }
    }
  }

  // remove active items of two-column-menu
  activateParentDropdown(item: any) {
    item.classList.add("active");
    let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

    if (parentCollapseDiv) {
      // to set aria expand true remaining
      parentCollapseDiv.classList.add("show");
      parentCollapseDiv.parentElement.children[0].classList.add("active");
      parentCollapseDiv.parentElement.children[0].setAttribute("aria-expanded", "true");
      if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
        parentCollapseDiv.parentElement.closest(".collapse").classList.add("show");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse")) {
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").classList.add("show");
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").previousElementSibling.classList.add("active");
        }
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  initActiveMenu() {
    const pathName = window.location.pathname;
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      let activeItems = items.filter((x: any) => x.classList.contains("active"));
      this.removeActivation(activeItems);

      let matchingMenuItem = items.find((x: any) => {
        return x.pathname === pathName;
      });
      if (matchingMenuItem) {
        this.activateParentDropdown(matchingMenuItem);
      }
    }
  }

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * Toggle the menu bar when having mobile screen
   */

  mobileMenu = false;

  toggleMobileMenu(event: any) {
    var sidebarsize = document.documentElement.getAttribute("data-sidebar-size");
    if (sidebarsize == 'sm-hover-active') {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover');
      this.mobileMenu = false; // Close sidebar
    } else {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover-active');
      this.mobileMenu = true; // Open sidebar
    }
  }


  /**
   * SidebarHide modal
   * @param content modal content
   */
  SidebarHide() {
    document.body.classList.remove('vertical-sidebar-enable');
  }

























  sideMenus: any = [
    {
      "id": 1,
      "label": "Dashboard",
      "ordering": 1,
      "icon": "ri-home-4-line",
      "link": "/dashboard",
      "is_active": true,
      "added_on": "2024-03-09T22:57:34.753848",
      "last_updated": "2024-06-19T16:44:24.262288",
      "health_care_registry_type": 1
    },
    {
      "id": 16,
      "label": "Appointments",
      "ordering": 2,
      "icon": "ri-bookmark-3-line",
      "link": "/patient/appointments",
      "is_active": true,
      "added_on": "2024-07-12T17:52:59.083934",
      "last_updated": "2024-07-13T10:04:00.634133",
      "health_care_registry_type": 1
    },
    {
      "id": 2,
      "label": "Patients",
      "ordering": 3,
      "icon": "ri-team-line",
      "link": "/patient/patients",
      "is_active": true,
      "added_on": "2024-03-09T23:09:31.942140",
      "last_updated": "2024-07-12T17:54:19.590521",
      "health_care_registry_type": 1
    },
    {
      "id": 3,
      "label": "Phlebotomist",
      "ordering": 4,
      "icon": "ri-test-tube-line",
      "link": "/phlebotomist/phlebotomists",
      "is_active": true,
      "added_on": "2024-03-09T23:10:30.412860",
      "last_updated": "2024-07-12T17:55:35.650455",
      "health_care_registry_type": 1
    },
    {
      "id": 4,
      "label": "Lab Technician",
      "ordering": 5,
      "icon": "ri-microscope-line",
      "link": "/labtechnican/labtechnicians",
      "is_active": true,
      "added_on": "2024-03-09T23:11:02.812154",
      "last_updated": "2024-07-12T17:55:42.504806",
      "health_care_registry_type": 1
    },
    {
      "id": 13,
      "label": "Transcriptor",
      "ordering": 6,
      "icon": "ri-body-scan-line",
      "link": "/radiology/radiologists",
      "is_active": true,
      "added_on": "2024-05-03T10:19:29.162337",
      "last_updated": "2024-07-12T17:55:47.687121",
      "health_care_registry_type": 1
    },
    {
      "id": 5,
      "label": "Dr Authorization",
      "ordering": 7,
      "icon": "ri-newspaper-line",
      "link": "/drauthorization/authorization",
      "is_active": true,
      "added_on": "2024-03-09T23:11:36.232752",
      "last_updated": "2024-07-12T17:55:58.835253",
      "health_care_registry_type": 1
    },
    {
      "id": 17,
      "label": "Home Services",
      "ordering": 8,
      "icon": "ri-map-pin-line",
      "link": '/homeservice/homeservices',
      "is_active": true,
      "added_on": "2024-03-09T23:11:36.232752",
      "last_updated": "2024-07-12T17:55:58.835253",
      "health_care_registry_type": 1
    },
    {
      "id": 6,
      "label": "Doctors",
      "ordering": 9,
      "icon": "ri-stethoscope-line",
      "link": "/doctor/doctors",
      "is_active": true,
      "added_on": "2024-03-09T23:12:06.904358",
      "last_updated": "2024-07-12T17:56:31.582202",
      "health_care_registry_type": 1
    },
    {
      "id": 7,
      "label": "Manage Payments",
      "ordering": 10,
      "icon": "bi bi-currency-rupee",
      "link": "/managepayment/managepayments",
      "is_active": true,
      "added_on": "2024-03-09T23:12:47.811988",
      "last_updated": "2024-07-12T17:56:44.546988",
      "health_care_registry_type": 1
    },
    {
      "id": 8,
      "label": "Referral Lab",
      "ordering": 11,
      "icon": "ri-community-line",
      "link": "/referrallab/labs",
      "is_active": true,
      "added_on": "2024-03-09T23:13:14.241354",
      "last_updated": "2024-07-12T17:56:53.260541",
      "health_care_registry_type": 1
    },
    {
      "id": 9,
      "label": "Lab Packages",
      "ordering": 12,
      "icon": "ri-article-line",
      "link": "/labpackage/labpackages",
      "is_active": true,
      "added_on": "2024-03-09T23:13:14.241354",
      "last_updated": "2024-07-12T17:56:53.260541",
      "health_care_registry_type": 1
    },
    {
      "id": 10,
      "label": "Privilege Card",
      "ordering": 13,
      "icon": "ri-bank-card-line",
      "link": "/loyaltycard",
      "is_active": true,
      "added_on": "2024-03-09T23:13:14.241354",
      "last_updated": "2024-07-12T17:56:53.260541",
      "health_care_registry_type": 1
    },
    {
      "id": 11,
      "label": "Bulk Messaging",
      "ordering": 14,
      "icon": "ri-mail-send-fill",
      "link": "/bulkmessaging",
      "is_active": true,
      "added_on": "2024-03-09T23:13:14.241354",
      "last_updated": "2024-07-12T17:56:53.260541",
      "health_care_registry_type": 1
    },
    {
      "id": 12,
      "label": "NABL",
      "ordering": 15,
      "icon": "ri-award-line",
      "link": "/nabl/nablcomp",
      "is_active": true,
      "added_on": "2024-03-09T23:15:09.531809",
      "last_updated": "2024-07-12T17:57:34.377625",
      "health_care_registry_type": 1
    },
    {
      "id": 15,
      "label": "Messages",
      "ordering": 16,
      "icon": "ri-message-2-line",
      "link": "/message/messages",
      "is_active": true,
      "added_on": "2024-06-19T16:43:03.135406",
      "last_updated": "2024-07-12T17:57:44.323783",
      "health_care_registry_type": 1
    },
    {
      "id": 14,
      "label": "Analytics",
      "ordering": 17,
      "icon": "ri-line-chart-line",
      "link": "/analytic/analytics",
      "is_active": true,
      "added_on": "2024-05-17T13:35:05.645307",
      "last_updated": "2024-07-12T17:57:52.002947",
      "health_care_registry_type": 1
    },
    {
      "id": 18,
      "label": "Staff",
      "ordering": 18,
      "icon": "ri-account-box-line",
      "link": "/staff/main",
      "is_active": true,
      "added_on": "2024-03-09T23:15:35.704240",
      "last_updated": "2024-07-12T17:57:59.811986",
      "health_care_registry_type": 1
    },
    {
      "id": 19,
      "label": "Accounts",
      "ordering": 19,
      "icon": "ri-database-2-line",
      "link": "/account/main",
      "is_active": true,
      "added_on": "2024-03-09T23:16:04.102219",
      "last_updated": "2024-07-12T17:58:06.887020",
      "health_care_registry_type": 1
    },
    {
      "id": 20,
      "label": "Inventory",
      "ordering": 20,
      "icon": "ri-home-gear-line",
      "link": "/inventory",
      "is_active": true,
      "added_on": "2024-03-09T23:16:04.102219",
      "last_updated": "2024-07-12T17:58:06.887020",
      "health_care_registry_type": 1
    },
    {
      "id": 21,
      "label": "Setup",
      "ordering": 21,
      "icon": "ri-settings-4-line",
      "link": "/setup/tweaks",
      "is_active": true,
      "added_on": "2024-03-09T23:16:47.741317",
      "last_updated": "2024-07-12T17:58:15.077921",
      "health_care_registry_type": 1
    }
  ]


}
