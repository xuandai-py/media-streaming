import { Body, Controller, Delete, Get, HttpStatus, Param, Post, UseInterceptors, UploadedFiles, Put, Req, Res, Query } from "@nestjs/common";
import { Video, VideoFiles } from "../model/video.schema";
import { VideoService } from "../service/video.service";
import { JwtService } from '@nestjs/jwt';
import { FileFieldsInterceptor, FilesInterceptor } from "@nestjs/platform-express";


@Controller('/api/video')
export class VideoController {
    constructor(private readonly videoService: VideoService) { }


    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'video', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ]))
    async createVideo(@Res() res, @Req() req, @Body() video: Video, @UploadedFiles() files: VideoFiles) {
        const reqBody = { title: video.title, createdBy: req.user, video: files.video[0].filename, coverImage: files.cover[0].filename }
        const newVideo = await this.videoService.createVideo(reqBody)
        return res.status(HttpStatus.CREATED)
    }

    @Get()
    async read(@Query() id: string): Promise<Object> {
        return await this.videoService.readVideo(id);
    }

    @Get('/:id')
    async stream(@Param('id') id: string, @Res() res, @Req() req){
        return await this.videoService.streamVideo(id, res, req);
    }

    @Put('/:id')
    async update(@Res() res, @Param('id') id: string, @Body() video: Video) {
        const updateVideo = await this.videoService.updateVideo(id, video);
        return res.status(HttpStatus.OK).json(updateVideo)
    }

    @Delete('/:id')
    async delete(@Res() res, @Param('id') id) {
        await this.videoService.deleteVideo(id);
        return res.status(HttpStatus.OK).json({
            message: 'User has been deleted',
            user: null
        })
    }
    
} 

    
