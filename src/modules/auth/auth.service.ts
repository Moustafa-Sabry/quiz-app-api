import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from "src/schemas/User";
import { LoginDto } from "./dtos/login.Dto";
import { ForgotPasswordDto } from "./dtos/forgetPass.Dto";
import { ResetPasswordDto } from "./dtos/resetPass.Dto";
import { ChangePasswordDto } from "./dtos/changePass.Dto";


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,

    ) {}

    async signup(user: any) {
        if(user.password !== user.confirmPassword){
            throw new BadRequestException('Password and confirmPassword do not match')
        }
        
        let isExist = await this.userModel.findOne({ email: user.email })
        if(isExist) throw new HttpException('email already exist',HttpStatus.CONFLICT );

        const { confirmPassword, ...userData } = user;
        let newUser = new this.userModel(userData)
        const savedUser = await newUser.save();
        console.log(savedUser);
        return {message :"Your account is created successfully",data:savedUser}
    }
    
    async login(body : LoginDto){
        let user = await this.userModel.findOne({ email: body.email }).select('+password');
        if(!user) throw new UnauthorizedException('Invalid Email or Password');

        let isMatch = await bcrypt.compare(body.password,user.password)
        if(!isMatch)  throw new UnauthorizedException('Invalid email or password',)

        const token = this.jwtService.sign({
            sub: user._id,
            email: user.email,
            role: user.role,
        })    
        return {
         message: 'Login successfully',
         token,
         user: {
           id: user._id,
           name: user.firstName,
           email: user.email,
           role: user.role,
         },
        }
    } 

    async forgotPassword(body: ForgotPasswordDto) {
        const { email } = body;
        const user = await this.userModel.findOne({ email });
        if (!user) {
          return {
            message: 'If email exists, reset link will be sent',
          };
        }

        const now = new Date();
        if (
            !user.passwordResetWindow ||
            now.getTime() - user.passwordResetWindow.getTime() >= 60 * 60 * 1000
          ) {
            user.passwordResetWindow = now;
            user.passwordResetRequests = 0;
          }

          if (user.passwordResetRequests >= 3) {
            throw new HttpException(
              'Maximum password reset requests reached. Please try again after one hour.',
              HttpStatus.TOO_MANY_REQUESTS,
            );
          }

        user.passwordResetRequests += 1;


        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.passwordResetToken = otp;
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        return {
            message: 'If email exists, reset link will be sent',
            otp, 
        };
    }

    async resetPassword(body: ResetPasswordDto) {
       const { email, otp, newPassword, confirmPassword } = body;
       if (newPassword !== confirmPassword) {
          throw new BadRequestException('Confirm password does not match',);
        }
       const user = await this.userModel.findOne({ email });
        if (!user) {
           throw new NotFoundException('User not found');
        }

        if (
          !user.passwordResetToken ||
          user.passwordResetToken !== otp ||
          !user.passwordResetExpires ||
          user.passwordResetExpires < new Date()
          ) {
          throw new BadRequestException(
            'Reset link has expired. Request new one.',
          );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
  
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.passwordChangedAt = new Date();

        await user.save();

        return {
          message: 'Password reset successful',
        };}

    async changePassword(userId: string, body: ChangePasswordDto){
         const { oldPassword, newPassword, confirmNewPassword} = body;
         if (newPassword !== confirmNewPassword) {
           throw new BadRequestException('Confirm password does not match',);
         }

         if (oldPassword === newPassword) {
           throw new BadRequestException('New password must be different from old password',);
         }

         const user = await this.userModel.findById(userId).select('+password');
         if (!user) {
            throw new NotFoundException('User not found');
         }

          const isMatch = await bcrypt.compare( oldPassword, user.password);
          if (!isMatch) {
            throw new BadRequestException(
              'Old password is incorrect',
            );
          }
           const hashedPassword = await bcrypt.hash(newPassword, 10);

           user.password = hashedPassword;
           user.passwordChangedAt = new Date();

           await user.save();

           return {
             message: 'Password changed successfully',
             note: 'Please login again for security.',
           };
    }

}