import { HttpException, HttpStatus, Injectable, } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from "src/model/user.schema";
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    
    async getOne(email: string): Promise<User> {
        return await this.userModel.findOne({email})
    }

    async signup(user: User): Promise<User> {
        try {

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.password, salt);
            const reqBody = {
                fullname: user.fullname,
                email: user.email,
                password: hash
            }

            const newUser = new this.userModel(reqBody);
            return newUser.save();

        } catch (error) {
            console.error('Failed to signin: ', error);

        }
    }

    async signin(user: User, jwt: JwtService): Promise<any> {
        try {
            const userExisted = await this.userModel.findOne({ email: user.email }).exec();
            if (userExisted && userExisted.password) {
                let res = await bcrypt.compare(user.password, userExisted.password);
                if (res) {
                    const payload = { email: user.email };
                    return {
                        jwtToken: jwt.sign(payload)
                    }
                }
                return new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
            }
            return new HttpException('Incorrect username or password', HttpStatus.UNAUTHORIZED);
        } catch (error) {
            console.error('Failed to signin: ', error);
            return new HttpException(`Failed to signin: ${error}`, HttpStatus.BAD_REQUEST);

        }

    }
}