import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http-client/src';

@Injectable({ providedIn: 'root' })
export class RoasterService {
  constructor(private apiService: ApiService) {
    /* TODO document why this constructor is empty */
  }

  getRoasterList(): Observable<{ roaster: any }> {
    return this.apiService.get('/articles/roaster');
  }
}
