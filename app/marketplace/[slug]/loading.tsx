// Suspense boundary for the listing page: its params are request-time data
// (no generateStaticParams), which cacheComponents requires inside <Suspense>.
export default function ListingLoading() {
  return (
    <div className="pt-32 pb-20 bg-cyber-dark min-h-screen">
      <div className="section-container animate-pulse grid lg:grid-cols-2 gap-8">
        <div className="aspect-video rounded-2xl bg-cyber-card" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded-lg bg-cyber-card" />
          <div className="h-5 w-1/3 rounded-lg bg-cyber-card" />
          <div className="h-32 rounded-xl bg-cyber-card" />
        </div>
      </div>
    </div>
  );
}
