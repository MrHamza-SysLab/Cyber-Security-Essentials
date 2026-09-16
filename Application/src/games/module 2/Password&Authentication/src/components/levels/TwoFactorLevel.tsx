
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Smartphone, Mail, Key, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface TwoFactorLevelProps {
  onComplete: (enabled: boolean, method: 'SMS' | 'APP' | 'EMAIL' | null) => void;
}

export default function TwoFactorLevel({ onComplete }: TwoFactorLevelProps) {
  const [step, setStep] = useState<'choose' | 'verify' | 'phishing'>('choose');
  const [method, setMethod] = useState<'SMS' | 'APP' | 'EMAIL' | null>(null);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'verify' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChoose = (m: 'SMS' | 'APP' | 'EMAIL') => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setMethod(m);
    setStep('verify');
    toast.success(`OTP sent to your ${m.toLowerCase()}: ${newOtp}`, {
      duration: 10000,
    });
  };

  const handleVerify = () => {
    if (otp === generatedOtp) {
      setStep('phishing');
    } else {
      toast.error(`Invalid OTP. Check your ${method?.toLowerCase()}`);
    }
  };

  const handlePhishing = (isLegit: boolean) => {
    if (isLegit) {
      onComplete(true, method);
    } else {
      toast.error("PHISHING DETECTED! You just gave your OTP to a fake site.");
      onComplete(false, null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-md mx-auto"
    >
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary">Level 03</span>
          </div>
          <CardTitle className="text-2xl font-bold">Enable 2FA</CardTitle>
          <CardDescription>
            Two-Factor Authentication adds an extra layer of security beyond just a password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 'choose' && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 gap-3"
              >
                <Button
                  variant="outline"
                  className="h-20 justify-start gap-4 border-zinc-800 hover:bg-zinc-800"
                  onClick={() => handleChoose('SMS')}
                >
                  <Smartphone className="w-8 h-8 text-blue-500" />
                  <div className="text-left">
                    <div className="font-bold">SMS OTP</div>
                    <div className="text-xs text-zinc-500">Receive code via text message</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 justify-start gap-4 border-zinc-800 hover:bg-zinc-800"
                  onClick={() => handleChoose('APP')}
                >
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                  <div className="text-left">
                    <div className="font-bold">Authenticator App</div>
                    <div className="text-xs text-zinc-500">Google Authenticator / Authy</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 justify-start gap-4 border-zinc-800 hover:bg-zinc-800"
                  onClick={() => handleChoose('EMAIL')}
                >
                  <Mail className="w-8 h-8 text-yellow-500" />
                  <div className="text-left">
                    <div className="font-bold">Email Verification</div>
                    <div className="text-xs text-zinc-500">Receive code in your inbox</div>
                  </div>
                </Button>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold">Verify Your Identity</h3>
                  <p className="text-sm text-zinc-400">Enter the 6-digit code sent to your {method}</p>
                </div>

                <div className="flex justify-center gap-2">
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-14 bg-zinc-950 border-zinc-800"
                  />
                </div>

                <div className="text-center text-sm">
                  {timer > 0 ? (
                    <span className="text-zinc-500">Code expires in <span className="text-primary font-mono">{timer}s</span></span>
                  ) : (
                    <Button 
                      variant="link" 
                      className="text-primary" 
                      onClick={() => {
                        setTimer(30);
                        handleChoose(method!);
                      }}
                    >
                      Resend Code
                    </Button>
                  )}
                </div>

                <Button className="w-full font-bold uppercase" onClick={handleVerify}>
                  Verify Code
                </Button>
              </motion.div>
            )}

            {step === 'phishing' && (
              <motion.div
                key="phishing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold text-yellow-500">URGENT SECURITY ALERT</p>
                    <p className="text-yellow-200/80">"Your account is locked. Please re-enter your OTP at <strong>secure-auth-login.net</strong> to unlock it."</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-zinc-400">What do you do?</p>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-800 hover:bg-red-500/10 hover:border-red-500/50"
                    onClick={() => handlePhishing(false)}
                  >
                    Enter OTP on the link provided
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-800 hover:bg-green-500/10 hover:border-green-500/50"
                    onClick={() => handlePhishing(true)}
                  >
                    Close the alert and use the official app
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
