import * as fs from "fs";
import * as echarts from "echarts";
import { TemplateHandler } from "easy-template-x";
import { marked } from "marked";
import markdownDocx, { Packer } from "markdown-docx";

export const genDocx = async (opts: any) => {
  const templateFile = fs.readFileSync("posts.docx");

  let data = {
    posts: [
      { author: "Alon Bar", text: "Very important\ntext here!" },
      { author: "Alon Bar", text: "Forgot to mention that..." },
    ],
  };

  // 如果指定了数据文件，读取JSON数据
  if (opts.data) {
    data = JSON.parse(fs.readFileSync(opts.data, "utf-8"));
  }

  const handler = new TemplateHandler();
  const doc = await handler.process(templateFile, data);

  const outputFile = opts.output || "posts-output.docx";
  fs.writeFileSync(outputFile, doc);
  console.log(`Document generated: ${outputFile}`);
};

export const genMarkdownDocx = async (opts: any) => {
  // Read markdown content
  const markdown = fs.readFileSync("input.md", "utf-8");

  // Convert to docx
  const doc = await markdownDocx(markdown);

  // Save to file
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("output.docx", buffer);

  console.log("Conversion completed successfully!");
};

export const genSvg = (opts: any) => {
  const configs: ChartConfig[] = JSON.parse(
    fs.readFileSync(opts.data, "utf-8")
  );

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

      const outputFile = opts.output + config.id + ".svg";
      fs.writeFileSync(outputFile, svgStr, "utf-8");
      console.log(`SVG generated: ${outputFile}`);

      chart.dispose();
    
  }
};

export const genHtml = async (opts: any) => {
  const markdown = fs.readFileSync(opts.input, "utf-8");
  const content = await marked.parse(markdown);

  const template = fs.readFileSync(opts.template, "utf-8");
  const html = template.replace("{{content}}", content);

  fs.writeFileSync(opts.output, html, "utf-8");
  console.log(`HTML generated: ${opts.output}`);
};

type ChartConfig = {
  id: string;
  renderer: "canvas" | "svg";
  width: number;
  height: number;
  option: any;
};
