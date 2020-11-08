import HistoryMap from "./historyMap.js";

const width = 870;
const height = 600;
const svg = d3
  .select(".history-pret-result")
  .append("svg")
  .attr("class", "map")
  .attr("width", width)
  .attr("height", height);

// d3.squareMap.render("electoral.csv", ".map-container");
d3.csv("1976-2016-president.csv").then((data) => {
  const historyMap = new HistoryMap(data, svg);
});
