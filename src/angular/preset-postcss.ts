// @ts-nocheck
import { logger } from '@storybook/node-logger';
import { Configuration } from 'webpack';
import postcssPseudoClasses from 'postcss-pseudo-classes';
import * as util from 'util';
import { PseudoStatesDefaultPrefix_ANGULAR } from '../share/types';

export interface Options {
  postCssLoaderOptions: {
    prefix: string;
  };
}

/* export function webpack(
  webpackConfig: Configuration = {},
  options: Options = {}
) {
  logger.info(
    `== webpack() ==> Pseudo States Addon Webpack ${util.inspect(
      options?.postCssLoaderOptions,
      {
        showHidden: false,
        depth: null,
      }
    )}`
  );
  return webpackConfig;
}
*/

/**
 * append postcss' pseudo state postcss-pseudo-classes
 *
 * @param webpackConfig
 * @param options
 */
export function webpackFinal(
  webpackConfig: Configuration = {},
  options: Options = {}
): Configuration {
  logger.info(`=> Loading Pseudo States Addon Webpack config (Angular Cli)`);

  logger.info(
    `==> Pseudo States Addon Webpack ${util.inspect(
      options?.postCssLoaderOptions,
      {
        showHidden: false,
        depth: null,
      }
    )}`
  );

  const postCSSDefaultOptions = {
    // overwrite default prefix `\\:`
    // use prefix without `:` because angular add component scope before each `:`
    prefix: PseudoStatesDefaultPrefix_ANGULAR,
    // add to blacklist because it leads to problems with :host-context()
    blacklist: [
      ':root',
      ':host',
      ':host-context',
      ':nth-child',
      ':nth-of-type',
    ],
  };

  const postCssLoaderOptions = options?.postCssLoaderOptions
    ? { ...postCSSDefaultOptions, ...options.postCssLoaderOptions }
    : postCSSDefaultOptions;

  // find rules responsible for styling
  webpackConfig.module.rules.forEach((r) => {
    // TODO Is this regex always valid??
    if (r.test.toString() === '/\\.scss$|\\.sass$/') {
      // loggerPack.logger.info(`==> Installed Runle in webpack Final ${util.inspect(r, {showHidden: false, depth: null})}`);

      for (const loader of r.use) {
        const loaderPath = loader?.loader || loader;

        // try to find postcss loader in rule.use
        if (loaderPath.indexOf('postcss-loader') >= 0) {
          if (loader.options) {
            // overwrite plugin (hopefully only base-webpack.config
            // https://github.com/storybookjs/storybook/blob/3026db93031720849576d4064fa2df62e17c8996/lib/core/src/server/preview/base-webpack.config.js
            // eslint-disable-next-line no-loop-func
            loader.options.plugins = () => [
              postcssPseudoClasses(postCssLoaderOptions),
            ];
          }
        }
      }
    }
  });

  logger.info(
    `=> Added PostCSS postcss-pseudo-classes to enable pseudo states styles.`
  );

  return webpackConfig;
}
