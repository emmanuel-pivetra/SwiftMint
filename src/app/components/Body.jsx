import React from 'react'
import HeroSection from './HeroSection'
import NewsSection from './NewsSection'
import DevicesSection from './DevicesSection'
import FeaturesSection from './FeaturesSection'
import Footer from './Footer'

const Body = () => {
  return (
     <div>
          <HeroSection />
          <NewsSection />
          <DevicesSection />
          <FeaturesSection />
          <Footer />
    </div>
  )
}

export default Body