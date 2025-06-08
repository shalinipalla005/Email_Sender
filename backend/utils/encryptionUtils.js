const crypto = require("crypto");

class PasswordEncryption {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.initializeEncryptionKey();
    }

    initializeEncryptionKey() {
        if (!process.env.ENCRYPTION_KEY) {
            const generatedKey = crypto.randomBytes(32).toString('hex');
            console.log('\x1b[33m%s\x1b[0m', `Warning: No ENCRYPTION_KEY found in environment variables.`);
            console.log('\x1b[32m%s\x1b[0m', `Generated new key: ${generatedKey}`);
            console.log('\x1b[33m%s\x1b[0m', `Please add this key to your .env file as ENCRYPTION_KEY=${generatedKey}`);
            this.encryptionKey = Buffer.from(generatedKey, 'hex');
        } else {
            try {
                const key = process.env.ENCRYPTION_KEY;
                // Ensure the key is a valid hex string
                if (!/^[0-9a-fA-F]{64}$/.test(key)) {
                    throw new Error('Invalid key format');
                }
                this.encryptionKey = Buffer.from(key, 'hex');
                if (this.encryptionKey.length !== 32) {
                    throw new Error('Invalid key length');
                }
            } catch (error) {
                const generatedKey = crypto.randomBytes(32).toString('hex');
                console.log('\x1b[31m%s\x1b[0m', `Error: Invalid ENCRYPTION_KEY in environment variables: ${error.message}`);
                console.log('\x1b[32m%s\x1b[0m', `Generated new key: ${generatedKey}`);
                console.log('\x1b[33m%s\x1b[0m', `Please add this key to your .env file as ENCRYPTION_KEY=${generatedKey}`);
                this.encryptionKey = Buffer.from(generatedKey, 'hex');
            }
        }
    }

    encrypt(password, aad = 'email-config') {
        if (!password) throw new Error('Password is required');
        
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
            
            // Convert AAD to Buffer if it's a string
            const aadBuffer = Buffer.from(aad);
            cipher.setAAD(aadBuffer);

            let encrypted = cipher.update(password, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag();

            return {
                encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    decrypt(encryptedData, aad = 'email-config') {
        try {
            if (!encryptedData || !encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
                throw new Error('Invalid encrypted data structure');
            }

            // Convert hex strings to Buffers
            const encryptedBuffer = Buffer.from(encryptedData.encrypted, 'hex');
            const ivBuffer = Buffer.from(encryptedData.iv, 'hex');
            const authTagBuffer = Buffer.from(encryptedData.authTag, 'hex');
            const aadBuffer = Buffer.from(aad);

            const decipher = crypto.createDecipheriv(
                this.algorithm,
                this.encryptionKey,
                ivBuffer
            );

            decipher.setAuthTag(authTagBuffer);
            decipher.setAAD(aadBuffer);

            let decrypted = decipher.update(encryptedBuffer, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
}

// Create and export a singleton instance
const protection = new PasswordEncryption();
module.exports = protection;
