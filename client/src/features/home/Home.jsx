import Background from './Background'
import Hero from './Hero'
import AboutSection from './AboutSection'
import FleetSection from '../../components/FleetSection'
import ReviewsSection from './ReviewsSection'
import CTASection from './CTASection'

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