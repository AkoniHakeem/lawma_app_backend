import { Body, Controller, Get, Post } from '@nestjs/common';
import { EntityProfileSignUpDto, SignInDto } from './dto/dto';
import { AuthService } from './auth.service';
import { ProfileService } from '../shared/profile/profile.service';
import { SharedService } from '../shared/shared.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private sharedService: SharedService,
  ) {
    //
  }
  @Get()
  getHello(): string {
    return 'Hello Lawma App is up and running!';
  }

  @Post('signup')
  async signupCompanyUser(@Body() signupDto: EntityProfileSignUpDto) {
    //
    const authTokenPayload = this.authService.signup(signupDto);
    return authTokenPayload;
  }

  @Post('signin')
  async login(@Body() signinDto: SignInDto) {
    //
    const authTokenPayload = this.authService.signin(signinDto);
    return authTokenPayload;
  }
}
