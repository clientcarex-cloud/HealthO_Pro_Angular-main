import { Component, ElementRef, Injector, ViewChild, ViewChildren, viewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { MessageEndpoint } from '../massage.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { Editor, Toolbar } from 'ngx-editor';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SidebarComponent } from 'src/app/layouts/sidebar/sidebar.component';
import { WebsocketService } from '../message.service';

declare var docx: any;

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: MessageEndpoint,
    public timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService,
    private staffEndpoint: StaffEndpoint,
    private sanitizer: DomSanitizer,
    private websocketService: WebsocketService
  ) {
    super(injector)
  }
  
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'ordered_list', 'bullet_list'],
  ];

  @ViewChild('scrollMe') scrollMe!: ElementRef;
  editor!: Editor;
  html = '';
  messages: any;
  private lastCalled: number | null = null;
  elapsedTime: string = '';
  private timer: any = null;
  page_size: number = 10
  page_number: number = 1;
  mySelf: any;
  private mySelfSubject: Subject<number> = new Subject<number>();


  private messageSubscription!: Subscription;

  override ngOnInit(): void {
    this.editor = new Editor();

    // Subscribe to WebSocket messages
    this.messageSubscription = this.websocketService.getMessages().subscribe(
      (message) => {
        this.handleWebSocketMessage(message);
      },
      (err) => {
        console.error('WebSocket error:', err);
      }
    );

  }


  override ngAfterViewInit(): void {
    this.websocketService.getCombinedChat();
    
  }


  private handleWebSocketMessage(message: any): void {

    if(message.hasOwnProperty('msg_user')){
      this.mySelf = message.msg_user;
    }

    else if(message.hasOwnProperty('combined_chats')){
      this.messages = message.combined_chats;
    }

    else if(message.type == "start_conversation"){
      this.websocketService.getCombinedChat();
    }

    else if(message.type == "send_messages_in_conversation" || message.type == "send_messages_in_group"){

      if(message.room_group_name == this.active_id){

        this.chattings.push(message.message);

        // this.getCombinedChats();
        setTimeout(()=>{
          this.scrollToBottom();
        }, 500)
      }

    }

    else if (message.type == "create_or_edit_group"){

    }

    else if(message.type == "change_admin_or_group_access"){
      // if(message.)
      this.websocketService.getCombinedChat();
    }

    else if(message.type == "get_personal_chats"){
      this.chattings = message.messages.reverse();
      this.scrollBottom();
    }

    else if(message.type == "create_or_edit_group"){
      this.modalService.dismissAll();
      this.selectedHealthOUSers = [];
      this.start_convo_message = '';
      this.group_name = ''
      this.modalService.dismissAll();
      this.alertService.showSuccess(this.group_name, "Group Created");
    }

    else if(message.type == "get_group_chats"){
      this.chattings = message.messages.reverse();
      this.scrollBottom();
    }

  }


  scrollBottom(){
    const scroll = this.scrollMe.nativeElement.scrollHeight;
    setTimeout(() => {
      this.scrollMe.nativeElement.scrollTop = this.scrollMe.nativeElement.scrollHeight - scroll;
    }, 0); // You can adjust the delay time if needed
  }


  startConversation(){
    if (this.start_convo_message != '' && this.selectedHealthOUSers.length != 0) {
      let count = 0;
      this.selectedHealthOUSers.forEach((u: any) => {
        const messageModel = {
          type:"start_conversation",
          room_group_name:"",
          data: {
            receiver: u,
            text: this.start_convo_message
          }
        }

        this.websocketService.sendMessage(messageModel);

        count++;
        if (count == this.selectedHealthOUSers.length) {
          this.selectedHealthOUSers = []
          this.start_convo_message = '';
          this.modalService.dismissAll();
          this.alertService.showSuccess("Message Sent");
        }

      })
    } else {
      if (this.selectedHealthOUSers.length == 0) {
        this.alertService.showInfo("Select Atleast One User");
      }

      if (this.start_convo_message == '') {
        this.alertService.showInfo("Enter message to start conversation");
      }
    }
  }


  postSeen(type : any){
    const model = {
      type: type,
      room_group_name: this.active_id,
      data: { }
    }

    this.websocketService.sendMessage(model);
  }

  getPersonalConversations(chat : any, load: any= false){
    
    this.personalConvoData = chat;
    this.groupConvo = null;
    this.active_id = chat.chat_data.room_group_name;
    this.group = false;

    const model = {
      type: "get_personal_chats",
      room_group_name: chat.chat_data.room_group_name,
      data: {}
    }
    if(load){ 
      this.page_number += 25;
      model.data = {page_size : this.page_number } 
    }else{
      this.page_number = 1;
      this.chattings = [];
    }
    this.websocketService.sendMessage(model);

    this.postSeen("mark_personal_chats_as_read");
 
  }

  
























  private handleUserDetails(userData: any): void {
    this.alertService.showInfo("details received")
  }



  override ngOnDestroy(): void {
    this.timer = null;
    clearInterval(this.timer);
    this.clearMessageTimer()
    
  }


  healthoUsers: any;
  getUserSearchToStartConvo(e: any) {
    
    this.subsink.sink = this.endPoint.getUsersSearch(e).subscribe((data: any) => {
      this.healthoUsers = data.filter((d: any) => d['name'] = d.username)
    })

  }


  createUser() {
    this.subsink.sink = this.staffEndpoint.getSingleStaff(this.cookieSrvc.getCookieData().lab_staff_id).subscribe((data: any) => {
      const model = {
        username: data.name.toLowerCase().replace(/ /g, '_') + '_' + data.mobile_number.slice(-4)
      }

      this.subsink.sink = this.endPoint.postUser(model).subscribe((response: any) => {
        this.mySelf = response[0];

      }, (error) => {
        this.alertService.showError("Failed to create Messaging User")
      })

    }, (error) => {
      this.alertService.showError("Failed to create Messaging User")
    })

  }

  selectedHealthOUSers: any = [];
  start_convo_message: string = ''
  group_name: string = ''
  selectedProUsers: any =[];

  selectUsersForChattings(e: any, u_id: any) {

    if (e.target.checked) {
      this.selectedHealthOUSers.push(u_id.id);
      this.selectedProUsers.push(u_id);

    } else {
      this.selectedHealthOUSers = this.selectedHealthOUSers.filter((i: any) => i !== u_id.id);
      this.selectedProUsers = this.selectedProUsers.filter((i: any)=> i.id != u_id.id)
    }
  }

  selectUsersForChattingsbULK(e: any){
    if (e.target.checked) {
      this.selectedHealthOUSers = [];
      this.selectedProUsers = [];
      this.healthoUsers.forEach((u: any)=>{
      this.selectedHealthOUSers.push(u.id);
      this.selectedProUsers.push(u);
      })

    } else {
      this.selectedHealthOUSers = [];
      this.selectedProUsers = [];
    }
  }

  startConvo() {
    if (this.start_convo_message != '' && this.selectedHealthOUSers.length != 0) {
      let count = 0;
      this.selectedHealthOUSers.forEach((u: any) => {
        const model = {
          receiver: u,
          text: this.start_convo_message
        }
        this.subsink.sink = this.endPoint.postInitialConvo(model).subscribe((res: any) => {

          count++;
          if (count == this.selectedHealthOUSers.length) {
            this.selectedHealthOUSers = []
            this.start_convo_message = '';
            this.modalService.dismissAll();
            this.alertService.showSuccess("Message Sent");
          }

        }, (error) => {
          count++;
        })
      })
    } else {
      if (this.selectedHealthOUSers.length == 0) {
        this.alertService.showInfo("Select Atleast One User");
      }

      if (this.start_convo_message == '') {
        this.alertService.showInfo("Enter message to start conversation");
      }
    }
  }

  startGroupConvo() {
    if (this.start_convo_message != '' && this.selectedHealthOUSers.length != 0) {

      // this.subsink.sink = this.endPoint.postIntialGroupConvo(model).subscribe((res: any) => {

      const model = {
        type:"create_or_edit_group",
        room_group_name:"",
        data: {
          name: this.group_name,
          members: this.selectedHealthOUSers,
          admin: [this.mySelf.id],
          text: this.start_convo_message,
          dp: "/assets/images/no-profile-picture-icon.svg",
          client_id: this.cookieSrvc.getCookieData().client_id
        }
    }

    this.websocketService.sendMessage(model);
      


      // }, (error) => {
      //   this.alertService.showError(error)
      // })
    } else {
      if (this.selectedHealthOUSers.length == 0) {
        this.alertService.showInfo("Select Atleast One User");
      }

      if (this.start_convo_message == '') {
        this.alertService.showInfo("Enter message to start conversation");
      }
    }
  }



  // getCombinedChats(e: any = '') {
  //   this.lastCalled = Date.now();
  //   this.subsink.sink = this.endPoint.getMessages(e).subscribe((data: any) => {
  //     this.messages = data?.results || data;
  //     this.startTimer()
  //   })
  // }

  searchCombinedChats(e: any) {
    // this.getCombinedChats(e)
  }




  postSeenStatus(convo_id: any, group: boolean = false) {
    if (!group) {
      const model = {
        conversation_id: convo_id,
        is_read: true
      }

      this.subsink.sink = this.endPoint.postSeenStatus(model).subscribe((reponse: any) => {
        this.cookieSrvc.deleteMessageId(convo_id)
      }, (error) => {
        this.alertService.showError("Failed to post seen status", error)
      })
    } else {
      const model = {
        group_id: convo_id,
        is_read: true
      }

      this.subsink.sink = this.endPoint.postSeenStatusInGroup(model).subscribe((reponse: any) => {
        // this.alertService.showSuccess("Seen Status Posted");
        this.cookieSrvc.deleteMessageId(convo_id)
      }, (error) => {
        this.alertService.showError("Failed to post seen status", error)
      })
    }

  }

  personalConvoData!: any;
  height: any = '0px';

  getPersonalConvo(chat: any, load: boolean = false) {
    this.personalConvoData = chat;
    this.groupConvo = null;
    this.active_id = chat.chat_data.id;
    this.group = false;

    this.postSeenStatus(chat.chat_data.id);
    // this.getCombinedChats();

    if (load) {
      this.page_number += 1
    } else {
      this.page_number = 1;
      this.page_size = chat.chat_data?.self_unread_messages !== 0 ? chat.chat_data?.self_unread_messages < 15 ? 15 : chat.chat_data?.self_unread_messages : 15;
    }

    this.subsink.sink = this.endPoint.getChat(chat.chat_data.id, this.page_size, this.page_number).subscribe((data: any) => {
      if (load) {
        const temp: any = [];
        const scroll = this.scrollMe.nativeElement.scrollHeight;
        data.results = data.results.reverse();
        data.results.forEach((msg: any) => {
          temp.push(msg)
        })
        this.chattings.forEach((msg: any) => {
          temp.push(msg)
        })

        this.chattings = temp

        setTimeout(() => {
          this.scrollMe.nativeElement.scrollTop = this.scrollMe.nativeElement.scrollHeight - scroll;
        }, 0); // You can adjust the delay time if needed

      } else {

        this.chattings = data.results.reverse();
        setTimeout(() => {
          this.scrollToBottom();
        }, 0); // You can adjust the delay time if needed
      }

    })

  }

  test() {
    this.alertService.showError(this.scrollMe.nativeElement.scrollHeight)
    this.height = 0;
  }

  chatscroll() {
    const element = this.scrollMe.nativeElement;
    if (element.scrollTop === 0) {
      if (this.group) {
        this.getGroupConversations(this.groupConvo, true)
      } else {
        // this.getPersonalConvo(this.personalConvoData, true)
        this.getPersonalConversations(this.personalConvoData, true)
      }

    }
  }

  // file: File | null = null; // Variable to hold the selected file
  files: any = [];
  openedFile: any;
  safeUrl: any
  @ViewChild('viewImage') viewImage: any;
  @ViewChild('viewPdf') viewPdf: any;

  openFile(file: any, content: any) {
    this.openedFile = file.file_name;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(file.file);
    if (file.file_name.includes('.pdf') || file.file_name.includes('.html')) {
      this.openXl(this.viewPdf, 'xl');
    } else if (file.file_name.includes('.jpg') || file.file_name.includes('.jpeg') || file.file_name.includes('.png')) {
      this.openXl(this.viewImage, 'xl');
    }
    else {
      this.alertService.showError("Can't Open this File")
    }

  }

  openDocument(base64Content: string) {
    const file = base64Content;
    let currentDocument = file;

    const docxOptions = Object.assign(docx.defaultOptions, {
      className: "docx",
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      ignoreLastRenderedPageBreak: true,
      experimental: false,
      trimXmlDeclaration: true,
      useBase64URL: false,
      useMathMLPolyfill: false,
      renderChanges: false,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
      debug: false,
    });

    docx.renderAsync(currentDocument, document.getElementById("container"), null, docxOptions)
      .then((x: any) => {

      });
  }

  downloadFile(base64String: any, fileName: any) {
    const linkSource = base64String;
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    downloadLink.href = linkSource;
    downloadLink.target = '_self';
    downloadLink.download = fileName;
    downloadLink.click();
  }



  removeFile(e: any) {
    this.files = this.files.filter((f: any) => f.file_name != e)
  }

  onFileSelected(e: any) {
    const files: FileList | null = e.target.files;
    const maxSizeInBytes = 15 * 1024 * 1024; // 15MB in bytes
    const filesToAdd: { file_name: string, file: string }[] = [];

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const selectedFile: File = files[i];

        // Check if file size is below 15MB
        if (selectedFile.size <= maxSizeInBytes) {
          const model = {
            file_name: selectedFile.name,
            file: ""
          };

          // Read file content as base64
          const reader = new FileReader();
          reader.onload = (event) => {
            // Assign base64 encoded string to model.file
            model.file = event.target?.result as string;

          };

          reader.readAsDataURL(selectedFile);
          filesToAdd.push(model);
        } else {
          // Handle error or inform user about file size limit exceeded
          this.alertService.showError(`File ${selectedFile.name} exceeds the 15MB size limit.`);
          // Optionally, you could notify the user here about the size limit.
        }
      }
    }

    // Add valid files to this.files array
    this.files.push(...filesToAdd);
  }


  sendMessage(type: any) {
    if ((this.msg_text && this.msg_text !== "") || this.files.length != 0) {

      const model = {
        type: type,
        room_group_name: this.active_id,
        data: {
          text: this.msg_text.replace(/<p><\/p>/g, ''),
          attachment: this.files
        }
      }

      this.msg_text = '';
      this.files = [];

      this.websocketService.sendMessage(model);

    } else {
      this.alertService.showError("Message may not blank", "")
    }

  }

  groupConvo!: any;
  editGrpName: boolean = false;
  groupNameEdit(e: boolean) {
    if (e) {
      this.editGrpName = true
    } else {
      this.editGrpName = false
    }

  }

  saveGroupName() {
    // const model = {
    //   name: this.groupConvo.group_data.name,
    //   dp: this.groupConvo.group_data.dp
    // }
    // this.subsink.sink = this.endPoint.updateGroupName(model, this.groupConvo.group_data.id).subscribe((reponse: any) => {
    //   this.editGrpName = false;
    // }, (error) => {
    //   this.alertService.showError("Error in updating the group name")
    // })

    const model: any = {
      type: "create_or_edit_group",
      room_group_name: this.active_id,
      data : {
        name: this.groupConvo.group_data.name,
        dp: this.groupConvo.group_data.dp,
        group_id: this.groupConvo.group_data.id,
      }
    }

    this.websocketService.sendMessage(model);

    this.editGrpName = false;
  }
  

  getGroupConversations(chat: any, load: boolean = false){
    this.editGrpName = false;
    this.groupConvo = chat;
    this.group = true;
  
    this.personalConvoData = null;
    this.active_id = chat.group_data.room_group_name;

    const model = {
      type: "get_group_chats",
      room_group_name: chat.group_data.room_group_name,
      data: {}
    }

    if(load){ 
      this.page_number += 25;
      model.data = {page_size : this.page_number } 
    }else{
      this.page_number = 1;
      this.chattings = [];
    }

    this.websocketService.sendMessage(model);
    this.postSeen("mark_group_messages_as_read");

  }

  getGroupConvo(chat: any, load: boolean = false) {
    this.editGrpName = false;
    this.groupConvo = chat;
    this.personalConvoData = null;
    this.active_id = chat.group_data.id;
    this.group = true;
    this.postSeenStatus(chat.group_data.id, true);
    // this.getCombinedChats();

    if (load) {
      this.page_number += 1
    } else {
      this.page_number = 1;
      this.page_size = chat.group_data?.current_user_unread_messages_count !== 0 ? chat.group_data?.current_user_unread_messages_count < 15 ? 15 : chat.group_data?.current_user_unread_messages_count : 15;
    }

    this.subsink.sink = this.endPoint.getGroupChat(chat.group_data.id, this.page_size, this.page_number).subscribe((data: any) => {
      if (load) {
        const temp: any = [];
        const scroll = this.scrollMe.nativeElement.scrollHeight;
        data.results = data.results.reverse();
        data.results.forEach((msg: any) => {
          temp.push(msg)
        })
        this.chattings.forEach((msg: any) => {
          temp.push(msg)
        })

        this.chattings = temp
        
        setTimeout(() => {
          this.scrollMe.nativeElement.scrollTop = this.scrollMe.nativeElement.scrollHeight - scroll;
        }, 0); // You can adjust the delay time if needed

      } else {

        this.chattings = data.results.reverse();

        setTimeout(() => {
          
        if(this.page_number = 1){
          this.scrollToBottom();
        }

        }, 0); // You can adjust the delay time if needed
      }

    })

    // this.startMessageTimer();
  }

  getGroupConvoUserDp(id: any){
    return this.groupConvo?.group_data?.members?.find((mem: any) => mem.id == id)?.dp || "/assets/images/no-profile-picture-icon.svg"
  }

