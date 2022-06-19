import { Request, Response, NextFunction } from 'express'
import AlbumService from "./albumService.js";
import TokenService from "./tokenService.js";
import FigurinhaService from './figurinhaService.js';

export default {
    injectServices: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.app.services) {
                const albumService = new AlbumService(req.app.db);
                const tokenService = new TokenService(req.app.db);
                const figurinhaService = new FigurinhaService(req.app.db, albumService);

                req.app.services = {
                    albumService,
                    tokenService,
                    figurinhaService
                };
            };
            
            next();
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: true, message: "Failed services injection " });
        }
    }
}