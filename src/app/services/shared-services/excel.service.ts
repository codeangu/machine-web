import { HttpClient } from '@angular/common/http';
import { Inject,Injectable } from '@angular/core';

import {apiType} from '../../shared/constant/collection-type'
import { excelHeadings } from '../../shared/constant/standard-format/standard-format-headings'
import { resolveHeadings } from '../../shared/constant/resolveHeadings'
import * as XLSX from 'xlsx';
const { read, write, utils } = XLSX;
import { Router } from "@angular/router";
import { GenericService } from './generic.service';
import { DatePipe } from '@angular/common';
import { OTHER_ARRAY } from 'src/app/shared/constant/otherForMc';
type AOA = any[][];
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  invoices: any;
  invoice: any;
  Other = OTHER_ARRAY;
  today= new Date().toLocaleDateString();
  constructor( @Inject('baseURL') private baseURL:string,
  private router:Router, private genericService:GenericService) { }

  exportWithoutResolve(complaints,filename,type?): void {

    let desctructerObj =[ excelHeadings]
   complaints.forEach(ele=>{
      let headingValues =[]
      if(type == 'pending' || type == 'overAllPending'){
        desctructerObj[0].push('Tech Name')
        
        if (type == 'overAllPending'){
          desctructerObj[0].push('Status')
        }
      } 
      for(let heading of excelHeadings){
        if(heading=='Upload Date'){
          let datePipe = new DatePipe("en-us");
          headingValues.push(datePipe.transform(ele['createdAt'], 'dd/MM/yyy'));
        }else if(ele[heading]) headingValues.push(ele[heading])
        
      }
      desctructerObj.push(headingValues);
    })
    console.log("desctructerObj ",desctructerObj);
    
      /* generate worksheet */
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(desctructerObj);
  
      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
      /* save to file */
      XLSX.writeFile(wb, filename +'.csv');
    }
    exportWitResolve(complaints,filename,downloadBy=null): void {
      let combineHeadings = [...excelHeadings, ...resolveHeadings]
      let desctructerObj =[ combineHeadings]
     complaints.forEach(ele=>{
        let headingValues =[]
        for(let heading of excelHeadings){
      if(ele.complaint[heading]) headingValues.push(ele.complaint[heading])
        }
        for(let heading of resolveHeadings){
    
         if(ele[heading]){
          headingValues.push(ele[heading])
         } else{
          headingValues.push('')
         }
          
        }
       
        desctructerObj.push(headingValues);
      })
      // console.log("desctructerObj ",desctructerObj);
      
        /* generate worksheet */
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(desctructerObj);
    
        /* generate workbook and add the worksheet */
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
        /* save to file */
        XLSX.writeFile(wb, filename +'.csv');

        if(downloadBy =='cci'){
          let count=0; 
          complaints.forEach(element => {
            this.genericService.updateById(apiType.resolve,{recent:false},element._id)
            .subscribe({
              next:(success)=>{
                count  = count + 1;
                if(count ==complaints.length){
                  this.router.navigate(['/cci/all-settled']);
                }
              }
            })
          });
        }
      }


      exportComplaintsWithResolve(complaints,filename,downloadBy=null): void {
        let combineHeadings = [...excelHeadings, ...resolveHeadings]
        let desctructerObj =[ combineHeadings]
       complaints.forEach(ele=>{
          let headingValues =[]
          for(let heading of excelHeadings){
        if(ele[heading]) headingValues.push(ele[heading])
          }
          for(let heading of resolveHeadings){
      
           if(ele.resolved[heading]){
            headingValues.push(ele.resolved[heading])
           } else{
            headingValues.push('')
           }
            
          }
         
          desctructerObj.push(headingValues);
        })
        // console.log("desctructerObj ",desctructerObj);
        
          /* generate worksheet */
          const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(desctructerObj);
      
          /* generate workbook and add the worksheet */
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      
          /* save to file */
          XLSX.writeFile(wb, filename +'.csv');
  
          if(downloadBy =='cci'){
            let count=0; 
            complaints.forEach(element => {
              this.genericService.updateById(apiType.resolve,{recent:false},element._id)
              .subscribe({
                next:(success)=>{
                  count  = count + 1;
                  if(count ==complaints.length){
                    this.router.navigate(['/cci/all-settled']);
                  }
                }
              })
            });
          }
        }
        //export MC
        public exportAsExcelFile(json: any[], excelFileName: string): void {
    
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
          // console.log('worksheet',worksheet);
          const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
          this.saveAsExcelFile(excelBuffer, excelFileName);
        }
      
        private saveAsExcelFile(buffer: any, fileName: string): void {
          const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
          });
          FileSaver.saveAs(data, fileName + '_Feedback_' + new Date().toLocaleDateString() + EXCEL_EXTENSION);
          
        }



        exportMC_Excel(complaints) {
          let newObj = this.returnMC_Obj(complaints);
          this.exportAsExcelFile(newObj, `Resolved MC ${this.today}`);
          //this.exportWitResolve(newObj,`Resolved MC ${this.today}`)
        }
        
        newArr = [];
        code;
        des;
        
      returnMC_Obj(complaints) {
          complaints.forEach((obj) => {
            var R_date: String = "";
            var datePipe = new DatePipe("en-US");
            if (obj.createdAt) {
              R_date = datePipe.transform(obj.createdAt, 'dd/MM/yyyy');
            }
            if (obj["Final Barcode"]) {
              obj["Final Barcode"] = obj["Final Barcode"];
            } else {
              obj["Final Barcode"] = obj.equipment
            }
            if (obj.compressorFault?.name) {
              var newObj = {
                Order: obj.complaint["Order Number"],
                Status: "Resolved",
                Remedy_Remarks: obj["Remedy Remarks"],
                Final_Equipment: obj["Final Barcode"],
                Service_Warranty: "",
                RC_Warranty: "",
                Material_Code: obj.compressorFault.code,
                Material_Description: obj.compressorFault.description,
                Warranty: "R",
                Report_Date_Time: R_date,
                Qty: "1",
                Level: "1",
              };
              this.newArr.push(newObj);
            }
        
            if (obj.gasLeak?.name) {
              var newObj = {
                Order: obj.complaint["Order Number"],
                Status: "Resolved",
                Remedy_Remarks: obj["Remedy Remarks"],
                Final_Equipment: obj["Final Barcode"],
                Service_Warranty: "",
                RC_Warranty: "",
                Material_Code: obj.gasLeak.code,
                Material_Description: obj.gasLeak.description,
                Warranty: "R",
                Report_Date_Time: R_date,
                Qty: "1",
                Level: "1",
              };
              this.newArr.push(newObj);
            }
            if (obj.otherPartFaults.length>0) {
              // var newOcode = obj.other_code.split(",");
        
              // newOcode.pop();
        
              for (const i of obj.otherPartFaults) {
                // for (const iterator of this.Other) {
                  // if (iterator.code === i.trim()) {
                    const newObj = {
                      Order: obj.complaint["Order Number"],
                      Status: "Resolved",
                      Remedy_Remarks: obj["Remedy Remarks"],
                      Final_Equipment: obj["Final Barcode"],
                      Service_Warranty: "",
                      RC_Warranty: "",
                      Material_Code: i.code,
                      Material_Description: i.description,
                      Warranty: "R",
                      Report_Date_Time: R_date,
                      Qty: "1",
                      Level: "1",
                    };
                    this.newArr.push(newObj);
                  // }
                // }
              }
            }
            if (obj.service?.name) {
              var newObj = {
                Order: obj.complaint["Order Number"],
                Status: "Resolved",
                Remedy_Remarks: obj["Remedy Remarks"],
                Final_Equipment: obj["Final Barcode"],
                Service_Warranty: "",
                RC_Warranty: "",
                Material_Code: obj.service.code,
                Material_Description: obj.service.description,
                Warranty: "R",
                Report_Date_Time: R_date,
                Qty: "1",
                Level: "1",
              };
              this.newArr.push(newObj);
            }
            if (obj.closeComplaint?.name) {
              var newObj = {
                Order: obj.complaint["Order Number"],
                Status: "Resolved",
                Remedy_Remarks: obj["Remedy Remarks"],
                Final_Equipment: obj["Final Barcode"],
                Service_Warranty: "",
                RC_Warranty: "",
                Material_Code: obj.closeComplaint.name,
                Material_Description: obj.closeComplaint.code,
                Warranty: "R",
                Report_Date_Time: R_date,
                Qty: "1",
                Level: "1",
              };
              this.newArr.push(newObj);
            }
          });
        
          return this.newArr;
        }      



      }
