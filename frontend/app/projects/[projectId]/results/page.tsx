import { Suspense } from "react";
import ResultsClient from "../../../../components/ResultsClient";

async function Inner({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ResultsClient projectId={projectId} />;
}

export default function Page({ params }: { params: Promise<{ projectId: string }> }) {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Loading...</p>}>
      <Inner params={params} />
    </Suspense>
  );
}