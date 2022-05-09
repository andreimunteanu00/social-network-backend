import {NextFunction, Request, Response} from "express";
import * as HttpStatus from "http-status";
import jwt_decode from "jwt-decode";

export const loggedUser = (req: Request, res: Response, next: NextFunction) => {

  const encodedToken = <string>req.headers["authorization"]?.substring(7);
  const token: any = jwt_decode(encodedToken);
  if (token.userId !== +req.params.id) {
    if (token.role !== "ADMIN") {
      res.status(HttpStatus.UNAUTHORIZED).send();
    }
  }
  next();

};
