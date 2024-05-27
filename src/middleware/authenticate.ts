import { Request, Response, NextFunction } from "express";

const secretKey = "your_secret_key"; // Replace with your secret key

interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

// Function to generate a JWT
export function generateToken(payload: object): string {
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
}

// Middleware to verify a JWT
export function verifyToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers["authorization"];

  if (!token) {
    res.status(403).send({ message: "No token provided!" });
    return;
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(500).send({ message: "Failed to authenticate token." });
      return;
    }
    req.user = decoded;
    next();
  });
}
