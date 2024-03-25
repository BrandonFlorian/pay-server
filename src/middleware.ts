import type { Request, Response, NextFunction  } from 'express';
import * as jwt from 'jsonwebtoken';

export const authenticateToken = (request: Request, response: Response, next: NextFunction) => {
    // Get the auth header value
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
    if (token == null) {
      return response.sendStatus(401); // If no token, return 401 Unauthorized
    }
  
    // Verify the token
    try {
      // The logic here is going to depend on how tokens are structured and validated.
      // Right now it is tbd so will need to change this once determined.
  
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err: any, user: any) => {
        if (err) return response.sendStatus(403); // if the token is no longer valid
        request.user = user;
        next(); // pass the execution off to whatever request the client intended
      });
    } catch (error) {
      // If token is not valid, respond with 403 Forbidden
      return response.sendStatus(403);
    }
  };