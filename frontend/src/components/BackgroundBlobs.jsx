const BackgroundBlobs = () => (
  <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
    <div
      className="absolute w-96 h-96 bg-fuchsia-400 opacity-30 rounded-full blur-3xl animate-blob1"
      style={{ top: '-6rem', left: '-6rem' }}
    />
    <div
      className="absolute w-96 h-96 bg-cyan-300 opacity-30 rounded-full blur-3xl animate-blob2"
      style={{ top: '10rem', right: '-8rem' }}
    />
    <div
      className="absolute w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-2xl animate-blob3"
      style={{ bottom: '-6rem', left: '30%' }}
    />
  </div>
);

export default BackgroundBlobs;