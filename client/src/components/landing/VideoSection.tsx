import { Play } from "lucide-react";
import { useState } from "react";

interface VideoSectionProps {
  videoId?: string;
  videoUrl?: string;
  title?: string;
}

export function VideoSection({
  videoId = "dQw4w9WgXcQ",
  videoUrl,
  title = "B1 AppBuilder Demo",
}: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // If videoUrl is provided (like Invideo URL), use iframe with that
  // Otherwise use YouTube embed
  const embedUrl = videoUrl
    ? videoUrl
    : `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  return (
    <section className="w-full bg-black py-12 md:py-20">
      <div className="container">
        <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
          {/* Video Container - 16:9 Aspect Ratio */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {!isPlaying && (
              <>
                {/* Thumbnail Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-primary-dark transition-colors cursor-pointer"
                      onClick={() => setIsPlaying(true)}>
                      <Play className="w-10 h-10 text-white fill-white" />
                    </div>
                    <p className="text-white font-semibold">{title}</p>
                    <p className="text-gray-400 text-sm mt-2">Click to play video</p>
                  </div>
                </div>
              </>
            )}

            {/* Video Iframe */}
            {isPlaying && (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={embedUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>

        {/* Video Info */}
        <div className="mt-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400">
            See how B1 AppBuilder converts your website into a mobile app in minutes
          </p>
        </div>
      </div>
    </section>
  );
}
