import fs from "fs-extra"
// 1. 检查dist/types目录是否存在
fs.emptyDirSync('./dist/types')

// 2. 复制声明文件到dist
fs.copySync('./src/types', './dist/types')
