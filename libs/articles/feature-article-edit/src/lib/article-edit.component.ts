import { DynamicFormComponent, Field, formsActions, ListErrorsComponent, ngrxFormsQuery } from '@realworld/core/forms';
import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { articleActions, articleEditActions, articleQuery } from '@realworld/articles/data-access';
import {AsyncPipe} from "@angular/common";
import {ActivatedRoute, ActivatedRouteSnapshot, ResolveFn} from "@angular/router";
import {Article} from "@realworld/core/api-types";

const structure: Field[] = [
  {
    type: 'INPUT',
    name: 'title',
    placeholder: 'Article Title',
    validator: [Validators.required],
  },
  {
    type: 'INPUT',
    name: 'description',
    placeholder: "What's this article about?",
    validator: [Validators.required],
  },
  {
    type: 'TEXTAREA',
    name: 'body',
    placeholder: 'Write your article (in markdown)',
    validator: [Validators.required],
  },
  {
    type: 'INPUT',
    name: 'tagList',
    placeholder: 'Enter Tags',
    validator: [],
  },
  {
    type: 'INPUT',
    name: 'collaboratorList',
    placeholder: 'Enter collaborators',
    validator: [],
  },
];

@UntilDestroy()
@Component({
  selector: 'cdt-article-edit',
  standalone: true,
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css'],
  imports: [DynamicFormComponent, ListErrorsComponent, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditComponent implements OnInit, OnDestroy {
  structure$ = this.store.select(ngrxFormsQuery.selectStructure);
  data$ = this.store.select(ngrxFormsQuery.selectData);
  data: any = {};

  constructor(private readonly store: Store) {}

  ngOnInit() {
    this.store.dispatch(formsActions.setStructure({ structure }));
    this.store
      .select(articleQuery.selectData)
      .pipe(untilDestroyed(this))
      .subscribe((article:Article) => {
        this.data = article;

        this.store.dispatch(formsActions.setData({ data: article }))
      });
  }

  stringToArray(dataConvert: string| string[]):any{
    const dataArray = typeof dataConvert == 'string' && dataConvert?.split(",").map((x:any) => x.trim())
   return dataArray || dataConvert;
  }
  updateForm(changes: any) {
    const tagList =  this.stringToArray(changes.tagList)
    const collaboratorList =  this.stringToArray(changes.collaboratorList)

    this.store.dispatch(formsActions.updateData({ data: {...changes, tagList, collaboratorList} }));
  }

  submit() {
    this.store.dispatch(articleEditActions.publishArticle());
  }

  ngOnDestroy() {
    this.store.dispatch(formsActions.initializeForm());
    this.data.slug && this.store.dispatch(articleActions.unlockArticle({ slug: this.data.slug }));
  }
}
