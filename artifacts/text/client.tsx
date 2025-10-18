import { Artifact } from '@/components/create-artifact';
import { DiffView } from '@/components/diffview';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { Editor } from '@/components/text-editor';
import {
  ClockRewind,
  CopyIcon,
  MessageIcon,
  PenIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import { toast } from 'sonner';

// Dummy Suggestion type definition
interface Suggestion {
  id: string;
  documentId: string;
  documentCreatedAt: Date;
  originalText: string;
  suggestedText: string;
  description?: string;
  isResolved: boolean;
  userId: string;
  createdAt: Date;
}

// Dummy suggestions data for development/testing
const DUMMY_SUGGESTIONS: Suggestion[] = [
  {
    id: 'suggestion-1',
    documentId: 'doc-1',
    documentCreatedAt: new Date('2024-01-15'),
    originalText: 'This is a sample text that could be improved.',
    suggestedText: 'This is an enhanced example text that demonstrates better writing quality.',
    description: 'Improve clarity and conciseness of the opening sentence',
    isResolved: false,
    userId: 'user-1',
    createdAt: new Date('2024-01-16')
  },
  {
    id: 'suggestion-2', 
    documentId: 'doc-1',
    documentCreatedAt: new Date('2024-01-15'),
    originalText: 'The quick brown fox jumps over the lazy dog.',
    suggestedText: 'The swift auburn fox leaps gracefully over the drowsy canine.',
    description: 'Use more descriptive and varied vocabulary',
    isResolved: false,
    userId: 'user-1',
    createdAt: new Date('2024-01-16')
  },
  {
    id: 'suggestion-3',
    documentId: 'doc-1', 
    documentCreatedAt: new Date('2024-01-15'),
    originalText: 'We should consider this option.',
    suggestedText: 'I strongly recommend we carefully evaluate this promising alternative.',
    description: 'Make the recommendation more assertive and specific',
    isResolved: false,
    userId: 'user-1',
    createdAt: new Date('2024-01-16')
  }
];

// Mock function to replace the missing getSuggestions import
const getSuggestions = async ({ documentId }: { documentId: string }) => {
  // Return dummy suggestions filtered by documentId
  return DUMMY_SUGGESTIONS.filter(suggestion => suggestion.documentId === documentId);
};

interface TextArtifactMetadata {
  suggestions: Array<Suggestion>;
}

export const textArtifact = new Artifact<'text', TextArtifactMetadata>({
  kind: 'text',
  description: 'Useful for text content, like drafting essays and emails.',
  initialize: async ({ documentId, setMetadata }) => {
    const suggestions = await getSuggestions({ documentId });

    setMetadata({
      suggestions,
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === 'data-suggestion') {
      setMetadata((metadata) => {
        return {
          suggestions: [...metadata.suggestions, streamPart.data],
        };
      });
    }

    if (streamPart.type === 'data-textDelta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + streamPart.data,
          isVisible:
            draftArtifact.status === 'streaming' &&
            draftArtifact.content.length > 400 &&
            draftArtifact.content.length < 450
              ? true
              : draftArtifact.isVisible,
          status: 'streaming',
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="text" />;
    }

    if (mode === 'diff') {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView oldContent={oldContent} newContent={newContent} />;
    }

    return (
      <>
        <div className="flex flex-row py-8 md:p-20 px-4">
          <Editor
            content={content}
            suggestions={metadata ? metadata.suggestions : []}
            isCurrentVersion={isCurrentVersion}
            currentVersionIndex={currentVersionIndex}
            status={status}
            onSaveContent={onSaveContent}
          />

          {metadata?.suggestions && metadata.suggestions.length > 0 ? (
            <div className="md:hidden h-dvh w-12 shrink-0" />
          ) : null}
        </div>
      </>
    );
  },
  actions: [
    {
      icon: <ClockRewind size={18} />,
      description: 'View changes',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('toggle');
      },
      isDisabled: ({ currentVersionIndex, setMetadata }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <PenIcon />,
      description: 'Add final polish',
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: 'user',
          parts: [{ type: 'text', text: 'Please add final polish and check for grammar, add section titles for better structure, and ensure everything reads smoothly.' }]
        });
      },
    },
    {
      icon: <MessageIcon />,
      description: 'Request suggestions',
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: 'user',
          parts: [{ type: 'text', text: 'Please add suggestions you have that could improve the writing.' }]
        });
      },
    },
  ],
});
