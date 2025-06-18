
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQ = () => {
  const faqs = [
    {
      question: "What are your delivery areas?",
      answer: "We currently deliver to most areas within 50 miles of our distribution center. During checkout, you can enter your ZIP code to see if delivery is available in your area. We're constantly expanding our delivery zones, so check back if we don't serve your area yet."
    },
    {
      question: "How fresh are your products?",
      answer: "All our products are sourced directly from local farms and producers. Most produce is harvested within 24-48 hours of delivery, and all products have clear expiration dates. We guarantee the freshness of every item or we'll replace it free of charge."
    },
    {
      question: "What is your return policy?",
      answer: "We want you to be completely satisfied with your purchase. If you're not happy with any item, contact us within 7 days of delivery for a full refund or replacement. For perishable items, we offer a 100% satisfaction guarantee."
    },
    {
      question: "Do you offer organic products?",
      answer: "Yes! We have a wide selection of certified organic products clearly marked on our website. All our organic items are certified by USDA-approved agencies and we work directly with organic farms in the region."
    },
    {
      question: "What are your delivery fees?",
      answer: "Delivery is $5.99 for orders under $50. Orders over $50 qualify for free delivery. We also offer a subscription service with free delivery on all orders for $9.99/month."
    },
    {
      question: "Can I schedule delivery times?",
      answer: "Yes! During checkout, you can choose from available delivery windows. We offer morning (8AM-12PM), afternoon (12PM-5PM), and evening (5PM-8PM) slots. Same-day delivery is available for orders placed before 2PM."
    },
    {
      question: "Do you have a mobile app?",
      answer: "Our website is fully mobile-optimized and works great on all devices. We're currently developing a native mobile app that will be available later this year with additional features like push notifications for deals and order updates."
    },
    {
      question: "How do you ensure food safety?",
      answer: "Food safety is our top priority. All our partners follow strict HACCP guidelines, our facilities are regularly inspected, and we maintain cold-chain integrity from farm to your door. All delivery vehicles are refrigerated and we use temperature monitoring throughout the process."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "You can modify or cancel your order up to 2 hours before your scheduled delivery time by logging into your account or calling our customer service line. After that time, we may have already begun preparing your order for delivery."
    },
    {
      question: "Do you offer bulk or wholesale pricing?",
      answer: "Yes! We offer special pricing for bulk orders and have a wholesale program for restaurants, cafes, and other food service businesses. Contact our sales team at wholesale@subburpfood.com for more information about volume discounts."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our products, delivery, and services.
          </p>
        </div>

        {/* FAQ Section */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle>Common Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Still have questions?
              </h2>
              <p className="text-gray-600 mb-6">
                Can't find the answer you're looking for? Our customer support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  Contact Support
                </a>
                <a 
                  href="mailto:hello@subburpfood.com" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Email Us
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
