import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We will get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container-custom py-12 animate-fade-in">
      <h1 className="section-title text-center mb-4">Contact Us</h1>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-lg mx-auto">
        Have a question or need help? We're here for you 24/7.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: FiMail, title: 'Email', value: 'support@asli.com' },
            { icon: FiPhone, title: 'Phone', value: '+91 98765 43210' },
            { icon: FiMapPin, title: 'Address', value: '123 Market Street, Mumbai, India' },
          ].map((item, idx) => (
            <div key={idx} className="card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2 card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input min-h-[150px]"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3">
              <FiSend className="mr-2" /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;