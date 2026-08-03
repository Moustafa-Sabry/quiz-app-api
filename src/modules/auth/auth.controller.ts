import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Body, Controller, Post, Put, Req, UseGuards } from "@nestjs/common";
import { SignupDto } from './dtos/signup.Dto';
import { LoginDto } from './dtos/login.Dto';
import { ForgotPasswordDto } from './dtos/forgetPass.Dto';
import { ResetPasswordDto } from './dtos/resetPass.Dto';
import { ChangePasswordDto } from './dtos/changePass.Dto';



@Controller('auth')
export class AuthController {
    constructor (
        private readonly AuthService:AuthService,
    ) {}

    @Post('register')
    signup(@Body() body:SignupDto){
        return this.AuthService.signup(body)
    }

    @Post('login')
    login(@Body() body:LoginDto){
        return this.AuthService.login(body)
    }

    @Post('forgot-password')
    forgotPassword(@Body() body: ForgotPasswordDto) {
        return this.AuthService.forgotPassword(body);
    }

    @Post('reset-password')
    resetPassword(@Body() body: ResetPasswordDto) {
        return this.AuthService.resetPassword(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('change-password')
    changePassword(@Req() req, @Body() body: ChangePasswordDto) {
      return this.AuthService.changePassword(req.user.id, body);
    }
} 