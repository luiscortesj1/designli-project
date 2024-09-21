export interface IEmailFetcher {
  fetchEmailContent(source: string): Promise<string>;
}
