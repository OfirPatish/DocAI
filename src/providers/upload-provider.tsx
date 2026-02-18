"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface UploadContextValue {
  isUploading: boolean;
  setUploading: (uploading: boolean) => void;
  isSummarizing: boolean;
  setSummarizing: (summarizing: boolean) => void;
  isBusy: boolean;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export const UploadProvider = ({ children }: { children: ReactNode }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const setUploading = useCallback((uploading: boolean) => {
    setIsUploading(uploading);
  }, []);

  const setSummarizing = useCallback((summarizing: boolean) => {
    setIsSummarizing(summarizing);
  }, []);

  const isBusy = isUploading || isSummarizing;

  return (
    <UploadContext.Provider
      value={{
        isUploading,
        setUploading,
        isSummarizing,
        setSummarizing,
        isBusy,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = (): UploadContextValue => {
  const ctx = useContext(UploadContext);
  if (!ctx) {
    return {
      isUploading: false,
      setUploading: () => {},
      isSummarizing: false,
      setSummarizing: () => {},
      isBusy: false,
    };
  }
  return ctx;
};
