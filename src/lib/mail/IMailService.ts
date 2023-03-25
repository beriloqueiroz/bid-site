import { IMailServiceNodeMailer } from './implementations/MailNodeMailer';

export type AttachmentsPath = {
  filename:string;
  path: string;
};

export type ResponseSent = {
  err?:any;
};

export interface IMailService {
  sendEmail(from:string, to:string, subject: string, body: string, attachmentsPaths?:AttachmentsPath[]): Promise<ResponseSent> ;
}

export const MailService: IMailService = IMailServiceNodeMailer;
