import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { simpleParser } from 'mailparser';
import * as fs from 'fs';
import axios from 'axios';
import * as path from 'path';
import * as https from 'https';
import { IEmailFetcher } from 'src/common/interfaces/IEmailFetcher.interface';

@Injectable()
export class FileEmailFetcher implements IEmailFetcher {
  async fetchEmailContent(filePath: string): Promise<string> {
    const absoluteFilePath = path.resolve(filePath);
    try {
      return fs.readFileSync(absoluteFilePath, 'utf-8');
    } catch (error) {
      throw new HttpException(
        `Failed to read the email file: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

@Injectable()
export class UrlEmailFetcher implements IEmailFetcher {
  async fetchEmailContent(url: string): Promise<string> {
    const agent = new https.Agent({ rejectUnauthorized: false });
    try {
      const response = await axios.get(url, { httpsAgent: agent });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch the email content from the URL: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

@Injectable()
export class MailParserService {
  constructor(
    private readonly fileEmailFetcher: FileEmailFetcher,
    private readonly urlEmailFetcher: UrlEmailFetcher,
  ) {}

  async parseMail(source: string): Promise<any> {
    const emailFetcher = this.isValidUrl(source)
      ? this.urlEmailFetcher
      : this.fileEmailFetcher;
    const mailContent = await emailFetcher.fetchEmailContent(source);
    return this.parseMailContent(mailContent);
  }

  private async parseMailContent(mailContent: string): Promise<any> {
    const parsed = await simpleParser(mailContent);
    const jsonAttachment = this.getJsonAttachment(parsed.attachments);
    if (jsonAttachment) return JSON.parse(jsonAttachment.content.toString());

    const jsonLink = this.extractJsonLink(parsed.text);
    if (jsonLink) return this.fetchJsonFromUrl(jsonLink);

    const webpageLink = this.extractWebpageLink(parsed.text);
    if (webpageLink) {
      const webpageText = await this.fetchJsonFromUrl(webpageLink);
      const finalJsonLink = this.extractJsonLink(webpageText);
      if (finalJsonLink) return this.fetchJsonFromUrl(finalJsonLink);
    }

    throw new HttpException('No JSON found in the email', HttpStatus.NOT_FOUND);
  }

  private getJsonAttachment(attachments: any[]): any {
    return attachments.find(
      (attachment) => attachment.contentType === 'application/json',
    );
  }

  private async fetchJsonFromUrl(url: string): Promise<any> {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const response = await axios.get(url, { httpsAgent: agent });
    return response.data;
  }

  private isValidUrl(string: string): boolean {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  private extractJsonLink(text: string): string | null {
    const regex = /https?:\/\/[^\s]+\.json/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  private extractWebpageLink(text: string): string | null {
    const regex = /https?:\/\/[^\s]+/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }
}
