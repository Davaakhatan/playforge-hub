'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

interface TwoFactorSetupData {
  secret: string;
  uri: string;
  backupCodes: string[];
}

export default function SecuritySettingsPage() {
  const { user, refreshUser } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Enable 2FA states
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'initial' | 'setup' | 'verify' | 'backup'>('initial');

  // Disable 2FA states
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);

  useEffect(() => {
    if (user) {
      setIs2FAEnabled(user.twoFactorEnabled || false);
    }
  }, [user]);

  const handleStartSetup = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start 2FA setup');
      }

      setSetupData(data);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setStep('backup');
      setIs2FAEnabled(true);
      if (refreshUser) refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword, code: disableCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA');
      }

      setIs2FAEnabled(false);
      setShowDisableForm(false);
      setDisablePassword('');
      setDisableCode('');
      setSuccess('Two-factor authentication has been disabled');
      if (refreshUser) refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    setStep('initial');
    setSetupData(null);
    setPassword('');
    setVerificationCode('');
    setSuccess('Two-factor authentication has been enabled');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">
          Please <Link href="/login" className="text-blue-400 hover:text-blue-300">log in</Link> to access security settings.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Security Settings</h1>
        <p className="mt-2 text-zinc-400">Manage your account security</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      <div className="rounded-xl bg-zinc-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
            <p className="text-sm text-zinc-400">
              Add an extra layer of security to your account
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              is2FAEnabled
                ? 'bg-green-500/10 text-green-400'
                : 'bg-zinc-700 text-zinc-400'
            }`}
          >
            {is2FAEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Initial state - Show enable/disable button */}
        {step === 'initial' && !showDisableForm && (
          <div>
            {!is2FAEnabled ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Use an authenticator app like Google Authenticator, Authy, or 1Password to generate one-time codes.
                </p>
                <div className="space-y-3">
                  <Input
                    label="Enter your password to continue"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                  />
                  <Button
                    onClick={handleStartSetup}
                    disabled={isLoading || !password}
                  >
                    {isLoading ? 'Setting up...' : 'Enable 2FA'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Two-factor authentication is currently enabled. Your account is protected with an additional security layer.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setShowDisableForm(true)}
                >
                  Disable 2FA
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Disable 2FA form */}
        {showDisableForm && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              To disable two-factor authentication, enter your password and a verification code.
            </p>
            <Input
              label="Password"
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Your password"
            />
            <Input
              label="2FA Code"
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              placeholder="6-digit code"
              maxLength={6}
            />
            <div className="flex gap-3">
              <Button
                onClick={handleDisable}
                disabled={isLoading || !disablePassword || !disableCode}
                variant="secondary"
              >
                {isLoading ? 'Disabling...' : 'Disable 2FA'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDisableForm(false);
                  setDisablePassword('');
                  setDisableCode('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Setup step - Show QR code */}
        {step === 'verify' && setupData && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="mb-4 text-sm text-zinc-400">
                Scan this QR code with your authenticator app:
              </p>
              <div className="mx-auto inline-block rounded-lg bg-white p-4">
                {/* QR Code placeholder - in production use a QR library */}
                <div className="flex h-48 w-48 items-center justify-center bg-zinc-100 text-zinc-600">
                  <div className="text-center text-xs">
                    <p className="font-mono break-all">{setupData.uri}</p>
                    <p className="mt-2 text-zinc-500">
                      (Use a QR code generator or enter manually)
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-zinc-500">
                Or enter this code manually: <br />
                <code className="text-blue-400">{setupData.secret}</code>
              </p>
            </div>

            <div className="space-y-3">
              <Input
                label="Enter the 6-digit code from your app"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleVerify}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStep('initial');
                    setSetupData(null);
                    setPassword('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Backup codes step */}
        {step === 'backup' && setupData && (
          <div className="space-y-6">
            <div className="rounded-lg bg-yellow-500/10 p-4">
              <h3 className="font-semibold text-yellow-400">Save your backup codes</h3>
              <p className="mt-1 text-sm text-yellow-300/80">
                These codes can be used to access your account if you lose your authenticator device. Each code can only be used once.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {setupData.backupCodes.map((code, index) => (
                <code
                  key={index}
                  className="rounded bg-zinc-800 px-3 py-2 text-center font-mono text-sm text-zinc-300"
                >
                  {code}
                </code>
              ))}
            </div>

            <p className="text-xs text-zinc-500">
              Store these codes in a safe place. You will not be able to see them again.
            </p>

            <Button onClick={handleFinish}>
              I have saved my backup codes
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link href="/settings" className="text-sm text-zinc-400 hover:text-white">
          &larr; Back to Settings
        </Link>
      </div>
    </div>
  );
}
