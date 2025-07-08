import * as fs from "fs";
import * as echarts from "echarts";
import { TemplateHandler } from "easy-template-x";
import { marked } from "marked";

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

export const genSvg = (opts: any) => {
  const chart = echarts.init(null, null, {
    renderer: "svg",
    ssr: true,
    width: parseInt(opts.width),
    height: parseInt(opts.height),
  });

  // 如果指定了数据文件，读取JSON配置
  let chartOption = {
    title: { text: "ECharts 入门示例" },
    tooltip: {},
    xAxis: { data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"] },
    yAxis: {},
    series: [
      {
        name: "销量",
        type: "bar",
        data: [5, 20, 36, 10, 10, 20],
      },
    ],
  };

  if (opts.data) {
    chartOption = JSON.parse(fs.readFileSync(opts.data, "utf-8"));
  }

  chart.setOption(chartOption);
  const svgStr = chart.renderToSVGString();

  const outputFile = opts.output || "bar.svg";
  fs.writeFileSync(outputFile, svgStr, "utf-8");
  console.log(`SVG generated: ${outputFile}`);

  chart.dispose();
};

export const genHtml = async (opts: any) => {
  const markdown = fs.readFileSync(opts.input, "utf-8");
  const content = await marked.parse(markdown);

  const template = fs.readFileSync(opts.template, "utf-8");
  const html = template.replace("{{content}}", content);

  fs.writeFileSync(opts.output, html, "utf-8");
  console.log(`HTML generated: ${opts.output}`);
};
