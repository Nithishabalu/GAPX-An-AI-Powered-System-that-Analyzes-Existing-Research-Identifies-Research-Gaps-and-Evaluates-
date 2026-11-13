import { Suspense } from "react";
import ProjectClient from "../../../components/ProjectClient";

async function Inner({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectClient projectId={projectId} />;
}

export default function Page({ params }: { params: Promise<{ projectId: string }> }) {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Loading...</p>}>
      <Inner params={params} />
    </Suspense>
  );
}