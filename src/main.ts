import { NestFactory } from '@nestjs/core';
import { MailParserModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(MailParserModule);
  await app.listen(3000);
}
bootstrap();
