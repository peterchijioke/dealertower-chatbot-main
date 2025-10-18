'use client';

import { UIArtifact } from '@/components/artifact';
import { useCallback, useMemo, useState } from 'react';

export const initialArtifactData: UIArtifact = {
  documentId: 'sample-doc-1',
  content: `# Sample Artifact

This is a sample artifact to demonstrate the functionality.

## Features
- Text editing
- Real-time preview
- Version control

You can edit this content and see the changes in real-time.`,
  kind: 'text',
  title: 'Sample Document',
  status: 'idle',
  isVisible: true,
  boundingBox: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

type Selector<T> = (state: UIArtifact) => T;

export function useArtifactSelector<Selected>(selector: Selector<Selected>) {
  // Use useState instead of SWR to avoid infinite loops
  const [localArtifact] = useState<UIArtifact>(initialArtifactData);

  const selectedValue = useMemo(() => {
    return selector(localArtifact);
  }, [localArtifact, selector]);

  return selectedValue;
}

export function useArtifact() {
  // Use useState instead of SWR
  const [localArtifact, setLocalArtifact] = useState<UIArtifact>(initialArtifactData);
  const [localArtifactMetadata, setLocalArtifactMetadata] = useState<any>(null);

  const artifact = useMemo(() => {
    return localArtifact;
  }, [localArtifact]);

  const setArtifact = useCallback(
    (updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => {
      setLocalArtifact((currentArtifact) => {
        const artifactToUpdate = currentArtifact || initialArtifactData;

        if (typeof updaterFn === 'function') {
          return updaterFn(artifactToUpdate);
        }

        return updaterFn;
      });
    },
    [],
  );

  return useMemo(
    () => ({
      artifact,
      setArtifact,
      metadata: localArtifactMetadata,
      setMetadata: setLocalArtifactMetadata,
    }),
    [artifact, setArtifact, localArtifactMetadata],
  );
}
