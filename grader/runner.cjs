// Запускається в окремому процесі: один тестовий випадок однієї посилки.
const [, , solutionPath, exportName, input] = process.argv;

const solution = require(solutionPath);
const result = solution[exportName](...JSON.parse(input));

process.stdout.write(JSON.stringify(result));
