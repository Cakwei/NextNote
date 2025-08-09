import * as jwt from "jose";
import { JOSEError } from "jose/errors";

export async function signToken(payload: object) {
  try {
    const SECRET_KEY = process.env.JWT_SECRET;
    if (!SECRET_KEY) {
      throw new Error("JWT_SECRET is not defined");
    }

    // ==== //
    const token = await new jwt.CompactSign(
      new TextEncoder().encode(JSON.stringify(payload))
    )
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(new TextEncoder().encode(SECRET_KEY));
    return token;
  } catch (e) {
    if (e instanceof JOSEError) {
      console.log("Error signing JWT token @ jwt.ts");
    }
    return "";
  }
}

export async function verifyToken(token: string) {
  try {
    const SECRET_KEY = process.env.JWT_SECRET;
    if (!SECRET_KEY) {
      throw new Error("JWT_SECRET is not defined");
    }

    // ==== //
    const { payload } = await jwt.compactVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );

    const decodedPayload = new TextDecoder().decode(payload);
    return decodedPayload;
  } catch (e) {
    if (e instanceof JOSEError) {
      console.log("Failed to verify token @ jwt.ts");
    }
    return ;
  }
}

/*
export async function decodeToken(token: string) {
  try {
    const SECRET_KEY = process.env.JWT_SECRET;
    if (!SECRET_KEY) {
      throw new Error("JWT_SECRET is not defined");
    }

    // ==== //
    const { plaintext } = await jwt.compactDecrypt(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );

    const decodedPayload = new TextDecoder().decode(payload);
    return decodedPayload;
  } catch (e) {
    if (e instanceof JOSEError) {
      console.log("Failed to verify token @ jwt.ts");
    }
    return false;
  }
}*/
