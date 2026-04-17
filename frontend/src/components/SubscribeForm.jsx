import { useState } from 'react';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import { subscribeToNewsletter } from '../services/api';
export default function SubscribeForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = (event) => {
        void (async () => {
            event.preventDefault();
            setLoading(true);
            try {
                const trimmedEmail = email.trim().toLowerCase();
                if (!trimmedEmail) {
                    toast.error('Please enter an email address.');
                    return;
                }
                await subscribeToNewsletter({ email: trimmedEmail });
                toast.success('Subscribed successfully.');
                setEmail('');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Subscription failed';
                toast.error(message);
            }
            finally {
                setLoading(false);
            }
        })();
    };
    return (<form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" required className="input flex-1" disabled={loading}/>
      <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
        {loading ? 'Subscribing...' : <><Send className="h-4 w-4"/>Subscribe</>}
      </button>
    </form>);
}
