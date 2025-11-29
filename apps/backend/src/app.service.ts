import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Valery Corporativo API - Backend funcionando correctamente ✅';
  }
}
