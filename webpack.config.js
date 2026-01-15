const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.ts',
    content: './src/content/content_script.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        
        { from: '_locales/', to: '_locales/' },

        {
          from: 'manifest.template.json',
          to: 'manifest.json',
          transform(content) {
            return Buffer.from(
              content.toString()
                .replace('${version}', process.env.npm_package_version)
                .replace('${timestamp}', new Date().toISOString())
            );
          }
        }
      ]
    })
  ]
};