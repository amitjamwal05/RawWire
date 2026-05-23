'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, Video, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SubmitNews() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userPhotoInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAadhaar, setUserAadhaar] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<File | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUserPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only PNG, JPG, JPEG, or SVG files are allowed');
        return;
      }
      if (file.size < 5 * 1024 || file.size > 150 * 1024) {
        toast.error('Photo size must be between 5 KB and 150 KB');
        return;
      }
      setUserPhoto(file);
    }
  };

  const handleNext = () => {
    if (!userName || !userEmail || !userPhone || !userAadhaar) {
      toast.error('All personal details are required');
      return;
    }
    if (userAadhaar.length !== 12 || !/^\d+$/.test(userAadhaar)) {
      toast.error('Aadhaar must be exactly 12 digits');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Initializing payment...');

    try {
      // 1. Create Order
      const formData = new FormData();
      formData.append('userName', userName);
      formData.append('userEmail', userEmail);
      formData.append('userPhone', userPhone);
      formData.append('userAadhaar', userAadhaar);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('media', media);
      if (userPhoto) formData.append('userPhoto', userPhoto);

      const orderRes = await fetch(`${getApiUrl()}/payments/create-order`, {
        method: 'POST',
        body: formData,
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.message || 'Failed to create order');
      }

      const orderData = await orderRes.json();
      toast.dismiss(toastId);

      // 2. Open Razorpay Checkout OR Simulate
      if (orderData.orderId.startsWith('order_simulated_')) {
        // Simulate successful payment flow locally
        const verifyToast = toast.loading('Simulating payment verification...');
        try {
          const verifyRes = await fetch(`${getApiUrl()}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              razorpay_signature: 'dummy_sig',
              newsId: orderData.newsId
            })
          });

          if (verifyRes.ok) {
            toast.success('Simulated Payment successful! Your post is pending admin approval.', { id: verifyToast });
            router.push('/');
          } else {
            toast.error('Payment verification failed', { id: verifyToast });
          }
        } catch (err) {
          toast.error('Payment verification error', { id: verifyToast });
        }
      } else {
        // Real Razorpay Checkout
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "RawWire",
          description: "News Article Submission Fee",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            const verifyToast = toast.loading('Verifying payment...');
            try {
              // 3. Verify Payment
              const verifyRes = await fetch(`${getApiUrl()}/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  newsId: orderData.newsId
                })
              });

              if (verifyRes.ok) {
                toast.success('Payment successful! Your post is pending admin approval.', { id: verifyToast });
                router.push('/');
              } else {
                toast.error('Payment verification failed', { id: verifyToast });
              }
            } catch (err) {
              toast.error('Payment verification error', { id: verifyToast });
            }
          },
          prefill: {
            name: userName,
            email: userEmail,
            contact: userPhone
          },
          theme: {
            color: "#0F172A" // bg-background approx
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast.error(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      }

    } catch (err: any) {
      toast.error(err.message || 'Network error', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center gap-6 px-4 py-3">
        {step === 1 ? (
          <Link href="/" className="p-2 rounded-full hover:bg-hover-bg transition-colors">
            <ArrowLeft size={20} />
          </Link>
        ) : (
          <button onClick={() => setStep(1)} className="p-2 rounded-full hover:bg-hover-bg transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-xl font-bold">Submit News (₹500)</h1>
      </div>

      <div className="p-4 flex-1">
        {step === 1 ? (
          <div className="flex flex-col gap-4 max-w-lg mx-auto mt-4">
            <div className="bg-hover-bg p-4 rounded-xl mb-4 text-sm text-muted">
              Submit your news article to RawWire. All submissions cost a flat fee of ₹500 and are subject to admin review before going live. Verified contributors receive a pink tick.
            </div>

            <input
              type="text"
              placeholder="Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-transparent border border-border rounded-xl p-4 text-lg outline-none focus:border-accent transition-colors w-full"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="bg-transparent border border-border rounded-xl p-4 text-lg outline-none focus:border-accent transition-colors w-full"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              className="bg-transparent border border-border rounded-xl p-4 text-lg outline-none focus:border-accent transition-colors w-full"
            />
            <input
              type="text"
              placeholder="12-Digit Aadhaar Number"
              value={userAadhaar}
              onChange={(e) => setUserAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className="bg-transparent border border-border rounded-xl p-4 text-lg outline-none focus:border-accent transition-colors w-full tracking-widest"
            />

            <div className="flex items-center justify-between border border-border rounded-xl p-4 cursor-pointer hover:border-accent transition-colors" onClick={() => userPhotoInputRef.current?.click()}>
              <div className="flex items-center gap-3">
                {userPhoto ? (
                  <img src={URL.createObjectURL(userPhoto)} alt="User Photo" className="w-10 h-10 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-hover-bg flex items-center justify-center border border-border">
                    <ImageIcon size={20} className="text-muted" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-bold">{userPhoto ? 'Photo Selected' : 'Upload Profile Photo'}</span>
                  <span className="text-xs text-muted">5KB - 150KB (PNG, JPG, SVG)</span>
                </div>
              </div>
              <input
                type="file"
                ref={userPhotoInputRef}
                onChange={handleUserPhotoChange}
                accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                className="hidden"
              />
            </div>

            <button 
              onClick={handleNext}
              className="w-full bg-foreground text-background font-bold rounded-full py-4 mt-4 hover:opacity-90 transition-opacity"
            >
              Continue to Editor
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 h-full">
            <input
              type="text"
              placeholder="Breaking News Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none text-2xl font-bold outline-none placeholder:text-muted py-2 w-full"
            />
            
            <textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-transparent border-none text-lg outline-none placeholder:text-muted resize-none min-h-[200px] w-full"
            />

            {preview && (
              <div className="relative w-full rounded-2xl overflow-hidden border border-border mt-4">
                {media?.type.startsWith('video') ? (
                  <video src={preview} className="w-full max-h-[400px] object-cover" controls />
                ) : (
                  <img src={preview} alt="Preview" className="w-full max-h-[400px] object-cover" />
                )}
                <button 
                  onClick={() => { setMedia(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-black/50 backdrop-blur text-white rounded-full p-2 hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
            )}

            <hr className="border-border my-2" />

            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-accent">
                <button 
                  className="p-2 hover:bg-accent/10 rounded-full transition-colors flex items-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud size={20} />
                  <span className="text-sm font-bold">Attach Media</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleMediaChange} 
                  accept="image/*,video/*"
                  className="hidden" 
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pay ₹500 & Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
