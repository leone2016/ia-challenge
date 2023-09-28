import { Injectable } from '@nestjs/common';
import {EntityManager, EntityRepository} from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Tag } from './tag.entity';
import { ITagsRO } from './tag.interface';
import {CreatetagDto} from "./dto/create-tag.dto";

@Injectable()
export class TagService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Tag)
    private readonly tagRepository: EntityRepository<Tag>,
  ) {}

  async findAll(): Promise<ITagsRO> {
    const tags = await this.tagRepository.findAll();
    return { tags: tags.map((tag) => tag.tag) };
  }

  async Create(dto: CreatetagDto): Promise<string[]> {
    let {tags} = dto
    const tagsToInsert:Tag[]= [];
    const tagsCreated = await this.tagRepository.find({tag:{ $in: tags }});
    const getTagIngex = (tag:string) => tagsCreated.findIndex(tagCreated=> tagCreated.tag===tag);

    const tagForCreate = tags
      .filter((tag: string)=> getTagIngex(tag)=== -1)
      .map((tagsToInsert: string )=>{return new Tag(tagsToInsert)} )

    await this.em.persistAndFlush(tagForCreate);
    return tags;
  }
}
