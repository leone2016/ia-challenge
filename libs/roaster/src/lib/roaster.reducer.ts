import { createFeature, createReducer, on } from '@ngrx/store';
import { roasterArticleActions } from './roaster.actions';

export const roasterInitialState = {
  roaster: {
    entities: [],
    roasterCount: 0,
    loaded: false,
    loading: false,
  },
};

export const roasterFeature = createFeature({
  name: 'roaster',
  reducer: createReducer(
    roasterInitialState,
    on(roasterArticleActions.loadRoaster, (state, action) => {
      const roaster = {
        ...state.roaster,
        entities: action.roaster,
      };
      return { ...state, roaster };
    }),
  ),
});
