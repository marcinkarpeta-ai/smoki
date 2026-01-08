export function DragonLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="dragonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(330 85% 55%)" />
          <stop offset="100%" stopColor="hsl(300 70% 60%)" />
        </linearGradient>
      </defs>
      
      {/* Dragon head silhouette */}
      <path 
        d="M12 28c0-6 4-12 12-12 6 0 10 3 12 7 1 2 2 4 2 7-2-2-4-2-5 0l-1 2c-1 1-1 2 0 2l3 4c-2 2-5 2-8 0-2-1-4-1-5 0-3 2-7 1-9-3-1-2-1-4-1-7z"
        fill="url(#dragonGradient)"
      />
      
      {/* Dragon eye */}
      <circle cx="20" cy="22" r="2" fill="white" />
      <circle cx="20" cy="22" r="1" fill="hsl(280 15% 8%)" />
      
      {/* Dragon horns */}
      <path 
        d="M22 16l-2-5 3 4M28 16l2-5-3 4" 
        stroke="url(#dragonGradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      
      {/* Dragon spikes on back */}
      <path 
        d="M30 20l3-4-1 4M34 24l4-3-2 4" 
        stroke="url(#dragonGradient)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* Basketball */}
      <circle cx="38" cy="38" r="7" fill="url(#dragonGradient)" />
      <path 
        d="M31 38h14M38 31v14" 
        stroke="hsl(280 15% 8%)" 
        strokeWidth="1.5"
      />
      <path 
        d="M33 33c3 3 7 3 10 0M33 43c3-3 7-3 10 0" 
        stroke="hsl(280 15% 8%)" 
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Fire breath accent */}
      <path 
        d="M10 24c-2-1-4-1-5 1-1 1 0 2 1 2 1-1 2-1 3 0"
        stroke="url(#dragonGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
