import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type VideoDocument = Video & Document;

export type VideoFiles = {
    video?: Express.Multer.File[],
    cover?: Express.Multer.File[]
}
@Schema()
export class Video {

    @Prop()
    title: string;
    @Prop()
    video: string;
    @Prop()
    coverImage: string;
    @Prop({ default: Date.now() })
    uploadedDate: Date;
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: "User"})
    createdBy: User

}

export const VideoSchema = SchemaFactory.createForClass(Video)