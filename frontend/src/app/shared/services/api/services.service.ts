import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';

export interface Requirements {
  allocated: number;
  available: number;
  required: number;
}

export interface AllocationConstraints {
  allocated: number;
  available: number;
}

export interface RedundancyConstraints {
  /* eslint-disable @typescript-eslint/naming-convention */
  max_replicas: number;
}

export interface AvailabilityConstraints {
  hosts: number;
}

export interface Constraints {
  allocations: AllocationConstraints;
  redundancy: RedundancyConstraints;
  availability: AvailabilityConstraints;
}

export declare type ServiceType = 'file' | 'object' | 'block';
export declare type ServiceBackend = 'cephfs' | 'nfs' | 'rbd' | 'iscsi' | 'rgw';

export type CreateServiceRequest = {
  name: string;
  type: ServiceType;
  size: number;
  replicas: number;
};

export type ServiceInfo = {
  name: string;
  size: number;
  replicas: number;
  type: ServiceType;
  backend: ServiceBackend;
};

export type ServiceStorage = {
  name: string;
  used: number;
  avail: number;
  allocated: number;
  utilization: number;
};

export enum ServiceStatusCode {
  OKAY = 0,
  WARN = 5,
  ERROR = 10,
  NONE = 20
}

export type ServiceStatusInfo = {
  code: number;
  msg: string;
};

export type ServiceStatus = {
  name: string;
  status: ServiceStatusCode;
  info: Array<any>;
};

export type Services = {
  allocated: number;
  services: Array<ServiceInfo>;
  status: Record<string, ServiceStatus>;
};

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private url = 'api/services';

  constructor(private http: HttpClient) {}

  public create(serviceInfo: ServiceInfo): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}/create`, serviceInfo);
  }

  public list(): Observable<Services> {
    return this.http.get<Services>(`${this.url}/`);
  }

  public get(name: string): Observable<ServiceInfo> {
    return this.http.get<ServiceInfo>(`${this.url}/${name}`);
  }

  public exists(name: string): Observable<boolean> {
    return this.get(name).pipe(
      mapTo(true),
      catchError((error) => {
        if (_.isFunction(error.preventDefault)) {
          error.preventDefault();
        }
        return of(false);
      })
    );
  }

  public delete(name: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${name}`);
  }
}
