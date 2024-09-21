import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ParseMailDto } from 'src/dto/email.dto';
import { MailParserService } from 'src/services/email.service';

@Controller('email')
export class MailParserController {
  constructor(private readonly mailParserService: MailParserService) {}

  @Get('parse')
  @UsePipes(new ValidationPipe({ transform: true }))
  async parseMail(@Query() query: ParseMailDto, @Res() res): Promise<any> {
    try {
      const parsedData = await this.mailParserService.parseMail(
        query.filePathOrUrl,
      );
      return res.status(HttpStatus.OK).json(parsedData);
    } catch (error) {
      return res.status(error.getStatus()).json({ message: error.message });
    }
  }
}