sortGroupConvo(){
  this.groupConvo.group_data.members =   this.groupConvo.group_data.members.sort((a: any, b: any) => {
    // Check if current id is in admin array
    const isAdminA = this.groupConvo.group_data.admin.includes(a.id);
    const isAdminB = this.groupConvo.group_data.admin.includes(b.id);

    // Sort logic based on isAdmin values
    if (isAdminA && !isAdminB) {
        return -1; // a should come before b
    } else if (!isAdminA && isAdminB) {
        return 1; // b should come before a
    } else {
        return 0; // leave them unchanged relative to each other
    }
});
}
  sendGroupMessage() {
    if ((this.msg_text && this.msg_text !== "") || this.files.length != 0) {

      const model = {
        text: this.msg_text.replace(/<p><\/p>/g, ''),
        attachment: this.files
      }

      this.subsink.sink = this.endPoint.postMessageInGroup(model, this.active_id).subscribe((response: any) => {
        this.alertService.showSuccess("Message Sent");
        this.msg_text = '';
        this.files = [];
        this.getGroupConvo(this.groupConvo)
      })
    } else {
      this.alertService.showError("Message may not blank", "")
    }

  }


  removeMemFromGroup(mem: any, self: any = false) {
    const model: any = {
      type: "change_admin_or_group_access",
      room_group_name: this.active_id,
      data : {
        members: [],
        leave_group: true,
        remove_admin: false,
        make_admin: false
      }
    }

    if(!self){
      model.data.members = [mem.id]
    }

    this.websocketService.sendMessage(model);
    this.groupConvo.group_data.members = this.groupConvo?.group_data?.members.filter((m: any) => m.id != mem.id);

    
  }

  giveAdminAccess(mem: any) {
    // const model = {
    //   members: [mem.id]
    // }

    // this.subsink.sink = this.endPoint.postAddAdmin(model, this.groupConvo.group_data.id).subscribe((reponse: any) => {
    //   this.alertService.showInfo(mem.username + " had Admin Access", this.groupConvo?.group_data?.name);
    //   this.groupConvo.group_data.admin.push(mem.id);
    //   this.getGroupConvo(this.groupConvo);
    // }, (error) => {
    //   this.alertService.showError("Failed to Remove " + mem.name + " from group.")
    // })

    this.groupConvo.group_data.admin.push(mem.id);
    const model: any = {
      type: "create_or_edit_group",
      room_group_name: this.active_id,
      data : {
        admin: this.groupConvo.group_data.admin,
        group_id: this.groupConvo.group_data.id,
        
      }
    }

      this.websocketService.sendMessage(model);
  }

  hideAddMem: boolean = false;

  addMembersToGroup(mem: any) {
    // const model = {
    //   members: [mem.id]
    // }

    // this.subsink.sink = this.endPoint.postAddMemberInGroup(model, this.groupConvo.group_data.id).subscribe((reponse: any) => {
    //   this.alertService.showInfo(mem.username + " added", this.groupConvo?.group_data?.name);
    //   this.groupConvo.group_data.members.push(mem);
    //   this.groupConvo.group_data.admin = this.groupConvo?.group_data?.admin.filter((m: any) => m != mem.id)
    //   this.getGroupConvo(this.groupConvo);
    // }, (error) => {
    //   this.alertService.showError("Failed to Add " + mem.name + " from group.")
    // })
    const currMems = this.groupConvo?.group_data?.members.map((m: any) => m.id);

    const model: any = {
      type: "create_or_edit_group",
      room_group_name: this.active_id,
      data : {
        members: [mem.id, ...currMems],
        group_id: this.groupConvo.group_data.id,
      }
    }



      this.websocketService.sendMessage(model);
      this.groupConvo.group_data.members.push(mem);
      this.groupConvo.group_data.admin = this.groupConvo?.group_data?.admin.filter((m: any) => m != mem.id)

    
  }

  RemoveAdminAccess(mem: any) {
    const model = {
      admin: [mem.id]
    }

    this.subsink.sink = this.endPoint.postRemoveAdminsInGroup(model, this.groupConvo.group_data.id).subscribe((reponse: any) => {
      this.alertService.showInfo(mem.username + " Admin Access Removed", this.groupConvo?.group_data?.name);
      // this.groupConvo.group_data.members.push(mem);
      this.groupConvo.group_data.admin = this.groupConvo?.group_data?.admin.filter((m: any) => m != mem.id)
      this.getGroupConvo(this.groupConvo);
    }, (error) => {
      this.alertService.showError("Failed to Add " + mem.name + " from group.")
    })
  }


  // exitGroup()

  // chat: any;
  forward_chat: any ;
  forward_Chat_members!: any;
  chat_members: any ;
  forwardMessageToChat(chat: any, bool:boolean = false){
    this.forward_chat = chat;
    let list : any = [];

    this.messages.forEach((msg: any)=>{
      if(msg.group){
        const model = {
          selected: bool,
          name: msg.name,
          id: msg.group_data.id,
          group: true,
          room_group_name : msg.group_data.room_group_name,
          type: 'send_messages_in_group',
          dp: msg.group ? msg.group_data.dp && msg.group_data.dp!='' ? msg.group_data.dp : '/assets/images/no-profile-picture-icon.svg': '/assets/images/no-profile-picture-icon.svg'
        }

        list.push(model);
      }else{
        const model = {
          selected: bool,
          name: msg.chat_data?.partner?.username,
          id: msg.chat_data.id,
          group: false,
          type: 'send_messages_in_conversation',
          room_group_name : msg.chat_data.room_group_name,
          dp:  msg.chat_data?.partner?.dp && msg.chat_data?.partner?.dp !='' ? msg.chat_data?.partner?.dp : '/assets/images/no-profile-picture-icon.svg'
        }

        list.push(model);
      }
    })

    this.forward_Chat_members = list;
  }

  selectForward(item: any, e: any){
    item.selected = e
  }

  forward_loading: boolean = false;

  async forWard() {

    this.forward_loading = true;

    for (const mem of this.forward_Chat_members) {
      if (mem.selected) {

        const model = {
          type: mem.type,
          room_group_name: mem.room_group_name,
          data: {
          text: this.forward_chat.text,
          attachment: this.forward_chat.attachment
          }
        }
        if(mem.group){
          // await this.forWardInChat(true, model, mem.id);
          this.websocketService.sendMessage(model);
        }else{
          // await this.forWardInChat(false, model, mem.id);
          this.websocketService.sendMessage(model);
        }

        // this.getCombinedChats();
        this.modalService.dismissAll();
      }
    }
  }

  

  async forWardInChat(group: boolean, model: any, id: any ){
    if(group){
      this.subsink.sink = this.endPoint.postMessageInGroup(model, id).subscribe((response: any) => {
        this.alertService.showSuccess("Message Sent");
      })
    }else{
      this.subsink.sink = this.endPoint.postMessage(model, id).subscribe((response: any) => {
        this.alertService.showSuccess("Message Sent");
    
      })
    }
  }
  



























  getChats(changeActive: boolean = false) {
    this.subsink.sink = this.endPoint.getMessages().subscribe((data: any) => {
      this.messages = data.results;
    })
  }

  chattings: any;
  chat: any;
  active_id: any;
  group: boolean = false;
  clicked_data: any;

  members: any;
  getChattings(data: any, get: boolean = false, changeActive: boolean = true) {
    this.clicked_data = data;
    this.closeOpened();
    if (changeActive) {
      data.opened = true;
    }

    this.focusMessage();
    if (!data.group) {
      this.group = false;
      this.alertService.showError("")
      this.chat = data.chat_data;
      this.active_id = data.chat_data.id;

    } else {
      this.chat = data.group_data;
      this.group = true;

      this.active_id = data.group_data.id;
    }

  }
  private intervalId: any;


  clearMessageTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  closeOpened() {
    this.messages.forEach((msg: any) => {
      msg.opened = false;
    })
  }

  focusMessage() {
    const box = document.getElementById("messageInput") as HTMLInputElement;
    if (box) {
      box.focus()
    }
  }

  msg_text: any = '';
  writeMessage(e: any) {
    this.msg_text = e
  }


  openXl(content: any, sz: any = '', cntr: boolean = false) {
    this.modalService.open(content, { size: sz  , centered: cntr})
  }

  users: any;
  getUsers(e: any) {
  
  }

  checkAdmin(mem: any) {

  }



















  // utility functions here 
  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      if (this.lastCalled === null) {
        this.elapsedTime = '';
        return;
      }

      const now = Date.now();
      const diff = now - this.lastCalled; // Difference in milliseconds

      const minutes = Math.floor(diff / (60 * 1000));
      if (minutes < 60) {
        if (minutes < 1) {
          this.elapsedTime = `Just Now`;
        } else {
          this.elapsedTime = `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
        }
      } else {
        this.elapsedTime = 'More than 59 mins ago';
      }
    }, 1000);
  }


  scrollToBottom(): void {
    try {
      this.scrollMe.nativeElement.scrollTop = this.scrollMe.nativeElement.scrollHeight;
    } catch (err) { }
  }

  getMemberName(sender_id: any) {
    return this.groupConvo?.group_data?.members?.find((mem: any) => mem.id == sender_id)?.username
  }


  startMessageTimer() {
    this.clearMessageTimer(); // Clear any existing timer
    this.intervalId = setInterval(() => {
      this.group ? this.getGroupConvo(this.groupConvo) : this.getPersonalConvo(this.personalConvoData) ;
    }, 15000); // 5000ms = 5 seconds
  }


  onFileChanged(event: any, type: any): void {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file).then((base64String: string) => {
        // Assign base64 string to form control
        if(type=='group'){
          this.groupConvo.group_data.dp = base64String;
        }else{
          this.mySelf.dp = base64String;
          this.mySelfSubject.next(this.mySelf);
        }

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

  closeProfile: boolean = false;

  updateUserName(e: any){
    e.replace("@healtho", "")
    if(e && e!= '' && e.split("").length <= 20){
      this.mySelf.username = e.replace(/ /g, "_").toLowerCase().replace('@healtho', '');
      this.mySelfSubject.next(this.mySelf)
    }else{
      e && e == '' ? this.alertService.showInfo("Username may no blank") : null;
      e && e.split("").length > 20 ? this.alertService.showInfo("Username may not be more than 20 characters.") : null
    }

  }
  
  user_name_ok: boolean | null = null;
  updateUserProfile(){
    this.subsink.sink = this.endPoint.updateUserDetails(this.mySelf, this.mySelf.id).subscribe((res : any)=>{
      this.user_name_ok = true;
    }, (error)=>{
      this.user_name_ok = false;

      this.alertService.showError(error)
    })
  }


}
