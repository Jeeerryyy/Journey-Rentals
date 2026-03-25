import Background from '../components/Background'
import Hero from '../components/Hero'
import AboutSection from '../components/AboutSection'
import FleetSection from '../components/FleetSection'
import ReviewsSection from '../components/ReviewsSection'
import CTASection from '../components/CTASection'

const Home = () => {
  return (
    <>
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