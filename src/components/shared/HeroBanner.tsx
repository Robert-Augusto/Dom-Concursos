'use client'

import { useRouter } from "next/navigation"

export function HeroBanner() {
  const router = useRouter()

  return (
    <div className="relative flex min-h-[260px] items-center gap-5 overflow-hidden rounded-2xl px-6 py-5 sm:min-h-[300px] sm:px-8 md:min-h-[340px] md:px-10">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(100deg, 
          rgba(5,6,9,0.96) 0%, 
          rgba(10,12,20,0.78) 38%, 
          rgba(10,12,20,0.45) 62%, 
          rgba(10,12,20,0.65) 100%
        ), url('/hero-banner.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
        }}
      />

      <div
        className="absolute -top-14 -right-10 h-44 w-44 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(245,220,154,0.35) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(61,127,255,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(212,178,84,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(212,178,84,0.06) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      <div
        className="absolute top-0 h-full w-1/2 pointer-events-none sp-shine"
        style={{
          left: '-50%',
          background:
            'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col gap-2">
        <div
          className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm md:text-[11px]"
          style={{
            background:
              'linear-gradient(90deg, rgba(212,178,84,0.22), rgba(212,178,84,0.08))',
            border: '1px solid rgba(212,178,84,0.35)',
            color: '#F0D080',
          }}
        >
          <span
            className="sp-badge-dot h-2 w-2 rounded-full"
            style={{ background: '#F0D080', boxShadow: '0 0 8px #F0D080' }}
          />
          DOM CONCURSOS
        </div>

        <h2
          className="font-heading text-[32px] font-black leading-[1.05] tracking-tight text-white sm:text-[38px] md:text-[48px]"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
        >
          Um pouco{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #F0D080, #C9A84C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontStyle: 'italic',
            }}
          >
            todos os dias.
          </span>
        </h2>

        <p
          className="line-clamp-3 max-w-[85%] text-[13px] font-medium leading-relaxed sm:max-w-[80%] sm:text-[14px] md:max-w-[72%] md:text-[19px]"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Aulas curtas, revisão inteligente e questões diárias. Pequenos passos,
          grande resultado.
        </p>

        <div className="mt-2 flex items-center gap-3.5">
          <button
            onClick={() => router.push('tutorial')}
            type="button"
            className="relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-[12px] font-black tracking-wide md:px-6 md:py-2.5 md:text-[14px]"
            style={{
              background: 'linear-gradient(90deg, #C9A84C, #DDA83A)',
              color: '#0B1220',
              boxShadow:
                '0 4px 14px rgba(212,178,84,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            <span>Começar agora</span>
            <svg
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              className="sp-cta-tap h-[26px] w-[26px]"
            >
              <g stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" fill="none">
                <path d="M26 4 L26 11" />
                <path d="M14 8 L18 14" />
                <path d="M38 8 L34 14" />
                <path d="M8 18 L14 21" />
                <path d="M44 18 L38 21" />
              </g>
              <path
                d="M22 20 C22 17.8 23.8 16 26 16 C28.2 16 30 17.8 30 20 
                 L30 34 L30 30 C30 28.3 31.3 27 33 27 C34.7 27 36 28.3 36 30 
                 L36 33 C36 31.3 37.3 30 39 30 C40.7 30 42 31.3 42 33 
                 L42 36 C42 34.5 43.1 33.4 44.5 33.4 C45.9 33.4 47 34.5 47 36 
                 L47 44 C47 52 41 58 33 58 L30 58 C26 58 23 56.5 20.5 53.8 
                 L11 43 C9.6 41.4 9.8 38.9 11.5 37.6 C13 36.4 15.2 36.6 16.5 38 
                 L22 44 Z"
                fill="#ffffff"
                stroke="#0B1220"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <p
            className="text-[11px] font-bold tracking-widest md:text-[13px]"
            style={{ color: '#F0D080' }}
          >
            ★★★★★{' '}
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>4.9</span>
          </p>
        </div>
      </div>

      <div className="relative z-10 flex-shrink-0">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className="sp-emblem h-[84px] w-[84px] md:h-[108px] md:w-[108px]"
          style={{
            filter: 'drop-shadow(0 4px 16px rgba(212,178,84,0.4))',
            opacity: 0.9,
          }}
        >
          <circle cx="32" cy="32" r="30" stroke="url(#spg1)" strokeWidth="1.5" opacity="0.6" />
          <circle cx="32" cy="32" r="22" stroke="url(#spg1)" strokeWidth="1" opacity="0.4" />
          <path d="M32 14 L38 28 L52 30 L42 40 L44 54 L32 47 L20 54 L22 40 L12 30 L26 28 Z" fill="url(#spg1)" />
          <defs>
            <linearGradient id="spg1" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0" stopColor="#F0D080" />
              <stop offset="1" stopColor="#C9A84C" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <style>{`
        @keyframes spShine {
          0%, 100% { transform: translateX(0); opacity: 0; }
          40% { opacity: 1; }
          80% { transform: translateX(400%); opacity: 0; }
        }
        .sp-shine { animation: spShine 4.5s ease-in-out infinite; }

        @keyframes spPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        .sp-badge-dot { animation: spPulse 1.6s ease-in-out infinite; }

        @keyframes spTapIn {
          0% { transform: translate(8px, 8px) rotate(-12deg); opacity: 0; }
          35% { transform: translate(0, 0) rotate(-12deg); opacity: 1; }
          55% { transform: translate(0, 0) rotate(-12deg) scale(0.88); opacity: 1; }
          75% { transform: translate(0, 0) rotate(-12deg) scale(1); opacity: 1; }
          100% { transform: translate(0, 0) rotate(-12deg); opacity: 1; }
        }
        .sp-cta-tap {
          position: absolute;
          right: -14px; bottom: -10px;
          width: 26px; height: 26px;
          pointer-events: none;
          animation: spTapIn 1.8s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
        }

        @keyframes spRotate {
          to { transform: rotate(360deg); }
        }
        .sp-emblem { animation: spRotate 30s linear infinite; }
      `}</style>
    </div>
  )
}
