import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createApp } from './bootstrap.js';

/** Emits openapi.json for contract tests / client generation without starting a listener. */
const app = await createApp();
const doc = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Ezyify API').setVersion('1.0').addBearerAuth().build());
writeFileSync('openapi.json', JSON.stringify(doc, null, 2));
await app.close();
console.log(`openapi.json written with ${Object.keys(doc.paths).length} paths`);
