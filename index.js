import { Command, CommanderError } from 'commander';
import fs from 'fs';
import path from 'path';
import { Lame } from 'node-lame';
const program = new Command();

function myParsePath(value) {
    if (!fs.lstatSync(value).isDirectory())
        throw new CommanderError.InvalidArgumentError('Not a valid path. Maybe run with `sudo`?');
}

function* walkSync(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            yield* walkSync(path.join(dir, file.name));
        } else {
            yield path.join(dir, file.name);
        }
    }
}

program
    .name('musiccompressor')
    .description('CLI music compressor, no reduction to quality.')
    .version('0.0.1')

program.command('run')
    .description('Compresses a folder')
    .argument('<path>', 'Path of the folder', myParsePath)
    .option('-t, --times <number>', 'How many times to run the compression, the higher the better.', '5')
    .action(async function() {
        for (const filePath of walkSync(this.args[0])) {
            for(let i=0; i<this.opts().times; i++){
                const encoder = new Lame({
                    output: filePath,
                    bitrate: 192
                }).setFile(filePath + '.new')

                await encoder.encode();

                await fs.unlink(filePath);
                await fs.rename(filePath + '.new', filePath);
            }
        }
    }
    )

program.parse();
