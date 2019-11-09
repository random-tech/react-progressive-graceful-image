declare module 'react-progressive-graceful-image' {
  export interface ProgressiveImageProps {
    delay?: number;
    onError?: (errorEvent: Event) => void;
    placeholder: string;
    src: string;
    srcSetData?: {
      srcSet: string;
      sizes: string;
    };
    noRetry?: boolean,
    retry?: Object;
    noLazyLoad?: boolean;
  }

  export interface ProgressiveImageState {
    image: string;
    loading: boolean;
    srcSetData?: {
      srcSet: string;
      sizes: string;
    };
    retryDelay: number;
    retryCount: number;  
  }

  export default class ProgressiveImage extends React.Component<
    ProgressiveImageProps,
    ProgressiveImageState
  > {}
}
