class SecurityManager {
  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
    this.sessionToken = null;
    this.accessLevel = 'guest'; // guest, user, admin, super_admin
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.lastActivity = Date.now();
    this.maxLoginAttempts = 3;
    this.loginAttempts = 0;
    this.lockoutTime = 15 * 60 * 1000; // 15 minutes
    this.auditLog = [];
    this.storageData = new Map(); // In-memory secure storage simulation
  }

  // Generate a unique encryption key for this session
  generateEncryptionKey() {
    const deviceId = this.getDeviceId();
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return this.simpleHash(deviceId + timestamp + random);
  }

  // Simple hash function (for demo - in production use proper crypto)
  simpleHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Simulate device ID (in real app, use react-native-device-info)
  getDeviceId() {
    if (!this.deviceId) {
      this.deviceId = 'DEVICE_' + Math.random().toString(36).substring(2, 15);
    }
    return this.deviceId;
  }

  // Simple XOR encryption (for demo - in production use proper encryption)
  encryptData(data) {
    try {
      const jsonString = JSON.stringify(data);
      let encrypted = '';
      const key = this.encryptionKey;
      
      for (let i = 0; i < jsonString.length; i++) {
        encrypted += String.fromCharCode(
          jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return btoa(encrypted); // Base64 encode
    } catch (error) {
      this.logSecurityEvent('ENCRYPTION_ERROR', { error: error.message });
      throw new Error('Data encryption failed');
    }
  }

  // Simple XOR decryption
  decryptData(encryptedData) {
    try {
      const encrypted = atob(encryptedData); // Base64 decode
      let decrypted = '';
      const key = this.encryptionKey;
      
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(
          encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return JSON.parse(decrypted);
    } catch (error) {
      this.logSecurityEvent('DECRYPTION_ERROR', { error: error.message });
      throw new Error('Data decryption failed');
    }
  }

  // Simple password hashing (for demo - in production use proper PBKDF2/bcrypt)
  hashPassword(password, salt = null) {
    if (!salt) {
      salt = Math.random().toString(36).substring(2, 15);
    }
    const hash = this.simpleHash(password + salt);
    return { hash, salt };
  }

  // Verify password hash
  verifyPassword(password, hash, salt) {
    const computed = this.hashPassword(password, salt);
    return computed.hash === hash;
  }

  // Generate secure session token
  generateSessionToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const deviceId = this.getDeviceId();
    return this.simpleHash(timestamp + random + deviceId);
  }

  // Start secure session
  startSession(accessLevel = 'user') {
    this.sessionToken = this.generateSessionToken();
    this.accessLevel = accessLevel;
    this.lastActivity = Date.now();
    this.logSecurityEvent('SESSION_START', { accessLevel, sessionToken: this.sessionToken });
    return this.sessionToken;
  }

  // Validate session
  validateSession() {
    if (!this.sessionToken) {
      return { valid: false, reason: 'No active session' };
    }

    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;

    if (timeSinceActivity > this.sessionTimeout) {
      this.endSession();
      return { valid: false, reason: 'Session expired' };
    }

    // Update last activity
    this.lastActivity = now;
    return { valid: true, accessLevel: this.accessLevel };
  }

  // End session
  endSession() {
    this.logSecurityEvent('SESSION_END', { sessionToken: this.sessionToken });
    this.sessionToken = null;
    this.accessLevel = 'guest';
    this.lastActivity = null;
  }

  // Check access permissions
  hasPermission(requiredLevel) {
    const levels = {
      'guest': 0,
      'user': 1,
      'admin': 2,
      'super_admin': 3
    };

    const userLevel = levels[this.accessLevel] || 0;
    const required = levels[requiredLevel] || 0;

    return userLevel >= required;
  }

  // Sanitize data based on access level
  sanitizeData(data, dataType) {
    const session = this.validateSession();
    if (!session.valid) {
      return null;
    }

    switch (dataType) {
      case 'customer':
        return this.sanitizeCustomerData(data);
      case 'invoice':
        return this.sanitizeInvoiceData(data);
      case 'inventory':
        return this.sanitizeInventoryData(data);
      case 'supplier':
        return this.sanitizeSupplierData(data);
      default:
        return data;
    }
  }

  // Sanitize customer data based on access level
  sanitizeCustomerData(data) {
    if (!this.hasPermission('user')) {
      return null;
    }

    if (!this.hasPermission('admin')) {
      // Hide sensitive information for regular users
      return {
        ...data,
        email: this.maskEmail(data.email),
        phone: this.maskPhone(data.phone),
        address: this.maskAddress(data.address),
        creditInfo: '[RESTRICTED]',
        paymentTerms: '[RESTRICTED]'
      };
    }

    return data; // Full access for admins
  }

  // Sanitize invoice data
  sanitizeInvoiceData(data) {
    if (!this.hasPermission('user')) {
      return null;
    }

    if (!this.hasPermission('admin')) {
      // Hide financial details for regular users
      return {
        ...data,
        customerEmail: this.maskEmail(data.customerEmail),
        subtotal: '[RESTRICTED]',
        tax: '[RESTRICTED]',
        total: '[RESTRICTED]',
        paymentMethod: '[RESTRICTED]'
      };
    }

    return data;
  }

  // Sanitize inventory data
  sanitizeInventoryData(data) {
    if (!this.hasPermission('user')) {
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        status: data.status > 0 ? 'In Stock' : 'Out of Stock'
      };
    }

    if (!this.hasPermission('admin')) {
      return {
        ...data,
        cost: '[RESTRICTED]',
        supplier: '[RESTRICTED]',
        profit: '[RESTRICTED]'
      };
    }

    return data;
  }

  // Sanitize supplier data
  sanitizeSupplierData(data) {
    if (!this.hasPermission('admin')) {
      return {
        id: data.id,
        name: data.name,
        location: data.location,
        specialization: data.specialization,
        rating: data.rating
      };
    }

    return data;
  }

  // Mask email addresses
  maskEmail(email) {
    if (!email) return '[HIDDEN]';
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
    return maskedUsername + '@' + domain;
  }

  // Mask phone numbers
  maskPhone(phone) {
    if (!phone) return '[HIDDEN]';
    return phone.substring(0, 3) + '-***-****';
  }

  // Mask addresses
  maskAddress(address) {
    if (!address) return '[HIDDEN]';
    return '[STREET ADDRESS HIDDEN]';
  }

  // Log security events
  logSecurityEvent(eventType, details = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      sessionToken: this.sessionToken,
      accessLevel: this.accessLevel,
      deviceId: this.getDeviceId(),
      details
    };

    this.auditLog.push(event);
    
    // Keep only last 1000 events to prevent memory issues
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }

    console.log('Security Event:', event);
  }

  // Get audit log (admin only)
  getAuditLog() {
    if (!this.hasPermission('admin')) {
      this.logSecurityEvent('UNAUTHORIZED_AUDIT_ACCESS');
      throw new Error('Insufficient permissions to access audit log');
    }

    return this.auditLog;
  }

  // Data integrity check using checksums
  generateChecksum(data) {
    return this.simpleHash(JSON.stringify(data));
  }

  // Verify data integrity
  verifyIntegrity(data, expectedChecksum) {
    const actualChecksum = this.generateChecksum(data);
    return actualChecksum === expectedChecksum;
  }

  // Secure storage operations (using in-memory Map for demo)
  secureStore(key, data) {
    try {
      const encryptedData = this.encryptData(data);
      const checksum = this.generateChecksum(data);
      const securePackage = {
        data: encryptedData,
        checksum: checksum,
        timestamp: Date.now()
      };
      
      this.storageData.set(key, JSON.stringify(securePackage));
      this.logSecurityEvent('SECURE_STORE', { key });
    } catch (error) {
      this.logSecurityEvent('STORE_ERROR', { key, error: error.message });
      throw error;
    }
  }

  // Secure retrieval operations
  secureRetrieve(key) {
    try {
      const stored = this.storageData.get(key);
      if (!stored) {
        return null;
      }

      const securePackage = JSON.parse(stored);
      const decryptedData = this.decryptData(securePackage.data);
      
      // Verify integrity
      if (!this.verifyIntegrity(decryptedData, securePackage.checksum)) {
        this.logSecurityEvent('INTEGRITY_VIOLATION', { key });
        throw new Error('Data integrity check failed');
      }

      this.logSecurityEvent('SECURE_RETRIEVE', { key });
      return decryptedData;
    } catch (error) {
      this.logSecurityEvent('RETRIEVE_ERROR', { key, error: error.message });
      throw error;
    }
  }

  // Rate limiting for API calls
  checkRateLimit(operation, maxRequests = 100, timeWindow = 60000) {
    const now = Date.now();
    const key = `${operation}_${this.sessionToken}`;
    
    if (!this.rateLimitTracking) {
      this.rateLimitTracking = {};
    }

    if (!this.rateLimitTracking[key]) {
      this.rateLimitTracking[key] = [];
    }

    // Clean old entries
    this.rateLimitTracking[key] = this.rateLimitTracking[key].filter(
      timestamp => now - timestamp < timeWindow
    );

    if (this.rateLimitTracking[key].length >= maxRequests) {
      this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { operation });
      return false;
    }

    this.rateLimitTracking[key].push(now);
    return true;
  }

  // Input validation and sanitization
  validateInput(input, type) {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'phone':
        return /^[\+]?[1-9][\d]{0,15}$/.test(input.replace(/[\s\-\(\)]/g, ''));
      case 'alphanumeric':
        return /^[a-zA-Z0-9\s]+$/.test(input);
      case 'numeric':
        return /^[0-9]+(\.[0-9]+)?$/.test(input);
      default:
        return true;
    }
  }

  // Sanitize input to prevent injection attacks
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['";]/g, '') // Remove potential SQL injection characters
      .trim();
  }

  // Get security status
  getSecurityStatus() {
    const session = this.validateSession();
    return {
      isAuthenticated: session.valid,
      accessLevel: this.accessLevel,
      sessionActive: !!this.sessionToken,
      lastActivity: this.lastActivity,
      timeUntilExpiry: session.valid ? 
        this.sessionTimeout - (Date.now() - this.lastActivity) : 0,
      auditLogEntries: this.auditLog.length
    };
  }
}

// Export singleton instance
const securityManager = new SecurityManager();
export default securityManager;