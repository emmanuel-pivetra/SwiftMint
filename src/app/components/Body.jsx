import React from 'react'
import HeroSection from './HeroSection'
import NewsSection from './NewsSection'
import FeaturesSection from './FeaturesSection'
import Footer from './Footer'
import FAQSection from './FAQSection'

const Body = () => {
  return (
     <div className='bg-[#0B1019]'>
          <HeroSection />
          <NewsSection />
          <FeaturesSection />
          <FAQSection />
          <Footer />
    </div>
  )
}

export default Body