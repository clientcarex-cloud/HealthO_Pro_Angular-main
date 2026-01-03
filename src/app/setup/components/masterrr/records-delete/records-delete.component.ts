
import { Component, OnInit } from '@angular/core';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Patient } from 'src/app/patient/models/patients/patient.model';

@Component({
    selector: 'app-records-delete',
    templateUrl: './records-delete.component.html',
    styleUrls: ['./records-delete.component.scss']
})
export class RecordsDeleteComponent implements OnInit {

    patients: Patient[] = [];
    loading = false;
    selectedIds: number[] = [];
    selectAll = false;

    // Pagination params
    pageSize = 20;
    pageNumber = 1;
    total = 0;

    fromDate = '';
    toDate = '';

    constructor(
        private patientEndpoint: PatientEndpoint,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        // Wait for date selection
    }

    getRangeValue(e: any) {
        if (e && e.length !== 0) {
            if (e.includes("to")) {
                const [startDate, endDate] = e.split(" to ");
                this.fromDate = startDate;
                this.toDate = endDate;
            } else {
                this.fromDate = e;
                this.toDate = e;
            }
            this.pageNumber = 1;
            this.getData();
        } else {
            this.fromDate = '';
            this.toDate = '';
            this.patients = [];
            this.total = 0;
        }
    }

    getData() {
        if (!this.fromDate || !this.toDate) {
            return;
        }

        this.loading = true;
        this.patients = [];
        const statusQuery = `&status_id=1,2,4,5,6,10,11,14,15,16,18,21,12,13,3`;

        this.patientEndpoint.getPaginatedPatients(
            this.pageSize,
            this.pageNumber,
            statusQuery,
            '',
            '',
            '', // single date param usually empty if range used
            this.fromDate,
            this.toDate,
            false
        ).subscribe((res: any) => {
            this.loading = false;
            this.patients = res.results || res;
            this.total = res.count || this.patients.length;
            this.resetSelection();
        }, err => {
            this.loading = false;
            this.toastr.error('Failed to load records', 'Error');
        });
    }

    toggleAll(event: any) {
        this.selectAll = event.target.checked;
        if (this.selectAll) {
            this.selectedIds = this.patients.map(p => p.id);
        } else {
            this.selectedIds = [];
        }
    }

    toggleOne(id: number, event: any) {
        if (event.target.checked) {
            this.selectedIds.push(id);
        } else {
            this.selectedIds = this.selectedIds.filter(sid => sid !== id);
        }
        this.selectAll = this.selectedIds.length === this.patients.length && this.patients.length > 0;
    }

    deleteSelected() {
        if (this.selectedIds.length === 0) {
            this.toastr.warning('Please select records to delete', 'No Selection');
            return;
        }

        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${this.selectedIds.length} records. This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.performDelete();
            }
        });
    }

    performDelete() {
        this.loading = true;
        this.patientEndpoint.deleteRecords(this.selectedIds).subscribe((res: any) => {
            this.loading = false;
            this.toastr.success(res.message || 'Records deleted successfully', 'Success');
            this.selectedIds = [];
            this.selectAll = false;
            this.getData();
        }, (err: any) => {
            this.loading = false;
            this.toastr.error(err.error?.message || 'Failed to delete records', 'Error');
        });
    }

    resetSelection() {
        this.selectedIds = [];
        this.selectAll = false;
    }
}
