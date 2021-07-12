import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import WebViewer from '@pdftron/pdfjs-express';

import {CommunicationService} from "./service/communication/communication.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('viewer') viewer: ElementRef;

  private webViewerInstance: any;
  public documentDetails: any;

  private roomId = 1;

  constructor(
    private communicationService: CommunicationService
  ) {
  }

  ngOnInit(): void {
    this.communicationService.getUpdatedPDF()
      .subscribe((data) => {
        this.updateDocument(data).then();
      });
  }

  ngAfterViewInit(): void {
    this.joinRoom();

    WebViewer({
      path: 'lib',
      initialDoc: '/assets/file-sample.pdf'
    }, this.viewer.nativeElement).then((instance) => {
      this.webViewerInstance = instance;

      if(this.documentDetails) {
        instance.docViewer.on('documentLoaded', () => {
          instance.annotManager.importAnnotations(this.documentDetails.xfdf).then();
        });
      }

      const {annotManager} = instance;
      annotManager.on('annotationChanged', (annotations, action, {imported}) => {
        if (imported) {
          return;
        }

        annotations.forEach((annotation) => {
          // add annotated file fun
          this.getAnnotatedFile({
            action: action,
            annotationId: annotation.Id
          }).then();
        })
      });
    })
  }

  joinRoom(): void {
    this.communicationService.joinRoom({roomId: this.roomId});
  }

  async getAnnotatedFile(data) {
    const {annotManager} = this.webViewerInstance;

    if (data.action === 'delete') {
      const command = '<delete><id>' + data.annotationId + '</id></delete>';
      annotManager.importAnnotCommand(command).then();
    }

    const xfdf: string = await annotManager.exportAnnotations({links: false, widgets: false});
    // save annotation fun
    this.saveAnnotation({...data, xfdf})
  }

  saveAnnotation(data): void {
    this.documentDetails = {
      xfdf: data.xfdf,
      annotationId: data.action === 'delete' ? data.annotationId : null,
      roomId: this.roomId
    };

    this.communicationService.updatePDF(this.documentDetails);
  }

  async updateDocument(data) {
    const {annotManager} = this.webViewerInstance;

    if (data.annotationId) {
      const command = '<delete><id>' + data.annotationId + '</id></delete>';
      annotManager.importAnnotCommand(command).then();
    } else {
      annotManager.importAnnotations(data.xfdf).then();
    }
  }

}
