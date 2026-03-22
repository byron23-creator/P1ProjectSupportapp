// PBKDF2-SHA512 + JWT. Variables requeridas: JWT_SECRET, JWT_EXPIRES_IN
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { IAuthService } = require('../../Soporte.Application/Services/IAuthService');

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH = 64;
const PBKDF2_DIGEST    = 'sha512';
const SALT_BYTES       = 32;

class AuthService extends IAuthService {
  constructor() {
    super();
    this.jwtSecret    = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';

    if (this.jwtSecret === 'CHANGE_THIS_SECRET_IN_PRODUCTION' && process.env.NODE_ENV === 'production') {
      throw new Error('AuthService: JWT_SECRET environment variable must be set in production.');
    }
  }

  async generateSalt() {
    return crypto.randomBytes(SALT_BYTES).toString('hex');
  }

  async hashPassword(plainPassword, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        plainPassword,
        salt,
        PBKDF2_ITERATIONS,
        PBKDF2_KEY_LENGTH,
        PBKDF2_DIGEST,
        (err, derivedKey) => {
          if (err) return reject(err);
          resolve(derivedKey.toString('hex'));
        }
      );
    });
  }

  async verifyPassword(plainPassword, storedHash, storedSalt) {
    const computedHash = await this.hashPassword(plainPassword, storedSalt);
    // timingSafeEqual para prevenir timing attacks
    const storedBuffer   = Buffer.from(storedHash, 'hex');
    const computedBuffer = Buffer.from(computedHash, 'hex');
    if (storedBuffer.length !== computedBuffer.length) return false;
    return crypto.timingSafeEqual(storedBuffer, computedBuffer);
  }

  async generateToken(payload) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn, algorithm: 'HS256' },
        (err, token) => {
          if (err) return reject(err);
          resolve(token);
        }
      );
    });
  }

  async verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.jwtSecret, { algorithms: ['HS256'] }, (err, decoded) => {
        if (err) return reject(new Error(`AuthService: Invalid or expired token. ${err.message}`));
        resolve(decoded);
      });
    });
  }
}

module.exports = { AuthService };
