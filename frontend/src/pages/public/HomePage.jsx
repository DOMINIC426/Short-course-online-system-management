// src/pages/HomePage.jsx
import Hero from "../../components/public/Hero";
import StatsStrip from "../../components/public/StatsStrip";
import FeaturedCourses from "../../components/public/FeaturedCourses";
import HowItWorks from "../../components/public/HowItWorks";
import CallToAction from "../../components/public/CallToAction";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#how-to-apply") return;

    requestAnimationFrame(() => {
      document.getElementById("how-to-apply")?.scrollIntoView({ behavior: "smooth" });
    });
  }, [location.hash]);

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
