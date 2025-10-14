// angular import
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../theme/shared/components/card/card.component';

// primeng imports
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

// project import
import { ApplicationService } from '../applications/application.service';
import { ConfigService } from '../config.service';
import { NotificationService } from '../core/notification.service';
import { CollectionUtil } from '../core/system.utils';


@Component({
  selector: 'app-sender-id',
  imports: [CardComponent, ReactiveFormsModule, CommonModule, TableModule, ButtonModule, TagModule, TooltipModule, DropdownModule],
  templateUrl: './sender-id.component.html',
  styleUrls: ['./sender-id.component.css']
})
export class SenderIdComponent implements OnInit {
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);
  private applicationService = inject(ApplicationService);
  private formBuilder = inject(FormBuilder);

  senderIdForm: FormGroup;
  senderIds: any[] = [];
  isLoading: boolean = false;

  // Application dropdown properties
  applications: any[] = [];

  constructor() {
    this.senderIdForm = this.formBuilder.group({
      senderId: ['', [Validators.required, Validators.maxLength(11)]],
      applicationId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadSenderIds();
    this.loadApplications();
  }

  async loadSenderIds() {
    this.isLoading = true;
    try {
      const response = await this.configService.getSenderIds();
      this.senderIds = response.data;
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading sender IDs:', error);
      this.notificationService.error('Failed to load sender IDs');
      this.isLoading = false;
      // Fallback to empty array for now
      this.senderIds = [];
    }
  }

  async loadApplications() {
    try {
      const response = await this.applicationService.getApplications();
      this.applications = response.data || [];
    } catch (error) {
      console.error('Error loading applications:', error);
      this.notificationService.error('Failed to load applications');
      this.applications = [];
    }
  }

  // fileResource_authLetter: any = {};
  fileResource_authLetter: FileResource = new FileResource("",new FileUpload);
  onFileChange_authLetter(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      if (file) {
        reader.readAsDataURL(file);
      }

      reader.onload = () => {

        const fileUpload: FileUpload = new FileUpload(file.name,reader.result as string);
        this.fileResource_authLetter.fileUpload = fileUpload;

        ////////console.log("file", file);
        ////////console.log("fileResource", this.fileResource_authLetter);

      };

    }
  }

  // fileResource_bizDoc: any = {};
  fileResource_bizDoc: FileResource = new FileResource("",new FileUpload);
  onFileChange_bizDoc(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      if (file) {
        reader.readAsDataURL(file);
      }


      reader.onload = () => {

        const fileUpload: FileUpload = new FileUpload(file.name,reader.result as string);
        // fileUpload.fileName = file.name;
        // fileUpload.fileString = reader.result;

        this.fileResource_bizDoc.fileUpload = fileUpload;
      };

    }
  }

  async onSubmit() {
    if (this.senderIdForm.valid) {
      this.isLoading = true;
      const formValues = this.senderIdForm.value;
      const payload = {
        senderId: formValues.senderId,
        applicationId: formValues.applicationId,
        authLetter: this.fileResource_authLetter,
        bizRegDoc: this.fileResource_bizDoc
      };

      try {
        const response = await this.configService.createSenderId(payload);

        this.senderIds.push(response.data);
        this.senderIdForm.reset();
        this.isLoading = false;
      } catch (error: any) {
        console.error('Error creating sender ID:', error);
        this.notificationService.error(error.message || 'Failed to create sender ID');
        this.isLoading = false;
      }
    }
  }

  async deleteSenderId(sender: any) {
    this.isLoading = true;
    try {
      await this.configService.deleteSenderId(sender.id);
      CollectionUtil.remove(this.senderIds, sender.id);
      // const index = this.senderIds.findIndex(s => s.senderId === sender.senderId);
      // if (index > -1) {
      //   this.senderIds.splice(index, 1);
      // }
      this.isLoading = false;
    } catch (error: any) {
      console.error('Error deleting sender ID:', error);
      this.notificationService.error(error.message || 'Failed to delete sender ID');
      this.isLoading = false;
    }
  }


}


export class  FileResource {
  id: string;
  fileUpload: FileUpload;
  constructor(id: string = '', fileUpload: FileUpload) {
    this.id = id;
    this.fileUpload = fileUpload;
  }
}

export class  FileUpload {
  id: number;
  fileName: string;
  fileString: string | ArrayBuffer;

  constructor(fileName: string = '', fileString : string | ArrayBuffer = '') {
    this.fileName = fileName;
    this.fileString = fileString;
  }
}
