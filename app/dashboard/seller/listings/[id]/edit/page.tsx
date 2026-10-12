import { Suspense, use } from "react";
import { EditListingClient } from "./EditListingClient";
import { Loader2 } from "lucide-react";

function EditListingLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
      <p className="text-sm text-muted-foreground">
        Loading listing from internal server...
      </p>
    </div>
  );
}

function EditListingWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EditListingClient id={id} />;
}

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<EditListingLoading />}>
      <EditListingWrapper params={params} />
    </Suspense>
  );
}
