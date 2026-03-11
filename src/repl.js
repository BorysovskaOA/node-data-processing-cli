export const setupRepl = () => {
  let currentDirectory  = os.homedir();

  const readlineInstance = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
  });
  process.stdout.write('Welcome to Data Processing CLI!');
  process.stdout.write(`You are currently in ${currentDirectory}`);

  readlineInstance.prompt();

  readlineInstance.on('line', (line) => {
    switch (line.trim()) {
      case '.exit': {
        readlineInstance.close()
        break;
      }
      default: {
        console.log('Unknown command');
        readlineInstance.prompt();
      }
    }
  });

  readlineInstance.on('close', () => {
    console.log('Thank you for using Data Processing CLI!')
    readlineInstance.close()
  });

  return readlineInstance;
}

