import { Command } from "commander";
import { genDocx, genPdf } from "./generator";

const program = new Command();

program
  .name("gendocx")
  .description("Generate documents with charts")
  .version("1.0.0");

// DOCX 子命令
program
  .command("docx")
  .description("Generate DOCX document from template and data")
  .option("-o, --output <file>", "output file name", "output.docx")
  .option("-i, --input <file>", "input markdown file", "input.md")
  .option("-d, --data <file>", "input data JSON file")
  .action((options) => {
    genDocx(options);
  });

// PDF 子命令
program
  .command("pdf")
  .description("Generate PDF from markdown")
  .option("-o, --output <file>", "output file name", "output.pdf")
  .option("-i, --input <file>", "input markdown file", "input.md")
  .option("-d, --data <file>", "input data JSON file")
  .action((options) => {
    genPdf(options);
  });

program.parse();
