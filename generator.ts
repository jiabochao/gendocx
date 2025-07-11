import * as fs from "fs";
import * as echarts from "echarts";
import { marked } from "marked";
import markdownDocx, { Packer } from "markdown-docx";
import template from "./input/report-template.txt" with { type: "text" };
import { $ } from "bun";

const reportBinPath = "/wads/report/bin";

export const genDocx = async (opts: any) => {
  const configs: ChartConfig[] = JSON.parse(
    fs.readFileSync(opts.data, "utf-8")
  );

  // 取opts.input文件所在目录
  const inputDir = opts.input.replace(/[^/]+$/, "");
  const svgDir = inputDir + "/svg/";

  // 生成图表SVG
  genSvg(svgDir, configs);

  // 将图表SVG转换为PNG
  await $`${reportBinPath}/phantomjs ${reportBinPath}/batch_rasterize.js ${svgDir} png`;

  let markdown = fs.readFileSync(opts.input, "utf-8");

  for (const config of configs) {
    // convert png file to base64 image url
    const pngFile = `${svgDir}${config.id}.png`;
    const pngData = fs.readFileSync(pngFile);
    const base64Image = `data:image/png;base64,${pngData.toString("base64")}`;
    markdown = markdown.replace(`(${config.id})`, `(${base64Image})`);
  }

  // Convert to docx
  const doc = await markdownDocx(markdown);

  // Save to file
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(opts.output, buffer);

  console.log("Conversion completed successfully!");
};

export const genPdf = async (opts: any) => {

  const configs: ChartConfig[] = JSON.parse(
    fs.readFileSync(opts.data, "utf-8")
  );

  // 取opts.input文件所在目录
  const inputDir = opts.input.replace(/[^/]+$/, "");
  const svgDir = inputDir + "/svg/";

  // 生成图表SVG
  genSvg(svgDir, configs);

  // 将图表SVG转换为PNG
  await $`${reportBinPath}/phantomjs ${reportBinPath}/batch_rasterize.js ${svgDir} png`;

  let markdown = fs.readFileSync(opts.input, "utf-8");

  for (const config of configs) {
    // convert png file to base64 image url
    const pngFile = `${svgDir}${config.id}.png`;
    const pngData = fs.readFileSync(pngFile);
    const base64Image = `data:image/png;base64,${pngData.toString("base64")}`;
    markdown = markdown.replace(`(${config.id})`, `(${base64Image})`);
  }
  
  const html = await genHtml(markdown);

  fs.writeFileSync(`${inputDir}/temp.html`, html, "utf-8");

  await $`${reportBinPath}/phantomjs ${reportBinPath}/batch_rasterize.js ${inputDir} pdf`;

  // rename ${inputDir}/temp.pdf to opts.output
  fs.renameSync(`${inputDir}/temp.pdf`, opts.output);

  console.log(`PDF generated: ${opts.output}`);
};

const genSvg = (output: string, configs: ChartConfig[]) => {

  if (!configs || configs.length === 0) {
    console.error("No chart configurations found in the data file.");
    return;
  }

  for (const config of configs) {
    const chart = echarts.init(null, null, {
        renderer: config.renderer,
        ssr: true,
        width: config.width,
        height: config.height,
      });

      chart.setOption(config.option);
      const svgStr = chart.renderToSVGString({useViewBox: true});

      const outputFile = output + config.id + ".svg";
      fs.writeFileSync(outputFile, svgStr, "utf-8");
      console.log(`SVG generated: ${outputFile}`);

      chart.dispose();
    
  }
};

const genHtml = async (markdown: string) => {
  const content = await marked.parse(markdown);
  const html = template.replace("{{content}}", content);
  return html;
};



type ChartConfig = {
  id: string;
  renderer: "canvas" | "svg";
  width: number;
  height: number;
  option: any;
};
