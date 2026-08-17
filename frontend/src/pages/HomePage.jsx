// src/pages/HomePage.jsx
import Hero from "../components/Hero";
import StatsStrip from "../components/StatsStrip";
import FeaturedCourses from "../components/FeaturedCourses";
import HowItWorks from "../components/HowItWorks";
import CallToAction from "../components/CallToAction";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <FeaturedCourses />
      <HowItWorks />
      <CallToAction />
    </>
  );
}
