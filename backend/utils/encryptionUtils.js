const crypto = require("crypto");

class PasswordEncryption {
    constructor() {
        this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
        if (Buffer.from(this.encryptionKey, 'hex').length !== 32) {
            throw new Error('Encryption key must be 32 bytes (64 hex characters)');
        }
        this.algorithm = 'aes-256-gcm';
    }

    encrypt(password, aad = 'email-config') {
        if (!password) throw new Error('Password is required');
        
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'hex'), iv);
            cipher.setAAD(Buffer.from(aad));

            let encrypted = cipher.update(password, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag();

            return {
                encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

 
    decrypt(encryptedData, aad = 'email-config') {
        try {
            const decipher = crypto.createDecipheriv(
                this.algorithm,
                Buffer.from(this.encryptionKey, 'hex'),
                Buffer.from(encryptedData.iv, 'hex')
            );
            decipher.setAAD(Buffer.from(aad));
            decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
}

module.exports = new PasswordEncryption();