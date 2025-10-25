import React, { useState } from "react";

const HelpSupportPage = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const faqs = [
    {
      question: "How do I create an event on Xvent?",
      answer: "Go to the 'Create Event' button on your home page. Fill in the event details like title, description, date/time, location, and click Publish. Your event will instantly appear on the platform for others to discover."
    },
    {
      question: "Can I edit or cancel my event after publishing?",
      answer: "Yes, you can edit or cancel your event anytime after publishing. Go to 'My Events' in your dashboard, select the event you want to modify, and choose the appropriate action."
    },
    {
      question: "How do I RSVP for an event?",
      answer: "Browse events on the platform and click on any event you're interested in. You'll find an RSVP button on the event details page. Click it to confirm your attendance."
    },
    {
      question: "How do I report inappropriate content or users?",
      answer: "You can report inappropriate content by clicking the report button (flag icon) on any event or user profile. Our moderation team will review your report within 24 hours."
    },
    {
      question: "How do I update my profile information?",
      answer: "Navigate to your profile page and click the 'Edit Profile' button. You can update your personal information, profile picture, and preferences there."
    },
    {
      question: "How do I delete my account?",
      answer: "Go to Settings > Account Settings, and you'll find the option to delete your account. Please note this action is permanent and cannot be undone."
    },
    {
      question: "How is my personal data protected?",
      answer: "We take data protection seriously. Your personal information is encrypted and stored securely. We comply with all relevant data protection regulations and never share your data with third parties without your consent."
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll respond within 24-48 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Help & Support</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* FAQ Section */}
        <div className="bbg-[#FAF9F2] rounded-2xl  p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto"></div>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left bg-[#F0EFE9] hover:bg-[#F0EFE9] transition-colors duration-200 flex justify-between items-center"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-semibold text-gray-800 text-lg">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-600 transform transition-transform duration-200 ${
                      activeFAQ === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeFAQ === index && (
                  <div className="px-6 py-4 bg-[#F0EFE9] border-t border-gray-200">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-[#FAF9F2] rounded-2xl  p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h2>
            <p className="text-gray-600 mb-2">
              Send a message and our support team will respond within 24-48 hours
            </p>
            <div className="w-20 h-1 bg-gray-900 mx-auto"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm"
                placeholder="What is this regarding?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How can we help? *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm resize-vertical"
                placeholder="Please describe your issue or question in detail..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#FB432C]/85 text-white font-semibold rounded-xl hover:bg-[#FB432C] transition-all duration-200 shadow-lg"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Additional Contact Information */}
        <div className="bg-[#FAF9F2] rounded-2xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Other Ways to Reach Us</h3>
            <div className="w-16 h-1 bg-gray-900 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Email Support</h4>
              <p className="text-gray-600">support@avant.com</p>
              <p className="text-sm text-gray-500 mt-1">We respond within 24 hours</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Business Hours</h4>
              <p className="text-gray-600">Monday - Friday: 9AM - 6PM</p>
              <p className="text-gray-600">Saturday: 10AM - 4PM</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-2">© 2025 Xvent</p>
          <p className="text-gray-500 text-sm">
            Terms & Conditions • Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;