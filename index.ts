import { Command } from "commander";
import { genDocx, genHtml, genSvg } from "./generator";

const program = new Command();

program
  .name("gendocx")
  .description("Generate documents with charts")
  .version("1.0.0");

// SVG 子命令
program
  .command("svg")
  .description("Generate SVG chart from JSON data")
  .option("-o, --output <file>", "output file name", "chart.svg")
  .option("-d, --data <file>", "input data JSON file")
  .option("--width <width>", "chart width", "800")
  .option("--height <height>", "chart height", "600")
  .action((options) => {
    genSvg(options);
  });

// DOCX 子命令
program
  .command("docx")
  .description("Generate DOCX document from template and data")
  .option("-o, --output <file>", "output file name", "output.docx")
  .option("-d, --data <file>", "input data JSON file")
  .option("-t, --template <file>", "template file", "posts.docx")
  .action((options) => {
    genDocx(options);
  });

// HTML 子命令
program
  .command("html")
  .description("Generate HTML from markdown")
  .option("-o, --output <file>", "output file name", "output.html")
  .option("-i, --input <file>", "input markdown file", "pdf-input.md")
  .option("--chart-options <file>", "chart options file in JSON format")
  .option(
    "--template <file>",
    "HTML template file",
    "assets/report-template.html"
  )
  .action((options) => {
    genHtml(options);
  });

program.parse();
