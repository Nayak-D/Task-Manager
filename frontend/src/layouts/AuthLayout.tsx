import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full relative bg-[#0a0a0a] overflow-x-hidden">
      {/* Background Layer: Persistent across auth pages */}
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-auto">
        <iframe
          src="https://my.spline.design/boxeshover-mEGXzS1UzdFm8SFZvjIfiLyu/"
          frameBorder="0"
          className="w-full h-full"
          style={{ pointerEvents: 'auto', border: 'none' }}
        />
      </div>

      {/* Overlay for better content readability */}
      <div className="fixed inset-0 bg-black/20 z-[5] pointer-events-none" />

      {/* Foreground Layer: Content area - fully responsive */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center md:justify-end px-4 sm:px-6 lg:px-12 py-6 sm:py-8 pointer-events-none">
        <div className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
