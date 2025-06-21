
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About SuBurpFoods
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
          At SuburpFood, we’re proud to serve you the finest quality food products made with love in our own kitchens, using ingredients sourced from trusted local farms and expert artisans — because great taste starts at home.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="animate-fade-in">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
              alt="Farm fresh produce"
              className="rounded-2xl shadow-lg w-full"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
            Founded in 2017, SuburpFood began with a simple mission — to bring the warmth of homemade flavors to every plate. What started as a small kitchen idea quickly grew into a trusted homegrown brand, committed to delivering ready-to-cook delights made from high-quality ingredients, sourced responsibly from local farms and crafted to celebrate real, honest food.
            </p>
            <p className="text-gray-600 leading-relaxed">
            What began as a humble weekend kitchen experiment quickly evolved into SuburpFood — a full-fledged homegrown brand and online destination, connecting food lovers with flavorful, ready-to-cook meals made from locally sourced ingredients and crafted with care in our own kitchens.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12 animate-fade-in">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sustainability</h3>
              <p className="text-gray-600">
                We prioritize environmentally responsible farming practices and 
                sustainable packaging to minimize our impact on the planet.
              </p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community</h3>
              <p className="text-gray-600">
                Supporting local farmers and producers is at the heart of what we do. 
                When you shop with us, you're investing in your community.
              </p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality</h3>
              <p className="text-gray-600">
                Every product is carefully selected and tested to ensure it meets 
                our high standards for freshness, taste, and nutritional value.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12 animate-fade-in">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <div className="text-center animate-fade-in">
              <img
                src="https://res.cloudinary.com/dzkfhdhs0/image/upload/v1750514391/heropage_hjel4f.png"
                alt="Raabia Ahmed"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900">Raabia Ahmed</h3>
              <p className="text-gray-600">Founder & Chef</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <img
                src="https://res.cloudinary.com/dzkfhdhs0/image/upload/v1750514391/heropage_hjel4f.png"
                alt="Iqbal Ahmed"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900">Iqbal Ahmed</h3>
              <p className="text-gray-600">Founder</p>
            </div>
            {/* <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                alt="Mike Davis"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900">Mike Davis</h3>
              <p className="text-gray-600">Quality Assurance</p>
            </div> */}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            To create a more sustainable and connected food system by making 
            high-quality, locally-sourced products accessible to everyone while 
            supporting the farmers and artisans who grow and create them.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
