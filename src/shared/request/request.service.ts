import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosHeaders } from 'axios';
import { isNotEmptyObject } from 'class-validator';
import { pick } from 'lodash';

@Injectable()
export class RequestService {
  constructor(
    private readonly requestApi: HttpService,
    private configService: ConfigService,
  ) {}

  baseURL: string;
  headers: Record<string, unknown> & { Authorization?: string };
  url_path: string;
  async requestApiService(
    path: string,
    {
      query = {},
      body = {},
      headers = {},
      method = 'GET',
      baseURL = '',
    }: {
      body?: Record<string, unknown>;
      query?: Record<string, unknown>;
      headers?: { Authorization?: string };
      method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
      baseURL?: string;
    } = {},
  ) {
    //
    // const authToken = this.configService.getOrThrow(
    //   'AUTH_SERVER_API_ACCESS_TOKEN',
    // );
    // baseURL = baseURL || this.configService.getOrThrow('AUTH_SERVER_URL');
    // const Authorization = headers.Authorization || `Bearer ${authToken}`;

    if (!baseURL) {
      this.setOrUseDefaultBaseUrl(baseURL);
    }

    this.setOrUseDefaultHeaders(headers || this.headers);

    const response = await this.requestApi.axiosRef(path, {
      headers: {
        ...(isNotEmptyObject(headers) ? headers : this.headers),
      } as AxiosHeaders,
      params: query,
      data: body,
      method,
      baseURL: baseURL || this.baseURL,
    });

    return pick(response, ['data', 'headers', 'request', 'status']);
  }

  useDefaults() {
    this.setOrUseDefaultBaseUrl();
    this.setOrUseDefaultHeaders();
  }

  setOrUseDefaultBaseUrl(baseURL?: string) {
    this.baseURL = baseURL || this.configService.getOrThrow('AUTH_SERVER_URL');
  }

  setOrUseDefaultHeaders(headers?: Record<string, unknown>) {
    const authToken = this.getEnvVar('AUTH_SERVER_API_ACCESS_TOKEN');
    this.headers = {
      Authorization: `Bearer ${authToken}`,
      ...(headers ? headers : {}),
    };
  }

  getEnvVar(varName: string) {
    return this.configService.getOrThrow(varName);
  }

  setup(url_path: string, headers: Record<string, string>) {
    this.url_path = url_path;
    this.headers = headers;
    return this;
  }

  async send(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data: Record<string, unknown>,
  ) {
    try {
      if (!this.url_path) {
        throw new Error('urlPath not saved');
      }
      const response = await this.requestApiService(this.url_path, {
        method,
        ...(data ? { body: data } : {}),
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      // Handle error appropriately
      throw new Error(`Error while processing request: ${error.message}`);
    }
  }
}
