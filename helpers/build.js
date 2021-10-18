const serverConfig = require('../webpack.config');
const webpack = require('webpack');

function generate_build(callback) {
  const compiler = webpack(serverConfig());
  compiler.run(callback);
}

generate_build((err, stats) => {
  printBuildTime(stats.startTime, stats.endTime);
  if (stats.compilation.errors.length) {
    console.error(
      `${stats.compilation.errors.length} errors during compilation!!`
    );
    stats.compilation.errors.forEach((e, i) => console.error(`${i + 1}: ${e}`));
  } else {
    console.log(`File hash: ${stats.hash}`);
    console.info('No errors during compilation!');
  }
});

function printBuildTime(start, end) {
  console.info(`Build time: ${(end - start) / 1000}s`);
}
