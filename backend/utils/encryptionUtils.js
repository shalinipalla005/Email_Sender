const crypto = require("crypto");

class PasswordEncryption {
    constructor() {
        // Generate a new key if none exists
        if (!process.env.ENCRYPTION_KEY) {
            const generatedKey = crypto.randomBytes(32).toString('hex');
            console.log('\x1b[33m%s\x1b[0m', `Warning: No ENCRYPTION_KEY found in environment variables.`);
            console.log('\x1b[32m%s\x1b[0m', `Generated new key: ${generatedKey}`);
            console.log('\x1b[33m%s\x1b[0m', `Please add this key to your .env file as ENCRYPTION_KEY=${generatedKey}`);
            this.encryptionKey = Buffer.from(generatedKey, 'hex');
        } else {
            try {
                this.encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
                if (this.encryptionKey.length !== 32) {
                    throw new Error('Invalid key length');
                }
            } catch (error) {
                const generatedKey = crypto.randomBytes(32).toString('hex');
                console.log('\x1b[31m%s\x1b[0m', `Error: Invalid ENCRYPTION_KEY in environment variables.`);
                console.log('\x1b[32m%s\x1b[0m', `Generated new key: ${generatedKey}`);
                console.log('\x1b[33m%s\x1b[0m', `Please add this key to your .env file as ENCRYPTION_KEY=${generatedKey}`);
                this.encryptionKey = Buffer.from(generatedKey, 'hex');
            }
        }
        
        this.algorithm = 'aes-256-gcm';
    }

    encrypt(password, aad = 'email-config') {
        if (!password) throw new Error('Password is required');
        
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
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
                this.encryptionKey,
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
