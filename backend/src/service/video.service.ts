import { ServiceUnavailableException, Injectable, NotFoundException, } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Video,VideoDocument } from "src/model/video.schema";
import { createReadStream, statSync } from "fs";
import { join } from "path";
import { Request, Response} from 'express'
@Injectable()
export class VideoService {
    constructor(@InjectModel(Video.name) private videoModel: Model<VideoDocument>) { }

    async createVideo(video: Object): Promise<Video> {
        const uploadVideo = new this.videoModel(video);
        return uploadVideo.save();
  }
    
    // get video details based on id 
    async readVideo(id): Promise<any>{
        if (id.id) {
            return this.videoModel.findOne({_id: id.id}).populate("createdBy").exec();
        }
        return this.videoModel.find().populate("createdBy").exec();
    }

    // send a video as stream - query the database to get the video’s details according to id
    async streamVideo(id: string, req: Request, res: Response) {
        try {
            const data = await this.videoModel.findById(id);
            if (!data) throw new NotFoundException(null, 'Content not found')
            const { range } = req.headers;
            if (range) {
                const { video } = data;
                const videoPath = statSync(join(process.cwd(), `./public/${video}`));
                const CHUNK_SIZE = 1e6;
                const start = Number(range.replace(/\D/g, ''));
                const end = Math.min(start + CHUNK_SIZE, videoPath.size - 1);
                const videoLength = end - start + 1;
                res.status(206);
                res.header({
                    'Content-Range': `bytes ${start} - ${end}/${videoPath.size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-length': videoLength,
                    'Content-Type': 'video/mp4',
                    
                })
                const videoStream = createReadStream(join(process.cwd(), `./public/${video}`), {start, end});
                videoStream.pipe(res);
            } else {
                throw new NotFoundException(null, 'Range not found');
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json( 'Err from stream');
            throw new ServiceUnavailableException();
        }
       
    }

    async updateVideo(id: string, video: Video): Promise<Video>{
        return await this.videoModel.findByIdAndUpdate(id, video, {new:true})
    }

    async deleteVideo(id: string): Promise<any>{
        return await this.videoModel.findByIdAndRemove(id);
    }
}