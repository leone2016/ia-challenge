import { UntilDestroy } from '@ngneat/until-destroy';
import { ChangeDetectionStrategy, Component, OnInit, Injectable } from '@angular/core';
import { AsyncPipe, DatePipe, NgForOf } from '@angular/common';
import { selectRoasterData } from './roaster.selectors';
import { Store } from '@ngrx/store';
import { roasterArticleActions } from './roaster.actions';
import { RoasterStoreService } from './roaster.store';
import { provideComponentStore } from '@ngrx/component-store';

@UntilDestroy()
@Component({
  selector: 'cdt-roaster',
  standalone: true,
  templateUrl: './roaster.component.html',
  styleUrls: ['./roaster.component.css'],
  imports: [DatePipe, NgForOf, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponentStore(RoasterStoreService)],
})
@Injectable()
export class RoasterComponent implements OnInit {
  roaster$ = this.homeRoaster.roaster$;

  constructor(private readonly homeRoaster: RoasterStoreService, private readonly store: Store) {}

  ngOnInit(): void {}
}
