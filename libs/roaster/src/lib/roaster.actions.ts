import { createActionGroup, props } from '@ngrx/store';

export const roasterArticleActions = createActionGroup({
  source: 'Roaster Article',
  events: {
    loadRoaster: props<{ roaster: any }>(),
    loadRoasterFailure: props<{ error: Error }>(),
    loadRoasterSuccess: props<{ article: any }>(),
  },
});
