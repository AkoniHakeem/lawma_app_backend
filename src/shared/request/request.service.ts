import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pick } from 'lodash';

@Injectable()
export class RequestService {
  constructor(
    private readonly requestApi: HttpService,
    private configService: ConfigService,
  ) {}
  async requestAuth(
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
    const authToken = this.configService.getOrThrow(
      'AUTH_SERVER_API_ACCESS_TOKEN',
    );
    baseURL = baseURL || this.configService.getOrThrow('AUTH_SERVER_URL');
    const Authorization = headers.Authorization || `Bearer ${authToken}`;

    const response = await this.requestApi.axiosRef(path, {
      headers: { ...headers, Authorization },
      params: query,
      data: body,
      method,
      baseURL,
    });

    return pick(response, ['data', 'headers', 'request', 'status']);
  }
}
