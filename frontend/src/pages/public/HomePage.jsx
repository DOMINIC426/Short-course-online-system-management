// src/pages/HomePage.jsx
import Hero from "../../components/public/Hero";
import StatsStrip from "../../components/public/StatsStrip";
import FeaturedCourses from "../../components/public/FeaturedCourses";
import HowItWorks from "../../components/public/HowItWorks";
import CallToAction from "../../components/public/CallToAction";

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
