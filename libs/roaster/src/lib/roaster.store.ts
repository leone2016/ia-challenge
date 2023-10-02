import { Injectable } from '@angular/core';
import { ComponentStore, OnStateInit, tapResponse } from '@ngrx/component-store';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RoasterService } from './roaster.service';

export interface RoasterState {
  roaster: string[];
}

@Injectable()
export class RoasterStoreService extends ComponentStore<RoasterState> implements OnStateInit {
  constructor(private readonly roaster: RoasterService) {
    super({ roaster: [] });
  }

  ngrxOnStateInit() {
    this.getTags();
  }

  // SELECTORS
  roaster$ = this.select((store) => store.roaster);

  // EFFECTS
  readonly getTags = this.effect<void>(
    pipe(
      switchMap(() =>
        this.roaster.getRoasterList().pipe(
          tapResponse(
            (response) => {
              this.patchState({ roaster: response.roaster });
            },
            (error) => {
              console.error('error getting tags: ', error);
            },
          ),
        ),
      ),
    ),
  );
}
