import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      {/* Background Layer: Persistent across auth pages */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <iframe
          src="https://my.spline.design/boxeshover-mEGXzS1UzdFm8SFZvjIfiLyu/"
          frameBorder="0"
          width="100%"
          height="100%"
          style={{ pointerEvents: 'auto' }}
        ></iframe>
      </div>

      {/* Foreground Layer: Content area */}
      <div className="relative z-10 min-h-screen flex items-center justify-center md:justify-end p-4 pointer-events-none">
        <Outlet />
      </div>
    </div>
  );
}
