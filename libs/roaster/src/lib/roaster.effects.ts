import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { inject } from '@angular/core';
import { roasterArticleActions } from './roaster.actions';
import { catchError, concatMap, map, of } from 'rxjs';
import { RoasterService } from './roaster.service';
import { selectRoasterData } from './roaster.selectors';
import { Store } from '@ngrx/store';

export const loadArticle$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store), roasterService = inject(RoasterService)) => {
    return actions$.pipe(
      ofType(roasterArticleActions.loadRoaster),
      concatLatestFrom(() => store.select(selectRoasterData.selectRoasterState)),
      concatMap((action) =>
        roasterService.getRoasterList().pipe(
          map((response) => roasterArticleActions.loadRoasterSuccess({ article: response.roaster })),
          catchError((error) => of(roasterArticleActions.loadRoasterFailure(error))),
        ),
      ),
    );
  },

  { functional: true },
);
