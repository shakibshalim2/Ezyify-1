import { type DynamicModule, Global, Module } from '@nestjs/common';
import { ENV, type Env } from '../config.js';

@Global()
@Module({})
export class EnvModule {
  static forRoot(env: Env): DynamicModule {
    return { module: EnvModule, providers: [{ provide: ENV, useValue: env }], exports: [ENV] };
  }
}
