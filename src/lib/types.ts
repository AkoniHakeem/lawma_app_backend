// import { User } from 'src/auth/entities/User.entity';

import { UserData } from '../auth/userData';
import { ProfileTypes } from './enums';

export enum FileUploadExtensions {
  PDF = 'pdf',
  WORD_DOC = 'doc',
  WORD_DOCX = 'docx',
  IMAGE_PNG = 'png',
  IMAGE_JPG = 'jpg',
  IMAGE_JPGEG = 'jpeg',
  IMAGE_GIF = 'gif',
  IMAGE_WEBP = 'webp',
  VIDEO_MP4 = 'mp4',
  VIDEO_WEBM = 'webm',
  VIDEO_MKV = 'mkv',
  VIDEO_3GP = '3gp',
  VIDEO_AVI = 'avi',
  VIDEO_WMV = 'wmv',
  VIDEO_MOV = 'mov',
  VIDEO_M3U8 = 'm3u8',
  VIDEO_TS = 'ts',
  VIDEO_FLV = 'flv',
}

export enum ContentTypes {
  PDF = 'application/pdf',
  WORD_DOC = 'application/msword',
  WORD_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  IMAGE_PNG = 'image/png',
  IMAGE_JPG = 'image/jpeg',
  IMAGE_JPGEG = 'image/jpeg',
  IMAGE_GIF = 'image/gif',
  IMAGE_WEBP = 'image/webp',
  VIDEO_MP4 = 'video/mp4',
  VIDEO_WEBM = 'video/webm',
  VIDEO_MKV = 'video/x-matroska',
  VIDEO_3GP = 'video/3gpp',
  VIDEO_AVI = 'video/x-msvideo',
  VIDEO_WMV = 'video/x-ms-wmv',
  VIDEO_MOV = 'video/quicktime',
  VIDEO_M3U8 = 'application/x-mpegURL',
  VIDEO_TS = 'video/MP2T',
  VIDEO_FLV = 'video/x-flv',
}

export interface PlatformRequest extends Request {
  authPayload: AuthTokenPayload;
}

export interface AuthTokenPayload {
  userData?: AuthenticatedUserData;
  profile?: ProfileSummary;
  exp?: number | unknown;
}

export interface AuthenticatedUserData {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BrevoSmtpEmail {
  to: { email: string }[];
  templateId?: number;
  htmlContent?: string;
  sender: { name: string; email: string };
  subject: string;
  params?: { [key: string]: string };
  attachment?: { url?: string; name?: string; content?: string }[];
}

export type PaystackCustomer = {
  first_name: string;
  last_name: string;
  phone?: string;
  email: string;
};

export type DedicatedVirtualAccountUserData = {
  preferred_bank: string;
  country?: string;
} & ({ customer: string } | PaystackCustomer);

export type PaystackWebhookEventObject = {
  event: PaystackWebhookEvents;
  data: PaystackWebhookData;
};

export type PaystackWebhookEvents = 'charge.success' | 'transfer.success';

export type PaystackWebhookData = {
  id: number;
  domain: 'live' | 'test';
  status: 'success' | 'failed';
  reference: string;
  amount: number;
  authorization: {
    receiver_bank_account_number: string;
    receiver_bank: 'Wema Bank' | 'Titan-Paystack';
  } & Record<string, unknown>;
  customer: {} & Record<string, unknown>;
} & Record<string, unknown>;

export interface MTNSmsOptions {
  /**
   * The sender address to use for the message. If this is provided, it will take precedence over the serviceCode.
   * @type {string}
   */
  senderAddress?: string;

  /**
   * The array of receiver addresses for the message.
   * @type {string[]}
   * @required
   */
  receiverAddress: string[];

  /**
   * The message to send.
   * @type {string}
   * @required
   */
  message: string;

  /**
   * The client correlator ID for the message.
   * @type {string}
   * @required
   */
  clientCorrelatorId: string;

  /**
   * The keyword to use for the message.
   * @type {string}
   */
  keyword?: string;

  /**
   * The service code to use for the message.
   * @type {string}
   * @required
   */
  serviceCode: string;

  /**
   * Whether to request a delivery report for the message. Default is false.
   * @type {boolean}
   */
  requestDeliveryReceipt?: boolean;
}

export interface MTNSmsResponse {
  /**
   * The MADAPI Canonical Error Code (it is 4 characters long and it is not the HTTP Status Code which is 3 characters long). Back-end system errors are mapped to specific canonical error codes which are returned. More information on these mappings can be found on the MADAPI Confluence Page 'Response Codes'.
   * @type {string}
   * @required
   */
  statusCode: string;

  /**
   * More details and corrective actions related to the error which can be shown to a client.
   * @type {string}
   * @required
   */
  statusMessage: string;

  /**
   * MADAPI generated Id to include for tracing requests.
   * @type {string}
   * @required
   */
  transactionId: string;

  /**
   * The status of the submitted outbound message(s).
   * @type {string}
   * @required
   */
  data: {
    status: string;
  };
}

export interface MTNRegisterCallbackUrlOptions {
  callbackUrl: string;
  targetSystem: string;
  deliveryReportUrl: string;
  serviceCode: string;
}

export type ProfileSummary = {
  id: string;
  profileTypeId: string;
  profileType: ProfileTypes;
  entityProfileId?: string;
};
