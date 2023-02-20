import fs from "fs";
import path from "path";

export async function reExport({ dir, ext = "js", quiet }) {
  const dirPath = path.join(process.cwd(), dir);
  // читаем все файлы в директории
  const files = await fs.promises.readdir(dirPath);

  // собираем переменные из всех файлов
  const exports = {};
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (filePath === path.join(dirPath, "index.js")) continue;
    const stats = await fs.promises.stat(filePath);
    if (stats.isFile() && path.extname(file) === `.${ext}`) {
      const moduleExports = await import(filePath);
      exports[path.parse(file).name] = moduleExports;
    }
  }

  let count = 0;
  // записываем файл index.js, который экспортирует переменные из всех файлов
  // console.log(exports.x.default.name);
  const exportStr = Object.entries(exports)
    .map(([fileName, fileVars]) => {
      let exportString = `export { `;
      const fileExports = Object.entries(fileVars)
        .map(([key, value]) => {
          if (key === "default") {
            const name = value.name;
            count++;
            return `default as ${name}`;
          } else {
            count++;
            return key;
          }
        })
        .join(", ");
      exportString += fileExports + ` } from './${fileName}';`;
      return exportString;
    })
    .join("\n");

  const indexPath = path.join(dirPath, "index.js");
  await fs.promises.writeFile(indexPath, exportStr);

  const noun = count === 1 ? "var" : "vars";
  console.log(
    `Added ${count} exported ${noun} from "${dir}" to "${dir}/index.js"`
  );
}
