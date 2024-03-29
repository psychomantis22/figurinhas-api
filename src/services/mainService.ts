import { Request, Response, NextFunction } from 'express'
import AlbumService from "./albumService.js";
import TokenService from "./tokenService.js";
import FigurinhaService from './figurinhaService.js';
import util from '../util/util.js';
import TwitchService from './twitchService.js';

export default {
    injectServices: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.app.services) {
                const albumService = new AlbumService(req.app.db);
                const tokenService = new TokenService(req.app.db);
                const figurinhaService = new FigurinhaService(req.app.db);
                const twitchService = new TwitchService(req.app.db);

                req.app.services = {
                    albumService,
                    tokenService,
                    figurinhaService,
                    twitchService
                };
            };
            
            next();
        } catch (e) {
            const error = util.handleError(e, "Service injection failed");
            res.status(error.status).json(error);
        }
    }
}