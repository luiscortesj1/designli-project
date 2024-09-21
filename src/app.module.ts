import { Module } from '@nestjs/common';
import {
  FileEmailFetcher,
  MailParserService,
  UrlEmailFetcher,
} from './services/email.service';
import { MailParserController } from './controllers/app.controller';

@Module({
  providers: [MailParserService, UrlEmailFetcher, FileEmailFetcher],
  controllers: [MailParserController],
})
export class MailParserModule {}
