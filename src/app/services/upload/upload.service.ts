import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ProcessHTTPMsgService } from '../auth/process-httpmsg.service';
import { catchError, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
export class FileUpload {
  key: string;
  name: string;
  url: string;
  file: File;

  constructor(file: File) {
    this.file = file;
  }
}
@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(  private storage: AngularFireStorage,

    ) { }

    private basePath = '/uploads';
    pushFileToStorage(fileUpload: FileUpload): Observable<{ progress: number | undefined, downloadURL?: string }> {
      console.log('File type:', fileUpload.file.type);
console.log('File size:', fileUpload.file.size, 'bytes');
      const filePath = `${this.basePath}/${fileUpload.file.name}`;
      const storageRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, fileUpload.file);
    
      // Get percentage changes
      const percentage$ = uploadTask.percentageChanges();
    
      return new Observable<{ progress: number | undefined, downloadURL?: string }>((observer) => {
        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            storageRef.getDownloadURL().subscribe(downloadURL => {
              fileUpload.url = downloadURL;
              console.log("downloadURL ", downloadURL);
              observer.next({ progress: 100, downloadURL: downloadURL }); // Emitting 100% progress and downloadURL
              observer.complete();
            });
          })
        ).subscribe(
          (snapshot) => {
            if (snapshot.totalBytes) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              observer.next({ progress: progress });
            }
          },
          (error) => {
            observer.error(error);
          }
        );
      });
    }

    deleteImageFromStorage(imageUrl: string): Observable<void> {
      const storageRef = this.storage.refFromURL(imageUrl);
      return new Observable<void>((observer) => {
        storageRef.delete().subscribe(
          () => {
            console.log('Image deleted successfully from Firebase Storage');
            observer.next();
            observer.complete();
          },
          (error) => {
            console.error('Error deleting image from Firebase Storage:', error);
            observer.error(error);
          }
        );
      });
    }
}
