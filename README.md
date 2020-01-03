# React Progressive Graceful Image

**Breaking changes** [0.6.8] : Now, `retry` prop is removed to improve performance and user accessibility as new retry strategy based is on window.navigator.onLine. Checkout below examples for details.

**Breaking changes** [0.6.5] : Now, `ref` will be a required 2nd argument of children function to use the lazyLoading feature. Checkout below examples for details.

***

**Note**: This is a forked repo from https://github.com/FormidableLabs/react-progressive-image. So, all usage are similar to that. 

I am adding two new features:
 - Graceful loading 
 - Lazy loading

similar to https://github.com/linasmnew/react-graceful-image, but with a different approach(for better performance and optimization). So, please check usage of 2 newly introduced props (noRetry, noLazyLoad) from the props table below.

#### [TODO] : 
- [x] Use of Intersection Observer for Lazy Loading (Better Performance)
- [x] Use of navigator.onLine in place of current retry strategy (Optimization)
- [ ] Introduce `rootMargin` and `threshold` props for Intersection Observer options.

***

[![Maintenance Status][maintenance-image]](#maintenance-status)

[`react-progressive-graceful-image`](https://www.npmjs.com/package/react-progressive-graceful-image) React component for progressive image loading

### Install

```bash
$ npm i react-progressive-graceful-image
```

### Examples

#### Simple

```jsx
<ProgressiveImage src="large-image.jpg" placeholder="tiny-image.jpg">
  {(src, ref) => <img ref={ref} src={src} alt="an image" />}
</ProgressiveImage>
```

#### With Delay

```jsx
<ProgressiveImage
  delay={3000}
  src="large-image.jpg"
  placeholder="tiny-image.jpg"
>
  {(src, ref) => <img ref={ref} src={src} alt="an image" />}
</ProgressiveImage>
```

#### With loading argument

```jsx
<ProgressiveImage src="large-image.jpg" placeholder="tiny-image.jpg">
  {(src, ref, loading) => (
    <img ref={ref} style={{ opacity: loading ? 0.5 : 1 }} src={src} alt="an image" />
  )}
</ProgressiveImage>
```

#### With srcSet

```jsx
<ProgressiveImage
  src="medium.jpg"
  srcSetData={{
    srcSet: 'small.jpg 320w, medium.jpg 700w, large.jpg 2000w',
    sizes: '(max-width: 2000px) 100vw, 2000px'
  }}
  placeholder="tiny-image.jpg"
>
  {(src, ref, _loading, srcSetData) => (
    <img
      src={src}
      ref={ref}
      srcSet={srcSetData.srcSet}
      sizes={srcSetData.sizes}
      alt="an image"
    />
  )}
</ProgressiveImage>
```

#### Component As Placeholder

If you want to use a component, such as a loading spinner, as a placeholder, you can make use of the `loading` argument in the render callback. It will be true while the main image is loading and false once it has fully loaded. Keep in mind that the `placeholder` props is `required`, so you will need to explicitly declare an empty string as it's value if you plan on using a component in the render callback.

```jsx
const dominantImageColor = '#86356B';
const placeholder = (
  <div
    style={{ backgroundColor: dominantImageColor, height: 300, width: 500 }}
  />
);

<ProgressiveImage src="large-image.jpg" placeholder="" >
  {(src, ref, loading) => {
    return loading ? placeholder : <img ref={ref} src={src} alt="an image" />;
  }}
</ProgressiveImage>;
```

#### Progressive Enhancement and No JavaScript

Since this component relies on JavaScript to replace the placeholder src with the full image src, you should use a fallback image if your application supports environments that do not have JavaScript enabled or is progressively enhanced.

You can do this by adding the fallback image inside of a `<noscript>` tag in the render callback you provide as the `ProgressiveImage` component's child.

```jsx
<ProgressiveImage src="large-image.jpg" placeholder="tiny-image.jpg" >
  {(src, ref) => {
    return (
      <div>
        <img ref={ref} className="progressive-image" src={src} />
        <noscript>
          <img className="progressive-image no-script" src="large-image.jpg" />
        </noscript>
      </div>
    );
  }}
</ProgressiveImage>
```

### Props

| Name        | Type                                   | Required | Description                                            |
| ----------- | -------------------------------------- | -------- | ------------------------------------------------------ |
| children    | `function`                             | `true`   | returns `src`, `ref`, `loading`, and `srcSetData`      |
| delay       | `number`                               | `false`  | time in milliseconds before src image is loaded        |
| onError     | `function`                             | `false`  | returns error event                                    |
| placeholder | `string`                               | `true`   | the src of the placeholder image                       |
| src         | `string`                               | `true`   | the src of the main image                              |
| srcSetData  | `{srcSet: "string", sizes: "string" }` | `false`  | srcset and sizes to be applied to the image            |
| noRetry     | `boolean`                              | `false`  | flag to turn off re-trying	                           |
| noLazyLoad  | `boolean`                              | `false`  | flag to turn off lazy loading                          |


## Maintenance Status

 **Stable:** Formidable is not planning to develop any new features for this project. We are still responding to bug reports and security concerns. We are still welcoming PRs for this project, but PRs that include new features should be small and easy to integrate and should not include breaking changes.

[maintenance-image]: https://img.shields.io/badge/maintenance-stable-blue.svg
