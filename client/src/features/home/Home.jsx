import { Helmet } from 'react-helmet-async'
import Background from './Background'
import Hero from './Hero'
import AboutSection from './AboutSection'
import FleetSection from '../vehicles/FleetSection'
import ReviewsSection from './ReviewsSection'
import CTASection from './CTASection'

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Journey Rentals | Premium Car &amp; Bike Hire in Solapur</title>
        <meta name="description" content="Rent premium cars and bikes instantly with Journey Rentals in Solapur. Affordable rates, verified vehicles, and seamless booking for your next adventure." />
        <link rel="canonical" href="https://journeyrentals.vercel.app/" />
      </Helmet>
      <Background />
      <main>
        <Hero />
        <AboutSection />
        <FleetSection />
        <ReviewsSection />
        <CTASection />
      </main>
    </>
  )
}

export default Home