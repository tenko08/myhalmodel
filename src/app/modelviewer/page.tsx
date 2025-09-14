'use client';
import dynamic from 'next/dynamic';

export default function ModelViewerPage() {
  const ModelViewer = dynamic(() => import('@/components/modelviewer/ModelViewer'), { ssr: false });

  return (
    <div className="w-full h-screen">
      <ModelViewer />
    </div>
  );
}
