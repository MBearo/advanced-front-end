const path = require('path')
const fs = require('fs')
const readline = require('readline');

fs.readdir(path.resolve(__dirname, './'), (err, files) => {
  console.log(files);
  streamMergeRecursive(files.filter(name => name.indexOf('0') > -1), fs.createWriteStream(path.resolve(__dirname, './haha.md')))
})

function streamMergeRecursive(scripts = [], fileWriteStream) {
  // 递归到尾部情况判断
  if (!scripts.length) {
    return fileWriteStream.end("console.log('Stream 合并完成')"); // 最后关闭可写流，防止内存泄漏
  }

  const currentFile = path.resolve(__dirname, scripts.shift());
  const currentReadStream = fs.createReadStream(currentFile); // 获取当前的可读流

  currentReadStream.pipe(fileWriteStream, { end: false });
  currentReadStream.on('end', function () {
    streamMergeRecursive(scripts, fileWriteStream);
  });

  currentReadStream.on('error', function (error) { // 监听错误事件，关闭可写流，防止内存泄漏
    console.error(error);
    fileWriteStream.close();
  });
}

