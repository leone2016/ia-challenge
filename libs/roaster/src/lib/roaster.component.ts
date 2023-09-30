import {UntilDestroy} from "@ngneat/until-destroy";
import {ChangeDetectionStrategy, Component, OnInit} from "@angular/core";
import {DatePipe, NgForOf} from "@angular/common";

@UntilDestroy()
@Component({
  selector: 'cdt-roaster',
  standalone: true,
  templateUrl: './roaster.component.html',
  styleUrls: ['./roaster.component.css'],
  imports: [
    DatePipe,
    NgForOf
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoasterComponent implements OnInit {
  ngOnInit(): void {
  }

}
