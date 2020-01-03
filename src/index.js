// @flow

import * as React from 'react';
// import throttle from 'lodash.throttle';
import 'intersection-observer'; // optional polyfill
import Observer from '@researchgate/react-intersection-observer';

type SrcSetData = {
  srcSet: string,
  sizes: string
};

type Props = {
  children: (string, boolean, SrcSetData) => React.Node,
  delay?: number,
  onError?: (errorEvent: Event) => void,
  placeholder: string,
  src: string,
  srcSetData?: SrcSetData,
  noRetry?: boolean,
  retry?: Object,
  noLazyLoad?: boolean
};

type State = {
  image: string,
  loading: boolean,
  srcSetData: SrcSetData,
  retryDelay: number,
  retryCount: number
};

// function isInViewport(el) {
//   const rect = el.getBoundingClientRect();
//   return (
//     rect.top >= 0 &&
//     rect.left >= 0 &&
//     rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
//     rect.left <= (window.innerWidth || document.documentElement.clientWidth)
//   );
// }

// function registerListener(event, fn) {
//   if (window.addEventListener) {
//     window.addEventListener(event, fn);
//   } else {
//     window.attachEvent('on' + event, fn);
//   }
// }
const hasWindow = () => {
  return typeof window !== 'undefined';
};
export default class ProgressiveImage extends React.Component<Props, State> {
  image: HTMLImageElement;
  constructor(props: Props) {
    super(props);

    // store a reference to the throttled function
    // this.throttledFunction = throttle(this.lazyLoad, 150);
    this._isMounted = false;

    this.state = {
      isOnline: hasWindow() ? window.navigator.onLine : true,
      retryDelay: this.props.retry.delay,
      retryCount: 1,
      image: props.placeholder,
      loading: true,
      srcSetData: { srcSet: '', sizes: '' }
    };
  }

  handleOnlineStatus = () => {
    this.setState({
      isOnline: window.navigator.onLine
    });
  };

