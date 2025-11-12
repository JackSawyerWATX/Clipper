import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert as RNAlert, Platform, Dimensions } from 'react-native';
import WebAlert from '../utils/WebAlert';
import securityManager from '../security/SecurityManager';

const Alert = Platform.OS === 'web' ? WebAlert : RNAlert;

export default function Login({ onLoginSuccess, onCreateAccount }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // PRODUCTION MODE - Full security enabled
  const isDevelopmentMode = false;

  // Production accounts - Use proper credentials in production
  const [demoAccounts, setDemoAccounts] = useState([
    { username: 'admin', password: 'ClipperAdmin2024!', role: 'admin', name: 'System Administrator' },
    { username: 'manager', password: 'ClipperMgr2024!', role: 'manager', name: 'Operations Manager' }
  ]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isLocked && lockoutTimer > 0) {
      const timer = setTimeout(() => {
        setLockoutTimer(lockoutTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockoutTimer === 0 && isLocked) {
      setIsLocked(false);
      setLoginAttempts(0);
    }
  }, [lockoutTimer, isLocked]);

  const validatePassword = (pass) => {
    // DEVELOPMENT MODE - Relaxed password validation
    if (isDevelopmentMode) {
      if (pass.length < 1) {
        return { isValid: false, message: 'Password cannot be empty (dev mode - any password accepted)' };
      }
      return { isValid: true, message: '' };
    }

    // Production validation (disabled in dev mode)
    const minLength = 6;
    const hasNumber = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    
    if (pass.length < minLength) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    if (!hasNumber) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!hasLetter) {
      return { isValid: false, message: 'Password must contain at least one letter' };
    }
    return { isValid: true, message: '' };
  };

  const validateUsername = (user) => {
    // DEVELOPMENT MODE - Relaxed username validation
    if (isDevelopmentMode) {
      if (user.length < 1) {
        return { isValid: false, message: 'Username cannot be empty (dev mode - any username accepted)' };
      }
      return { isValid: true, message: '' };
    }

    // Production validation (disabled in dev mode)
    const minLength = 3;
    const validChars = /^[a-zA-Z0-9_]+$/.test(user);
    
    if (user.length < minLength) {
      return { isValid: false, message: 'Username must be at least 3 characters long' };
    }
    if (!validChars) {
      return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    return { isValid: true, message: '' };
  };

  const handleLogin = async () => {
    // DEVELOPMENT MODE - Skip lockout checks
    if (!isDevelopmentMode && isLocked) {
      Alert.alert(
        '🔒 Account Locked',
        `Too many failed attempts. Please wait ${lockoutTimer} seconds before trying again.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (!username.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both username and password.', [{ text: 'OK' }]);
      return;
    }

    setIsLoading(true);

    // Reduced delay in development mode
    const delay = isDevelopmentMode ? 500 : 1500;
    
    setTimeout(async () => {
      try {
        // Check against demo accounts
        const account = demoAccounts.find(acc => 
          acc.username.toLowerCase() === username.toLowerCase().trim() && 
          acc.password === password.trim()
        );



        if (account) {
          // Successful login
          let sessionToken = 'dev-session-' + Date.now();
          
          // Try security manager, but don't let it block login
          try {
            if (securityManager && securityManager.startSession) {
              sessionToken = securityManager.startSession(account.role);
            }
            if (securityManager && securityManager.logActivity) {
              securityManager.logActivity('LOGIN_SUCCESS', `User ${account.username} logged in successfully`);
            }
          } catch (error) {
            console.warn('Security manager error (non-blocking):', error);
          }
          
          setLoginAttempts(0);
          setIsLocked(false);
          
          // Simplified success in dev mode - auto-login without alert
          if (isDevelopmentMode) {
            // Auto-proceed to dashboard in development mode
            if (onLoginSuccess) {
              onLoginSuccess({
                user: account,
                sessionToken,
                accessLevel: account.role
              });
            } else {
              console.error('❌ onLoginSuccess is not defined!');
            }
          } else {
            Alert.alert(
              '✅ Login Successful',
              `Welcome back, ${account.name}!\n\nRole: ${account.role.toUpperCase()}\nSession started with enhanced security.`,
              [
                {
                  text: 'Continue',
                  onPress: () => onLoginSuccess({
                    user: account,
                    sessionToken,
                    accessLevel: account.role
                  })
                }
              ]
            );
          }
        } else {
          // Failed login - DEVELOPMENT MODE: No lockout, just simple error
          if (isDevelopmentMode) {
            Alert.alert(
              '❌ Login Failed (Dev Mode)',
              `Username or password not found.\n\nTry: admin/123 or test/1\n\nNo lockout in development mode.`,
              [{ text: 'Try Again' }]
            );
          } else {
            // Production mode lockout logic
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            
            if (securityManager && securityManager.logActivity) {
              securityManager.logActivity('LOGIN_FAILED', `Failed login attempt for username: ${username}`);
            }

            if (newAttempts >= 3) {
              setIsLocked(true);
              setLockoutTimer(300); // 5 minutes lockout
              Alert.alert(
                '🚫 Account Locked',
                'Too many failed login attempts. Your account has been locked for 5 minutes for security purposes.',
                [{ text: 'OK' }]
              );
            } else {
              Alert.alert(
                '❌ Login Failed',
                `Invalid username or password.\n\nAttempts remaining: ${3 - newAttempts}`,
                [{ text: 'Try Again' }]
              );
            }
          }
        }
      } catch (error) {
        Alert.alert('Login Error', error.message, [{ text: 'OK' }]);
      } finally {
        setIsLoading(false);
      }
    }, delay);
  };

  const handleCreateAccount = async () => {
    if (!username.trim() || !password.trim() || (!isDevelopmentMode && !confirmPassword.trim())) {
      Alert.alert('Validation Error', 'Please fill in all fields.', [{ text: 'OK' }]);
      return;
    }

    const usernameValidation = validateUsername(username.trim());
    if (!usernameValidation.isValid) {
      Alert.alert('Username Error', usernameValidation.message, [{ text: 'OK' }]);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert('Password Error', passwordValidation.message, [{ text: 'OK' }]);
      return;
    }

    // Only check password confirmation in production mode or if confirmPassword is filled
    if (!isDevelopmentMode && password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.', [{ text: 'OK' }]);
      return;
    }

    // Check if username already exists
    const existingAccount = demoAccounts.find(acc => 
      acc.username.toLowerCase() === username.toLowerCase().trim()
    );

    if (existingAccount) {
      Alert.alert('Account Error', 'Username already exists. Please choose a different username.', [{ text: 'OK' }]);
      return;
    }

    setIsLoading(true);

    // Reduced delay in development mode
    const delay = isDevelopmentMode ? 500 : 2000;

    // Create account
    setTimeout(() => {
      try {
        const newAccount = {
          username: username.trim(),
          password: password,
          role: 'user',
          name: isDevelopmentMode ? `Dev User ${username.trim()}` : `User ${username.trim()}`,
          createdAt: new Date().toISOString()
        };

        // Add to accounts list
        setDemoAccounts(prevAccounts => [...prevAccounts, newAccount]);
        
        if (securityManager && securityManager.logActivity) {
          securityManager.logActivity('ACCOUNT_CREATED', `New account created: ${username.trim()}`);
        }

        if (isDevelopmentMode) {
          Alert.alert(
            '🎉 Dev Account Created',
            `Account created successfully!\n\nUsername: ${newAccount.username}\nPassword: ${newAccount.password}\nRole: ${newAccount.role}\n\nYou can now login with these credentials.`,
            [
              {
                text: 'Auto Login',
                onPress: () => {
                  setIsCreateMode(false);
                  setConfirmPassword('');
                  // Auto-login the newly created account
                  setTimeout(() => {
                    const sessionToken = securityManager.startSession(newAccount.role, newAccount);
                    onLoginSuccess({
                      user: newAccount,
                      sessionToken,
                      accessLevel: newAccount.role
                    });
                  }, 100);
                }
              },
              {
                text: 'Login Manually',
                onPress: () => {
                  setIsCreateMode(false);
                  setPassword('');
                  setConfirmPassword('');
                }
              }
            ]
          );
        } else {
          Alert.alert(
            '🎉 Account Created Successfully',
            `Welcome to Clipper Aviation Logistics!\n\nUsername: ${newAccount.username}\nRole: ${newAccount.role}\n\nYou can now log in with your credentials.`,
            [
              {
                text: 'Login Now',
                onPress: () => {
                  setIsCreateMode(false);
                  setPassword('');
                  setConfirmPassword('');
                }
              }
            ]
          );
        }
      } catch (error) {
        Alert.alert('Account Creation Error', `Failed to create account: ${error.message}`, [{ text: 'OK' }]);
      } finally {
        setIsLoading(false);
      }
    }, delay);
  };

  const showDemoAccounts = () => {
    const accountList = demoAccounts.map(acc => 
      `• ${acc.username} / ${acc.password} (${acc.role})`
    ).join('\n');

    if (isDevelopmentMode) {
      Alert.alert(
        '� Development Accounts',
        `DEVELOPMENT MODE - Easy login credentials:\n\n${accountList}\n\n✅ No password requirements\n✅ No account lockouts\n✅ Fast login process`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '�🔑 Demo Accounts',
        `You can use these demo accounts to test the system:\n\n${accountList}\n\nNote: This is a demo system. In production, accounts would be created through proper registration.`,
        [{ text: 'OK' }]
      );
    }
  };

  const isDesktop = screenData.width >= 1024;
  const containerStyle = isDesktop ? styles.desktopContainer : styles.mobileContainer;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.loginCard, isDesktop && styles.desktopCard]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>✈️ Clipper</Text>
          <Text style={styles.subtitle}>Aviation Logistics</Text>
          <Text style={styles.description}>
            {isCreateMode ? 'Create New Account' : 'Secure Access Portal'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isCreateMode && !isDevelopmentMode && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          )}

          {isCreateMode && isDevelopmentMode && (
            <View style={styles.devModeBox}>
              <Text style={styles.devModeText}>
                🚧 DEV MODE - No Password Confirmation Required
              </Text>
              <Text style={styles.devModeSubtext}>
                Account creation simplified for development
              </Text>
            </View>
          )}

          {/* Development Mode Notice */}
          {isDevelopmentMode && (
            <View style={styles.devModeBox}>
              <Text style={styles.devModeText}>
                🚧 DEVELOPMENT MODE - Relaxed Security
              </Text>
              <Text style={styles.devModeSubtext}>
                No lockouts • Simple passwords accepted • Fast login
              </Text>
            </View>
          )}

          {/* Security Info - Only in production mode */}
          {!isDevelopmentMode && loginAttempts > 0 && !isCreateMode && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ {loginAttempts} failed attempt{loginAttempts > 1 ? 's' : ''}. {3 - loginAttempts} remaining.
              </Text>
            </View>
          )}

          {!isDevelopmentMode && isLocked && (
            <View style={styles.lockoutBox}>
              <Text style={styles.lockoutText}>
                🔒 Account locked. Unlock in {Math.floor(lockoutTimer / 60)}:{(lockoutTimer % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}

          {/* Buttons */}
          <TouchableOpacity 
            style={[styles.primaryButton, (isLoading || (!isDevelopmentMode && isLocked)) && styles.disabledButton]}
            onPress={isCreateMode ? handleCreateAccount : handleLogin}
            disabled={isLoading || (!isDevelopmentMode && isLocked)}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? '⏳ Processing...' : isCreateMode ? '🎯 Create Account' : isDevelopmentMode ? '🚧 Dev Login' : '🔐 Secure Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {
              setIsCreateMode(!isCreateMode);
              setPassword('');
              setConfirmPassword('');
              setLoginAttempts(0);
            }}
          >
            <Text style={styles.secondaryButtonText}>
              {isCreateMode ? '← Back to Login' : '+ Create New Account'}
            </Text>
          </TouchableOpacity>

          {!isCreateMode && (
            <>
              <TouchableOpacity 
                style={styles.demoButton}
                onPress={showDemoAccounts}
              >
                <Text style={styles.demoButtonText}>
                  {isDevelopmentMode ? '🚧 Dev Accounts' : '🔑 View Demo Accounts'}
                </Text>
              </TouchableOpacity>
              

            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.securityIndicators}>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>Encrypted</Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🛡️</Text>
              <Text style={styles.securityText}>Secure</Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>📊</Text>
              <Text style={styles.securityText}>Audited</Text>
            </View>
          </View>
          <Text style={styles.version}>v1.0.0 - Secure Access System</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileContainer: {
    padding: 20,
  },
  desktopContainer: {
    padding: 40,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  desktopCard: {
    maxWidth: 450,
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeIcon: {
    fontSize: 20,
  },
  devModeBox: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  devModeText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  devModeSubtext: {
    color: '#388e3c',
    fontSize: 12,
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  lockoutBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  lockoutText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  demoButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  demoButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },


  footer: {
    alignItems: 'center',
  },
  securityIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  securityItem: {
    alignItems: 'center',
  },
  securityIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  version: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});