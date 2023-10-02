import { createSelector } from '@ngrx/store';
import { roasterFeature } from './roaster.reducer';

const { selectRoasterState } = roasterFeature;

export const selectRoaster = createSelector(selectRoasterState, (roaster) => roaster.roaster);
export const selectRoasterData = {
  selectRoasterState,
  selectRoaster,
};
