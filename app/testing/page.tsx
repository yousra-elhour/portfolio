"use client";

import SimpleCloudLink from "../components/SimpleCloudLink";
import CloudsAnimation from "../components/CloudsAnimation";
import Image from "next/image";

export default function Testing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with Clouds Animation */}
      <div className="absolute inset-0 -z-20">
        {/* <CloudsAnimation /> */}
      </div>

      {/* Fallback background image */}
      <Image
        src="/clouds/bg.png"
        alt="Background"
        fill
        priority
        className="absolute inset-0 -z-30 h-full w-full object-cover"
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-white mb-8">
            Testing Page
          </h1>
          
          <p className="text-xl text-white/80 mb-12 max-w-2xl">
            This page demonstrates the cloud transition effect. Click the links below to see clouds covering the screen during navigation.
          </p>

          <div className="space-y-6">
            <SimpleCloudLink 
              href="/"
              className="block text-2xl text-white hover:text-blue-300 transition-colors duration-300 border border-white/30 px-8 py-4 rounded-lg hover:border-blue-300"
            >
              ← Back to Home
            </SimpleCloudLink>
            
            <SimpleCloudLink 
              href="/testing/works"
              className="block text-2xl text-white hover:text-blue-300 transition-colors duration-300 border border-white/30 px-8 py-4 rounded-lg hover:border-blue-300"
            >
              Go to Testing Works →
            </SimpleCloudLink>
            
            <SimpleCloudLink 
              href="/works"
              className="block text-2xl text-white hover:text-blue-300 transition-colors duration-300 border border-white/30 px-8 py-4 rounded-lg hover:border-blue-300"
            >
              Go to Real Works →
            </SimpleCloudLink>
            
            <SimpleCloudLink 
              href="/about"
              className="block text-2xl text-white hover:text-blue-300 transition-colors duration-300 border border-white/30 px-8 py-4 rounded-lg hover:border-blue-300"
            >
              Go to About →
            </SimpleCloudLink>
          </div>
        </div>
      </div>

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/20 -z-10"></div>
    </div>
  );
}
