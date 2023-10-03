import { Component, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {Article, Profile} from '@realworld/core/api-types';
@Component({
  selector: 'cdt-article-meta',
  standalone: true,
  templateUrl: './article-meta.component.html',
  styleUrls: ['./article-meta.component.css'],
  imports: [RouterModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleMetaComponent {
  @Input() article!: Article;
  @Input() currentUser!: Profile;
  @Input() isAuthenticated!: boolean;
  @Input() canModify!: boolean;
  @Output() follow: EventEmitter<string> = new EventEmitter<string>();
  @Output() unfollow: EventEmitter<string> = new EventEmitter<string>();
  @Output() unfavorite: EventEmitter<string> = new EventEmitter();
  @Output() favorite: EventEmitter<string> = new EventEmitter();
  @Output() delete: EventEmitter<string> = new EventEmitter();

  toggleFavorite() {
    if (this.article.favorited) {
      this.unfavorite.emit(this.article.slug);
    } else {
      this.favorite.emit(this.article.slug);
    }
  }

  toggleFollow(author: Profile) {
    console.log(author)
    if (author.following) {
      this.unfollow.emit(author.username);
    } else {
      this.follow.emit(author.username);
    }
  }

  deleteArticle() {
    this.delete.emit(this.article.slug);
  }
}
