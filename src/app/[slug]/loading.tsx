export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-48 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