  componentDidMount() {
    this._isMounted = true;
    if (!hasWindow()) {
      return;
    }
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);
    // const { src, srcSetData } = this.props;
    // if user wants to lazy load
    // if (!this.props.noLazyLoad) {
    //   check if already within viewport to avoid attaching listeners
    //   if (isInViewport(this.placeholderImage.current)) {
    //     this.loadImage(src, srcSetData);
    //   } else {
    //     registerListener('load', this.throttledFunction);
    //     registerListener('scroll', this.throttledFunction);
    //     registerListener('resize', this.throttledFunction);
    //     registerListener('gestureend', this.throttledFunction); // to detect pinch on mobile devices
    //     registerListener('touchend', this.throttledFunction); // to detect end of swipe/touch on devices
    //   }
    // } else {
    //   this.loadImage(src, srcSetData);
    // }
  }

  componentDidUpdate(prevProps: Props) {
    const { src, placeholder, srcSetData } = this.props;
    // We only invalidate the current image if the src has changed.
    if (src !== prevProps.src) {
      this.setState({ image: placeholder, loading: true }, () => {
        this.loadImage(src, srcSetData);
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;

    if (this.image) {
      this.image.onload = null;
      this.image.onerror = null;
    }
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);
    // this.clearEventListeners();
  }

  loadImage = (src: string, srcSetData?: SrcSetData) => {
    // If there is already an image we nullify the onload
    // and onerror props so it does not incorrectly set state
    // when it resolves
    if (this.image) {
      this.image.onload = null;
      this.image.onerror = null;
    }
    const image = new Image();
    this.image = image;
    image.onload = this.onLoad;
    image.onerror = () => {
      this.onError;
      return;
      // this.handleImageRetries(image);
    };
    image.src = src;
    if (srcSetData) {
      image.srcset = srcSetData.srcSet;
      image.sizes = srcSetData.sizes;
    }
  };

  onLoad = () => {
    // use this.image.src instead of this.props.src to
    // avoid the possibility of props being updated and the
    // new image loading before the new props are available as
    // this.props.

    if (this.props.delay) {
      this.setImageWithDelay();
    } else {
      this.setImage();
    }
  };

  setImageWithDelay = () => {
    setTimeout(() => {
      this.setImage();
    }, this.props.delay);
  };

  setImage = () => {
    if (this._isMounted) {
      this.setState(
        {
          image: this.image.src,
          loading: false,
          srcSetData: {
            srcSet: this.image.srcset || '',
            sizes: this.image.sizes || ''
          }
        },
        () => {
          window.removeEventListener('online', this.handleOnlineStatus);
          window.removeEventListener('offline', this.handleOnlineStatus);
        }
      );
    }
  };

  onError = (errorEvent: Event) => {
    const { onError } = this.props;
    if (onError) {
      onError(errorEvent);
    }
  };

  /*
    Handles the actual re-attempts of loading the image
    following the default / provided retry algorithm
  */
  handleImageRetries(image) {
    // if we are not mounted anymore, we do not care, and we can bail
    if (!this._isMounted) {
      return;
    }

    this.setState({ loading: true }, () => {
      if (this.state.retryCount <= this.props.retry.count) {
        this.timeout = setTimeout(() => {
          // if we are not mounted anymore, we do not care, and we can bail
          if (!this._isMounted) {
            return;
          }

          // re-attempt fetching the image
          image.src = this.props.src;
          if (this.props.srcSetData) {
            image.srcset = this.props.srcSetData.srcSet;
            image.sizes = this.props.srcSetData.sizes;
          }
          // update count and delay
          this.setState(prevState => {
            let updateDelay;
            if (this.props.retry.accumulate === 'multiply') {
              updateDelay = prevState.retryDelay * this.props.retry.delay;
            } else if (this.props.retry.accumulate === 'add') {
              updateDelay = prevState.retryDelay + this.props.retry.delay;
            } else if (this.props.retry.accumulate === 'noop') {
              updateDelay = this.props.retry.delay;
            } else {
              updateDelay = 'multiply';
            }

            return {
              retryDelay: updateDelay,
              retryCount: prevState.retryCount + 1
            };
          });
        }, this.state.retryDelay * 1000);
      }
    });
  }

  /*
    If placeholder is currently within the viewport then load the actual image
    and remove all event listeners associated with it
  */
  // lazyLoad = () => {
  //   const { src, srcSetData } = this.props;
  //   if (isInViewport(this.placeholderImage.current)) {
  //     this.clearEventListeners();
  //     this.loadImage(src, srcSetData);
  //   }
  // };

  // clearEventListeners() {
  //   this.throttledFunction.cancel();
  //   window.removeEventListener('load', this.throttledFunction);
  //   window.removeEventListener('scroll', this.throttledFunction);
  //   window.removeEventListener('resize', this.throttledFunction);
  //   window.removeEventListener('gestureend', this.throttledFunction);
  // }

  handleIntersection = (event, unobserve, isOnline) => {
    if (event.isIntersecting) {
      const { src, srcSetData } = this.props;
      if (isOnline) {
        this.loadImage(src, srcSetData);
        unobserve();
      }
    }
  };

  render() {
    const options = {
      onChange: (event, unobserve) =>
        this.handleIntersection(event, unobserve, this.state.isOnline),
      rootMargin: '0% 0% 25%',
      threshold: [0],
      disabled: this.props.noLazyLoad || false
    };
    const { image, loading, srcSetData } = this.state;
    const { children, noRetry, retry, noLazyLoad } = this.props;
    const ref = React.createRef();
    this.placeholderImage = ref;
    // console.log({ noRetry, retry, noLazyLoad });
    if (noLazyLoad === undefined) {
      // noLazyLoad = false;
    }
    if (noRetry === undefined) {
      // noRetry = false;
    }
    if (noRetry) {
      retry = { count: 8, delay: 2, accumulate: 'multiply' };
    }
    if (!children || typeof children !== 'function') {
      throw new Error(`ProgressiveImage requires a function as its only child`);
    }

    return (
      <Observer {...options}>
        {children(image, ref, loading, srcSetData)}
      </Observer>
    );
  }
}
