'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { createUserProfile } from '../actions';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+880${phone}`,
      });

      if (error) throw error;

      toast.success('OTP sent to your phone!');
      setShowOtp(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+880${phone}`,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      // Create user profile in database
      if (data.user) {
        const result = await createUserProfile(data.user.id, `+880${phone}`);
        if (!result.success) {
          toast.error('Failed to create user profile');
          return;
        }
      }

      toast.success('Login successful!');
      // Redirect to dashboard or home
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#D70F64] mb-2">Khabee</h1>
          <p className="text-gray-600">Welcome back</p>
        </div>

        {!showOtp ? (
          <form onSubmit={handlePhoneSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  🇧🇩 +880
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="1XXXXXXXXX"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-gray-300 focus:ring-[#D70F64] focus:border-[#D70F64]"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D70F64] text-white py-3 px-4 rounded-md hover:bg-[#B80D55] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D70F64] transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">
                We've sent a 4-digit code to +880{phone}
              </p>
              <div className="flex justify-center space-x-2">
                {[...Array(4)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const newOtp = otp.split('');
                      newOtp[i] = e.target.value;
                      setOtp(newOtp.join(''));
                    }}
                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:ring-[#D70F64] focus:border-[#D70F64]"
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D70F64] text-white py-3 px-4 rounded-md hover:bg-[#B80D55] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D70F64] transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => setShowOtp(false)}
              className="w-full mt-3 text-[#D70F64] hover:text-[#B80D55] text-sm"
            >
              Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}